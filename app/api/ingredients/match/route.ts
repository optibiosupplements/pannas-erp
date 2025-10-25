import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ingredients } from '@/lib/db/schema';
import { sql, ilike, or } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Levenshtein distance for fuzzy string matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Calculate similarity score (0-100)
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return Math.round(((maxLength - distance) / maxLength) * 100);
}

// Check if query matches any synonyms
function matchesSynonyms(query: string, synonyms: any): number {
  if (!synonyms || !Array.isArray(synonyms)) return 0;
  
  let bestScore = 0;
  for (const synonym of synonyms) {
    const score = calculateSimilarity(query, synonym);
    if (score > bestScore) bestScore = score;
  }
  return bestScore;
}

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10, threshold = 60, useAI = true } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Searching for ingredient: "${query}"`);

    // Step 1: Try exact match first
    const exactMatches = await db
      .select()
      .from(ingredients)
      .where(
        or(
          sql`LOWER(${ingredients.ingredientName}) = LOWER(${query})`,
          sql`LOWER(${ingredients.commonName}) = LOWER(${query})`
        )
      );

    if (exactMatches.length > 0) {
      console.log(`✅ Found ${exactMatches.length} exact match(es)`);
      return NextResponse.json({
        matches: exactMatches.map(ing => ({
          ...ing,
          matchScore: 100,
          matchType: 'exact',
        })),
        searchQuery: query,
      });
    }

    // Step 2: Try partial/fuzzy matching
    const allIngredients = await db.select().from(ingredients);
    
    const scoredMatches = allIngredients.map(ingredient => {
      // Calculate similarity scores
      const nameScore = calculateSimilarity(query, ingredient.ingredientName);
      const commonNameScore = ingredient.commonName 
        ? calculateSimilarity(query, ingredient.commonName)
        : 0;
      const synonymScore = matchesSynonyms(query, ingredient.synonyms);
      
      // Take the best score
      const matchScore = Math.max(nameScore, commonNameScore, synonymScore);
      
      // Determine match type
      let matchType = 'fuzzy';
      if (matchScore === synonymScore && synonymScore > 0) matchType = 'synonym';
      else if (matchScore === commonNameScore) matchType = 'common_name';
      
      return {
        ...ingredient,
        matchScore,
        matchType,
      };
    });

    // Filter by threshold and sort by score
    const fuzzyMatches = scoredMatches
      .filter(m => m.matchScore >= threshold)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    if (fuzzyMatches.length > 0) {
      console.log(`✅ Found ${fuzzyMatches.length} fuzzy match(es)`);
      return NextResponse.json({
        matches: fuzzyMatches,
        searchQuery: query,
      });
    }

    // Step 3: Use AI to find semantic matches
    if (useAI && process.env.OPENAI_API_KEY) {
      console.log('🤖 Using AI for semantic matching...');
      
      try {
        const ingredientNames = allIngredients.map(i => ({
          id: i.id,
          name: i.ingredientName,
          commonName: i.commonName,
          category: i.category,
        }));

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert in nutraceutical ingredients. Given a search query and a list of available ingredients, identify the most likely matches even if the names don't match exactly. Consider chemical names, common names, synonyms, and related compounds.`,
            },
            {
              role: 'user',
              content: `Search query: "${query}"\n\nAvailable ingredients:\n${JSON.stringify(ingredientNames, null, 2)}\n\nReturn the top 5 most relevant ingredient IDs as a JSON array of numbers. Only return the JSON array, nothing else.`,
            },
          ],
          temperature: 0.3,
        });

        const aiMatchIds = JSON.parse(response.choices[0].message.content || '[]');
        const aiMatches = allIngredients
          .filter(i => aiMatchIds.includes(i.id))
          .map(i => ({
            ...i,
            matchScore: 75, // AI matches get a default score
            matchType: 'ai_semantic',
          }));

        if (aiMatches.length > 0) {
          console.log(`✅ AI found ${aiMatches.length} semantic match(es)`);
          return NextResponse.json({
            matches: aiMatches,
            searchQuery: query,
          });
        }
      } catch (aiError) {
        console.error('AI matching failed:', aiError);
      }
    }

    // No matches found
    console.log('❌ No matches found');
    return NextResponse.json({
      matches: [],
      searchQuery: query,
      suggestion: 'Try using a more general term or check the ingredient category',
    });

  } catch (error) {
    console.error('Ingredient matching error:', error);
    return NextResponse.json(
      { error: 'Failed to match ingredients' },
      { status: 500 }
    );
  }
}

// GET endpoint for simple search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Simple ILIKE search for GET requests
    const matches = await db
      .select()
      .from(ingredients)
      .where(
        or(
          ilike(ingredients.ingredientName, `%${query}%`),
          ilike(ingredients.commonName, `%${query}%`),
          ilike(ingredients.category, `%${query}%`)
        )
      )
      .limit(limit);

    return NextResponse.json({
      matches,
      searchQuery: query,
    });

  } catch (error) {
    console.error('Ingredient search error:', error);
    return NextResponse.json(
      { error: 'Failed to search ingredients' },
      { status: 500 }
    );
  }
}


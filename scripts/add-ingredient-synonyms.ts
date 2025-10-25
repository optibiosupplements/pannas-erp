import { db } from '../lib/db';
import { ingredients } from '../lib/db/schema';
import { sql } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Common ingredient synonyms database
const KNOWN_SYNONYMS: Record<string, string[]> = {
  // Vitamins
  'Ascorbic Acid': ['Vitamin C', 'L-Ascorbic Acid', 'Ascorbate'],
  'Vitamin C': ['Ascorbic Acid', 'L-Ascorbic Acid', 'Ascorbate'],
  'Cholecalciferol': ['Vitamin D3', 'Vitamin D-3'],
  'Vitamin D3': ['Cholecalciferol', 'Vitamin D-3'],
  'Tocopherol': ['Vitamin E', 'Alpha-Tocopherol'],
  'Vitamin E': ['Tocopherol', 'Alpha-Tocopherol', 'd-alpha-tocopherol'],
  'Cyanocobalamin': ['Vitamin B12', 'Cobalamin', 'B-12'],
  'Vitamin B12': ['Cyanocobalamin', 'Cobalamin', 'Methylcobalamin'],
  'Pyridoxine': ['Vitamin B6', 'Pyridoxine HCl', 'B-6'],
  'Thiamine': ['Vitamin B1', 'Thiamine HCl', 'B-1'],
  'Riboflavin': ['Vitamin B2', 'B-2'],
  'Niacin': ['Vitamin B3', 'Nicotinic Acid', 'Niacinamide', 'B-3'],
  'Folic Acid': ['Folate', 'Vitamin B9', 'Folacin'],
  'Biotin': ['Vitamin B7', 'Vitamin H'],
  
  // Minerals
  'Magnesium Oxide': ['Magnesium', 'MgO'],
  'Calcium Carbonate': ['Calcium', 'CaCO3'],
  'Zinc Oxide': ['Zinc', 'ZnO'],
  'Ferrous Sulfate': ['Iron', 'Iron Sulfate', 'FeSO4'],
  
  // Amino Acids
  'L-Glutamine': ['Glutamine'],
  'L-Arginine': ['Arginine'],
  'L-Lysine': ['Lysine'],
  'L-Carnitine': ['Carnitine', 'Acetyl-L-Carnitine'],
  
  // Herbs
  'Curcuma Longa': ['Turmeric', 'Curcumin'],
  'Turmeric': ['Curcuma Longa', 'Curcumin'],
  'Panax Ginseng': ['Ginseng', 'Korean Ginseng'],
  'Ginkgo Biloba': ['Ginkgo'],
  'Bacopa Monnieri': ['Bacopa', 'Brahmi'],
  
  // Others
  'Omega-3': ['Fish Oil', 'EPA', 'DHA'],
  'CoQ10': ['Coenzyme Q10', 'Ubiquinone'],
  'Glucosamine': ['Glucosamine Sulfate', 'Glucosamine HCl'],
};

async function addSynonymsToIngredients() {
  console.log('🔄 Starting to add synonyms to ingredients...');
  
  try {
    const allIngredients = await db.select().from(ingredients);
    console.log(`Found ${allIngredients.length} ingredients to process`);
    
    let updatedCount = 0;
    let aiEnhancedCount = 0;
    
    for (const ingredient of allIngredients) {
      const synonyms: string[] = [];
      
      // Add ingredient name and common name to synonyms
      if (ingredient.ingredientName) {
        synonyms.push(ingredient.ingredientName);
      }
      if (ingredient.commonName && ingredient.commonName !== ingredient.ingredientName) {
        synonyms.push(ingredient.commonName);
      }
      
      // Check if we have known synonyms
      const knownSyns = KNOWN_SYNONYMS[ingredient.ingredientName];
      if (knownSyns) {
        synonyms.push(...knownSyns);
        console.log(`  ✓ Added ${knownSyns.length} known synonyms for ${ingredient.ingredientName}`);
      }
      
      // Use AI to generate additional synonyms for important ingredients
      if (process.env.OPENAI_API_KEY && !knownSyns) {
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert in nutraceutical ingredients. Generate a list of common synonyms, alternative names, and chemical names for ingredients.',
              },
              {
                role: 'user',
                content: `Ingredient: ${ingredient.ingredientName}\nCategory: ${ingredient.category}\nCommon Name: ${ingredient.commonName || 'N/A'}\n\nProvide 3-5 alternative names or synonyms as a JSON array of strings. Only return the JSON array.`,
              },
            ],
            temperature: 0.3,
          });
          
          const aiSynonyms = JSON.parse(response.choices[0].message.content || '[]');
          if (aiSynonyms.length > 0) {
            synonyms.push(...aiSynonyms);
            aiEnhancedCount++;
            console.log(`  🤖 AI added ${aiSynonyms.length} synonyms for ${ingredient.ingredientName}`);
          }
          
          // Rate limit to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (aiError) {
          console.error(`  ⚠️  AI failed for ${ingredient.ingredientName}:`, aiError);
        }
      }
      
      // Remove duplicates and update
      const uniqueSynonyms = [...new Set(synonyms)];
      
      if (uniqueSynonyms.length > 0) {
        await db.update(ingredients)
          .set({ synonyms: uniqueSynonyms })
          .where(sql`${ingredients.id} = ${ingredient.id}`);
        
        updatedCount++;
      }
    }
    
    console.log('\n✅ Synonym addition complete!');
    console.log(`   - Updated ${updatedCount} ingredients`);
    console.log(`   - AI enhanced ${aiEnhancedCount} ingredients`);
    
  } catch (error) {
    console.error('❌ Failed to add synonyms:', error);
    throw error;
  }
}

addSynonymsToIngredients()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


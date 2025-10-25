'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Search, Sparkles, CheckCircle } from 'lucide-react';

interface MatchResult {
  id: number;
  ingredientName: string;
  commonName: string | null;
  category: string | null;
  supplierName: string | null;
  costPerKg: string | null;
  matchScore: number;
  matchType: string;
  synonyms?: string[];
}

export default function IngredientSearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearchPerformed(true);

    try {
      const response = await fetch('/api/ingredients/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          limit: 10,
          threshold: 50,
          useAI: true,
        }),
      });

      const data = await response.json();
      setResults(data.matches || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'exact':
        return { label: 'Exact Match', color: 'bg-green-100 text-green-700' };
      case 'synonym':
        return { label: 'Synonym Match', color: 'bg-blue-100 text-blue-700' };
      case 'common_name':
        return { label: 'Common Name', color: 'bg-purple-100 text-purple-700' };
      case 'fuzzy':
        return { label: 'Fuzzy Match', color: 'bg-yellow-100 text-yellow-700' };
      case 'ai_semantic':
        return { label: 'AI Match', color: 'bg-pink-100 text-pink-700' };
      default:
        return { label: 'Match', color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Intelligent Ingredient Search</h1>
          <p className="text-slate-600 mt-1">
            Search with fuzzy matching, synonyms, and AI-powered semantic understanding
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder='Try "Vitamin C", "Turmeric", "Ascorbic Acid", etc.'
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-slate-600">Try examples:</span>
            {['Vitamin C', 'Turmeric', 'Omega 3', 'CoQ10', 'Magnesium'].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setQuery(example);
                  setTimeout(() => handleSearch(), 100);
                }}
                className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {searchPerformed && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                Search Results
                {results.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({results.length} {results.length === 1 ? 'match' : 'matches'} found)
                  </span>
                )}
              </h2>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-600">Searching ingredients...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No matches found</p>
                <p className="text-sm text-slate-500 mt-1">
                  Try a different search term or check the spelling
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {results.map((result) => {
                  const matchType = getMatchTypeLabel(result.matchType);
                  return (
                    <div key={result.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {result.ingredientName}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${matchType.color}`}>
                              {matchType.label}
                            </span>
                            <span className="px-2 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded">
                              {result.matchScore}% match
                            </span>
                          </div>
                          
                          {result.commonName && (
                            <p className="text-sm text-slate-600 mb-1">
                              Common name: <span className="font-medium">{result.commonName}</span>
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {result.category && (
                              <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                                {result.category}
                              </span>
                            )}
                            {result.supplierName && (
                              <span className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded">
                                Supplier: {result.supplierName}
                              </span>
                            )}
                            {result.costPerKg && (
                              <span className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded">
                                ${result.costPerKg}/kg
                              </span>
                            )}
                          </div>

                          {result.synonyms && result.synonyms.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-slate-500">
                                Also known as: {result.synonyms.slice(0, 5).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>

                        <button className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Select
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Feature Explanation */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How Intelligent Matching Works</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>✓ <strong>Exact Match:</strong> Direct name or common name match</p>
            <p>✓ <strong>Synonym Match:</strong> Matches alternative names (e.g., "Vitamin C" → "Ascorbic Acid")</p>
            <p>✓ <strong>Fuzzy Match:</strong> Handles typos and variations using Levenshtein distance</p>
            <p>✓ <strong>AI Semantic Match:</strong> Uses GPT-4 to understand context and find related ingredients</p>
            <p className="mt-3 text-xs text-blue-600">
              This ensures Ava can always find the right ingredient, even with imperfect customer requests.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}


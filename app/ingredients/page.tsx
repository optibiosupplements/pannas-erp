import { db } from '@/lib/db';
import { ingredients } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Navigation from '@/components/Navigation';
import { Beaker, Package, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function IngredientsPage() {
  const allIngredients = await db.select().from(ingredients).orderBy(desc(ingredients.ingredientName));
  
  // Get unique categories
  const categories = [...new Set(allIngredients.map(i => i.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Raw Ingredients</h1>
          <p className="text-slate-600 mt-1">
            Master ingredient database - {allIngredients.length} ingredients available
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Beaker className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Ingredients</p>
                <p className="text-2xl font-bold text-slate-900">{allIngredients.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Categories</p>
                <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Cost/kg</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${(allIngredients.reduce((sum, i) => sum + (Number(i.costPerKg) || 0), 0) / allIngredients.length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">All Ingredients</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Ingredient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Cost/kg
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Assay %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {allIngredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {ingredient.ingredientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        {ingredient.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {ingredient.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      ${ingredient.costPerKg}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {ingredient.assayPercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}


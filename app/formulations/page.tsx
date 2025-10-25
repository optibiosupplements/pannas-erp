import { db } from '@/lib/db';
import Navigation from '@/components/Navigation';
import { Beaker, Plus, Package, DollarSign } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function FormulationsPage() {
  const allFormulations = await db.query.productSpecifications.findMany({
    orderBy: (productSpecifications, { desc }) => [desc(productSpecifications.createdAt)],
    with: {
      rfq: {
        with: {
          customer: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Formulations</h1>
            <p className="text-slate-600 mt-1">Product formulation development and costing</p>
          </div>
          <Link
            href="/formulations/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Formulation
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Beaker className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Formulations</p>
                <p className="text-2xl font-bold text-slate-900">{allFormulations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Draft</p>
                <p className="text-2xl font-bold text-slate-900">
                  {allFormulations.filter(f => f.status === 'Draft').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-slate-900">
                  {allFormulations.filter(f => f.status === 'Approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Quoted</p>
                <p className="text-2xl font-bold text-slate-900">
                  {allFormulations.filter(f => f.status === 'Quoted').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulations List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">All Formulations</h2>
          </div>
          
          {allFormulations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Beaker className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No formulations yet</p>
              <p className="text-sm text-slate-500 mt-1">Create your first product formulation to get started</p>
              <Link
                href="/formulations/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Formulation
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Spec Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Cost/Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {allFormulations.map((formulation) => (
                    <tr key={formulation.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-600">{formulation.specNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{formulation.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700">
                          {formulation.rfq?.customer?.companyName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{formulation.productFormat || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">
                          ${formulation.totalCostPerUnit ? Number(formulation.totalCostPerUnit).toFixed(2) : '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                          formulation.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                          formulation.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          formulation.status === 'Quoted' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {formulation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link 
                          href={`/formulations/${formulation.id}`} 
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


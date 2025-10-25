import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowRight, Mail, Package, Users, TrendingUp } from 'lucide-react';

export default async function Dashboard() {
  // Get dashboard data
  const allRfqs = await db.query.rfqs.findMany({
    orderBy: (rfqs, { desc }) => [desc(rfqs.createdAt)],
    limit: 5,
    with: {
      customer: true,
    },
  });
  
  const allSpecs = await db.query.productSpecifications.findMany();
  const allOpportunities = await db.query.opportunities.findMany();
  
  const newRfqsCount = allRfqs.filter(r => r.status === 'New').length;
  const totalRfqs = allRfqs.length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header - Clear visual hierarchy */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Panna's ERP</h1>
              <p className="text-slate-600 mt-1">Nutraceutical Brokerage Management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">Welcome back,</p>
                <p className="font-semibold text-slate-900">Panna</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation - Consistent and predictable */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <Link 
              href="/" 
              className="px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
            >
              Dashboard
            </Link>
            <Link 
              href="/rfqs" 
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-b-2 border-transparent transition-colors"
            >
              RFQs
            </Link>
            <Link 
              href="/products" 
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-b-2 border-transparent transition-colors"
            >
              Products
            </Link>
            <Link 
              href="/customers" 
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-b-2 border-transparent transition-colors"
            >
              Customers
            </Link>
            <Link 
              href="/ingredients" 
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-b-2 border-transparent transition-colors"
            >
              Ingredients
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics - Visual hierarchy with icons and color coding */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              {newRfqsCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {newRfqsCount}
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-slate-600">New RFQs</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">{newRfqsCount}</p>
            <p className="text-xs text-slate-500 mt-1">Requires attention</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600">Total Products</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">{allSpecs.length}</p>
            <p className="text-xs text-slate-500 mt-1">Specifications created</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600">Active Customers</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">{new Set(allRfqs.map(r => r.customerId)).size}</p>
            <p className="text-xs text-slate-500 mt-1">Unique clients</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600">Opportunities</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">{allOpportunities.length}</p>
            <p className="text-xs text-slate-500 mt-1">In pipeline</p>
          </div>
        </div>
        
        {/* Recent RFQs - Clear data presentation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Recent RFQs</h2>
              <p className="text-sm text-slate-500 mt-1">Latest quote requests from customers</p>
            </div>
            <Link 
              href="/rfqs" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {allRfqs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No RFQs yet</p>
              <p className="text-sm text-slate-500 mt-1">New quote requests will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      RFQ Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {allRfqs.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-600">{rfq.rfqNumber}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {rfq.customer?.companyName || 'Unknown'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {rfq.customer?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700 max-w-xs truncate">
                          {rfq.productDescription || rfq.originalEmailSubject || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                          rfq.status === 'New' ? 'bg-blue-100 text-blue-700' :
                          rfq.status === 'In Review' ? 'bg-yellow-100 text-yellow-700' :
                          rfq.status === 'Quoted' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {rfq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(rfq.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link 
                          href={`/rfqs/${rfq.id}`} 
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


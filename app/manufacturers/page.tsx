import { db } from '@/lib/db';
import Navigation from '@/components/Navigation';
import { Factory, Plus, Mail, Phone, Building } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ManufacturersPage() {
  const allManufacturers = await db.query.manufacturers.findMany({
    orderBy: (manufacturers, { desc }) => [desc(manufacturers.createdAt)],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manufacturers</h1>
            <p className="text-slate-600 mt-1">Manage your manufacturing partners</p>
          </div>
          <Link
            href="/manufacturers/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Manufacturer
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Factory className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Manufacturers</p>
                <p className="text-2xl font-bold text-slate-900">{allManufacturers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Partners</p>
                <p className="text-2xl font-bold text-slate-900">
                  {allManufacturers.filter(m => m.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">New This Month</p>
                <p className="text-2xl font-bold text-slate-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Manufacturers List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">All Manufacturers</h2>
          </div>
          
          {allManufacturers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Factory className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No manufacturers yet</p>
              <p className="text-sm text-slate-500 mt-1">Add your first manufacturing partner to get started</p>
              <Link
                href="/manufacturers/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Manufacturer
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Phone
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
                  {allManufacturers.map((manufacturer) => (
                    <tr key={manufacturer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">{manufacturer.companyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700">{manufacturer.contactName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          {manufacturer.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4" />
                          {manufacturer.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                          manufacturer.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {manufacturer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link 
                          href={`/manufacturers/${manufacturer.id}`} 
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


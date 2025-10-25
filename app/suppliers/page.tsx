import Navigation from '@/components/Navigation';
import { Truck, Plus, Package } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
  // TODO: Add suppliers table to database schema
  const suppliers: any[] = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Suppliers</h1>
            <p className="text-slate-600 mt-1">Manage your raw ingredient suppliers</p>
          </div>
          <Link
            href="/suppliers/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-slate-900">{suppliers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Suppliers</p>
                <p className="text-2xl font-bold text-slate-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Ingredients Sourced</p>
                <p className="text-2xl font-bold text-slate-900">514</p>
              </div>
            </div>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">All Suppliers</h2>
          </div>
          
          <div className="px-6 py-12 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No suppliers yet</p>
            <p className="text-sm text-slate-500 mt-1">Add your first supplier to get started</p>
            <Link
              href="/suppliers/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Supplier
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}


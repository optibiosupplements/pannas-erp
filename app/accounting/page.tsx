import Navigation from '@/components/Navigation';
import { DollarSign, Plus, TrendingUp, FileText, CreditCard } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccountingPage() {
  // TODO: Add invoices, payments, and financial tracking tables
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Accounting</h1>
            <p className="text-slate-600 mt-1">Financial tracking, invoicing, and payments</p>
          </div>
          <Link
            href="/accounting/new-invoice"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </Link>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">$0.00</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Outstanding Invoices</p>
                <p className="text-2xl font-bold text-slate-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Pending Payments</p>
                <p className="text-2xl font-bold text-slate-900">$0.00</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">This Month</p>
                <p className="text-2xl font-bold text-slate-900">$0.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Recent Invoices</h2>
          </div>
          
          <div className="px-6 py-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No invoices yet</p>
            <p className="text-sm text-slate-500 mt-1">Create your first invoice to get started</p>
            <Link
              href="/accounting/new-invoice"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Link>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Recent Payments</h2>
          </div>
          
          <div className="px-6 py-12 text-center">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No payments recorded</p>
            <p className="text-sm text-slate-500 mt-1">Payment history will appear here</p>
          </div>
        </div>
      </main>
    </div>
  );
}


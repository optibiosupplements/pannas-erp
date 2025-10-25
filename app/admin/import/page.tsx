'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Upload, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/import-suppliers', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Supplier Data Import</h1>
          <p className="text-slate-600 mt-1">
            Import supplier records and link ingredients to their suppliers
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Import Ingredient-Supplier Mappings
            </h2>
            
            <p className="text-slate-600 mb-6">
              This will process 514 ingredient-supplier mappings and create supplier records.
            </p>

            <button
              onClick={handleImport}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Start Import
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Import Successful!</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Suppliers Created</p>
                  <p className="text-2xl font-bold text-slate-900">{result.suppliersCreated}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Ingredients Linked</p>
                  <p className="text-2xl font-bold text-slate-900">{result.ingredientsLinked}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Not Found</p>
                  <p className="text-2xl font-bold text-slate-900">{result.ingredientsNotFound}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-slate-900">{result.totalSuppliers}</p>
                </div>
              </div>

              {result.logs && result.logs.length > 0 && (
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Import Log:</h4>
                  <div className="max-h-64 overflow-y-auto">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                      {result.logs.join('\n')}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-900">Import Failed</h3>
              </div>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">What this does:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Reads 514 ingredient-supplier mappings from the data file</li>
            <li>• Creates supplier records for each unique supplier</li>
            <li>• Links ingredients to their suppliers via foreign key</li>
            <li>• Adds SKU codes to ingredient notes</li>
            <li>• Uses fuzzy matching to find ingredients with slight name variations</li>
          </ul>
        </div>
      </main>
    </div>
  );
}


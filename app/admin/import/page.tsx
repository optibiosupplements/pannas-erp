'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Upload, CheckCircle, XCircle, Loader, Database } from 'lucide-react';

export default function ImportPage() {
  const [migrating, setMigrating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const handleMigration = async () => {
    setMigrating(true);
    setMigrationResult(null);

    try {
      const response = await fetch('/api/admin/run-migration', {
        method: 'POST',
      });

      const data = await response.json();
      setMigrationResult(data);
    } catch (err) {
      setMigrationResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setMigrating(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);

    try {
      const response = await fetch('/api/admin/import-suppliers', {
        method: 'POST',
      });

      const data = await response.json();
      setImportResult(data);
    } catch (err) {
      setImportResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Supplier Data Import</h1>
          <p className="text-slate-600 mt-1">
            Import supplier records and link ingredients to their suppliers
          </p>
        </div>

        {/* Step 1: Migration */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Database className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Step 1: Run Database Migration
            </h2>
            
            <p className="text-slate-600 mb-6">
              Add new columns to the database (ingredient_id and supplier_type).
            </p>

            <button
              onClick={handleMigration}
              disabled={migrating || migrationResult?.success}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              {migrating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Running Migration...
                </>
              ) : migrationResult?.success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Migration Complete
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Run Migration
                </>
              )}
            </button>
          </div>

          {migrationResult && (
            <div className={`mt-6 p-6 ${migrationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                {migrationResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <h3 className={`text-lg font-semibold ${migrationResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {migrationResult.success ? 'Migration Successful!' : 'Migration Failed'}
                </h3>
              </div>
              {migrationResult.success ? (
                <div className="text-green-800">
                  <p className="mb-2">{migrationResult.message}</p>
                  {migrationResult.migrations && (
                    <ul className="text-sm space-y-1">
                      {migrationResult.migrations.map((m: string, i: number) => (
                        <li key={i}>✓ {m}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="text-red-700">{migrationResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Import */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Step 2: Import Ingredient-Supplier Mappings
            </h2>
            
            <p className="text-slate-600 mb-6">
              Process 514 ingredient-supplier mappings and create 101 supplier records.
            </p>

            <button
              onClick={handleImport}
              disabled={importing || !migrationResult?.success}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              {importing ? (
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
            
            {!migrationResult?.success && (
              <p className="text-sm text-slate-500 mt-2">
                Please run the migration first
              </p>
            )}
          </div>

          {importResult && (
            <div className={`mt-6 p-6 ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} rounded-lg`}>
              <div className="flex items-center gap-2 mb-4">
                {importResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <h3 className={`text-lg font-semibold ${importResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {importResult.success ? 'Import Successful!' : 'Import Failed'}
                </h3>
              </div>
              
              {importResult.success ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-slate-600">Suppliers Created</p>
                      <p className="text-2xl font-bold text-slate-900">{importResult.suppliersCreated}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-slate-600">Ingredients Linked</p>
                      <p className="text-2xl font-bold text-slate-900">{importResult.ingredientsLinked}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-slate-600">Total Suppliers</p>
                      <p className="text-2xl font-bold text-slate-900">{importResult.totalSuppliers}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-slate-600">Total Ingredients</p>
                      <p className="text-2xl font-bold text-slate-900">{importResult.totalIngredients}</p>
                    </div>
                  </div>

                  {importResult.logs && importResult.logs.length > 0 && (
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-900 mb-2">Import Log:</h4>
                      <div className="max-h-64 overflow-y-auto">
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                          {importResult.logs.join('\n')}
                        </pre>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-red-700">{importResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">What this does:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Adds ingredient_id and supplier_type columns to database</li>
            <li>• Reads 514 ingredient-supplier mappings from consolidated data</li>
            <li>• Creates 101 unique supplier records with type classifications</li>
            <li>• Links ingredients to suppliers via foreign key</li>
            <li>• Adds Ingredient IDs (RM001-RM514), pricing, potency, and categories</li>
            <li>• Uses fuzzy matching to find ingredients with slight name variations</li>
          </ul>
        </div>
      </main>
    </div>
  );
}


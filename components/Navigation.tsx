'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Customers', href: '/customers' },
    { name: 'Raw Ingredients', href: '/ingredients' },
    { name: 'Suppliers', href: '/suppliers' },
    { name: 'Manufacturers', href: '/manufacturers' },
    { name: 'Formulations', href: '/formulations' },
    { name: 'RFQs', href: '/rfqs' },
    { name: 'Accounting', href: '/accounting' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Panna&apos;s ERP</h1>
              <p className="text-slate-600 mt-1">Nutraceutical Brokerage Management</p>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">Welcome back,</p>
                <p className="font-semibold text-slate-900">Panna</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}


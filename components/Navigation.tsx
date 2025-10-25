'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Package, 
  Truck, 
  Factory, 
  FlaskConical, 
  Mail, 
  DollarSign,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Raw Ingredients', href: '/ingredients', icon: Package },
    { name: 'Suppliers', href: '/suppliers', icon: Truck },
    { name: 'Manufacturers', href: '/manufacturers', icon: Factory },
    { name: 'Formulations', href: '/formulations', icon: FlaskConical },
    { name: 'RFQs', href: '/rfqs', icon: Mail },
    { name: 'Accounting', href: '/accounting', icon: DollarSign },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href) || false;
  };

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Always clickable to go home */}
            <Link 
              href="/" 
              className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
            >
              <div className="bg-white p-2 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Panna&apos;s ERP
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm">
                  Nutraceutical Brokerage Management
                </p>
              </div>
            </Link>

            {/* Desktop User Info */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-blue-200">Welcome back,</p>
                <p className="font-semibold text-white">Panna</p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                P
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-500 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    active
                      ? 'text-blue-600 border-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link 
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                      active
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                  P
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Panna</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


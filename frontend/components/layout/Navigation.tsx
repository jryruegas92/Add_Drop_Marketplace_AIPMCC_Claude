'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Haas Trade Hub</span>
            </Link>
            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                <Link
                  href="/marketplace"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isActive('/marketplace')
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  My Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isActive('/profile')
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  My Classes
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Hi, {user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-700 hover:text-blue-600 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-700 hover:text-blue-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

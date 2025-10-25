'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/marketplace');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Haas Trade Hub
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            The marketplace for UC Berkeley Haas MBA students to coordinate class trades
            during add/drop periods. No more scattered WhatsApp messages or endless portal checking!
          </p>

          <div className="flex justify-center space-x-4 mb-16">
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
            >
              Login
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Post Your Trades</h3>
              <p className="text-gray-600">
                Announce classes you&apos;re dropping or looking for with just a few clicks
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Browse Marketplace</h3>
              <p className="text-gray-600">
                Filter and search to find exactly the classes you need
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Negotiate & Trade</h3>
              <p className="text-gray-600">
                Make offers, counter-offers, and finalize trades with instant contact sharing
              </p>
            </div>
          </div>

          <div className="mt-16 bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <div className="text-left space-y-4">
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</span>
                <div>
                  <h4 className="font-semibold">Sign up with your Haas email</h4>
                  <p className="text-gray-600">Register with your @haas.berkeley.edu or @berkeley.edu email</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</span>
                <div>
                  <h4 className="font-semibold">Add your enrolled classes</h4>
                  <p className="text-gray-600">Select the classes you&apos;re currently enrolled in</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</span>
                <div>
                  <h4 className="font-semibold">Create posts or make offers</h4>
                  <p className="text-gray-600">Post what you&apos;re dropping or browse the marketplace to make offers</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</span>
                <div>
                  <h4 className="font-semibold">Finalize your trade</h4>
                  <p className="text-gray-600">When you accept an offer, contact info is shared to coordinate the drop/add</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            Built for Haas MBA students, by students. Happy trading!
          </p>
        </div>
      </footer>
    </div>
  );
}

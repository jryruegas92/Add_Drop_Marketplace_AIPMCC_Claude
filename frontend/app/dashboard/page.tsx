'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import { postsApi } from '@/lib/api/posts';
import { offersApi } from '@/lib/api/offers';
import { Post, Offer, OfferStatus, PostStatus } from '@/lib/types';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [madeOffers, setMadeOffers] = useState<Offer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'made' | 'received'>('posts');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [postsData, madeData, receivedData] = await Promise.all([
        postsApi.getMy(),
        offersApi.getMy(),
        offersApi.getReceived(),
      ]);
      setMyPosts(postsData);
      setMadeOffers(madeData.made);
      setReceivedOffers(receivedData.received);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: number) => {
    try {
      await offersApi.updateStatus(offerId, OfferStatus.ACCEPTED);
      alert('Offer accepted! Contact information has been shared.');
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    try {
      await offersApi.updateStatus(offerId, OfferStatus.REJECTED);
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleClosePost = async (postId: number) => {
    try {
      await postsApi.updateStatus(postId, PostStatus.CLOSED);
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsApi.delete(postId);
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (authLoading || isLoading) {
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Posts ({myPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('made')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'made'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Offers I Made ({madeOffers.length})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Offers Received ({receivedOffers.length})
            </button>
          </nav>
        </div>

        {activeTab === 'posts' && (
          <div className="space-y-4">
            {myPosts.length === 0 ? (
              <div className="bg-white p-8 rounded-lg text-center text-gray-500">
                You haven&apos;t created any posts yet.
              </div>
            ) : (
              myPosts.map((post) => (
                <div key={post.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`inline-block text-xs px-2 py-1 rounded mb-2 ${
                        post.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        post.status === 'TRADE_AGREED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status.replace(/_/g, ' ')}
                      </span>
                      <span className="ml-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {post.post_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {post.class_dropping && (
                    <div className="mb-2">
                      <span className="font-medium">Dropping: </span>
                      <span>{post.class_dropping.code} - {post.class_dropping.title}</span>
                    </div>
                  )}

                  {post.class_wanted && (
                    <div className="mb-2">
                      <span className="font-medium">Looking for: </span>
                      <span>{post.class_wanted.code} - {post.class_wanted.title}</span>
                    </div>
                  )}

                  {post.notes && <p className="text-gray-700 mb-2">{post.notes}</p>}

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      {post.offer_count || 0} offer(s) received
                    </span>
                    <div className="space-x-2">
                      {post.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleClosePost(post.id)}
                          className="text-sm bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                        >
                          Close
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'made' && (
          <div className="space-y-4">
            {madeOffers.length === 0 ? (
              <div className="bg-white p-8 rounded-lg text-center text-gray-500">
                You haven&apos;t made any offers yet.
              </div>
            ) : (
              madeOffers.map((offer) => (
                <div key={offer.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-block text-xs px-2 py-1 rounded ${
                      offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      offer.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      offer.status === 'COUNTERED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {offer.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(offer.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {offer.post && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium mb-1">Offer on post by {offer.post.user_name}</p>
                      {offer.post.class_dropping && (
                        <p className="text-sm">Dropping: {offer.post.class_dropping.code}</p>
                      )}
                      {offer.post.class_wanted && (
                        <p className="text-sm">Looking for: {offer.post.class_wanted.code}</p>
                      )}
                    </div>
                  )}

                  <div className="mb-2">
                    <span className="font-medium">Classes Offered: </span>
                    {offer.offered_classes.map((c) => c.code).join(', ')}
                  </div>

                  {offer.message && (
                    <p className="text-gray-700 mb-2">Message: {offer.message}</p>
                  )}

                  {offer.status === 'ACCEPTED' && offer.post && (
                    <div className="mt-4 p-3 bg-green-50 rounded">
                      <p className="text-sm font-medium text-green-800">Trade Accepted!</p>
                      {offer.post.user_email && (
                        <p className="text-sm">Email: {offer.post.user_email}</p>
                      )}
                      {offer.post.user_phone && (
                        <p className="text-sm">Phone: {offer.post.user_phone}</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'received' && (
          <div className="space-y-4">
            {receivedOffers.length === 0 ? (
              <div className="bg-white p-8 rounded-lg text-center text-gray-500">
                You haven&apos;t received any offers yet.
              </div>
            ) : (
              receivedOffers.map((offer) => (
                <div key={offer.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">From: {offer.offerer_name}</h3>
                      <span className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
                        offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        offer.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {offer.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(offer.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {offer.post && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium mb-1">On your post:</p>
                      {offer.post.class_dropping && (
                        <p className="text-sm">Dropping: {offer.post.class_dropping.code}</p>
                      )}
                      {offer.post.class_wanted && (
                        <p className="text-sm">Looking for: {offer.post.class_wanted.code}</p>
                      )}
                    </div>
                  )}

                  <div className="mb-2">
                    <span className="font-medium">Classes Offered: </span>
                    {offer.offered_classes.map((c) => c.code).join(', ')}
                  </div>

                  {offer.message && (
                    <p className="text-gray-700 mb-2">Message: {offer.message}</p>
                  )}

                  {offer.status === 'PENDING' && (
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleAcceptOffer(offer.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectOffer(offer.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {offer.status === 'ACCEPTED' && (
                    <div className="mt-4 p-3 bg-green-50 rounded">
                      <p className="text-sm font-medium text-green-800">You Accepted This Offer!</p>
                      {offer.offerer_email && (
                        <p className="text-sm">Email: {offer.offerer_email}</p>
                      )}
                      {offer.offerer_phone && (
                        <p className="text-sm">Phone: {offer.offerer_phone}</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

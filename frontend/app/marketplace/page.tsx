'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import { postsApi } from '@/lib/api/posts';
import { classesApi } from '@/lib/api/classes';
import { offersApi } from '@/lib/api/offers';
import { Post, PostType, Class, CreatePostRequest, CreateOfferRequest } from '@/lib/types';

export default function MarketplacePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [myClasses, setMyClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<PostType | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showMakeOffer, setShowMakeOffer] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, filterType]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [postsData, classesData, myClassesData] = await Promise.all([
        postsApi.getAll(filterType ? { post_type: filterType } : {}),
        classesApi.getAll(),
        classesApi.getEnrolled(),
      ]);
      setPosts(postsData);
      setAllClasses(classesData);
      setMyClasses(myClassesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      post.class_dropping?.title.toLowerCase().includes(search) ||
      post.class_dropping?.code.toLowerCase().includes(search) ||
      post.class_wanted?.title.toLowerCase().includes(search) ||
      post.class_wanted?.code.toLowerCase().includes(search)
    );
  });

  const CreatePostModal = () => {
    const [postType, setPostType] = useState<PostType>(PostType.DROPPING_OPEN);
    const [classDroppingId, setClassDroppingId] = useState('');
    const [classWantedId, setClassWantedId] = useState('');
    const [notes, setNotes] = useState('');
    const [timing, setTiming] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const data: CreatePostRequest = {
          post_type: postType,
          class_dropping_id: classDroppingId ? parseInt(classDroppingId) : undefined,
          class_wanted_id: classWantedId ? parseInt(classWantedId) : undefined,
          notes,
          timing,
        };
        await postsApi.create(data);
        setShowCreatePost(false);
        loadData();
      } catch (error: any) {
        alert(error.message);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Post Type</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as PostType)}
                className="w-full border rounded px-3 py-2 text-gray-900"
                required
              >
                <option value={PostType.DROPPING_OPEN}>Dropping Class - Open to Offers</option>
                <option value={PostType.DROPPING_TARGETED}>Dropping Class for Specific Class</option>
                <option value={PostType.LOOKING_FOR}>Looking for Class</option>
              </select>
            </div>

            {(postType === PostType.DROPPING_OPEN || postType === PostType.DROPPING_TARGETED) && (
              <div>
                <label className="block text-sm font-medium mb-1">Class I'm Dropping</label>
                <select
                  value={classDroppingId}
                  onChange={(e) => setClassDroppingId(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                >
                  <option value="">Select a class</option>
                  {myClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(postType === PostType.DROPPING_TARGETED || postType === PostType.LOOKING_FOR) && (
              <div>
                <label className="block text-sm font-medium mb-1">Class I Want</label>
                <select
                  value={classWantedId}
                  onChange={(e) => setClassWantedId(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                >
                  <option value="">Select a class</option>
                  {allClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-900"
                rows={3}
                placeholder="Any additional information..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Timing</label>
              <input
                type="text"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-900"
                placeholder="e.g., Week 1 of add/drop"
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Post
              </button>
              <button
                type="button"
                onClick={() => setShowCreatePost(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const MakeOfferModal = ({ postId }: { postId: number }) => {
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const data: CreateOfferRequest = {
          post_id: postId,
          offered_class_ids: selectedClasses,
          message,
        };
        await offersApi.create(data);
        setShowMakeOffer(null);
        alert('Offer sent successfully!');
      } catch (error: any) {
        alert(error.message);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Make an Offer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Classes to Offer</label>
              {myClasses.map((c) => (
                <label key={c.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClasses([...selectedClasses, c.id]);
                      } else {
                        setSelectedClasses(selectedClasses.filter((id) => id !== c.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{c.code} - {c.title}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-900"
                rows={3}
                placeholder="Add a message to your offer..."
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Send Offer
              </button>
              <button
                type="button"
                onClick={() => setShowMakeOffer(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <button
            onClick={() => setShowCreatePost(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Create Post
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border rounded px-4 py-2 text-gray-900"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as PostType | '')}
            className="border rounded px-4 py-2 text-gray-900"
          >
            <option value="">All Post Types</option>
            <option value={PostType.DROPPING_OPEN}>Dropping - Open</option>
            <option value={PostType.DROPPING_TARGETED}>Dropping - Targeted</option>
            <option value={PostType.LOOKING_FOR}>Looking For</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-white p-8 rounded-lg text-center text-gray-500">
              No posts found. Be the first to create one!
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                      {post.post_type.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-xl font-semibold">{post.user_name}</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                {post.class_dropping && (
                  <div className="mb-2">
                    <span className="font-medium">Dropping: </span>
                    <span className="text-lg">{post.class_dropping.code} - {post.class_dropping.title}</span>
                  </div>
                )}

                {post.class_wanted && (
                  <div className="mb-2">
                    <span className="font-medium">Looking for: </span>
                    <span className="text-lg">{post.class_wanted.code} - {post.class_wanted.title}</span>
                  </div>
                )}

                {post.notes && (
                  <p className="text-gray-700 mb-2">{post.notes}</p>
                )}

                {post.timing && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Timing:</span> {post.timing}
                  </p>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    {post.offer_count || 0} offer(s)
                  </span>
                  {post.user_id !== user?.id && (
                    <button
                      onClick={() => setShowMakeOffer(post.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Make Offer
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreatePost && <CreatePostModal />}
      {showMakeOffer && <MakeOfferModal postId={showMakeOffer} />}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import { classesApi } from '@/lib/api/classes';
import { Class, ProgramType } from '@/lib/types';

export default function ProfilePage() {
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [myClasses, setMyClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'classes'>('classes');
  const [showAddClass, setShowAddClass] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    graduation_year: '',
    program_type: '' as ProgramType | '',
    phone: '',
    contact_visible: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      setProfileData({
        name: user.name,
        graduation_year: user.graduation_year?.toString() || '',
        program_type: user.program_type || '',
        phone: user.phone || '',
        contact_visible: user.contact_visible,
      });
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const [allClassesData, myClassesData] = await Promise.all([
        classesApi.getAll(),
        classesApi.getEnrolled(),
      ]);
      setAllClasses(allClassesData);
      setMyClasses(myClassesData);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await classesApi.enroll(parseInt(selectedClassId));
      setShowAddClass(false);
      setSelectedClassId('');
      loadClasses();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleUnenrollClass = async (classId: number) => {
    if (!confirm('Are you sure you want to remove this class?')) return;
    try {
      await classesApi.unenroll(classId);
      loadClasses();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        name: profileData.name,
        graduation_year: profileData.graduation_year ? parseInt(profileData.graduation_year) : undefined,
        program_type: profileData.program_type || undefined,
        phone: profileData.phone || undefined,
        contact_visible: profileData.contact_visible,
      });
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const availableClasses = allClasses.filter(
    (c) => !myClasses.some((mc) => mc.id === c.id)
  );

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('classes')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'classes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Classes
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Settings
            </button>
          </nav>
        </div>

        {activeTab === 'classes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Enrolled Classes ({myClasses.length})</h2>
              <button
                onClick={() => setShowAddClass(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Add Class
              </button>
            </div>

            <div className="space-y-3">
              {myClasses.length === 0 ? (
                <div className="bg-white p-8 rounded-lg text-center text-gray-500">
                  You haven&apos;t added any classes yet. Add your enrolled classes to start trading!
                </div>
              ) : (
                myClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{classItem.code}</h3>
                      <p className="text-gray-600">{classItem.title}</p>
                      {classItem.professor && (
                        <p className="text-sm text-gray-500">{classItem.professor}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUnenrollClass(classItem.id)}
                      className="text-red-500 hover:text-red-700 px-3 py-1 rounded border border-red-500 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {showAddClass && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">Add a Class</h2>
                  <form onSubmit={handleEnrollClass} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Select Class</label>
                      <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                      >
                        <option value="">Choose a class...</option>
                        {availableClasses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} - {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Add Class
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddClass(false);
                          setSelectedClassId('');
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Program Type</label>
                  <select
                    value={profileData.program_type}
                    onChange={(e) => setProfileData({ ...profileData, program_type: e.target.value as ProgramType })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select a program</option>
                    {Object.values(ProgramType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={profileData.graduation_year}
                    onChange={(e) => setProfileData({ ...profileData, graduation_year: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="510-555-0123"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="contact_visible"
                    checked={profileData.contact_visible}
                    onChange={(e) => setProfileData({ ...profileData, contact_visible: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="contact_visible" className="text-sm">
                    Make my contact information visible to all users
                  </label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      if (user) {
                        setProfileData({
                          name: user.name,
                          graduation_year: user.graduation_year?.toString() || '',
                          program_type: user.program_type || '',
                          phone: user.phone || '',
                          contact_visible: user.contact_visible,
                        });
                      }
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Program Type</p>
                  <p className="font-medium">{user?.program_type || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Graduation Year</p>
                  <p className="font-medium">{user?.graduation_year || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium">{user?.phone || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Visibility</p>
                  <p className="font-medium">
                    {user?.contact_visible ? 'Visible to all' : 'Only visible when trades are accepted'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

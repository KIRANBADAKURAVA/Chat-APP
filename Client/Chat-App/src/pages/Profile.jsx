import React, { useEffect, useState } from 'react';
import { FiUser, FiCamera, FiSave, FiKey } from 'react-icons/fi';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [previewPic, setPreviewPic] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/v1/user/getuser', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accesstoken')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setUser(data.data);
        setUsername(data.data.username);
        setPreviewPic(data.data.profilePicture);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setProfilePic(file);
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('username', username);
      if (profilePic) formData.append('profilePicture', profilePic);
      const response = await fetch('/api/v1/user/updateProfile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accesstoken')}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update profile');
      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');
    setPasswordLoading(true);
    try {
      const response = await fetch('/api/v1/user/updatePassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accesstoken')}`,
        },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error('Failed to update password');
      setPasswordSuccess('Password updated successfully!');
      setPassword('');
    } catch (err) {
      setPasswordError(err.message);
    }
    setPasswordLoading(false);
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (error) return <div className="text-red-600 text-center mt-8">{error}</div>;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold overflow-hidden">
            {previewPic ? (
              <img src={previewPic} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <FiUser size={48} />
            )}
          </div>
          {editMode && (
            <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition">
              <FiCamera className="text-white" size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
            </label>
          )}
        </div>
        <form onSubmit={handleProfileUpdate} className="w-full flex flex-col items-center">
          <div className="mb-4 w-full">
            <label className="block text-gray-700 font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={!editMode}
              className={`w-full px-4 py-2 rounded-lg border ${editMode ? 'bg-gray-50' : 'bg-gray-100'} text-black outline-none focus:ring-2 focus:ring-blue-200 border-gray-200 transition`}
            />
          </div>
          {success && <div className="text-green-600 mb-2">{success}</div>}
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <div className="flex gap-4 w-full">
            {editMode ? (
              <>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition font-semibold">
                  <FiSave /> Save
                </button>
                <button type="button" className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </form>
        {/* Password Update */}
        <form onSubmit={handlePasswordUpdate} className="w-full mt-8 flex flex-col items-center">
          <div className="mb-4 w-full">
            <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2"><FiKey /> New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border bg-gray-50 text-black outline-none focus:ring-2 focus:ring-blue-200 border-gray-200 transition"
              placeholder="Enter new password"
            />
          </div>
          {passwordSuccess && <div className="text-green-600 mb-2">{passwordSuccess}</div>}
          {passwordError && <div className="text-red-600 mb-2">{passwordError}</div>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2" disabled={passwordLoading}>
            <FiSave /> {passwordLoading ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile; 
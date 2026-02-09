import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { User as UserIcon, Lock, Save } from 'lucide-react';

export const Profile = () => {
  const { currentUser, updateUserProfile } = useStore();
  
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
    }
  }, [currentUser]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    updateUserProfile(currentUser.id, {
      fullName,
      password: newPassword || undefined
    });
    setMsg('Profile updated successfully!');
    setNewPassword(''); // Clear password field
    setTimeout(() => setMsg(''), 3000);
  };

  if (!currentUser) return null;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-bold">
            {currentUser.username.substring(0,2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser.fullName}</h2>
            <p className="text-gray-500">Role: <span className="font-semibold text-primary">{currentUser.role}</span></p>
          </div>
        </div>

        {msg && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center">
            {msg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username (Cannot be changed)</label>
            <input 
              disabled
              value={currentUser.username}
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full pl-10 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password (Optional)</label>
             <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full pl-10 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Announcement, Role } from '../types';
import { Bell, AlertTriangle, Info, Plus } from 'lucide-react';
import { MusicPlayer } from '../components/MusicPlayer';

export const Dashboard = () => {
  const { currentUser, announcements, tasks, schedule, addAnnouncement } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnnounce, setNewAnnounce] = useState({ title: '', content: '', type: 'NORMAL' as const });

  const canAddAnnouncement = [Role.KOMTI, Role.WAKOMTI, Role.ADMIN].includes(currentUser?.role as Role);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    addAnnouncement({
      id: Date.now().toString(),
      title: newAnnounce.title,
      content: newAnnounce.content,
      type: newAnnounce.type,
      date: new Date().toISOString(),
      authorId: currentUser.id,
      authorName: currentUser.fullName
    });
    setShowAddModal(false);
    setNewAnnounce({ title: '', content: '', type: 'NORMAL' });
  };

  // Get active tasks count
  const activeTasks = tasks.filter(t => !t.isCompleted).length;
  // Get today's schedule
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysClasses = schedule.filter(s => s.day === today);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, {currentUser?.fullName}!</p>
        </div>
        <div className="flex gap-4">
           {/* Notification Badge could go here */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
           <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Tasks</h3>
           <p className="text-3xl font-bold text-primary mt-2">{activeTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
           <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Classes Today</h3>
           <p className="text-3xl font-bold text-secondary mt-2">{todaysClasses.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
           <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Announcements</h3>
           <p className="text-3xl font-bold text-green-500 mt-2">{announcements.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Announcements Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Bell size={20} /> Latest Announcements
            </h2>
            {canAddAnnouncement && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1 hover:bg-blue-600 transition"
              >
                <Plus size={16} /> New
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {announcements.map(ann => (
              <div key={ann.id} className={`p-4 rounded-lg border-l-4 shadow-sm bg-white dark:bg-gray-800 ${
                ann.type === 'EMERGENCY' ? 'border-red-500' : 
                ann.type === 'IMPORTANT' ? 'border-yellow-500' : 'border-blue-500'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">{ann.title}</h3>
                  {ann.type === 'EMERGENCY' && <AlertTriangle size={18} className="text-red-500" />}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{ann.content}</p>
                <div className="text-xs text-gray-400 flex justify-between">
                  <span>{ann.authorName}</span>
                  <span>{new Date(ann.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Preview */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Today's Schedule</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            {todaysClasses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No classes today. Enjoy!</p>
            ) : (
              <ul className="space-y-3">
                {todaysClasses.map(c => (
                  <li key={c.id} className="flex gap-3 items-center">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">{c.subject}</p>
                      <p className="text-xs text-gray-500">{c.time} • {c.room}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <MusicPlayer />

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Post Announcement</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Title"
                value={newAnnounce.title}
                onChange={e => setNewAnnounce({...newAnnounce, title: e.target.value})}
                required
              />
              <textarea 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Content"
                rows={4}
                value={newAnnounce.content}
                onChange={e => setNewAnnounce({...newAnnounce, content: e.target.value})}
                required
              />
              <select 
                 className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 value={newAnnounce.type}
                 onChange={(e: any) => setNewAnnounce({...newAnnounce, type: e.target.value})}
              >
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Role } from '../types';
import { Calendar, Plus, Clock, MapPin, Trash2, BookOpen } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const Schedule = () => {
  const { schedule, subjects, currentUser, addScheduleItem, deleteScheduleItem } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    day: 'Monday',
    startTime: '',
    endTime: '',
    subject: '',
    room: ''
  });

  const canManage = [Role.ADMIN, Role.KURIKULUM].includes(currentUser?.role as Role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.subject) return;

    addScheduleItem({
      id: Date.now().toString(),
      day: newItem.day,
      time: `${newItem.startTime} - ${newItem.endTime}`,
      subject: newItem.subject,
      room: newItem.room
    });
    setIsModalOpen(false);
    setNewItem({ day: 'Monday', startTime: '', endTime: '', subject: '', room: '' });
  };

  // Helper to find subject details (like teacher, code) based on name
  const getSubjectDetails = (name: string) => subjects.find(s => s.name === name);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar /> Class Schedule
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
             Weekly fixed schedule for the semester.
          </p>
        </div>
        {canManage && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 shadow-md transition"
          >
            <Plus size={18} /> Add Class
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {DAYS.map(day => {
          // Get items for this day and sort by start time (simple string comparison works for HH:MM 24h format)
          const dayItems = schedule
            .filter(s => s.day === day)
            .sort((a, b) => a.time.localeCompare(b.time));

          return (
            <div key={day} className="flex flex-col gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center font-bold text-gray-700 dark:text-gray-200 border-b-4 border-primary/50 shadow-sm">
                {day}
              </div>
              
              <div className="space-y-4">
                {dayItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    Free Day
                  </div>
                ) : (
                  dayItems.map(item => {
                    const subDetails = getSubjectDetails(item.subject);
                    return (
                      <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                        
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-bold text-secondary bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                             {subDetails?.code || 'GEN'}
                           </span>
                           {canManage && (
                             <button 
                               onClick={() => deleteScheduleItem(item.id)}
                               className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                             >
                               <Trash2 size={16} />
                             </button>
                           )}
                        </div>

                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-1">{item.subject}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{subDetails?.teacher || 'Unknown Teacher'}</p>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                             <Clock size={14} className="text-primary" />
                             <span>{item.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                             <MapPin size={14} className="text-green-500" />
                             <span>{item.room}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
               <Plus className="bg-primary text-white rounded-full p-1" size={20} /> Add Schedule
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
                 <select 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  value={newItem.day}
                  onChange={e => setNewItem({...newItem, day: e.target.value})}
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                 <select 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  required
                  value={newItem.subject}
                  onChange={e => setNewItem({...newItem, subject: e.target.value})}
                >
                  <option value="">Select a Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name} ({s.teacher})</option>)}
                </select>
                {subjects.length === 0 && <p className="text-xs text-red-500 mt-1">No subjects available. Add subjects first.</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                    <input 
                      type="time" 
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                      required
                      value={newItem.startTime}
                      onChange={e => setNewItem({...newItem, startTime: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                    <input 
                      type="time" 
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                      required
                      value={newItem.endTime}
                      onChange={e => setNewItem({...newItem, endTime: e.target.value})}
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room / Location</label>
                 <input 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. Lab 1, Room 304"
                  required
                  value={newItem.room}
                  onChange={e => setNewItem({...newItem, room: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-blue-600 transition">Save Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
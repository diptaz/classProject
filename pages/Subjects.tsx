import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Role } from '../types';
import { Book, Plus, Trash2 } from 'lucide-react';

export const Subjects = () => {
  const { subjects, currentUser, addSubject, deleteSubject } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', teacher: '' });

  const canManage = [Role.ADMIN, Role.KURIKULUM].includes(currentUser?.role as Role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSubject({
      id: Date.now().toString(),
      ...newSubject
    });
    setIsModalOpen(false);
    setNewSubject({ name: '', code: '', teacher: '' });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Book /> Subjects (Mata Kuliah)
        </h1>
        {canManage && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={18} /> Add Subject
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(sub => (
          <div key={sub.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                  {sub.code}
                </span>
                {canManage && (
                  <button 
                    onClick={() => deleteSubject(sub.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{sub.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Teacher: {sub.teacher}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
              ID: {sub.id}
            </div>
          </div>
        ))}
      </div>
      
      {subjects.length === 0 && (
         <div className="text-center py-12 text-gray-400">No subjects found. Please add one.</div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Add New Subject</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Subject Name (e.g. Web Development)"
                required
                value={newSubject.name}
                onChange={e => setNewSubject({...newSubject, name: e.target.value})}
              />
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Code (e.g. WEB101)"
                required
                value={newSubject.code}
                onChange={e => setNewSubject({...newSubject, code: e.target.value})}
              />
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Teacher Name"
                required
                value={newSubject.teacher}
                onChange={e => setNewSubject({...newSubject, teacher: e.target.value})}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

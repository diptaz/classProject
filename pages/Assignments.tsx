import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Role, Task } from '../types';
import { CheckCircle, Circle, Plus, Calendar } from 'lucide-react';

export const Assignments = () => {
  const { tasks, currentUser, addTask, toggleTaskCompletion } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  
  // Form State
  const [newTask, setNewTask] = useState({ title: '', description: '', subject: '', deadline: '' });

  const canEdit = [Role.KURIKULUM, Role.SEKRETARIS, Role.ADMIN].includes(currentUser?.role as Role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!currentUser) return;
    addTask({
      id: Date.now().toString(),
      ...newTask,
      isCompleted: false,
      createdBy: currentUser.role
    });
    setShowModal(false);
    setNewTask({ title: '', description: '', subject: '', deadline: '' });
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'ACTIVE') return !t.isCompleted;
    if (filter === 'COMPLETED') return t.isCompleted;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
        {canEdit && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={18} /> Add Task
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        {['ALL', 'ACTIVE', 'COMPLETED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              filter === f 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between group">
            <div className="flex gap-4">
              <button 
                onClick={() => toggleTaskCompletion(task.id)}
                className={`mt-1 transition-colors ${task.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-primary'}`}
              >
                {task.isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
              </button>
              <div>
                <h3 className={`text-lg font-bold ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                  {task.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                <div className="flex gap-4 mt-3 text-xs text-gray-400 font-medium">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{task.subject}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-gray-400">No assignments found.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Add Assignment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Title"
                required
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
              />
              <textarea 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Description"
                rows={3}
                required
                value={newTask.description}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
              />
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Subject"
                required
                value={newTask.subject}
                onChange={e => setNewTask({...newTask, subject: e.target.value})}
              />
              <input 
                type="date"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                value={newTask.deadline}
                onChange={e => setNewTask({...newTask, deadline: e.target.value})}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

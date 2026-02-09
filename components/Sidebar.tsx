import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../context/Store';
import { Role } from '../types';
import { 
  Home, BookOpen, Video, Calendar, Grid, 
  FileText, Shield, LogOut, Book, User, GraduationCap
} from 'lucide-react';

export const Sidebar = () => {
  const { currentUser, logout } = useStore();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  if (!currentUser) return null;

  const canSeeSubjects = [Role.ADMIN, Role.KURIKULUM, Role.IT_LOGISTIK, Role.KOMTI, Role.SEKRETARIS].includes(currentUser.role);

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary tracking-tighter">Class<span className="text-gray-800 dark:text-white">Sync</span></h1>
        <div className="mt-2 text-xs font-mono text-gray-500 dark:text-gray-500">
          Logged as: <span className="text-secondary font-bold">{currentUser.role}</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <NavLink to="/dashboard" className={navItemClass}>
          <Home size={20} /> Dashboard
        </NavLink>
        
        <NavLink to="/assignments" className={navItemClass}>
          <BookOpen size={20} /> Assignments
        </NavLink>

        <NavLink to="/schedule" className={navItemClass}>
          <Calendar size={20} /> Schedule
        </NavLink>

        <NavLink to="/tutor-events" className={navItemClass}>
          <GraduationCap size={20} /> Tutor Events
        </NavLink>
        
        {canSeeSubjects && (
          <NavLink to="/subjects" className={navItemClass}>
            <Book size={20} /> Subjects
          </NavLink>
        )}

        <NavLink to="/videos" className={navItemClass}>
          <Video size={20} /> Videos
        </NavLink>

        <NavLink to="/materials" className={navItemClass}>
          <FileText size={20} /> Materials
        </NavLink>

        <NavLink to="/seating" className={navItemClass}>
          <Grid size={20} /> Seating Plan
        </NavLink>

        {currentUser.role === Role.ADMIN && (
          <NavLink to="/admin" className={navItemClass}>
            <Shield size={20} /> Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <NavLink to="/profile" className="flex items-center gap-3 px-4 py-2 w-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <User size={20} /> My Profile
        </NavLink>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
};
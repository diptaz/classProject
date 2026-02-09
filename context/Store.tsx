import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import bcrypt from 'bcryptjs';
import { User, Role, Announcement, Task, ScheduleItem, VideoMaterial, ActivityLog, Subject, DocumentMaterial, TutorEvent } from '../types';
import { generateUsers, initialAnnouncements, initialTasks, initialSchedule, initialVideos, initialSubjects, initialMaterials, initialTutorEvents } from '../services/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  subjects: Subject[];
  announcements: Announcement[];
  tasks: Task[];
  schedule: ScheduleItem[];
  videos: VideoMaterial[];
  materials: DocumentMaterial[];
  tutorEvents: TutorEvent[];
  activityLog: ActivityLog[];
  isDarkMode: boolean;
  isLoading: boolean;
  
  toggleDarkMode: () => void;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithGoogle: (email: string, name: string, googleId: string) => void;
  logout: () => void;
  
  // Data manipulation
  addAnnouncement: (announcement: Announcement) => void;
  addTask: (task: Task) => void;
  toggleTaskCompletion: (taskId: string) => void;
  
  addSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;

  addScheduleItem: (item: ScheduleItem) => void;
  deleteScheduleItem: (id: string) => void;

  addVideo: (video: VideoMaterial) => void;
  deleteVideo: (id: string) => void;

  addMaterial: (material: DocumentMaterial) => void;
  deleteMaterial: (id: string) => void;

  addTutorEvent: (event: TutorEvent) => void;
  editTutorEvent: (id: string, updates: Partial<TutorEvent>) => void;
  deleteTutorEvent: (id: string) => void;
  joinTutorEvent: (eventId: string) => void;
  leaveTutorEvent: (eventId: string) => void;
  promoteFromWaitingList: (eventId: string, userId: string) => void;
  assignUserToEvent: (eventId: string, userId: string) => void;
  kickFromEvent: (eventId: string, userId: string) => void;

  updateUserRole: (userId: string, role: Role) => void;
  updateUserStatus: (userId: string, isActive: boolean) => void;
  updateUserProfile: (userId: string, data: { fullName?: string, password?: string }) => void;
  
  updateSeat: (userId: string, seatIndex: number | null) => void;
  resetSeats: () => void;
  randomizeSeats: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  // Initialize currentUser from localStorage synchronously to avoid initial null state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('classSync_currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing session:", error);
      return null;
    }
  });
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [videos, setVideos] = useState<VideoMaterial[]>([]);
  const [materials, setMaterials] = useState<DocumentMaterial[]>([]);
  const [tutorEvents, setTutorEvents] = useState<TutorEvent[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync currentUser changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('classSync_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('classSync_currentUser');
    }
  }, [currentUser]);

  // --- Initial Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // 1. Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.warn("Supabase credentials missing. Falling back to local/mock data.");
        loadLocalData();
        setIsLoading(false);
        return;
      }

      try {
        // 2. Fetch Users
        const { data: dbUsers, error: userError } = await supabase.from('users').select('*');
        if (dbUsers && dbUsers.length > 0) {
          setUsers(dbUsers);
          
          // Re-validate and sync session with latest DB data
          if (currentUser) {
            const freshUser = dbUsers.find((u: User) => u.id === currentUser.id);
            if (freshUser) {
               if (freshUser.isActive) {
                  // Keep session but update details (except password if it's hashed)
                  const { password, ...safeUser } = freshUser;
                  setCurrentUser(prev => prev ? { ...prev, ...safeUser, password: prev.password } : null); 
               } else {
                  setCurrentUser(null);
               }
            }
          }
        } else {
          // Seed initial users if DB is empty
          const seedUsers = generateUsers();
          await supabase.from('users').insert(seedUsers);
          setUsers(seedUsers);
        }

        // 3. Fetch Subjects
        const { data: dbSubjects } = await supabase.from('subjects').select('*');
        setSubjects(dbSubjects?.length ? dbSubjects : []);

        // 4. Fetch Announcements
        const { data: dbAnnounce } = await supabase.from('announcements').select('*').order('date', { ascending: false });
        setAnnouncements(dbAnnounce?.length ? dbAnnounce : []);

        // 5. Fetch Tasks
        const { data: dbTasks } = await supabase.from('tasks').select('*').order('deadline', { ascending: true });
        setTasks(dbTasks?.length ? dbTasks : []);

        // 6. Fetch Schedule
        const { data: dbSchedule } = await supabase.from('schedule').select('*');
        setSchedule(dbSchedule?.length ? dbSchedule : []);

        // 7. Fetch Videos
        const { data: dbVideos } = await supabase.from('videos').select('*');
        setVideos(dbVideos?.length ? dbVideos : []);

        // 8. Fetch Materials
        const { data: dbMaterials } = await supabase.from('materials').select('*');
        setMaterials(dbMaterials?.length ? dbMaterials : []);

        // 9. Fetch Tutor Events
        const { data: dbEvents } = await supabase.from('tutor_events').select('*');
        setTutorEvents(dbEvents?.length ? dbEvents : []);

        // 10. Fetch Logs
        const { data: dbLogs } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(50);
        setActivityLog(dbLogs?.length ? dbLogs : []);

      } catch (error) {
        console.error("Error fetching data from Supabase:", error);
        loadLocalData(); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); 

  const loadLocalData = () => {
    const storedUsers = localStorage.getItem('classSync_users');
    setUsers(storedUsers ? JSON.parse(storedUsers) : generateUsers());
    const storedSubjects = localStorage.getItem('classSync_subjects');
    setSubjects(storedSubjects ? JSON.parse(storedSubjects) : initialSubjects);
    if (!storedUsers) setUsers(generateUsers());
    if (!storedSubjects) setSubjects(initialSubjects);
    setAnnouncements(initialAnnouncements);
    setTasks(initialTasks);
    setSchedule(initialSchedule);
    setVideos(initialVideos);
    setMaterials(initialMaterials);
    setTutorEvents(initialTutorEvents);
  };

  // Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const logActivity = async (action: string) => {
    if (!currentUser) return;
    const log: ActivityLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      action: `${currentUser.username} (${currentUser.role}): ${action}`,
      timestamp: new Date().toISOString()
    };
    setActivityLog(prev => [log, ...prev]);
    if (isSupabaseConfigured()) {
       await supabase.from('activity_logs').insert(log);
    }
  };

  const login = async (u: string, p: string) => {
    // 1. Try Supabase RPC for Encrypted Passwords (pgcrypto) - works if server side has keys
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('verify_password', { 
          username_input: u, 
          password_input: p 
        });

        if (data && data.isActive) {
           setCurrentUser(data);
           logActivity(`Logged in (Secure RPC)`);
           return true;
        }
      } catch (err) {
        console.log("RPC Login skipped or failed, trying fallback.");
      }
    }

    // 2. Fallback: Check local user list (Mock or Client-Fetched Data) with bcrypt or plaintext
    const user = users.find(usr => usr.username === u);
    
    if (user && user.isActive && user.password) {
       let isValid = false;

       // Check if the stored password looks like a Bcrypt Hash (Starts with $2)
       // This handles legacy data in localStorage that might still be plain text
       if (user.password.startsWith('$2')) {
          try {
             isValid = bcrypt.compareSync(p, user.password);
          } catch (e) {
             console.error("Error comparing hash", e);
             isValid = false;
          }
       } else {
          // Fallback: Simple string comparison for legacy plain text data
          isValid = (user.password === p);
       }
       
       if (isValid) {
          setCurrentUser(user);
          logActivity(`Logged in`);
          return true;
       }
    }
    
    return false;
  };

  const loginWithGoogle = async (email: string, name: string, googleId: string) => {
    let user = users.find(u => u.username === email);
    
    if (!user) {
      user = {
        id: `g_${googleId}`,
        username: email,
        fullName: name,
        role: Role.STUDENT, 
        isActive: true,
        password: '', 
        seatIndex: null
      };
      setUsers(prev => [...prev, user!]);
      if (isSupabaseConfigured()) {
        await supabase.from('users').insert(user);
      }
    }

    if (user && user.isActive) {
      setCurrentUser(user);
      logActivity(`Logged in via Google`);
    }
  };

  const logout = () => {
    if (currentUser) {
      logActivity(`Logged out`);
    }
    setCurrentUser(null);
  };

  // --- Actions with Supabase Integration ---

  const addAnnouncement = async (item: Announcement) => {
    setAnnouncements([item, ...announcements]);
    if (isSupabaseConfigured()) await supabase.from('announcements').insert(item);
    logActivity(`Added announcement: ${item.title}`);
  };

  const addTask = async (item: Task) => {
    setTasks([item, ...tasks]);
    if (isSupabaseConfigured()) await supabase.from('tasks').insert(item);
    logActivity(`Added task: ${item.title}`);
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = !task.isCompleted;

    setTasks(tasks.map(t => t.id === taskId ? { ...t, isCompleted: newStatus } : t));
    
    if (isSupabaseConfigured()) {
      await supabase.from('tasks').update({ isCompleted: newStatus }).eq('id', taskId);
    }
  };

  const addSubject = async (subject: Subject) => {
    setSubjects([...subjects, subject]);
    if (isSupabaseConfigured()) await supabase.from('subjects').insert(subject);
    logActivity(`Added subject: ${subject.name}`);
  }

  const deleteSubject = async (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    if (isSupabaseConfigured()) await supabase.from('subjects').delete().eq('id', id);
    logActivity(`Deleted subject ID: ${id}`);
  }

  const addScheduleItem = async (item: ScheduleItem) => {
    setSchedule([...schedule, item]);
    if (isSupabaseConfigured()) await supabase.from('schedule').insert(item);
    logActivity(`Added schedule item for ${item.day}`);
  }

  const deleteScheduleItem = async (id: string) => {
    setSchedule(schedule.filter(s => s.id !== id));
    if (isSupabaseConfigured()) await supabase.from('schedule').delete().eq('id', id);
    logActivity(`Deleted schedule item ID: ${id}`);
  }

  const addVideo = async (video: VideoMaterial) => {
    setVideos([video, ...videos]);
    if (isSupabaseConfigured()) await supabase.from('videos').insert(video);
    logActivity(`Added video: ${video.title}`);
  }

  const deleteVideo = async (id: string) => {
    setVideos(videos.filter(v => v.id !== id));
    if (isSupabaseConfigured()) await supabase.from('videos').delete().eq('id', id);
    logActivity(`Deleted video ID: ${id}`);
  }

  const addMaterial = async (material: DocumentMaterial) => {
    setMaterials([material, ...materials]);
    if (isSupabaseConfigured()) await supabase.from('materials').insert(material);
    logActivity(`Added material: ${material.title}`);
  }

  const deleteMaterial = async (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
    if (isSupabaseConfigured()) await supabase.from('materials').delete().eq('id', id);
    logActivity(`Deleted material ID: ${id}`);
  }

  const addTutorEvent = async (event: TutorEvent) => {
    setTutorEvents([event, ...tutorEvents]);
    if (isSupabaseConfigured()) await supabase.from('tutor_events').insert(event);
    logActivity(`Added tutor event: ${event.title}`);
  };

  const editTutorEvent = async (id: string, updates: Partial<TutorEvent>) => {
    setTutorEvents(prev => prev.map(ev => ev.id === id ? { ...ev, ...updates } : ev));
    if (isSupabaseConfigured()) await supabase.from('tutor_events').update(updates).eq('id', id);
    logActivity(`Edited tutor event ID: ${id}`);
  };

  const deleteTutorEvent = async (id: string) => {
    setTutorEvents(tutorEvents.filter(e => e.id !== id));
    if (isSupabaseConfigured()) await supabase.from('tutor_events').delete().eq('id', id);
    logActivity(`Deleted tutor event ID: ${id}`);
  };

  const joinTutorEvent = async (eventId: string) => {
    if (!currentUser) return;
    const event = tutorEvents.find(e => e.id === eventId);
    if (!event) return;
    
    if (event.participants.includes(currentUser.id) || (event.waitingList && event.waitingList.includes(currentUser.id))) {
      return;
    }

    if (event.participants.length < event.maxParticipants) {
      const newParticipants = [...event.participants, currentUser.id];
      setTutorEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, participants: newParticipants } : ev));
      
      if (isSupabaseConfigured()) {
        await supabase.from('tutor_events').update({ participants: newParticipants }).eq('id', eventId);
      }
      logActivity(`Joined tutor event ID: ${eventId}`);
    } else {
      const currentWaitingList = event.waitingList || [];
      const newWaitingList = [...currentWaitingList, currentUser.id];
      setTutorEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, waitingList: newWaitingList } : ev));

      if (isSupabaseConfigured()) {
        await supabase.from('tutor_events').update({ waitingList: newWaitingList }).eq('id', eventId);
      }
      logActivity(`Joined waiting list for event ID: ${eventId}`);
    }
  };

  const leaveTutorEvent = async (eventId: string) => {
    if (!currentUser) return;
    const event = tutorEvents.find(e => e.id === eventId);
    if (!event) return;

    const isParticipant = event.participants.includes(currentUser.id);
    const isWaitlisted = event.waitingList && event.waitingList.includes(currentUser.id);

    if (isParticipant) {
        const newParticipants = event.participants.filter(id => id !== currentUser.id);
        setTutorEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, participants: newParticipants } : ev));
        if (isSupabaseConfigured()) {
            await supabase.from('tutor_events').update({ participants: newParticipants }).eq('id', eventId);
        }
        logActivity(`Left tutor event ID: ${eventId}`);
    } else if (isWaitlisted) {
        const newWaitingList = (event.waitingList || []).filter(id => id !== currentUser.id);
        setTutorEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, waitingList: newWaitingList } : ev));
        if (isSupabaseConfigured()) {
            await supabase.from('tutor_events').update({ waitingList: newWaitingList }).eq('id', eventId);
        }
        logActivity(`Left waiting list for event ID: ${eventId}`);
    }
  };

  const promoteFromWaitingList = async (eventId: string, userId: string) => {
    const event = tutorEvents.find(e => e.id === eventId);
    if (!event) return;

    const newWaitingList = (event.waitingList || []).filter(id => id !== userId);
    let newParticipants = event.participants;
    if (!event.participants.includes(userId)) {
       newParticipants = [...event.participants, userId];
    }

    setTutorEvents(prev => prev.map(ev => ev.id === eventId ? { 
        ...ev, 
        waitingList: newWaitingList,
        participants: newParticipants
    } : ev));

    if (isSupabaseConfigured()) {
       await supabase.from('tutor_events').update({ 
           waitingList: newWaitingList,
           participants: newParticipants
       }).eq('id', eventId);
    }
    logActivity(`Promoted user ${userId} from waiting list in event ${eventId}`);
  };

  const assignUserToEvent = async (eventId: string, userId: string) => {
    const event = tutorEvents.find(e => e.id === eventId);
    if (!event) return;

    if (event.participants.includes(userId)) return;

    const newWaitingList = (event.waitingList || []).filter(id => id !== userId);
    const newParticipants = [...event.participants, userId];

    setTutorEvents(prev => prev.map(ev => ev.id === eventId ? { 
        ...ev, 
        waitingList: newWaitingList,
        participants: newParticipants
    } : ev));

    if (isSupabaseConfigured()) {
       await supabase.from('tutor_events').update({ 
           waitingList: newWaitingList,
           participants: newParticipants
       }).eq('id', eventId);
    }
    logActivity(`Assigned user ${userId} to event ${eventId}`);
  };

  const kickFromEvent = async (eventId: string, userId: string) => {
    const event = tutorEvents.find(e => e.id === eventId);
    if (!event) return;

    const newParticipants = event.participants.filter(id => id !== userId);
    setTutorEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, participants: newParticipants } : ev));

    if (isSupabaseConfigured()) {
        await supabase.from('tutor_events').update({ participants: newParticipants }).eq('id', eventId);
    }
    logActivity(`Removed user ${userId} from event ${eventId}`);
  };

  const updateUserRole = async (userId: string, role: Role) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
    if (isSupabaseConfigured()) await supabase.from('users').update({ role }).eq('id', userId);
    logActivity(`Updated user ${userId} to role ${role}`);
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isActive } : u));
    if (isSupabaseConfigured()) await supabase.from('users').update({ isActive }).eq('id', userId);
    logActivity(`Updated user ${userId} active status to ${isActive}`);
  };

  const updateUserProfile = async (userId: string, data: { fullName?: string, password?: string }) => {
    const updates: any = {};
    if (data.fullName) updates.fullName = data.fullName;
    
    // Hash password if it's being updated locally to ensure consistency with login logic
    if (data.password) {
      updates.password = bcrypt.hashSync(data.password, 10);
    }

    setUsers(users.map(u => {
      if (u.id === userId) {
        return { ...u, ...updates };
      }
      return u;
    }));

    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
    }

    if (isSupabaseConfigured()) await supabase.from('users').update(updates).eq('id', userId);
    logActivity(`User ${userId} updated their profile`);
  };

  const updateSeat = async (userId: string, seatIndex: number | null) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) return { ...u, seatIndex };
      if (seatIndex !== null && u.seatIndex === seatIndex) return { ...u, seatIndex: null };
      return u;
    }));
    
    if (isSupabaseConfigured()) {
       if (seatIndex !== null) {
           await supabase.from('users').update({ seatIndex: null }).eq('seatIndex', seatIndex);
       }
       await supabase.from('users').update({ seatIndex }).eq('id', userId);
    }
    logActivity(`Updated seat for user ${userId}`);
  };

  const resetSeats = async () => {
     setUsers(prev => prev.map(u => ({ ...u, seatIndex: null })));
     if (isSupabaseConfigured()) await supabase.from('users').update({ seatIndex: null }).neq('id', '0');
     logActivity('Reset all seats');
  };

  const randomizeSeats = async () => {
    const students = users.filter(u => u.role === Role.STUDENT);
    const studentIds = students.map(u => u.id);
    const shuffled = [...studentIds].sort(() => Math.random() - 0.5);
    
    const updates = students.map(u => {
      const idx = shuffled.indexOf(u.id);
      return { id: u.id, seatIndex: idx < 35 ? idx : null };
    });

    setUsers(prev => prev.map(u => {
      if (u.role === Role.STUDENT) {
        const up = updates.find(x => x.id === u.id);
        return { ...u, seatIndex: up ? up.seatIndex : null };
      }
      return u;
    }));

    if (isSupabaseConfigured()) {
        for (const up of updates) {
            await supabase.from('users').update({ seatIndex: up.seatIndex }).eq('id', up.id);
        }
    }
    logActivity('Randomized seats');
  };

  return (
    <StoreContext.Provider value={{
      currentUser, users, subjects, announcements, tasks, schedule, videos, materials, tutorEvents, activityLog, isDarkMode, isLoading,
      toggleDarkMode, login, loginWithGoogle, logout, 
      addAnnouncement, addTask, toggleTaskCompletion,
      addSubject, deleteSubject, addScheduleItem, deleteScheduleItem,
      addVideo, deleteVideo,
      addMaterial, deleteMaterial,
      addTutorEvent, editTutorEvent, deleteTutorEvent, joinTutorEvent, leaveTutorEvent, promoteFromWaitingList, assignUserToEvent, kickFromEvent,
      updateUserRole, updateUserStatus, updateUserProfile,
      updateSeat, resetSeats, randomizeSeats
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
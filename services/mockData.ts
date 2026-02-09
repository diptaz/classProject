import bcrypt from 'bcryptjs';
import { Role, User, Announcement, Task, ScheduleItem, VideoMaterial, Subject, DocumentMaterial, TutorEvent } from '../types';

// Pre-hash the password 'password' for performance
const hash = bcrypt.hashSync('password', 10);

export const generateUsers = (): User[] => {
  const users: User[] = [];

  // 1 Admin
  users.push({ id: 'admin', username: 'admin', fullName: 'Super Administrator', role: Role.ADMIN, isActive: true, password: hash });
  // 1 Kurikulum
  users.push({ id: 'kuri', username: 'kurikulum', fullName: 'Staff Kurikulum', role: Role.KURIKULUM, isActive: true, password: hash });
  // 1 Komti
  users.push({ id: 'komti', username: 'komti', fullName: 'Ketua Tingkat', role: Role.KOMTI, isActive: true, password: hash });
  // 1 Wakomti
  users.push({ id: 'wakomti', username: 'wakomti', fullName: 'Wakil Ketua', role: Role.WAKOMTI, isActive: true, password: hash });
  // 1 IT
  users.push({ id: 'it', username: 'it', fullName: 'IT Support', role: Role.IT_LOGISTIK, isActive: true, password: hash });
  // 1 Tatib
  users.push({ id: 'tatib', username: 'tatib', fullName: 'Tata Tertib', role: Role.TATA_TERTIB, isActive: true, password: hash });
  // 1 Sekretaris
  users.push({ id: 'sekre', username: 'sekretaris', fullName: 'Sekretaris Kelas', role: Role.SEKRETARIS, isActive: true, password: hash });
  
  // 1 Murid Bibilung (Tutor)
  users.push({ id: 'bibilung1', username: 'bibilung', fullName: 'Master Bibilung', role: Role.MURID_BIBILUNG, isActive: true, password: hash });

  // 35 Students
  for (let i = 1; i <= 35; i++) {
    users.push({
      id: `s${i}`,
      username: `student${i}`,
      fullName: `Student Name ${i}`,
      role: Role.STUDENT,
      isActive: true,
      password: hash,
      seatIndex: i - 1 // Initial seating 0-34
    });
  }

  return users;
};

export const initialSubjects: Subject[] = [
  { id: '1', name: 'Web Development', code: 'WEB101', teacher: 'Mr. Smith' },
  { id: '2', name: 'Database Systems', code: 'DB201', teacher: 'Mrs. Jones' },
  { id: '3', name: 'Calculus', code: 'MAT301', teacher: 'Dr. Brown' },
  { id: '4', name: 'English', code: 'ENG101', teacher: 'Ms. Wilson' },
];

export const initialAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to the New Semester!',
    content: 'Please check your schedule and seating arrangement.',
    date: new Date().toISOString(),
    authorId: 'komti',
    authorName: 'Ketua Tingkat',
    type: 'IMPORTANT'
  }
];

export const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Calculus Homework Chapter 1',
    description: 'Solve problems 1-10 on page 24.',
    subject: 'Calculus',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days later
    isCompleted: false,
    createdBy: Role.KURIKULUM
  }
];

export const initialSchedule: ScheduleItem[] = [
  { id: '1', day: 'Monday', time: '08:00 - 10:00', subject: 'Web Development', room: 'Lab 1' },
  { id: '2', day: 'Monday', time: '10:00 - 12:00', subject: 'Database Systems', room: 'Lab 2' },
  { id: '3', day: 'Tuesday', time: '08:00 - 10:00', subject: 'English', room: 'Class A' },
];

export const initialVideos: VideoMaterial[] = [
  {
    id: '1',
    title: 'Intro to React',
    url: 'https://www.youtube.com/embed/SqcY0GlETPk', 
    subject: 'Web Development',
    week: 1,
    uploadedBy: 'Kurikulum'
  }
];

export const initialMaterials: DocumentMaterial[] = [
  {
    id: '1',
    title: 'Database Normalization Guide',
    type: 'PDF',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Comprehensive guide to 1NF, 2NF, 3NF',
    subject: 'Database Systems',
    uploadedBy: 'Sekretaris'
  }
];

export const initialTutorEvents: TutorEvent[] = [
  {
    id: '1',
    title: 'React Hooks Deep Dive',
    description: 'Extra class to understand useEffect and useState deeply.',
    date: new Date(Date.now() + 86400000 * 3).toISOString(),
    tutorId: 'bibilung1',
    tutorName: 'Master Bibilung',
    maxParticipants: 5,
    participants: ['s1', 's2'],
    waitingList: []
  }
];
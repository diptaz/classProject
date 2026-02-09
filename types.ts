export enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  KURIKULUM = 'KURIKULUM',
  KOMTI = 'KOMTI',
  WAKOMTI = 'WAKOMTI',
  IT_LOGISTIK = 'IT_LOGISTIK',
  TATA_TERTIB = 'TATA_TERTIB',
  SEKRETARIS = 'SEKRETARIS',
  MURID_BIBILUNG = 'MURID_BIBILUNG',
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  password?: string; // In a real app, never store plain password
  isActive: boolean;
  seatIndex?: number | null; // For seating plan (0-34)
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  authorId: string;
  authorName: string;
  type: 'NORMAL' | 'IMPORTANT' | 'EMERGENCY';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string; // Should match Subject.name or ID
  deadline: string;
  isCompleted: boolean; // For student view toggling locally
  createdBy: Role;
}

export interface ScheduleItem {
  id: string;
  day: string; // "Monday", etc.
  time: string;
  subject: string;
  room: string;
}

export interface VideoMaterial {
  id: string;
  title: string;
  url: string; // YouTube or Drive link
  subject: string;
  week: number;
  uploadedBy: string;
}

export interface DocumentMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'DOC';
  url: string;
  description: string;
  subject: string;
  uploadedBy: string;
}

export interface TutorEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  tutorId: string;
  tutorName: string;
  maxParticipants: number;
  participants: string[]; // List of User IDs who joined
}

// Log activity
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
}
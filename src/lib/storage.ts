import { Teacher, School, ClassData, AttendanceSubmission } from '@/types';

const STORAGE_KEYS = {
  TEACHER: 'teacher_profile',
  SCHOOL: 'school_profile',
  CLASSES: 'class_data',
  PENDING_SUBMISSIONS: 'pending_submissions',
  IS_ONLINE: 'is_online'
};

export const storage = {
  // Teacher
  saveTeacher: (teacher: Teacher) => {
    localStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(teacher));
  },
  getTeacher: (): Teacher | null => {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHER);
    return data ? JSON.parse(data) : null;
  },

  // School
  saveSchool: (school: School) => {
    localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(school));
  },
  getSchool: (): School | null => {
    const data = localStorage.getItem(STORAGE_KEYS.SCHOOL);
    return data ? JSON.parse(data) : null;
  },

  // Classes
  saveClasses: (classes: ClassData[]) => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  },
  getClasses: (): ClassData[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return data ? JSON.parse(data) : [];
  },
  updateClass: (classId: string, classData: ClassData) => {
    const classes = storage.getClasses();
    const index = classes.findIndex(c => `${c.grade}${c.section}` === classId);
    if (index !== -1) {
      classes[index] = classData;
      storage.saveClasses(classes);
    }
  },

  // Pending Submissions
  savePendingSubmission: (submission: AttendanceSubmission) => {
    const pending = storage.getPendingSubmissions();
    pending.push(submission);
    localStorage.setItem(STORAGE_KEYS.PENDING_SUBMISSIONS, JSON.stringify(pending));
  },
  getPendingSubmissions: (): AttendanceSubmission[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING_SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  },
  clearPendingSubmissions: () => {
    localStorage.setItem(STORAGE_KEYS.PENDING_SUBMISSIONS, JSON.stringify([]));
  },

  // Clear all
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};

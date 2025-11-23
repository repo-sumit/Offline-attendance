export interface Teacher {
  id: string;
  name: string;
  designation: string;
}

export interface School {
  udise: string;
  name: string;
  block: string;
  district: string;
}

export interface Student {
  id: string;
  name: string;
  isPresent: boolean;
  hasMeal: boolean;
}

export interface ClassData {
  grade: string;
  section: string;
  students: Student[];
  isDownloaded: boolean;
  lastRefreshed?: Date;
}

export interface AttendanceSubmission {
  classId: string;
  date: string;
  students: {
    id: string;
    isPresent: boolean;
    hasMeal: boolean;
  }[];
  isPending: boolean;
}

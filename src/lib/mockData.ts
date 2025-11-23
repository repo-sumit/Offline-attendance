import { Teacher, School, Student } from '@/types';

// Mock API calls - Replace with real API calls in production
export const mockApi = {
  validateTeacherId: async (teacherId: string): Promise<Teacher | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock validation
    if (teacherId === '12345678') {
      return {
        id: teacherId,
        name: 'Priya Sharma',
        designation: 'Primary Teacher'
      };
    }
    return null;
  },

  validateUdise: async (udise: string): Promise<School | null> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (udise === '27251234567') {
      return {
        udise,
        name: 'Maharashtra Primary School',
        block: 'Pune City',
        district: 'Pune'
      };
    }
    return null;
  },

  fetchClassStudents: async (grade: string, section: string): Promise<Student[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock students
    const studentCount = Math.floor(Math.random() * 15) + 25; // 25-40 students
    const students: Student[] = [];
    
    for (let i = 1; i <= studentCount; i++) {
      students.push({
        id: `${grade}${section}${String(i).padStart(4, '0')}${Math.floor(Math.random() * 10000)}`,
        name: generateStudentName(),
        isPresent: false,
        hasMeal: false
      });
    }
    
    return students;
  },

  submitAttendance: async (data: any): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }
};

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Aadhya', 'Ananya', 'Diya', 'Saanvi', 'Pari', 'Advait', 'Ishaan', 'Krishna', 'Rohan', 'Shruti', 'Tanvi', 'Riya', 'Prisha', 'Vedant', 'Arnav'];
const lastNames = ['Patil', 'Deshmukh', 'Kulkarni', 'Jadhav', 'Pawar', 'Shinde', 'More', 'Salvi', 'Naik', 'Joshi', 'Kamble', 'Gaikwad', 'Bhosale', 'Mane', 'Sawant'];

function generateStudentName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

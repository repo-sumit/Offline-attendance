import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { mockApi } from '@/lib/mockData';
import { ClassData, Student, Teacher, School } from '@/types';
import { OnlineStatusBadge } from '@/components/OnlineStatusBadge';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, X, Upload } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Attendance = () => {
  const { classId } = useParams<{ classId: string }>();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const savedTeacher = storage.getTeacher();
      const savedSchool = storage.getSchool();
      setTeacher(savedTeacher);
      setSchool(savedSchool);

      if (!classId) {
        navigate('/home');
        return;
      }

      const grade = classId.charAt(0);
      const section = classId.charAt(1);
      const classes = storage.getClasses();
      const foundClass = classes.find(c => c.grade === grade && c.section === section);

      // In offline mode, class must be downloaded
      if (!isOnline) {
        if (!foundClass || !foundClass.isDownloaded) {
          toast({
            title: "Download Required",
            description: "Please download the class for offline use",
            variant: "destructive"
          });
          navigate('/home');
          return;
        }
        setClassData(foundClass);
        setStudents(foundClass.students);
        setIsLoading(false);
      } else {
        // In online mode, fetch students from API if not in storage
        if (foundClass) {
          setClassData(foundClass);
          setStudents(foundClass.students);
          setIsLoading(false);
        } else {
          // Fetch from API
          try {
            const fetchedStudents = await mockApi.fetchClassStudents(grade, section);
            const newClassData: ClassData = {
              grade,
              section,
              students: fetchedStudents,
              isDownloaded: false
            };
            setClassData(newClassData);
            setStudents(fetchedStudents);
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to load students",
              variant: "destructive"
            });
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    loadData();
  }, [classId, navigate, toast, isOnline]);

  const toggleAttendance = (studentId: string) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === studentId ? { ...s, isPresent: !s.isPresent } : s
      )
    );
  };

  const handleSubmit = async () => {
    setShowSubmitDialog(false);
    setIsSubmitting(true);

    const submissionData = {
      classId: classId!,
      date: format(new Date(), 'yyyy-MM-dd'),
      students: students.map(s => ({
        id: s.id,
        isPresent: s.isPresent,
        hasMeal: s.hasMeal
      })),
      isPending: !isOnline
    };

    try {
      if (isOnline) {
        await mockApi.submitAttendance(submissionData);
        toast({
          title: "Attendance Submitted",
          description: "Attendance has been submitted successfully"
        });
      } else {
        storage.savePendingSubmission(submissionData);
        toast({
          title: "Saved Offline",
          description: "Attendance will be uploaded when online"
        });
      }
      navigate('/home');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit attendance",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setShowDiscardDialog(false);
    navigate('/home');
  };

  const presentCount = students.filter(s => s.isPresent).length;
  const absentCount = students.length - presentCount;

  if (!teacher || !school) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-3 md:p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-2xl mx-auto space-y-2 md:space-y-3">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/home')}
              className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 md:h-9 md:w-9 p-0"
            >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-base md:text-xl font-bold">Class {classId} Attendance</h1>
              <p className="text-xs md:text-sm opacity-90">{school.name}</p>
            </div>
            <OnlineStatusBadge />
          </div>

          <div className="flex items-center justify-between text-xs md:text-sm">
            <span>Teacher: {teacher.name}</span>
            <span>{format(new Date(), 'dd MMM yyyy')}</span>
          </div>

          <div className="flex gap-3 md:gap-4 text-xs md:text-sm bg-primary-foreground/10 p-2 rounded">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Check className="h-3 w-3 md:h-4 md:w-4" />
              Present: {presentCount}
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <X className="h-3 w-3 md:h-4 md:w-4" />
              Absent: {absentCount}
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="max-w-2xl mx-auto p-3 md:p-4 space-y-2">
        {students.map((student) => (
          <Card
            key={student.id}
            className="p-3 md:p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-98"
            onClick={() => toggleAttendance(student.id)}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                variant={student.isPresent ? "default" : "outline"}
                size="lg"
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex-shrink-0 ${
                  student.isPresent ? 'bg-blue-600 hover:bg-blue-700' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAttendance(student.id);
                }}
              >
                {student.isPresent ? (
                  <Check className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <X className="h-5 w-5 md:h-6 md:w-6" />
                )}
              </Button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm md:text-base truncate">{student.name}</p>
                <p className="text-xs md:text-sm text-muted-foreground font-mono">{student.id}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-3 md:p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-11 md:h-12 text-sm md:text-base"
            onClick={() => setShowDiscardDialog(true)}
          >
            Discard
          </Button>
          <Button
            className="flex-1 h-11 md:h-12 text-sm md:text-base"
            onClick={() => setShowSubmitDialog(true)}
            disabled={isSubmitting}
          >
            {!isOnline && <Upload className="mr-2 h-3 w-3 md:h-4 md:w-4" />}
            Submit
          </Button>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Attendance?</AlertDialogTitle>
            <AlertDialogDescription>
              You are marking {presentCount} students as present and {absentCount} as absent.
              {!isOnline && " (Will be uploaded when online)"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard all unsaved attendance changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Attendance;

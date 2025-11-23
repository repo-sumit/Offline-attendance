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
import { ArrowLeft, Check, X, Upload, UtensilsCrossed } from 'lucide-react';
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

const MealAttendance = () => {
  const { classId } = useParams<{ classId: string }>();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { toast } = useToast();

  useEffect(() => {
    const savedTeacher = storage.getTeacher();
    const savedSchool = storage.getSchool();
    setTeacher(savedTeacher);
    setSchool(savedSchool);

    if (!classId) {
      navigate('/home');
      return;
    }

    const classes = storage.getClasses();
    const grade = classId.charAt(0);
    const section = classId.charAt(1);
    const foundClass = classes.find(c => c.grade === grade && c.section === section);

    if (!foundClass) {
      toast({
        title: "Class Not Found",
        description: "Class data not available",
        variant: "destructive"
      });
      navigate('/home');
      return;
    }

    // In offline mode, class must be downloaded
    if (!isOnline && !foundClass.isDownloaded) {
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
  }, [classId, navigate, toast]);

  const toggleMeal = (studentId: string) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === studentId ? { ...s, hasMeal: !s.hasMeal } : s
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
          title: "Meal Attendance Submitted",
          description: "Meal attendance has been submitted successfully"
        });
      } else {
        storage.savePendingSubmission(submissionData);
        toast({
          title: "Saved Offline",
          description: "Meal attendance will be uploaded when online"
        });
      }
      navigate('/home');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit meal attendance",
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

  const mealCount = students.filter(s => s.hasMeal).length;
  const noMealCount = students.length - mealCount;

  if (!classData || !teacher || !school) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/home')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Class {classId} Meal
              </h1>
              <p className="text-sm opacity-90">{school.name}</p>
            </div>
            <OnlineStatusBadge />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Teacher: {teacher.name}</span>
            <span>{format(new Date(), 'dd MMM yyyy')}</span>
          </div>

          <div className="flex gap-4 text-sm bg-primary-foreground/10 p-2 rounded">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Had Meal: {mealCount}
            </div>
            <div className="flex items-center gap-2">
              <X className="h-4 w-4" />
              No Meal: {noMealCount}
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="max-w-2xl mx-auto p-4 space-y-2">
        {students.map((student) => (
          <Card
            key={student.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleMeal(student.id)}
          >
            <div className="flex items-center gap-4">
              <Button
                variant={student.hasMeal ? "default" : "outline"}
                size="lg"
                className={`w-16 h-16 rounded-full ${
                  student.hasMeal ? 'bg-orange-600 hover:bg-orange-700' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMeal(student.id);
                }}
              >
                {student.hasMeal ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <X className="h-6 w-6" />
                )}
              </Button>
              <div className="flex-1">
                <p className="font-semibold">{student.name}</p>
                <p className="text-sm text-muted-foreground font-mono">{student.id}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowDiscardDialog(true)}
          >
            Discard
          </Button>
          <Button
            className="flex-1"
            onClick={() => setShowSubmitDialog(true)}
            disabled={isSubmitting}
          >
            {!isOnline && <Upload className="mr-2 h-4 w-4" />}
            Submit
          </Button>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Meal Attendance?</AlertDialogTitle>
            <AlertDialogDescription>
              You are marking {mealCount} students as having had meals.
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
              This will discard all unsaved meal attendance changes.
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

export default MealAttendance;

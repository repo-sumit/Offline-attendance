import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { mockApi } from '@/lib/mockData';
import { Teacher, School, ClassData } from '@/types';
import { OnlineStatusBadge } from '@/components/OnlineStatusBadge';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useToast } from '@/hooks/use-toast';
import { Download, RefreshCw, ChevronDown, ChevronUp, Loader2, Calendar, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Home = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [loadingClass, setLoadingClass] = useState<string | null>(null);
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { toast } = useToast();

  useEffect(() => {
    const savedTeacher = storage.getTeacher();
    const savedSchool = storage.getSchool();
    
    if (!savedTeacher || !savedSchool) {
      navigate('/');
    } else {
      setTeacher(savedTeacher);
      setSchool(savedSchool);
      
      // Load saved classes or initialize
      const savedClasses = storage.getClasses();
      if (savedClasses.length > 0) {
        setClasses(savedClasses);
      } else {
        initializeClasses();
      }
    }
  }, [navigate]);

  const initializeClasses = () => {
    // Primary school example (grades 1-5)
    const grades = ['1', '2', '3', '4', '5'];
    const sections = ['A', 'B', 'C'];
    
    const initialClasses: ClassData[] = [];
    grades.forEach(grade => {
      sections.forEach(section => {
        initialClasses.push({
          grade,
          section,
          students: [],
          isDownloaded: false
        });
      });
    });
    
    setClasses(initialClasses);
    storage.saveClasses(initialClasses);
  };

  const handleDownload = async (classId: string) => {
    if (!isOnline) {
      toast({
        title: "Offline Mode",
        description: "Cannot download classes while offline",
        variant: "destructive"
      });
      return;
    }

    setLoadingClass(classId);
    const [grade, section] = [classId.charAt(0), classId.charAt(1)];
    
    try {
      const students = await mockApi.fetchClassStudents(grade, section);
      
      const updatedClasses = classes.map(c => {
        if (`${c.grade}${c.section}` === classId) {
          return {
            ...c,
            students,
            isDownloaded: true,
            lastRefreshed: new Date()
          };
        }
        return c;
      });
      
      setClasses(updatedClasses);
      storage.saveClasses(updatedClasses);
      
      toast({
        title: "Class Downloaded",
        description: `Class ${grade}${section} roster downloaded successfully`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download class data",
        variant: "destructive"
      });
    } finally {
      setLoadingClass(null);
    }
  };

  const handleLogout = () => {
    storage.clearAll();
    navigate('/');
  };

  const downloadedClasses = classes.filter(c => c.isDownloaded);
  const notDownloadedClasses = classes.filter(c => !c.isDownloaded);

  if (!teacher || !school) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Attendance</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
          
          <Card className="bg-primary-foreground/10 border-none">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">School</p>
                  <p className="font-semibold">{school.name}</p>
                </div>
                <OnlineStatusBadge />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="opacity-90">Teacher: </span>
                  <span className="font-medium">{teacher.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(), 'dd MMM yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Class List */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-semibold">Your Classes</h2>
        
        {/* Downloaded Classes */}
        {downloadedClasses.map(classItem => {
          const classId = `${classItem.grade}${classItem.section}`;
          const isExpanded = expandedClass === classId;
          
          return (
            <Collapsible
              key={classId}
              open={isExpanded}
              onOpenChange={(open) => setExpandedClass(open ? classId : null)}
            >
              <Card className="overflow-hidden border-primary/20">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">{classId}</span>
                      </div>
                      <div>
                        <p className="font-semibold">Class {classId}</p>
                        <p className="text-sm text-muted-foreground">
                          {classItem.students.length} students
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isOnline && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(classId);
                          }}
                          disabled={loadingClass === classId}
                        >
                          {loadingClass === classId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="border-t p-4 space-y-2 bg-muted/30">
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/attendance/${classId}`)}
                      >
                        Mark Attendance
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => navigate(`/meal-attendance/${classId}`)}
                      >
                        Mark Meal Attendance
                      </Button>
                    </div>
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          );
        })}
        
        {/* Not Downloaded Classes */}
        {notDownloadedClasses.map(classItem => {
          const classId = `${classItem.grade}${classItem.section}`;
          const isLoading = loadingClass === classId;
          
          return (
            <Card key={classId} className={!isOnline ? "opacity-50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-lg font-bold text-muted-foreground">{classId}</span>
                    </div>
                    <div>
                      <p className="font-semibold">Class {classId}</p>
                      <Badge variant="secondary" className="text-xs">Not Downloaded</Badge>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleDownload(classId)}
                    disabled={!isOnline || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Home;

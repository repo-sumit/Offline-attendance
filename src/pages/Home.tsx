import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { mockApi } from '@/lib/mockData';
import { Teacher, School, ClassData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Download, RefreshCw, Loader2, Calendar, LogOut, Wifi, WifiOff, UtensilsCrossed, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Home = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loadingClass, setLoadingClass] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(() => storage.getOnlineMode());
  const [pendingCount, setPendingCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
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
      
      // Check pending submissions
      updatePendingCount();
    }
  }, [navigate]);

  const updatePendingCount = () => {
    const pending = storage.getPendingSubmissions();
    setPendingCount(pending.length);
  };

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
  
  // In online mode: show all classes in ascending order
  // In offline mode: show downloaded first, then not downloaded
  const displayClasses = isOnline 
    ? [...classes].sort((a, b) => {
        const orderA = `${a.grade}${a.section}`;
        const orderB = `${b.grade}${b.section}`;
        return orderA.localeCompare(orderB);
      })
    : [...downloadedClasses, ...notDownloadedClasses];

  const handleUploadPending = async () => {
    const pending = storage.getPendingSubmissions();
    
    if (pending.length === 0) {
      toast({
        title: "No Pending Data",
        description: "There are no pending submissions to upload"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      let successCount = 0;
      for (const submission of pending) {
        await mockApi.submitAttendance(submission);
        successCount++;
      }
      
      storage.clearPendingSubmissions();
      updatePendingCount();
      
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successCount} attendance record(s)`
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload some attendance records",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const toggleOnlineMode = () => {
    const newMode = !isOnline;
    setIsOnline(newMode);
    storage.setOnlineMode(newMode);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('onlineModeChange', { detail: { isOnline: newMode } }));
    
    toast({
      title: newMode ? "Online Mode" : "Offline Mode",
      description: newMode ? "You are now back online" : "You are now in offline mode for testing"
    });
  };

  if (!teacher || !school) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-3 md:p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-2xl mx-auto space-y-2 md:space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-xl font-bold">Attendance</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/10 text-xs md:text-sm"
            >
              <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              Logout
            </Button>
          </div>

          {/* Demo Mode Toggle */}
          <Card className="bg-primary-foreground/10 border-none">
            <CardContent className="p-2 md:p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  )}
                  <Label htmlFor="mode-toggle" className="cursor-pointer font-medium text-xs md:text-sm">
                    <span className={isOnline ? 'text-foreground' : 'text-destructive'}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span> Mode (Demo)
                  </Label>
                </div>
                <Switch
                  id="mode-toggle"
                  checked={isOnline}
                  onCheckedChange={toggleOnlineMode}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary-foreground/10 border-none">
            <CardContent className="p-2 md:p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90">School</p>
                  <p className="font-semibold text-sm md:text-base">{school.name}</p>
                </div>
                <Badge 
                  variant={isOnline ? "default" : "destructive"}
                  className={`gap-1 md:gap-1.5 text-xs ${isOnline ? 'bg-success hover:bg-success/80' : ''}`}
                >
                  {isOnline ? (
                    <>
                      <Wifi className="h-3 w-3" />
                      Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
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
      <div className="max-w-2xl mx-auto p-3 md:p-4 space-y-3 md:space-y-4">
        <h2 className="text-base md:text-lg font-semibold">Your Classes</h2>
        
        {/* All Classes */}
        {displayClasses.map(classItem => {
          const classId = `${classItem.grade}${classItem.section}`;
          const isLoading = loadingClass === classId;
          const isDownloaded = classItem.isDownloaded;
          
          return (
            <Card key={classId} className={`overflow-hidden ${isDownloaded ? 'border-primary/20' : ''} ${!isOnline && !isDownloaded ? 'opacity-50' : ''}`}>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${isDownloaded ? 'bg-primary/10' : 'bg-muted'} flex items-center justify-center`}>
                      <span className={`text-base md:text-lg font-bold ${isDownloaded ? 'text-primary' : 'text-muted-foreground'}`}>{classId}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base">Class {classId}</p>
                      {isDownloaded ? (
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {classItem.students.length} students
                        </p>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Not Downloaded</Badge>
                      )}
                    </div>
                  </div>
                  
                  {isDownloaded && isOnline ? (
                    <div className="flex items-center gap-1">
                      {pendingCount > 0 && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleUploadPending}
                          disabled={isUploading}
                          className="h-8 md:h-9 gap-1 text-xs"
                        >
                          {isUploading ? (
                            <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                          ) : (
                            <Upload className="h-3 w-3 md:h-4 md:w-4" />
                          )}
                          <span className="hidden sm:inline">Upload ({pendingCount})</span>
                          <span className="sm:hidden">{pendingCount}</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(classId)}
                        disabled={isLoading}
                        className="h-8 w-8 md:h-9 md:w-9 p-0"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
                        )}
                      </Button>
                    </div>
                  ) : !isDownloaded && (
                    <Button
                      size="sm"
                      onClick={() => handleDownload(classId)}
                      disabled={!isOnline || isLoading}
                      className="text-xs md:text-sm h-8 md:h-9"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                          <span className="hidden sm:inline">Downloading</span>
                        </>
                      ) : (
                        <>
                          <Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                          Download
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Button
                    className="w-full h-10 md:h-11 text-sm md:text-base"
                    onClick={() => navigate(`/attendance/${classId}`)}
                    disabled={!isOnline && !isDownloaded}
                  >
                    Mark Attendance
                  </Button>
                  <Button
                    className="w-full h-10 md:h-11 text-sm md:text-base"
                    variant="outline"
                    onClick={() => navigate(`/meal-attendance/${classId}`)}
                    disabled={!isOnline && !isDownloaded}
                  >
                    <UtensilsCrossed className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                    Mark Meal Attendance
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

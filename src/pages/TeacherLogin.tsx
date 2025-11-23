import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { mockApi } from '@/lib/mockData';
import { storage } from '@/lib/storage';
import { Loader2, GraduationCap } from 'lucide-react';

const TeacherLogin = () => {
  const [teacherId, setTeacherId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (teacherId.length !== 8 || !/^\d+$/.test(teacherId)) {
      toast({
        title: "Invalid Teacher ID",
        description: "Teacher ID must be exactly 8 digits",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const teacher = await mockApi.validateTeacherId(teacherId);
      
      if (teacher) {
        storage.saveTeacher(teacher);
        navigate('/teacher-confirm');
      } else {
        toast({
          title: "Invalid Teacher ID",
          description: "No teacher found with this ID",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate Teacher ID. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Teacher Login</CardTitle>
            <CardDescription>Enter your Teacher ID to continue</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacherId">Teacher ID</Label>
              <Input
                id="teacherId"
                type="tel"
                inputMode="numeric"
                maxLength={8}
                placeholder="12345678"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value.replace(/\D/g, ''))}
                className="text-lg text-center tracking-wider"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground text-center">
                8-digit numeric ID
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Submit'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Demo ID: 12345678
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherLogin;

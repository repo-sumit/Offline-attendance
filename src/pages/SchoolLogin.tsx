import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { mockApi } from '@/lib/mockData';
import { storage } from '@/lib/storage';
import { Loader2, School } from 'lucide-react';

const SchoolLogin = () => {
  const [udise, setUdise] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (udise.length !== 11 || !/^\d+$/.test(udise)) {
      toast({
        title: "Invalid UDISE Code",
        description: "UDISE Code must be exactly 11 digits",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const school = await mockApi.validateUdise(udise);
      
      if (school) {
        storage.saveSchool(school);
        navigate('/school-confirm');
      } else {
        toast({
          title: "Invalid UDISE Code",
          description: "No school found with this code",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate UDISE Code. Please try again.",
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
            <School className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">School Verification</CardTitle>
            <CardDescription>Enter your School UDISE Code</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="udise">UDISE Code</Label>
              <Input
                id="udise"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                placeholder="27251234567"
                value={udise}
                onChange={(e) => setUdise(e.target.value.replace(/\D/g, ''))}
                className="text-lg text-center tracking-wider"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground text-center">
                11-digit unique school identifier
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
              Demo UDISE: 27251234567
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolLogin;

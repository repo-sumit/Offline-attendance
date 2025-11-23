import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { School } from '@/types';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

const SchoolConfirm = () => {
  const [school, setSchool] = useState<School | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedSchool = storage.getSchool();
    if (!savedSchool) {
      navigate('/school-login');
    } else {
      setSchool(savedSchool);
    }
  }, [navigate]);

  if (!school) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Confirm School Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">School Name</p>
              <p className="text-lg font-semibold">{school.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">UDISE Code</p>
              <p className="text-lg font-mono">{school.udise}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Block/Taluka</p>
              <p className="text-lg">{school.block}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">District</p>
              <p className="text-lg">{school.district}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/home')} 
              className="w-full"
            >
              Confirm
            </Button>
            <Button 
              onClick={() => navigate('/school-login')} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Re-enter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolConfirm;

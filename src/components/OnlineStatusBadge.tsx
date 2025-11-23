import { Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Badge } from '@/components/ui/badge';

export const OnlineStatusBadge = () => {
  const isOnline = useOnlineStatus();

  return (
    <Badge variant={isOnline ? "default" : "secondary"} className="gap-1.5">
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
  );
};

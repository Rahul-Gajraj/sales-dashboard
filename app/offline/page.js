'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6 space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-gray-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-gray-900">You're Offline</h1>
            <p className="text-gray-600">
              No internet connection detected. Some features may be limited.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <p className="text-xs text-gray-500">
              The app will work with cached data when possible
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  let errorMessage = 'An error occurred during authentication.';
  let errorDetails = 'Please try again or contact support if the issue persists.';
  
  if (error === 'AccessDenied') {
    errorMessage = 'Access Denied';
    errorDetails = 'Only @maaruji.com and @cronberry.com email addresses are allowed to access this application.';
  } else if (error === 'Configuration') {
    errorMessage = 'Configuration Error';
    errorDetails = 'There\'s an issue with the authentication setup. Please contact support.';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-red-600">{errorMessage}</h1>
            <p className="text-gray-600">{errorDetails}</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Back to Sign In
            </Button>
            
            <p className="text-xs text-gray-500">
              Need help? Contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
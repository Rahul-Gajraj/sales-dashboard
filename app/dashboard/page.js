'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Navigation } from '@/components/Navigation';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ['me.summary', '2025Q3'],
    queryFn: async () => {
      const response = await fetch('/api/summary?cycle_id=2025Q3');
      if (!response.ok) throw new Error('Failed to fetch summary');
      return response.json();
    },
    enabled: !!session,
    staleTime: 15 * 60 * 1000,
  });

  const { data: activity } = useQuery({
    queryKey: ['me.activity', '2025Q3'],
    queryFn: async () => {
      const response = await fetch('/api/activity?cycle_id=2025Q3&limit=10');
      if (!response.ok) throw new Error('Failed to fetch activity');
      return response.json();
    },
    enabled: !!session,
    staleTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">Failed to load dashboard data</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {summary?.rep?.name}!
            </h1>
            <p className="text-sm text-gray-600">
              Last updated: {formatDateTime(summary?.last_computed_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* Sales Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Sales Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Target</p>
                <p className="text-lg font-semibold">{formatCurrency(summary?.sales?.target)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-lg font-semibold">{formatCurrency(summary?.sales?.remaining)}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 justify-start"
                onClick={() => router.push('/achieved-logs')}
              >
                <div className="text-left w-full">
                  <p className="text-sm text-gray-600">Achieved</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(summary?.sales?.achieved)}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 justify-start"
                onClick={() => router.push('/refund-logs')}
              >
                <div className="text-left w-full">
                  <p className="text-sm text-gray-600">Refunds</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(summary?.sales?.refunds)}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Points & Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Points & Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Points</p>
                <p className="text-2xl font-bold">{summary?.points?.total}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {summary?.points?.level}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Incentives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Incentives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-semibold">{formatCurrency(summary?.incentives?.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Released</span>
                <span className="font-semibold">{formatCurrency(summary?.incentives?.monthly_released)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quarterly Hold</span>
                <span className="font-semibold">{formatCurrency(summary?.incentives?.quarterly_hold)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity (this week) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity (this week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Demos: <strong>{summary?.weekly?.demos}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Closures: <strong>{summary?.weekly?.closures}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm">Refunds: <strong>{summary?.weekly?.refunds}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm">Response: <strong>{summary?.weekly?.avg_response_time_min}m</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity?.items?.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.text}</p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    +{item.points}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Message */}
        {summary?.message && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-blue-800 font-medium text-center">
                {summary.message}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Navigation activeTab="dashboard" />
    </div>
  );
}
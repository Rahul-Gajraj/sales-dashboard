'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Calendar, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Mock data for month-wise refund logs with detailed transactions
const mockRefundLogs = [
  {
    month: 'September 2025',
    total: 2500,
    count: 1,
    transactions: [
      { date: '2025-09-20', client: 'Unsatisfied Corp', amount: 2500, lead_id: 'UC001', reason: 'Product not as described' }
    ]
  },
  {
    month: 'August 2025', 
    total: 4500,
    count: 2,
    transactions: [
      { date: '2025-08-25', client: 'Tech Startup', amount: 3000, lead_id: 'TS002', reason: 'Budget constraints' },
      { date: '2025-08-18', client: 'Small Business', amount: 1500, lead_id: 'SB003', reason: 'Changed requirements' }
    ]
  },
  {
    month: 'July 2025',
    total: 0,
    count: 0,
    transactions: []
  },
  {
    month: 'June 2025',
    total: 3000,
    count: 1,
    transactions: [
      { date: '2025-06-10', client: 'Enterprise Ltd', amount: 3000, lead_id: 'EL004', reason: 'Technical issues' }
    ]
  },
];

export default function RefundLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Refund Logs</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* Summary Card */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(
                    mockRefundLogs.reduce((sum, log) => sum + log.total, 0)
                  )}
                </p>
                <p className="text-sm text-red-600">Total Refunds</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">
                  {mockRefundLogs.reduce((sum, log) => sum + log.count, 0)}
                </p>
                <p className="text-sm text-red-600">Total Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Notice */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Impact on Incentives</p>
                <p>
                  Refunds are deducted from your quarterly held incentives. 
                  Focus on quality deals to minimize refunds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Month-wise Logs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Monthly Breakdown
          </h2>
          
          {mockRefundLogs.map((log, index) => (
            <div key={index} className="space-y-2">
              <Card className={`hover:shadow-md transition-shadow ${
                log.total === 0 ? 'bg-green-50 border-green-200' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{log.month}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {log.total === 0 ? (
                          <span className="text-green-600 font-medium">
                            ✨ No refunds this month!
                          </span>
                        ) : (
                          <>
                            <span>Amount: <strong className="text-red-600">
                              {formatCurrency(log.total)}
                            </strong></span>
                            <Badge variant="destructive" className="text-xs">
                              {log.count} {log.count === 1 ? 'refund' : 'refunds'}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {log.total > 0 ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const element = document.getElementById(`refund-transactions-${index}`);
                          if (element) {
                            element.classList.toggle('hidden');
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Details
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-green-700 bg-green-50">
                        Clean Month
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Expandable Refund Transactions List */}
              {log.total > 0 && (
                <div id={`refund-transactions-${index}`} className="hidden">
                  <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-800 mb-3">Refund Details - {log.month}</h4>
                      <div className="space-y-2">
                        {log.transactions?.map((transaction, txIndex) => (
                          <div key={txIndex} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{transaction.client}</p>
                              <p className="text-sm text-gray-600">{transaction.date} • Lead #{transaction.lead_id}</p>
                              <p className="text-xs text-orange-600 mt-1">Reason: {transaction.reason}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-600">-{formatCurrency(transaction.amount)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 text-lg">💡 Tips to Reduce Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Qualify leads thoroughly during demo</li>
              <li>• Set clear expectations about product capabilities</li>
              <li>• Follow up proactively post-sale</li>
              <li>• Ensure proper onboarding and training</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Mock data for month-wise achieved logs with detailed transactions
const mockAchievedLogs = [
  {
    month: 'September 2025',
    total: 45000,
    deals: 8,
    transactions: [
      { date: '2025-09-25', client: 'TechCorp Ltd', amount: 12000, lead_id: 'TC001' },
      { date: '2025-09-22', client: 'StartupX', amount: 8500, lead_id: 'SX002' },
      { date: '2025-09-18', client: 'Enterprise Solutions', amount: 15000, lead_id: 'ES003' },
      { date: '2025-09-15', client: 'Digital Agency', amount: 9500, lead_id: 'DA004' }
    ]
  },
  {
    month: 'August 2025', 
    total: 35000,
    deals: 6,
    transactions: [
      { date: '2025-08-28', client: 'Global Corp', amount: 18000, lead_id: 'GC005' },
      { date: '2025-08-20', client: 'Innovation Hub', amount: 11000, lead_id: 'IH006' },
      { date: '2025-08-12', client: 'Future Tech', amount: 6000, lead_id: 'FT007' }
    ]
  },
  {
    month: 'July 2025',
    total: 28000,
    deals: 5,
    transactions: [
      { date: '2025-07-30', client: 'Smart Solutions', amount: 14000, lead_id: 'SS008' },
      { date: '2025-07-15', client: 'NextGen Corp', amount: 9000, lead_id: 'NG009' },
      { date: '2025-07-08', client: 'Cloud Systems', amount: 5000, lead_id: 'CS010' }
    ]
  }
];

export default function AchievedLogsPage() {
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
            <h1 className="text-2xl font-bold text-gray-900">Achieved Logs</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* Summary Card */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(
                    mockAchievedLogs.reduce((sum, log) => sum + log.total, 0)
                  )}
                </p>
                <p className="text-sm text-green-600">Total Achieved</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {mockAchievedLogs.reduce((sum, log) => sum + log.deals, 0)}
                </p>
                <p className="text-sm text-green-600">Total Deals</p>
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
          
          {mockAchievedLogs.map((log, index) => (
            <div key={index} className="space-y-2">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{log.month}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Amount: <strong className="text-green-600">
                          {formatCurrency(log.total)}
                        </strong></span>
                        <Badge variant="outline">{log.deals} deals</Badge>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const element = document.getElementById(`transactions-${index}`);
                        if (element) {
                          element.classList.toggle('hidden');
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Expandable Transactions List */}
              <div id={`transactions-${index}`} className="hidden">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Transaction Details - {log.month}</h4>
                    <div className="space-y-2">
                      {log.transactions?.map((transaction, txIndex) => (
                        <div key={txIndex} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.client}</p>
                            <p className="text-sm text-gray-600">{transaction.date} • Lead #{transaction.lead_id}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-700">
              💡 <strong>Note:</strong> Click "View Details" to access detailed logs 
              and transaction records for each month.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
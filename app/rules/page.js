'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Navigation';
import { BookOpen, RefreshCw, Target, Trophy, DollarSign } from 'lucide-react';

// Mock structured rules data (will come from Google Sheets)
const rulesData = {
  points: {
    stages: [
      {
        name: "Contact Stage",
        basePoints: 20,
        bonuses: [
          { name: "Speed Bonus", points: 10, condition: "Contacted within 15 minutes" },
          { name: "Quality Bonus", points: 5, condition: "Personalized message" }
        ]
      },
      {
        name: "Demo Stage", 
        basePoints: 50,
        bonuses: [
          { name: "Preparation Bonus", points: 15, condition: "Pre-demo research completed" },
          { name: "Engagement Bonus", points: 10, condition: "Interactive demo session" }
        ]
      },
      {
        name: "Closure Stage",
        basePoints: 400,
        bonuses: [
          { name: "Speed Bonus", points: 100, condition: "Closed within 7 days" },
          { name: "Upsell Bonus", points: 200, condition: "Premium plan closure" }
        ]
      }
    ]
  },
  levels: [
    { name: "Rookie", icon: "🥉", range: "0-499", commission: "0%", description: "Entry level performer" },
    { name: "Hunter", icon: "🥈", range: "500-999", commission: "10%", description: "Consistent performer" },
    { name: "Striker", icon: "🥇", range: "1000-1499", commission: "20%", description: "Top performer with priority leads" },
    { name: "Slayer", icon: "🏆", range: "1500+", commission: "30%", description: "Elite performer with exclusive benefits" }
  ],
  incentives: {
    monthly: {
      percentage: 50,
      condition: "Released if target achievement ≥ 100%",
      calculation: "(Achievement / Target) × Base Incentive × 0.5"
    },
    quarterly: {
      percentage: 50,
      condition: "Held for quarterly evaluation",
      notes: [
        "Refunds deducted from quarterly hold",
        "Released at quarter end if net positive",
        "Carries forward if negative"
      ]
    }
  }
};

export default function RulesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('points');

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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Rules & Guidelines</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* Sticky Tabbed Navigation */}
        <div className="sticky top-16 z-10 bg-gray-50 py-2 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="points" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Points
                </TabsTrigger>
                <TabsTrigger value="levels" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Levels
                </TabsTrigger>
                <TabsTrigger value="incentives" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Incentives
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* Points Tab */}
          <TabsContent value="points" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Point System by Sales Stage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {rulesData.points.stages.map((stage, index) => (
                  <div key={index} className="border-l-4 border-l-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">{stage.name}</h3>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {stage.basePoints} pts
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {stage.bonuses.map((bonus, bonusIndex) => (
                        <div key={bonusIndex} className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-green-800">{bonus.name}</span>
                            <Badge variant="outline" className="text-green-700 bg-green-100">
                              +{bonus.points} pts
                            </Badge>
                          </div>
                          <p className="text-sm text-green-600 mt-1">{bonus.condition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Levels Tab */}
          <TabsContent value="levels" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Levels & Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rulesData.levels.map((level, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    index === 0 ? 'bg-gray-50 border-gray-300' :
                    index === 1 ? 'bg-blue-50 border-blue-300' :
                    index === 2 ? 'bg-purple-50 border-purple-300' :
                    'bg-yellow-50 border-yellow-300'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{level.icon}</span>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{level.name}</h3>
                          <p className="text-sm text-gray-600">{level.range} points</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {level.commission} bonus
                      </Badge>
                    </div>
                    <p className="text-gray-700">{level.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Incentives Tab */}
          <TabsContent value="incentives" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monthly Incentives */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 text-lg">Monthly Incentives (50%)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="font-semibold text-green-800">Release Condition:</p>
                    <p className="text-sm text-green-700">{rulesData.incentives.monthly.condition}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-semibold text-gray-800">Calculation Formula:</p>
                    <code className="text-sm bg-gray-100 p-2 rounded block mt-2">
                      {rulesData.incentives.monthly.calculation}
                    </code>
                  </div>
                </CardContent>
              </Card>

              {/* Quarterly Hold */}
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800 text-lg">Quarterly Hold (50%)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <p className="font-semibold text-orange-800">Hold Condition:</p>
                    <p className="text-sm text-orange-700">{rulesData.incentives.quarterly.condition}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800">Important Notes:</p>
                    {rulesData.incentives.quarterly.notes.map((note, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <p className="text-sm text-gray-700">{note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 text-lg">💡 Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Maximize Monthly Release:</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Achieve 100%+ of monthly target</li>
                      <li>• Focus on quality leads</li>
                      <li>• Minimize refunds</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Protect Quarterly Hold:</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Proper lead qualification</li>
                      <li>• Set clear expectations</li>
                      <li>• Proactive follow-up</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </div>
      </div>

      <Navigation activeTab="rules" />
    </div>
  );
}
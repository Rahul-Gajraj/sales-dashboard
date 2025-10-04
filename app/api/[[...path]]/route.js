import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

// Mock GAS data for development
const mockSummary = {
  "cycle_id": "2025Q3",
  "rep": {"id":"r_102","name":"Pawan Sankhala","email":"pawan@cronberry.com"},
  "sales":{"target":400000,"achieved":80000,"remaining":320000,"refunds":7000},
  "points":{"total":650,"level":"Striker"},
  "incentives":{"total":0,"monthly_released":0,"quarterly_hold":0},
  "weekly":{"demos":4,"closures":2,"refunds":1,"avg_response_time_min":11},
  "message":"Keep pushing, Pawan Sankhala! You're doing great.",
  "last_computed_at":"2025-09-07T01:10:00+05:30"
};

const mockActivity = {
  "items":[
    {"date":"2025-09-06","text":"+400 Closure Won (Lead #LB) 🚀 Closure<7d","points":400,"lead_ref":"LB","link_logs":"https://..."},
    {"date":"2025-09-05","text":"+50 Demo Done (Lead #LB)","points":50,"lead_ref":"LB"},
    {"date":"2025-09-03","text":"+30 Demo Scheduled (Lead #LB)","points":30},
    {"date":"2025-09-02","text":"+30 Demo Scheduled (Lead #LB)","points":30},
    {"date":"2025-09-01","text":"+20 Contacted (Lead #LB) ⚡ Contact<15m","points":20}
  ],
  "cursor":"eyJvZmZzZXQiOjN9"
};

const mockLeaderboard = [
  { "rep_name":"Pawan Sankhala", "points_total":1230, "level":"Slayer" },
  { "rep_name":"Ravi Kumar", "points_total":1180, "level":"Striker" },
  { "rep_name":"Anjali Sharma", "points_total":950, "level":"Hunter" },
  { "rep_name":"Vikash Singh", "points_total":820, "level":"Hunter" },
  { "rep_name":"Priya Patel", "points_total":750, "level":"Rookie" }
];

const mockRules = `# Sales Performance Rules

## Stages

### Contact Stage
- **Base Points:** 20 points
- **Speed Bonus:** +10 points if contacted within 15 minutes
- **Quality Bonus:** +5 points for personalized message

### Demo Stage
- **Base Points:** 50 points
- **Preparation Bonus:** +15 points for pre-demo research
- **Engagement Bonus:** +10 points for interactive demo

### Closure Stage
- **Base Points:** 400 points
- **Speed Bonus:** +100 points if closed within 7 days
- **Upsell Bonus:** +200 points for premium plans

## Levels

### 🥉 Rookie (0-499 points)
- Entry level performer
- Basic commission structure

### 🥈 Hunter (500-999 points) 
- Consistent performer
- 10% commission bonus

### 🥇 Striker (1000-1499 points)
- Top performer
- 20% commission bonus + priority leads

### 🏆 Slayer (1500+ points)
- Elite performer
- 30% commission bonus + exclusive benefits

## Incentives

### Monthly Incentives (50%)
- Released if target achievement ≥ 100%
- Calculated: (Achievement / Target) × Base Incentive × 0.5

### Quarterly Hold (50%)
- Held for quarterly evaluation
- Refunds deducted from quarterly hold
- Released at quarter end if net positive`;

const mockCycles = {
  "current": "2025Q3",
  "available": ["2025Q3", "2025Q2", "2025Q1"]
};

// Function to call real GAS endpoint
async function callGASEndpoint(endpoint, params = {}) {
  const gasUrl = process.env.NEXT_PUBLIC_GAS_BASE_URL;
  if (!gasUrl) {
    throw new Error('GAS URL not configured');
  }

  const url = new URL(gasUrl);
  url.searchParams.append('endpoint', endpoint);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`GAS request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function GET(request) {
  try {
    const { pathname, searchParams } = new URL(request.url);
    const pathSegments = pathname.split('/').filter(Boolean);
    const endpoint = pathSegments[pathSegments.length - 1];

    // For now, return mock data. Later we can uncomment GAS calls
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    switch (endpoint) {
      case 'summary':
        // const summaryData = await callGASEndpoint('/me/summary', {
        //   cycle_id: searchParams.get('cycle_id')
        // });
        return NextResponse.json(mockSummary);

      case 'activity':
        // const activityData = await callGASEndpoint('/me/activity', {
        //   cycle_id: searchParams.get('cycle_id'),
        //   limit: searchParams.get('limit') || '50',
        //   cursor: searchParams.get('cursor')
        // });
        return NextResponse.json(mockActivity);

      case 'leaderboard':
        // const leaderboardData = await callGASEndpoint('/leaderboard', {
        //   cycle_id: searchParams.get('cycle_id'),
        //   limit: searchParams.get('limit') || '200'
        // });
        return NextResponse.json(mockLeaderboard);

      case 'rules':
        // const rulesData = await callGASEndpoint('/rules');
        return NextResponse.json({ content: mockRules });

      case 'cycles':
        // const cyclesData = await callGASEndpoint('/cycles');
        return NextResponse.json(mockCycles);

      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT(request) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(request) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
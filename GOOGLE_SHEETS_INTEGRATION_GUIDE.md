# Google Sheets Integration Guide
## Sales Rep Dashboard PWA Data Structure

This guide explains how to structure your Google Sheets data to work seamlessly with the Sales Rep Dashboard PWA.

---

## 🗂️ Required Sheets Structure

Your Google Sheets workbook should contain the following sheets:

### 1. **Reps Sheet** (User Management)
**Purpose**: Store sales rep information and authentication whitelist

| Column | Name | Type | Description | Example |
|--------|------|------|-------------|---------|
| A | rep_id | String | Unique identifier | "r_102" |
| B | name | String | Full name | "Pawan Sankhala" |
| C | email | String | Google Workspace email | "pawan@maaruji.com" |
| D | status | String | Active/Inactive | "active" |
| E | hire_date | Date | Date of joining | "2024-01-15" |

### 2. **Sales Sheet** (Sales Tracking)
**Purpose**: Track individual sales transactions

| Column | Name | Type | Description | Example |
|--------|------|------|-------------|---------|
| A | transaction_id | String | Unique transaction ID | "TXN_001" |
| B | rep_id | String | Reference to Reps.rep_id | "r_102" |
| C | client_name | String | Customer name | "TechCorp Ltd" |
| D | amount | Number | Sale amount (₹) | 12000 |
| E | date | Date | Transaction date | "2025-09-25" |
| F | lead_id | String | Lead reference | "TC001" |
| G | cycle_id | String | Quarter/cycle | "2025Q3" |
| H | status | String | confirmed/pending | "confirmed" |

### 3. **Refunds Sheet** (Refund Tracking)
**Purpose**: Track refund transactions

| Column | Name | Type | Description | Example |
|--------|------|------|-------------|---------|
| A | refund_id | String | Unique refund ID | "REF_001" |
| B | rep_id | String | Reference to Reps.rep_id | "r_102" |
| C | original_transaction_id | String | Reference to Sales.transaction_id | "TXN_001" |
| D | client_name | String | Customer name | "Unsatisfied Corp" |
| E | amount | Number | Refund amount (₹) | 2500 |
| F | date | Date | Refund date | "2025-09-20" |
| G | reason | String | Refund reason | "Product not as described" |
| H | cycle_id | String | Quarter/cycle | "2025Q3" |

### 4. **Targets Sheet** (Sales Targets)
**Purpose**: Define sales targets by rep and cycle

| Column | Name | Type | Description | Example |
|--------|------|------|-------------|---------|
| A | target_id | String | Unique target ID | "TGT_001" |
| B | rep_id | String | Reference to Reps.rep_id | "r_102" |
| C | cycle_id | String | Quarter/cycle | "2025Q3" |
| D | target_amount | Number | Target amount (₹) | 400000 |
| E | start_date | Date | Cycle start date | "2025-07-01" |
| F | end_date | Date | Cycle end date | "2025-09-30" |

### 5. **Activities Sheet** (Point System)
**Purpose**: Track activities and points

| Column | Name | Type | Description | Example |
|--------|------|------|-------------|---------|
| A | activity_id | String | Unique activity ID | "ACT_001" |
| B | rep_id | String | Reference to Reps.rep_id | "r_102" |
| C | lead_id | String | Lead reference | "LB" |
| D | activity_type | String | contact/demo/closure | "closure" |
| E | points | Number | Points earned | 400 |
| F | date | Date | Activity date | "2025-09-06" |
| G | description | String | Activity description | "Closure Won (Lead #LB)" |
| H | bonus_type | String | speed/quality/upsell | "speed" |
| I | cycle_id | String | Quarter/cycle | "2025Q3" |

### 6. **Rules Sheet** (System Configuration)
**Purpose**: Define point rules, levels, and incentives

| Column | Name | Type | Description | Example |
|--------|------|------|-------------|---------|
| A | rule_type | String | points/levels/incentives | "points" |
| B | stage_name | String | contact/demo/closure | "contact" |
| C | base_points | Number | Base points for stage | 20 |
| D | bonus_name | String | Speed/Quality/Upsell | "Speed Bonus" |
| E | bonus_points | Number | Bonus points | 10 |
| F | bonus_condition | String | Condition description | "Contacted within 15 minutes" |

### 7. **Levels Sheet** (Performance Levels)
**Purpose**: Define performance levels and benefits

| Column | Name | Type | Description | Example |
|--------|------|------|-------------|---------|
| A | level_name | String | Level name | "Striker" |
| B | min_points | Number | Minimum points | 1000 |
| C | max_points | Number | Maximum points | 1499 |
| D | commission_bonus | Number | Commission bonus % | 20 |
| E | icon | String | Emoji/icon | "🥇" |
| F | description | String | Level description | "Top performer with priority leads" |

---

## 🔄 Google Apps Script (GAS) Endpoints

Update your GAS Web App to provide these endpoints:

### Authentication & User Data
```javascript
// GET /me/summary?cycle_id=2025Q3
function getSummary(repEmail, cycleId) {
  // Query Reps sheet by email
  // Calculate sales data from Sales/Refunds sheets
  // Calculate points from Activities sheet
  // Determine level from Levels sheet
  // Return JSON structure as shown in app
}
```

### Activity Feed
```javascript
// GET /me/activity?cycle_id=2025Q3&limit=50&cursor=
function getActivity(repEmail, cycleId, limit, cursor) {
  // Query Activities sheet by rep_id and cycle_id
  // Sort by date descending
  // Format activity descriptions with emojis
  // Return paginated results
}
```

### Leaderboard
```javascript
// GET /leaderboard?cycle_id=2025Q3&limit=200
function getLeaderboard(cycleId, limit) {
  // Aggregate points by rep for cycle
  // Join with Reps sheet for names
  // Determine levels from points
  // Sort by points descending
  // Return top performers
}
```

### Rules & Configuration
```javascript
// GET /rules
function getRules() {
  // Query Rules, Levels sheets
  // Format as structured JSON (not markdown)
  // Return points/levels/incentives data
}
```

---

## 📊 Sample Data for Testing

### Reps Sheet Sample:
```
rep_id | name | email | status | hire_date
r_102 | Pawan Sankhala | pawan@maaruji.com | active | 2024-01-15
r_103 | Ravi Kumar | ravi@cronberry.com | active | 2024-02-01
r_104 | Anjali Sharma | anjali@maaruji.com | active | 2024-03-15
```

### Sales Sheet Sample:
```
transaction_id | rep_id | client_name | amount | date | lead_id | cycle_id | status
TXN_001 | r_102 | TechCorp Ltd | 12000 | 2025-09-25 | TC001 | 2025Q3 | confirmed
TXN_002 | r_102 | StartupX | 8500 | 2025-09-22 | SX002 | 2025Q3 | confirmed
TXN_003 | r_103 | Global Corp | 18000 | 2025-08-28 | GC005 | 2025Q3 | confirmed
```

### Activities Sheet Sample:
```
activity_id | rep_id | lead_id | activity_type | points | date | description | bonus_type | cycle_id
ACT_001 | r_102 | LB | closure | 400 | 2025-09-06 | Closure Won (Lead #LB) | speed | 2025Q3
ACT_002 | r_102 | LB | demo | 50 | 2025-09-05 | Demo Done (Lead #LB) | none | 2025Q3
ACT_003 | r_102 | LB | contact | 30 | 2025-09-03 | Demo Scheduled (Lead #LB) | quality | 2025Q3
```

---

## 🔧 Implementation Steps

### Step 1: Setup Google Sheets
1. Create a new Google Sheets workbook
2. Create the 7 sheets listed above
3. Add the column headers exactly as specified
4. Populate with sample data for testing

### Step 2: Update GAS Web App
1. Modify your existing GAS script
2. Update the doGet() function to handle new endpoints
3. Implement data fetching functions for each sheet
4. Add proper error handling and authentication

### Step 3: Test Integration
1. Update the PWA API endpoints to call real GAS URLs
2. Test each endpoint individually
3. Verify data formatting matches expected structure
4. Test authentication with @maaruji.com and @cronberry.com emails

### Step 4: Data Migration
1. Export existing data to match new structure
2. Import into Google Sheets
3. Validate data integrity
4. Test end-to-end functionality

---

## 🎯 Key Benefits of This Structure

1. **Normalized Data**: Reduces duplication and maintains consistency
2. **Scalable**: Easy to add new reps, cycles, and data points  
3. **Performance**: Optimized queries for dashboard loading
4. **Flexible**: Easy to modify rules and levels without code changes
5. **Audit Trail**: Complete transaction and activity history
6. **Multi-cycle**: Supports multiple quarters/periods seamlessly

---

## 🔍 Data Validation Rules

Apply these validation rules in Google Sheets:

1. **rep_id**: Must be unique, format "r_XXX"
2. **email**: Must be valid email, domain whitelist
3. **amounts**: Must be positive numbers
4. **dates**: Must be valid dates in YYYY-MM-DD format
5. **cycle_id**: Must follow YYYYQX format (e.g., 2025Q3)
6. **status**: Must be from predefined list

---

## 🚀 Advanced Features

Once basic integration is working, you can add:

1. **Real-time Updates**: Use Google Sheets API webhooks
2. **Data Validation**: Add custom validation rules
3. **Automated Calculations**: Use formulas for derived fields
4. **Backup & Sync**: Implement data backup strategies
5. **Analytics**: Add advanced reporting capabilities

---

This structure ensures your PWA gets clean, consistent data while maintaining flexibility for future enhancements!
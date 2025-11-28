# Change Request Debug Page - Developer Guide

## Overview

The Debug Page provides a comprehensive view of all data associated with a change request, helping developers verify data collection and assessment calculations during development.

**⚠️ Note:** This page is for development purposes only and should not be included in production builds.

## Accessing the Debug Page

### From Dashboard
1. Navigate to the Dashboard (`/`)
2. Find the change request you want to inspect
3. Click the **yellow bug icon** (🐛) button next to "View Details"

### Direct URL
Navigate directly to: `/debug/changes/:id`

Example: `http://localhost:5173/debug/changes/1`

## What Data is Displayed

### 1. Quick Stats (Top Cards)
Visual summary of key metrics:
- **Risk Score** - Calculated risk assessment (red)
- **Effort Score** - Calculated effort assessment (orange)
- **Benefit Score** - Calculated benefit assessment (green)
- **Priority** - Current priority and status (blue)

### 2. Basic Information
Core change request details:
- Title, Description
- Status, Priority
- Request Number
- Requester ID

### 3. Requester Information
Details about the person who submitted the request:
- Email, Username
- Full Name
- Department

### 4. Timestamps
All date/time information:
- Created, Updated
- Submitted
- Scheduled Start/End
- Actual Start/End

### 5. Risk Assessment
Risk calculation details:
- **Risk Score** - Numerical value (0-100)
- **Risk Level** - Critical/High/Medium/Low
- **Calculated At** - When it was calculated
- **Calculated By** - User ID who triggered calculation

### 6. Effort Assessment ⭐
Detailed breakdown of effort factors:

**Effort Score:** Overall calculated effort

**8 Effort Factors (1-5 scale):**
Each factor is color-coded:
- 🟢 Green (1-2): Low effort
- 🟡 Yellow (3): Medium effort
- 🔴 Red (4-5): High effort

1. **Impact Scope** - Number of users/systems affected
2. **Business Critical** - How critical is the affected system
3. **Complexity** - Technical difficulty
4. **Testing Coverage** - Quality of testing (⬆️ inverse - higher is better)
5. **Rollback Capability** - Ease of reverting (⬆️ inverse - higher is better)
6. **Historical Failures** - Past failure rate for similar changes
7. **Cost to Implement** - Financial cost
8. **Time to Implement** - Time required

**Note:** Testing Coverage and Rollback Capability are **inverse** - higher scores are better (less effort).

### 7. Benefit Assessment ⭐
Detailed breakdown of benefit factors:

**Benefit Score:** Overall calculated benefit

**6 Benefit Types** (only selected ones shown):

Each benefit detail shows:
- **Raw Value** - £ amount, hours, or customer count
- **Raw Timeline** - Months to realize benefit
- **Value Score** - Calculated from raw value using config
- **Time Score** - Calculated from timeline (lower months = higher score)
- **Combined Score** - Value Score + Time Score
- **Weighted Score** - Combined × weight (this contributes to total)

#### Benefit Types:

1. **Revenue Improvement** 💰
   - Unit: £ (GBP)
   - Annual revenue improvement
   - Example: £100,000 = 100 points

2. **Cost Savings** 💸
   - Unit: £ (GBP)
   - Annual cost reduction

3. **Customer Impact** 👥
   - Unit: Number of customers
   - How many customers are positively affected

4. **Process Improvement** ⚡
   - Unit: Hours (hours saved × users affected)
   - Total time saved across all users

5. **Internal QoL** 😊
   - Unit: Hours
   - Time saved for internal staff

6. **Strategic Alignment** 🎯
   - Manual score: 1-10
   - Admin-assigned based on strategic importance
   - Multiplied by 10 for weighting

### 8. Raw JSON Data (Collapsible Sections)

Click to expand/collapse:

- **Wizard Data** - All data from the change request wizard
- **Scheduling Data** - Scheduling information
- **Metrics Data** - Performance metrics
- **Prioritization Data** - Prioritization calculations
- **Custom Fields** - Any custom fields

## Understanding Scores

### Effort Score Calculation

The effort score is calculated from the 8 factors:

```
Effort Score = Average of 8 factors (adjusted for inverse factors)

Where:
- Testing Coverage is inverted: actual = (6 - entered value)
- Rollback Capability is inverted: actual = (6 - entered value)
```

**Interpretation:**
- **1.0-2.0:** Low effort (easy to implement)
- **2.1-3.5:** Medium effort
- **3.6-5.0:** High effort (difficult/risky)

### Benefit Score Calculation

Each benefit contributes a weighted score:

```
For each benefit:
1. Value Score = (rawValue / valueFor100Points) × 100
2. Time Score = 100 - (rawTimeline × timeDecayPerMonth)
3. Combined Score = Value Score + Time Score
4. Weighted Score = Combined Score × weight

Total Benefit Score = Sum of all Weighted Scores
```

**Example:**
- Revenue Improvement: £50,000, 6 months timeline
- Config: £100,000 = 100 points, 5 points decay/month
- Value Score: (50000 / 100000) × 100 = 50
- Time Score: 100 - (6 × 5) = 70
- Combined: 50 + 70 = 120
- If weight = 1.5: Weighted = 120 × 1.5 = 180

### Prioritization Logic

Changes are typically prioritized using:

```
Priority = (Benefit Score - Effort Score) / Risk Score

Higher = Better priority
```

## Use Cases

### 1. Verify Data Collection
Check that all wizard data is being properly saved to the database:
- Look at "Wizard Data (Raw JSON)" section
- Verify all form fields are present

### 2. Debug Assessment Calculations
Verify effort and benefit calculations:
- Check individual factor values
- Verify scoring formulas are working
- Ensure weighted scores are correct

### 3. Review Benefit Scoring Configuration
See how benefit scoring config affects calculations:
- Check value-to-points conversion
- Verify time decay is applying correctly
- Review weighted contributions

### 4. Audit Trail
Check when assessments were calculated:
- `risk_calculated_at`
- `effort_calculated_at`
- `benefit_calculated_at`

### 5. Database Debugging
Verify data is being stored correctly:
- Check JSON fields are populated
- Ensure timestamps are accurate
- Verify foreign key relationships

## Color Coding

### Effort Factors
- 🟢 **Green (1-2):** Low effort - good
- 🟡 **Yellow (3):** Medium effort
- 🔴 **Red (4-5):** High effort - concerning

### Benefit Details
- 🟢 **Green backgrounds:** Revenue/savings benefits
- 🟣 **Purple backgrounds:** Strategic alignment
- Numbers show exact calculations for transparency

## Tips for Development

1. **Use this page early and often** during development to verify formulas
2. **Check calculations manually** - the debug page shows all intermediate values
3. **Compare multiple change requests** to see how scoring differs
4. **Verify JSON storage** - ensure complex data structures are preserved
5. **Test edge cases** - zero values, very large numbers, negative timelines

## Removing from Production

Before deploying to production:

### Option 1: Remove the route
In `App.tsx`, comment out or delete:
```typescript
<Route
  path="/debug/changes/:id"
  element={isAuthenticated ? <ChangeRequestDebug /> : <Navigate to="/login" />}
/>
```

### Option 2: Add environment check
Wrap the route in a condition:
```typescript
{process.env.NODE_ENV === 'development' && (
  <Route path="/debug/changes/:id" element={...} />
)}
```

### Option 3: Remove debug button
In `Dashboard.tsx`, remove the bug icon button:
```typescript
// Remove this button
<Link to={`/debug/changes/${change.id}`} ...>
  <Bug size={16} />
</Link>
```

## API Endpoint

The debug page uses the standard change request endpoint:

```
GET /api/changes/:id
Authorization: Bearer <token>
```

This returns the complete change request with all related data including:
- All database fields
- Calculated scores
- Effort/benefit factors
- All JSON data fields

## Troubleshooting

### "Failed to fetch change request"
- Check that the backend is running on port 5000
- Verify the change request ID exists
- Check authentication token is valid

### "Not calculated" showing for scores
- The assessment hasn't been completed yet
- Run the effort/benefit assessment pages first
- Check the `*_calculated_at` fields

### JSON sections are empty
- Data hasn't been saved to those fields yet
- This is normal for new/draft change requests
- Complete the wizard to populate these fields

---

**Happy Debugging!** 🐛✨

This tool should help you understand exactly what data is being collected and how scores are being calculated during development.

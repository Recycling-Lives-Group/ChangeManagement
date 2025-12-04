# Change Management System - User Guide

**For:** End Users (Requesters, CAB Members, Managers)
**Version:** 1.0
**Last Updated:** 2025-12-04

---

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Creating a Change Request](#creating-a-change-request)
3. [Viewing Your Requests](#viewing-your-requests)
4. [CAB Review Process](#cab-review-process)
5. [Understanding Scores](#understanding-scores)
6. [Common Tasks](#common-tasks)
7. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Logging In

1. Navigate to the Change Management System URL
2. Enter your email address and password
3. Click **Login**

**Forgot Password?** Contact your system administrator.

### First Time Login

If this is your first time logging in:
1. Your account will have been created by an administrator
2. You'll be assigned one of these roles:
   - **User** - Can create and view own change requests
   - **Manager** - Can review and approve changes
   - **CAB Member** - Can review changes in CAB meetings
   - **Admin** - Full system access

---

## Creating a Change Request

### Step-by-Step Guide

#### 1. Start a New Request

1. Click **"New Change Request"** button on dashboard
2. You'll enter a 4-step wizard:
   - **Basic Info** → **Benefits** → **Impact** → **Review**

#### 2. Basic Information

**Required Fields:**
- **Title** - Clear, descriptive name (e.g., "Upgrade CRM System to v5.2")
- **Description** - Detailed explanation of what changes
- **Proposed Date** - When you'd like this implemented

**Example:**
```
Title: Migrate Email to New Server
Description: Move company email from old server (mail-01) to
new high-availability server (mail-02). Includes mailbox
migration for 250 users and DNS updates.
Proposed Date: 2025-03-15
```

Click **Next** when complete.

#### 3. Benefit Assessment

**Why is this change needed?** Select ALL that apply:

##### 💰 Revenue Improvement
- **When to use:** Change will increase sales or income
- **Example:** "New e-commerce feature will increase online sales by 15%"
- **Enter:** Expected annual revenue increase in £
- **Timeline:** When you'll see these benefits (months)

##### 💸 Cost Savings
- **When to use:** Change will reduce ongoing costs
- **Example:** "Switching to cloud hosting saves £2,000/month"
- **Enter:** Expected annual cost savings in £
- **Timeline:** When savings begin (months)

##### 👥 Customer Impact
- **When to use:** Change improves customer experience
- **Example:** "Faster checkout process affects 5,000 customers"
- **Enter:** Number of customers impacted
- **Timeline:** When customers will notice improvement

##### ⚙️ Process Improvement
- **When to use:** Change makes internal processes more efficient
- **Example:** "Automated reporting saves 10 hours per week"
- **Enter:** Efficiency improvement as percentage (0-100%)
- **Timeline:** When efficiency gains occur

##### 😊 Internal Quality of Life
- **When to use:** Change makes employees' work easier or better
- **Example:** "New tool eliminates manual data entry for 15 staff"
- **Enter:** Number of employees positively impacted
- **Timeline:** When benefits start

##### 🎯 Strategic Alignment
- **When to use:** Change aligns with company strategy
- **Example:** "Supports digital transformation initiative"
- **Enter:** Alignment score 1-10 (10 = perfect alignment)
- **No timeline** - Strategic value doesn't decay

**💡 Tip:** Be realistic with numbers. Overstating benefits can lead to rejection.

Click **Next** when all relevant benefits are filled in.

#### 4. Impact Assessment

**What's affected by this change?**

- **Systems Affected** - Which IT systems are impacted? (e.g., "Email server, DNS, Outlook clients")
- **Users Affected** - How many people are impacted? (number)
- **Departments Affected** - Which departments? (e.g., "All departments, IT, Sales")
- **Estimated Effort** - How long will it take? (hours)
- **Estimated Cost** - How much will it cost? (£)

**Example:**
```
Systems: Email server (mail-02), DNS, all Outlook clients
Users: 250
Departments: All departments
Effort: 40 hours
Cost: £5,000 (consultant fees)
```

Click **Next** to review.

#### 5. Review & Submit

**Final check:**
- Review all information carefully
- Benefits and impact scores are calculated automatically
- Click **Edit** on any step to make changes
- Click **Submit** to send for approval

**After Submission:**
- Status changes to **"Submitted"**
- Manager and CAB will review
- You'll receive notifications about status updates

---

## Viewing Your Requests

### Dashboard Overview

Your dashboard shows all your change requests with:

**Status Indicators:**
- 🔵 **Draft** - Not yet submitted
- 🟡 **Submitted** - Awaiting review
- 🟢 **Approved** - Approved by CAB
- 🔴 **Rejected** - Not approved
- 📅 **Scheduled** - Scheduled for implementation
- ⚙️ **In Progress** - Currently being implemented
- ✅ **Completed** - Successfully implemented
- ❌ **Cancelled** - Cancelled

**Benefit Icons:**
- 💰 Revenue Improvement
- 💸 Cost Savings
- 👥 Customer Impact
- ⚙️ Process Improvement
- 😊 Internal QoL
- 🎯 Strategic Alignment

Hover over icons to see benefit details.

### Filtering Requests

Use the **Status Filter** dropdown to show only:
- All Requests
- Submitted
- Approved
- Rejected
- Scheduled
- Completed

### Request Actions

**View Details** - See full information
**Edit** - Modify draft requests (submitted requests cannot be edited)
**Delete** - Remove draft requests

---

## CAB Review Process

### What is CAB?

**Change Advisory Board (CAB)** - A committee that reviews and approves change requests to ensure they:
- Have valid business justification
- Don't negatively impact the organization
- Are scheduled appropriately
- Have adequate resources

### Review Stages

1. **Manager Review** - Your manager reviews first
2. **CAB Meeting** - CAB members assess risk and benefit
3. **Decision** - Approved, Rejected, or Request More Info
4. **Scheduling** - Approved changes are scheduled for implementation

### What CAB Looks At

- **Benefit Score** (0-100) - How valuable is this change?
- **Effort Score** (0-100) - How much work is required?
- **Priority Matrix** - Where does this fall on benefit vs. effort?
- **Risk Assessment** - What could go wrong?
- **Resource Availability** - Do we have capacity?

**Eisenhower Matrix Quadrants:**
- **Quick Wins** (High Benefit, Low Effort) - Fast track
- **Major Projects** (High Benefit, High Effort) - Plan carefully
- **Fill Ins** (Low Benefit, Low Effort) - Do when time permits
- **Time Wasters** (Low Benefit, High Effort) - Usually rejected

---

## Understanding Scores

### Benefit Score (0-100)

**What it means:**
- Combines all benefit types you entered
- Higher number = more valuable to organization
- Based on actual £, customer numbers, efficiency gains

**Example Calculations:**

**Revenue Improvement:**
- Enter: £50,000 annual increase
- Calculation: (£50,000 / £100,000 target) × 100 = 50 points
- Timeline: 3 months = -15 points (5 points × 3)
- Final: 50 - 15 = **35 points**

**Multiple Benefits:**
- Revenue: 35 points
- Cost Savings: 40 points
- Customer Impact: 25 points
- **Total: 100 points** (averaged)

### Effort Score (0-100)

**What it means:**
- Combines hours, cost, complexity, resources needed
- Higher number = more work required
- Calculated from your impact assessment

**Factors:**
- Hours estimated
- Cost estimated
- Number of systems affected
- Complexity level
- Testing required
- Documentation needs

### Priority Score

**Overall priority** = Benefit Score - Effort Score

- **Positive** = Benefit outweighs effort (good!)
- **Negative** = Effort outweighs benefit (may be rejected)
- **High Positive** = Quick Win or Major Project
- **Low/Negative** = Fill In or Time Waster

---

## Common Tasks

### Update a Draft Request

1. Go to Dashboard
2. Find your draft request
3. Click **View Details**
4. Click **Edit**
5. Make changes and resubmit

**Note:** Cannot edit submitted requests. Contact your manager if changes needed after submission.

### Check Request Status

1. Go to Dashboard
2. Look at status badge next to each request
3. Click **View Details** for full history

### Respond to Rejection

If your request is rejected:

1. Read rejection comments to understand why
2. Decide if you want to:
   - **Revise and resubmit** - Create new request addressing concerns
   - **Escalate** - Discuss with manager
   - **Cancel** - Change not needed after all

### View Metrics

1. Click **Metrics** in navigation
2. See organization-wide statistics:
   - Changes by benefit type
   - Total revenue improvements
   - Total cost savings
   - Implementation status

---

## Tips & Best Practices

### ✅ DO

- **Be specific** - Provide detailed descriptions
- **Be realistic** - Don't exaggerate benefits
- **Include timelines** - When will benefits be realized?
- **Justify costs** - Explain why effort/cost is needed
- **Check examples** - Look at approved changes for reference
- **Plan ahead** - Submit well before needed date
- **Provide evidence** - Include supporting documents/data

### ❌ DON'T

- **Rush submissions** - Take time to complete thoroughly
- **Inflate benefits** - Unrealistic claims lead to rejection
- **Ignore effort** - Underestimating effort causes problems
- **Submit without review** - Double-check before submitting
- **Skip benefit justification** - "Because we need it" isn't enough
- **Forget dependencies** - Note what must happen first

### 💡 Tips for High-Quality Requests

1. **Start with "Why"**
   - What problem does this solve?
   - What opportunity does this create?
   - How does it help the business?

2. **Quantify Everything**
   - £ savings instead of "reduces cost"
   - X hours saved instead of "more efficient"
   - Y customers impacted instead of "improves service"

3. **Consider All Benefits**
   - Sometimes the biggest benefit isn't obvious
   - Internal QoL improvements often overlooked
   - Strategic alignment can tip the balance

4. **Be Honest About Effort**
   - Underestimating causes delays and frustration
   - Include testing, training, documentation time
   - Factor in dependencies and waiting time

5. **Think About Timing**
   - Urgent benefits score higher (closer timeline)
   - Long-term benefits score lower initially
   - Balance quick wins with strategic investments

---

## Getting Help

### Support Contacts

**Technical Issues:**
- Login problems
- System errors
- Cannot access features
→ Contact: IT Support

**Process Questions:**
- How to create request
- Why was request rejected
- Status updates
→ Contact: Your Manager

**System Training:**
- How to use the system
- Best practices
- Workshops
→ Contact: Change Management Team

### Additional Resources

- **[README.md](README.md)** - Technical overview
- **[FEATURES_CHECKLIST.md](FEATURES_CHECKLIST.md)** - All system features
- **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** - For administrators

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────┐
│         CHANGE REQUEST QUICK START              │
├──────────────────────────────────────────────────┤
│ 1. Click "New Change Request"                   │
│ 2. Fill in Title, Description, Date             │
│ 3. Select ALL benefits that apply               │
│ 4. Enter realistic numbers (£, people, %)       │
│ 5. Describe impact (systems, users, effort)     │
│ 6. Review everything                            │
│ 7. Submit for approval                          │
│                                                  │
│ Remember: Be specific, realistic, and thorough! │
└──────────────────────────────────────────────────┘

STATUS MEANINGS:
🔵 Draft - Still editing
🟡 Submitted - With CAB for review
🟢 Approved - Ready to schedule
🔴 Rejected - Needs revision
📅 Scheduled - Implementation planned
⚙️ In Progress - Being implemented
✅ Completed - Done!

BENEFIT TYPES:
💰 Revenue    💸 Cost Savings    👥 Customers
⚙️ Process    😊 Employee QoL    🎯 Strategic
```

---

**Need more help?** Contact your manager or the Change Management team.

**System Version:** 1.0
**Last Updated:** 2025-12-04

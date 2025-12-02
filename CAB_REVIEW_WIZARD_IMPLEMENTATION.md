# CAB Review Wizard Implementation

**Session Date:** 2025-12-01
**Status:** In Progress - 50% Complete

---

## Problem Statement

### Original Issues
1. **Benefit scores not being calculated** when creating new change requests
2. **Effort scores not being calculated** when creating new change requests
3. **Form submitting prematurely** - recurring issue when transitioning from page 3 to page 4 in change request wizard
4. **Incomplete data capture** - Users creating requests but lacking detailed assessment data needed for proper scoring

### Root Cause Analysis
- Initially tried to calculate scores during change request creation, but realized:
  - User doesn't have all the information needed for accurate assessments
  - Benefit/effort/risk calculations require detailed technical and business analysis
  - CAB members are better positioned to assess these factors
  - Scores should be calculated AFTER proper review, not during initial submission

---

## Solution: CAB Review Wizard

### New Approach (Agreed)
**Change the workflow so that scoring happens during CAB review, not during creation:**

1. **User creates change request** (keep existing simple wizard)
   - Basic information only
   - Business justification
   - High-level descriptions
   - Original values saved for lessons learned

2. **CAB reviews using assessment wizard** (NEW - being implemented)
   - Step-by-step wizard walks through ALL assessment factors
   - CAB reviews original user input
   - CAB can accept OR revise each value
   - All revisions are tracked separately

3. **On approval, calculate ALL scores** (benefit, effort, risk)
   - Use CAB-revised values (or original if not revised)
   - Store both original and revised values
   - Calculate comprehensive scores based on complete assessment

---

## Data Storage Design

### Database Schema
**Existing tables (no changes needed):**
- `change_requests` table has:
  - `wizard_data` (JSON) - stores original user input
  - `benefit_score`, `effort_score`, `risk_score` (INT)
  - `benefit_factors`, `effort_factors` (JSON) - stores detailed factor breakdowns
  - `benefit_calculated_at`, `effort_calculated_at`, `risk_calculated_at` (TIMESTAMP)

- `cab_reviews` table has:
  - `review_data` (JSON) - **will store CAB assessment**
  - `vote` (ENUM)
  - `comments` (TEXT)

### Data Structure
```json
{
  "original": {
    "revenueImprovement": "5000",
    "revenueTimeline": "2",
    "revenueDescription": "User's explanation"
  },
  "cabRevised": {
    "revenueImprovement": "3000",
    "revenueTimeline": "3",
    "revenueDescription": "CAB's revised assessment"
  }
}
```

---

## Implementation Progress

### ✅ COMPLETED

1. **Backend Benefit Calculator** (`backend/src/utils/benefitCalculator.ts`)
   - Created utility that mirrors frontend benefit calculation
   - Extracts factors from wizard data
   - Calculates normalized scores (0-100)
   - Includes: revenue, cost savings, customer impact, process improvement, internal QoL, strategic alignment

2. **Integration into Change Creation** (`backend/src/controllers/changeController.ts`)
   - Added import for `autoCalculateBenefit`
   - Auto-calculates benefit score when creating changes (lines 177-178)
   - Passes benefit score and factors to create method (lines 190-191)

3. **Updated ChangeRequest Model** (`backend/src/models/ChangeRequest.ts`)
   - Added `benefit_score` and `benefit_factors` parameters to create method (lines 211-212)
   - Updated INSERT statement to include these fields (line 249-250)
   - Backend successfully builds with these changes

4. **Fixed Benefit Assessment Page** (`frontend/src/pages/BenefitAssessment.tsx`)
   - Removed error toast "Benefit configuration not loaded yet" (line 131-133)
   - Now silently waits for config to load

5. **CAB Review Wizard Component** (`frontend/src/pages/CABReviewWizard.tsx`)
   - ✅ **FULLY CREATED** - Complete wizard component with:
     - Dynamic steps based on what user filled in
     - Benefit factor review (revenue, cost, customer, process, QoL)
     - Impact assessment (users, systems, dependencies)
     - Risk assessment (technical, business, complexity, rollback, testing)
     - Strategic alignment (alignment score, urgency, resources)
     - Final review with approve/reject buttons
     - Shows original values + allows CAB to revise
     - Stores assessment in `cabAssessment` state

---

### 🔄 IN PROGRESS / TODO

#### High Priority - Complete These Next Session

6. **Add Route for CAB Wizard** (`frontend/src/App.tsx`)
   - Need to add route: `/cab-review/:id/assess`
   - Import: `import CABReviewWizard from './pages/CABReviewWizard';`
   - Add route within authenticated routes

7. **Link CAB Review Page to Wizard** (`frontend/src/pages/CABReview.tsx`)
   - Change the "Review" button to navigate to `/cab-review/${changeId}/assess`
   - Remove simple approve/reject buttons from main CAB page
   - Direct users to full wizard instead

8. **Create Backend CAB Approval Endpoint** (`backend/src/controllers/changeController.ts`)
   - Create new endpoint: `POST /api/changes/:id/cab-approve`
   - Receives `cabAssessment` and `comments` from wizard
   - Stores CAB assessment in `cab_reviews.review_data`
   - Calculates ALL scores (benefit, effort, risk) using CAB-revised values
   - Updates change request with calculated scores
   - Changes status to 'approved'

9. **Create Backend Route** (`backend/src/routes/changes.ts`)
   - Add route: `router.post('/:id/cab-approve', protect, authorize('cab_member', 'manager', 'admin'), cabApproveChange);`

10. **Effort Calculator Backend Utility** (NEW - need to create)
    - Create `backend/src/utils/effortCalculator.ts`
    - Mirror the risk calculator structure
    - Calculate effort based on:
      - Hours estimated
      - Cost
      - Team size
      - Complexity
      - Systems affected
    - Return normalized effort score (0-100)

11. **Update Risk Calculator** (`backend/src/utils/riskCalculator.ts`)
    - Currently exists but may need updates to accept CAB assessment data
    - Ensure it can work with both wizard data and CAB assessment data

---

## Key Design Decisions

### Why This Approach?
1. **Better Data Quality**: CAB members have expertise to properly assess factors
2. **Complete Information**: All assessment happens at once during review, not piecemeal
3. **Audit Trail**: Keep original user input for lessons learned
4. **Flexibility**: CAB can revise any value they disagree with
5. **Single Point of Calculation**: Scores calculated once on approval with complete data

### Benefit Factor Flow Example
**User says:** "This will generate £5,000 revenue in 2 months"
↓
**CAB sees:** Original input displayed
↓
**CAB reviews:** Do we agree?
- ✅ Yes → Keep original value
- ✏️ No → Revise to £3,000 in 3 months
↓
**On Approval:** Calculate benefit score using CAB's values (or original if unchanged)

---

## Remaining Form Submission Issue

### The Recurring Bug
**Problem:** Form submits when moving from page 3 to page 4 in change wizard

**Need to Document Fix:**
- This has happened multiple times this week
- Need to identify root cause in `ChangeForm.tsx` or wizard navigation
- Likely issue: Button type not set to "button", defaults to "submit"
- Or: Form submission handler triggered by navigation

**TODO Next Session:**
1. Review `frontend/src/pages/ChangeForm.tsx`
2. Find page 3 → page 4 transition
3. Check all button types
4. Ensure navigation buttons have `type="button"`
5. Document fix in this file for future reference

---

## Testing Plan (For Next Session)

### Test Complete Flow:
1. ✅ User creates change request (existing wizard) - keep as-is
2. ⏳ CAB member opens change in CAB Review list
3. ⏳ CAB member clicks to start assessment wizard
4. ⏳ Walk through each step of wizard
5. ⏳ Revise some values, keep others
6. ⏳ Complete wizard and approve
7. ⏳ Verify all scores calculated (benefit, effort, risk)
8. ⏳ Verify both original and revised values stored
9. ⏳ Check database that scores are saved
10. ⏳ Verify change status updated to 'approved'

---

## Files Modified/Created This Session

### Created:
1. `backend/src/utils/benefitCalculator.ts` - Benefit calculation utility
2. `frontend/src/pages/CABReviewWizard.tsx` - Complete CAB wizard component
3. `CAB_REVIEW_WIZARD_IMPLEMENTATION.md` - This document

### Modified:
1. `backend/src/controllers/changeController.ts` - Added benefit calculation on creation
2. `backend/src/models/ChangeRequest.ts` - Updated create method for benefit fields
3. `frontend/src/pages/BenefitAssessment.tsx` - Removed error message

---

## Quick Start Guide for Next Session

### To Continue Implementation:

1. **Add the route** - Edit `frontend/src/App.tsx`:
```tsx
import CABReviewWizard from './pages/CABReviewWizard';

// Add route in Routes section:
<Route
  path="/cab-review/:id/assess"
  element={
    isAuthenticated ? (
      <Layout>
        <CABReviewWizard />
      </Layout>
    ) : (
      <Navigate to="/login" />
    )
  }
/>
```

2. **Link from CAB Review** - Edit `frontend/src/pages/CABReview.tsx`:
```tsx
// Change review button to:
<Link to={`/cab-review/${change.id}/assess`}>
  <button>Start Assessment</button>
</Link>
```

3. **Create backend endpoint** - Edit `backend/src/controllers/changeController.ts`:
```typescript
export const cabApproveChange = async (req: AuthRequest, res: Response) => {
  // Get cabAssessment from req.body
  // Store in cab_reviews.review_data
  // Calculate benefit, effort, risk scores
  // Update change_requests with scores
  // Change status to 'approved'
}
```

4. **Create effort calculator** - New file `backend/src/utils/effortCalculator.ts`

5. **Test the complete flow**

---

## Notes for Future Sessions

- The CAB wizard is fully built and ready to use
- Just needs routing and backend integration
- Once working, remove auto-calculation from change creation
- Focus benefit/effort/risk calculation ONLY on CAB approval
- Keep this document updated as implementation progresses

---

## Contact/Session Info

If you have questions about this implementation:
1. Read this document first
2. Check the files listed in "Files Modified/Created"
3. The wizard component is complete and well-commented
4. Backend utilities are modeled after existing riskCalculator.ts

**Estimated Time to Complete:** 2-3 hours
**Priority:** High - This fixes multiple issues and improves data quality

---

## Form Submission Bug - Investigation Needed

**TODO for next session:**
- [ ] Open `frontend/src/pages/ChangeForm.tsx`
- [ ] Search for page navigation buttons (page 3 → 4)
- [ ] Check if buttons have `type="button"` attribute
- [ ] Check if form has `onSubmit` that's being triggered
- [ ] Document the fix pattern here for future reference
- [ ] Create a checklist of common React form pitfalls

**Hypothesis:** Navigation buttons triggering form submission because:
- Button inside `<form>` without `type="button"` defaults to `type="submit"`
- Enter key in form fields triggers submission
- Form validation on page change

**Fix Pattern:**
```tsx
// Wrong:
<button onClick={goToNextPage}>Next</button>

// Right:
<button type="button" onClick={goToNextPage}>Next</button>
```

---

**End of Document**

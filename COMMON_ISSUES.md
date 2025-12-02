# Common Issues & Solutions

This document tracks recurring issues that have been fixed multiple times to prevent regression.

## Form Auto-Submit Issue

### Problem
Forms with multi-step navigation automatically submit when clicking "Next" or "Previous" buttons instead of navigating between steps.

### Root Cause
In HTML forms, `<button>` elements default to `type="submit"` if no type is specified. When navigation buttons don't explicitly set `type="button"`, they trigger form submission.

### Solution
**ALWAYS** explicitly set `type="button"` on navigation buttons within forms:

```tsx
// ❌ WRONG - Will trigger form submission
<button onClick={nextStep}>Next</button>

// ✅ CORRECT - Navigation only
<button type="button" onClick={nextStep}>Next</button>
```

### Files to Check
When adding or modifying form wizards, always verify:
- `frontend/src/pages/ChangeForm.tsx` - Change request wizard
- `frontend/src/pages/CABReviewWizard.tsx` - CAB review wizard
- `frontend/src/pages/BenefitAssessment.tsx` - Benefit assessment forms
- Any other multi-step forms

### Rule
**Every button in a `<form>` element must have an explicit type:**
- `type="button"` - For navigation, actions, cancellation
- `type="submit"` - Only for the final submit button
- `type="reset"` - For form reset (rarely used)

### Testing Checklist
When testing multi-step forms:
1. ✅ Navigate forward through all steps
2. ✅ Navigate backward through all steps
3. ✅ Verify data persists between steps
4. ✅ Only the final "Submit" button should submit the form
5. ✅ Check browser dev console for errors

### Last Fixed
- 2025-12-02: Verified ChangeForm.tsx has correct `type="button"` on all navigation buttons

---

## Future Issues
Add new recurring issues here with the same format:
- Problem description
- Root cause
- Solution with code examples
- Files to check
- Testing checklist

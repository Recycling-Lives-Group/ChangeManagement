# Scoring Variables Reference

## BENEFIT WEIGHTS (BenefitAssessment.tsx) - CURRENT

These are the weights applied when calculating benefit scores:

1. **revenueImprovement** - Weight: 2.5 (Highest - Revenue generation)
2. **costSavings** - Weight: 2.3 (Very High - Cost reduction)
3. **customerImpact** - Weight: 2.2 (Very High - Customer satisfaction)
4. **processImprovement** - Weight: 1.9 (High - Operational efficiency)
5. **internalQoL** - Weight: 1.6 (Medium-High - Employee satisfaction)
6. **strategicAlignment** - Weight: 2.0 (High - Long-term goals)
7. **riskReduction** - Weight: 1.7 (High - Risk mitigation)

**Total Items: 7**

---

## BENEFIT CONFIG (benefit_scoring_config database table)

These are the benefit types stored in the database with configuration for scoring:

1. **revenueImprovement** - Revenue Improvement
2. **costSavings** - Cost Savings
3. **customerImpact** - Customer Impact
4. **processImprovement** - Process Improvement
5. **internalQoL** - Internal Quality of Life
6. **strategicAlignment** - Strategic Alignment
7. **riskReduction** - Risk Reduction

**Total Items: 7**

**✅ Note:** Benefit Weights and Benefit Config are now aligned (7 items each).

---

## EFFORT WEIGHTS (EffortAssessment.tsx) - CURRENT

These are the weights applied when calculating effort scores:

1. **hoursEstimated** - Weight: 2.0 (Most important)
2. **costEstimated** - Weight: 1.8 (Very High)
3. **resourceRequirement** - Weight: 1.5 (Medium-High)
4. **complexity** - Weight: 1.6 (High)
5. **systemsAffected** - Weight: 1.3 (Medium)
6. **testingRequired** - Weight: 1.2 (Medium)
7. **documentationRequired** - Weight: 1.0 (Lower)
8. **urgency** - Weight: 1.8 (High - Time sensitivity)

**Total Items: 8**

---

## EFFORT CONFIG (effort_scoring_config database table) - CURRENT

These are the effort types stored in the database with configuration for scoring:

1. **hoursEstimated** - Hours Estimated
2. **costEstimated** - Cost Estimated
3. **resourceRequirement** - Resource Requirement
4. **complexity** - Complexity
5. **systemsAffected** - Systems Affected
6. **testingRequired** - Testing Required
7. **documentationRequired** - Documentation Required
8. **urgency** - Urgency

**Total Items: 8**

**✅ Note:** Effort Weights and Effort Config are aligned (8 items each).

---

## Summary - COMPLETED ✅

| Category | Count | Status |
|----------|-------|--------|
| Benefit Weights | 7 | ✅ Aligned |
| Benefit Config | 7 | ✅ Aligned |
| Effort Weights | 8 | ✅ Aligned |
| Effort Config | 8 | ✅ Aligned |

## Changes Completed

### Benefits
- ✅ **riskReduction** added back (was incorrectly removed)
- ✅ Removed: urgency (moved to Effort)
- ✅ Removed: impactScope (not a benefit)
- ✅ Removed: riskLevel (not a benefit - confused with riskReduction)
- ✅ Removed: resourceRequirement (moved to Effort)

### Effort
- ✅ Added: **urgency** (moved from Benefits)
- ✅ Renamed: **teamSize** → **resourceRequirement**
- ✅ Database updated
- ✅ Code updated

**Final Result:**
- Benefits = 7 items (all true business benefits)
- Effort = 8 items (all effort/complexity factors)
- Both systems fully aligned between code and database

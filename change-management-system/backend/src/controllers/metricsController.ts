import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

export const getMetrics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized',
        },
      });
    }

    const db = (await import('../config/database.js')).getDatabase();

    // Get changes by benefit type (multiple benefit types per change)
    const [benefitTypeResults] = await db.query(`
      SELECT 'revenueImprovement' as benefit_type, COUNT(*) as count
      FROM change_requests
      WHERE JSON_EXTRACT(wizard_data, '$.changeReasons.revenueImprovement') = true
      UNION ALL
      SELECT 'costReduction' as benefit_type, COUNT(*) as count
      FROM change_requests
      WHERE JSON_EXTRACT(wizard_data, '$.changeReasons.costReduction') = true
      UNION ALL
      SELECT 'customerImpact' as benefit_type, COUNT(*) as count
      FROM change_requests
      WHERE JSON_EXTRACT(wizard_data, '$.changeReasons.customerImpact') = true
      UNION ALL
      SELECT 'processImprovement' as benefit_type, COUNT(*) as count
      FROM change_requests
      WHERE JSON_EXTRACT(wizard_data, '$.changeReasons.processImprovement') = true
      UNION ALL
      SELECT 'internalQoL' as benefit_type, COUNT(*) as count
      FROM change_requests
      WHERE JSON_EXTRACT(wizard_data, '$.changeReasons.internalQoL') = true
      UNION ALL
      SELECT 'riskReduction' as benefit_type, COUNT(*) as count
      FROM change_requests
      WHERE JSON_EXTRACT(wizard_data, '$.changeReasons.riskReduction') = true
    `) as any;

    // Get revenue improvement and cost reduction totals
    const [revenueResults] = await db.query(`
      SELECT
        SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(wizard_data, '$.revenueDetails.expectedRevenue')) AS DECIMAL(15,2))) as total_revenue
      FROM change_requests
      WHERE JSON_EXTRACT(wizard_data, '$.changeReasons.revenueImprovement') = true
        AND JSON_EXTRACT(wizard_data, '$.revenueDetails.expectedRevenue') IS NOT NULL
    `) as any;

    const [costSavingsResults] = await db.query(`
      SELECT
        SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(wizard_data, '$.costReductionDetails.expectedSavings')) AS DECIMAL(15,2))) as total_savings
      FROM change_requests
      WHERE JSON_EXTRACT(wizard_data, '$.changeReasons.costReduction') = true
        AND JSON_EXTRACT(wizard_data, '$.costReductionDetails.expectedSavings') IS NOT NULL
    `) as any;

    // Get hours saved (process improvement)
    const [hoursSavedResults] = await db.query(`
      SELECT
        SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(wizard_data, '$.processImprovementDetails.expectedEfficiency')) AS DECIMAL(15,2))) as total_hours
      FROM change_requests
      WHERE JSON_EXTRACT(wizard_data, '$.changeReasons.processImprovement') = true
        AND JSON_EXTRACT(wizard_data, '$.processImprovementDetails.expectedEfficiency') IS NOT NULL
    `) as any;

    // Get status counts
    const [statusResults] = await db.query(`
      SELECT
        status,
        COUNT(*) as count
      FROM change_requests
      GROUP BY status
    `) as any;

    // Build status metrics
    const statusCounts = statusResults.reduce((acc: any, row: any) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        benefitTypes: benefitTypeResults.filter((item: any) => item.count > 0),
        revenue: {
          total: parseFloat(revenueResults[0]?.total_revenue || 0),
        },
        costSavings: {
          total: parseFloat(costSavingsResults[0]?.total_savings || 0),
        },
        hoursSaved: {
          total: parseFloat(hoursSavedResults[0]?.total_hours || 0),
        },
        statusCounts: {
          submitted: statusCounts.submitted || 0,
          rejected: statusCounts.rejected || 0,
          scheduled: statusCounts.scheduled || 0,
          completed: statusCounts.completed || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch metrics',
      },
    });
  }
};

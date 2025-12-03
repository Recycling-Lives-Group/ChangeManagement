import { Response } from 'express';
import { ChangeRequest } from '../models/ChangeRequest.js';
import { User } from '../models/User.js';
import type { AuthRequest } from '../middleware/auth.js';
import { autoCalculateRisk } from '../utils/riskCalculator.js';
import { autoCalculateBenefit } from '../utils/benefitCalculator.js';
import { autoCalculateEffort } from '../utils/effortCalculator.js';

// @desc    Get all change requests
// @route   GET /api/changes
// @access  Private
export const getChanges = async (req: AuthRequest, res: Response) => {
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

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // Get user to check role
    const user = await User.findById(parseInt(req.user.id));
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
      });
    }

    // Build filter options
    const options: any = { page, pageSize };

    // Filter by status if provided
    if (req.query.status) {
      options.status = (req.query.status as string).split(',');
    }

    // If user is not admin/coordinator, only show their requests
    const adminRoles = ['admin', 'manager', 'cab_member', 'Admin', 'Coordinator', 'CAB_Member'];
    if (!adminRoles.includes(user.role)) {
      options.requesterId = user.id;
    }

    const { changes, total } = await ChangeRequest.findAll(options);

    res.status(200).json({
      success: true,
      data: changes.map(c => ChangeRequest.formatChange(c)),
      meta: {
        page,
        pageSize,
        total,
      },
    });
  } catch (error) {
    console.error('getChanges error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

// @desc    Get single change request
// @route   GET /api/changes/:id
// @access  Private
export const getChange = async (req: AuthRequest, res: Response) => {
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

    const change = await ChangeRequest.findById(parseInt(req.params.id));

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    // Get user to check permissions
    const user = await User.findById(parseInt(req.user.id));
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
      });
    }

    // Check if user has permission to view this change
    const adminRoles = ['admin', 'manager', 'cab_member', 'Admin', 'Coordinator', 'CAB_Member'];
    if (!adminRoles.includes(user.role) && change.requester_id !== user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to view this change request',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: ChangeRequest.formatChange(change),
    });
  } catch (error) {
    console.error('getChange error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

// @desc    Create new change request
// @route   POST /api/changes
// @access  Private
export const createChange = async (req: AuthRequest, res: Response) => {
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

    const user = await User.findById(parseInt(req.user.id));
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
      });
    }

    // Create change request
    // Extract title from wizard data if not directly provided
    const wizardData = req.body.wizardData || req.body;
    const title = req.body.title || wizardData.changeTitle || 'Untitled Change Request';
    const description = req.body.description || wizardData.briefDescription || null;

    // Auto-calculate risk score from wizard data
    const riskAssessment = autoCalculateRisk(wizardData);

    // Auto-calculate benefit score from wizard data
    const benefitAssessment = autoCalculateBenefit(wizardData);

    const changeData = {
      title: title,
      description: description,
      requester_id: user.id,
      status: 'submitted',
      priority: req.body.priority || 'medium',
      wizard_data: wizardData,
      scheduling_data: req.body.schedulingData || null,
      risk_score: riskAssessment.score,
      risk_level: riskAssessment.level,
      benefit_score: benefitAssessment.score,
      benefit_factors: benefitAssessment.factors,
    };

    console.log('Creating change with data:', JSON.stringify(changeData, null, 2));
    const change = await ChangeRequest.create(changeData);

    res.status(201).json({
      success: true,
      data: ChangeRequest.formatChange(change),
    });
  } catch (error) {
    console.error('createChange error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

// @desc    Update change request
// @route   PUT /api/changes/:id
// @access  Private
export const updateChange = async (req: AuthRequest, res: Response) => {
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

    const change = await ChangeRequest.findById(parseInt(req.params.id));

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    const user = await User.findById(parseInt(req.user.id));
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
      });
    }

    // Check if user has permission to update
    const adminRoles = ['admin', 'manager', 'Admin', 'Coordinator'];
    if (!adminRoles.includes(user.role) && change.requester_id !== user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to update this change request',
        },
      });
    }

    // Extract title from wizard data if not directly provided
    const wizardData = req.body.wizardData || req.body;
    const title = req.body.title || wizardData.changeTitle || change.title;
    const description = req.body.description || wizardData.briefDescription || change.description;

    console.log('Updating change with data:', JSON.stringify(req.body, null, 2));
    console.log('scheduledStart:', req.body.scheduledStart, 'scheduledEnd:', req.body.scheduledEnd);

    // Convert ISO datetime to MySQL format (YYYY-MM-DD HH:MM:SS)
    const toMySQLDateTime = (isoString: string | undefined | null): Date | null => {
      if (!isoString) return null;
      try {
        return new Date(isoString);
      } catch (e) {
        console.error('Error parsing date:', isoString, e);
        return null;
      }
    };

    // Prepare update data
    const updateData: any = {
      title: title,
      description: description,
    };

    // Only add fields that are actually provided
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.priority !== undefined) updateData.priority = req.body.priority;
    if (req.body.wizardData !== undefined) updateData.wizard_data = req.body.wizardData;
    if (req.body.schedulingData !== undefined) updateData.scheduling_data = req.body.schedulingData;
    if (req.body.effort_score !== undefined) updateData.effort_score = req.body.effort_score;
    if (req.body.benefit_score !== undefined) updateData.benefit_score = req.body.benefit_score;
    if (req.body.effort_calculated_at !== undefined) updateData.effort_calculated_at = toMySQLDateTime(req.body.effort_calculated_at);
    if (req.body.benefit_calculated_at !== undefined) updateData.benefit_calculated_at = toMySQLDateTime(req.body.benefit_calculated_at);

    // Handle scheduled dates (accept both camelCase and snake_case)
    const scheduledStart = req.body.scheduledStart || req.body.scheduled_start;
    const scheduledEnd = req.body.scheduledEnd || req.body.scheduled_end;
    const actualStart = req.body.actualStart || req.body.actual_start;
    const actualEnd = req.body.actualEnd || req.body.actual_end;

    if (scheduledStart !== undefined) {
      updateData.scheduled_start = toMySQLDateTime(scheduledStart);
      console.log('Setting scheduled_start to:', updateData.scheduled_start);
    }
    if (scheduledEnd !== undefined) {
      updateData.scheduled_end = toMySQLDateTime(scheduledEnd);
      console.log('Setting scheduled_end to:', updateData.scheduled_end);
    }
    if (actualStart !== undefined) {
      updateData.actual_start = toMySQLDateTime(actualStart);
    }
    if (actualEnd !== undefined) {
      updateData.actual_end = toMySQLDateTime(actualEnd);
    }

    console.log('Final update data:', JSON.stringify(updateData, null, 2));

    const updatedChange = await ChangeRequest.update(change.id, updateData);

    if (!updatedChange) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: ChangeRequest.formatChange(updatedChange),
    });
  } catch (error) {
    console.error('updateChange error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

// @desc    Delete/Cancel change request
// @route   DELETE /api/changes/:id
// @access  Private
export const deleteChange = async (req: AuthRequest, res: Response) => {
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

    const change = await ChangeRequest.findById(parseInt(req.params.id));

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    const user = await User.findById(parseInt(req.user.id));
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
      });
    }

    // Check permissions
    const adminRoles = ['admin', 'manager', 'Admin', 'Coordinator'];
    if (!adminRoles.includes(user.role) && change.requester_id !== user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to cancel this change request',
        },
      });
    }

    // Mark as cancelled
    await ChangeRequest.delete(change.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('deleteChange error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

// @desc    Approve change request
// @route   POST /api/changes/:id/approve
// @access  Private
export const approveChange = async (req: AuthRequest, res: Response) => {
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

    const { comments } = req.body;
    const change = await ChangeRequest.findById(parseInt(req.params.id));

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    const db = (await import('../config/database.js')).getDatabase();

    // Create CAB review record
    await db.execute(
      `INSERT INTO cab_reviews (change_request_id, reviewer_id, vote, comments, reviewed_at)
       VALUES (?, ?, 'approved', ?, NOW())
       ON DUPLICATE KEY UPDATE vote = 'approved', comments = ?, reviewed_at = NOW()`,
      [change.id, req.user.id, comments || null, comments || null]
    );

    // Add comment if provided
    if (comments) {
      await db.execute(
        `INSERT INTO change_comments (change_request_id, user_id, comment, is_internal)
         VALUES (?, ?, ?, FALSE)`,
        [change.id, req.user.id, comments]
      );
    }

    // Update change status to approved
    const updatedChange = await ChangeRequest.update(change.id, {
      status: 'approved',
    });

    if (!updatedChange) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: ChangeRequest.formatChange(updatedChange),
    });
  } catch (error) {
    console.error('approveChange error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

// @desc    Reject change request
// @route   POST /api/changes/:id/reject
// @access  Private
export const rejectChange = async (req: AuthRequest, res: Response) => {
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

    const { comments } = req.body;
    const change = await ChangeRequest.findById(parseInt(req.params.id));

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    const db = (await import('../config/database.js')).getDatabase();

    // Create CAB review record
    await db.execute(
      `INSERT INTO cab_reviews (change_request_id, reviewer_id, vote, comments, reviewed_at)
       VALUES (?, ?, 'rejected', ?, NOW())
       ON DUPLICATE KEY UPDATE vote = 'rejected', comments = ?, reviewed_at = NOW()`,
      [change.id, req.user.id, comments || null, comments || null]
    );

    // Add comment if provided
    if (comments) {
      await db.execute(
        `INSERT INTO change_comments (change_request_id, user_id, comment, is_internal)
         VALUES (?, ?, ?, FALSE)`,
        [change.id, req.user.id, comments]
      );
    }

    // Update change status to rejected
    const updatedChange = await ChangeRequest.update(change.id, {
      status: 'rejected',
    });

    if (!updatedChange) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: ChangeRequest.formatChange(updatedChange),
    });
  } catch (error) {
    console.error('rejectChange error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

// @desc    CAB approval with comprehensive assessment
// @route   POST /api/changes/:id/cab-approve
// @access  Private (CAB members, managers, admins)
export const cabApproveChange = async (req: AuthRequest, res: Response) => {
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

    const { cabAssessment, decision, comments } = req.body;

    if (!decision || (decision !== 'approve' && decision !== 'reject')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Decision must be either "approve" or "reject"',
        },
      });
    }

    const change = await ChangeRequest.findById(parseInt(req.params.id));

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    const db = (await import('../config/database.js')).getDatabase();

    // Keep original wizard data unchanged (for lessons learned reference)
    const originalData = change.wizard_data || {};

    // Use CAB assessment data for scoring calculations
    // CAB assessment contains the reviewed/revised values
    const assessmentData = { ...originalData };

    // Apply CAB assessment values if provided
    if (cabAssessment) {
      // Initialize changeReasons if it doesn't exist
      if (!assessmentData.changeReasons) {
        assessmentData.changeReasons = {};
      }

      // Merge benefit factors (revenueImprovement, costSavings, etc.)
      if (cabAssessment.revenueImprovement) {
        assessmentData.changeReasons.revenueImprovement = true;
        assessmentData.revenueDetails = {
          expectedRevenue: cabAssessment.revenueImprovement.rawValue,
          revenueTimeline: cabAssessment.revenueImprovement.rawTimeline,
          revenueDescription: cabAssessment.revenueImprovement.explanation
        };
      }
      if (cabAssessment.costSavings) {
        assessmentData.changeReasons.costReduction = true;
        assessmentData.costReductionDetails = {
          expectedSavings: cabAssessment.costSavings.rawValue,
          savingsTimeline: cabAssessment.costSavings.rawTimeline,
          savingsDescription: cabAssessment.costSavings.explanation
        };
      }
      if (cabAssessment.customerImpact) {
        assessmentData.changeReasons.customerImpact = true;
        assessmentData.customerImpactDetails = {
          customersAffected: cabAssessment.customerImpact.rawValue,
          impactTimeline: cabAssessment.customerImpact.rawTimeline,
          impactDescription: cabAssessment.customerImpact.explanation
        };
      }
      if (cabAssessment.processImprovement) {
        assessmentData.changeReasons.processImprovement = true;
        assessmentData.processImprovementDetails = {
          expectedEfficiency: cabAssessment.processImprovement.rawValue,
          improvementTimeline: cabAssessment.processImprovement.rawTimeline,
          processDescription: cabAssessment.processImprovement.explanation
        };
      }
      if (cabAssessment.internalQoL) {
        assessmentData.changeReasons.internalQoL = true;
        assessmentData.internalQoLDetails = {
          usersAffected: cabAssessment.internalQoL.rawValue,
          qolTimeline: cabAssessment.internalQoL.rawTimeline,
          expectedImprovements: cabAssessment.internalQoL.explanation
        };
      }

      // Merge effort factors
      if (cabAssessment.hoursEstimated !== undefined) assessmentData.estimatedEffortHours = cabAssessment.hoursEstimated;
      if (cabAssessment.costEstimated !== undefined) assessmentData.estimatedCost = cabAssessment.costEstimated;
      if (cabAssessment.resourceRequirement !== undefined) assessmentData.resourceRequirement = cabAssessment.resourceRequirement;
      if (cabAssessment.complexity !== undefined) assessmentData.complexity = cabAssessment.complexity;
      if (cabAssessment.systemsAffected !== undefined) assessmentData.systemsAffectedCount = cabAssessment.systemsAffected;
      if (cabAssessment.testingRequired !== undefined) assessmentData.testingRequired = cabAssessment.testingRequired;
      if (cabAssessment.documentationRequired !== undefined) assessmentData.documentationRequired = cabAssessment.documentationRequired;
      if (cabAssessment.urgency !== undefined) assessmentData.urgency = cabAssessment.urgency;

      // Merge other assessment data
      if (cabAssessment.impactedUsers !== undefined) assessmentData.impactedUsers = cabAssessment.impactedUsers;
      if (cabAssessment.systemsAffectedList !== undefined) assessmentData.systemsAffected = cabAssessment.systemsAffectedList;
      if (cabAssessment.dependencies !== undefined) assessmentData.dependencies = cabAssessment.dependencies;
      if (cabAssessment.strategicAlignment !== undefined) assessmentData.strategicAlignment = cabAssessment.strategicAlignment;
    }

    let benefitScore = null;
    let benefitFactors = null;
    let effortScore = null;
    let effortFactors = null;
    let riskScore = null;
    let riskLevel = null;

    // Only calculate scores if approving
    if (decision === 'approve') {
      // Calculate benefit score using CAB-assessed data (not original user input)
      const benefitResult = autoCalculateBenefit(assessmentData);
      benefitScore = benefitResult.score;
      benefitFactors = benefitResult.factors;

      // Calculate effort score using CAB-assessed data (not original user input)
      const effortResult = autoCalculateEffort(assessmentData);
      effortScore = effortResult.score;
      effortFactors = effortResult.factors;

      // Calculate risk score using CAB-assessed data (not original user input)
      const riskResult = autoCalculateRisk(assessmentData);
      riskScore = riskResult.score;
      riskLevel = riskResult.level;
    }

    // Create CAB review record with assessment data
    await db.execute(
      `INSERT INTO cab_reviews (change_request_id, reviewer_id, vote, comments, review_data, reviewed_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE vote = ?, comments = ?, review_data = ?, reviewed_at = NOW()`,
      [
        change.id,
        req.user.id,
        decision === 'approve' ? 'approved' : 'rejected',
        comments || null,
        JSON.stringify(cabAssessment || {}),
        decision === 'approve' ? 'approved' : 'rejected',
        comments || null,
        JSON.stringify(cabAssessment || {}),
      ]
    );

    // Add comment if provided
    if (comments) {
      await db.execute(
        `INSERT INTO change_comments (change_request_id, user_id, comment, is_internal)
         VALUES (?, ?, ?, FALSE)`,
        [change.id, req.user.id, comments]
      );
    }

    // Update change request with scores and status
    const updateData: any = {
      status: decision === 'approve' ? 'approved' : 'rejected',
      wizard_data: assessmentData, // Save CAB-revised values back to wizard_data
    };

    if (decision === 'approve') {
      updateData.benefit_score = benefitScore;
      updateData.benefit_factors = benefitFactors;
      updateData.benefit_calculated_at = new Date();
      updateData.effort_score = effortScore;
      updateData.effort_factors = effortFactors;
      updateData.effort_calculated_at = new Date();
      updateData.risk_score = riskScore;
      updateData.risk_level = riskLevel;
      updateData.risk_calculated_at = new Date();
    }

    const updatedChange = await ChangeRequest.update(change.id, updateData);

    if (!updatedChange) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: ChangeRequest.formatChange(updatedChange),
    });
  } catch (error) {
    console.error('cabApproveChange error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

// @desc    Update benefit score and factors for a change request
// @route   PUT /api/changes/:id/benefit-score
// @access  Private
export const updateBenefitScore = async (req: AuthRequest, res: Response) => {
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

    const { benefitScore, benefitFactors } = req.body;

    if (typeof benefitScore !== 'number' || !benefitFactors) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'benefitScore (number) and benefitFactors (object) are required',
        },
      });
    }

    const change = await ChangeRequest.findById(parseInt(req.params.id));

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    const db = (await import('../config/database.js')).getDatabase();

    // Update benefit score and factors
    await db.execute(
      `UPDATE change_requests
       SET benefit_score = ?,
           benefit_factors = ?,
           benefit_calculated_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [benefitScore, JSON.stringify(benefitFactors), change.id]
    );

    // Fetch updated change
    const updatedChange = await ChangeRequest.findById(change.id);

    if (!updatedChange) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found after update',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: ChangeRequest.formatChange(updatedChange),
    });
  } catch (error) {
    console.error('updateBenefitScore error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

// @desc    Calculate and update effort score for a change request
// @route   POST /api/changes/:id/effort-score
// @access  Private
export const updateEffortScore = async (req: AuthRequest, res: Response) => {
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

    const change = await ChangeRequest.findById(parseInt(req.params.id));

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    // Parse wizard_data
    let wizardData = change.wizard_data;
    if (typeof wizardData === 'string') {
      try {
        wizardData = JSON.parse(wizardData);
      } catch (e) {
        wizardData = {};
      }
    }

    // Calculate effort score from wizard_data
    const { autoCalculateEffort } = await import('../utils/effortCalculator.js');
    const effortResult = autoCalculateEffort(wizardData);
    const effortScore = effortResult.score;
    const effortFactors = effortResult.factors;

    const db = (await import('../config/database.js')).getDatabase();

    // Update effort score and factors
    await db.execute(
      `UPDATE change_requests
       SET effort_score = ?,
           effort_factors = ?,
           effort_calculated_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [effortScore, JSON.stringify(effortFactors), change.id]
    );

    // Fetch updated change
    const updatedChange = await ChangeRequest.findById(change.id);

    if (!updatedChange) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found after update',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: ChangeRequest.formatChange(updatedChange),
    });
  } catch (error) {
    console.error('updateEffortScore error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

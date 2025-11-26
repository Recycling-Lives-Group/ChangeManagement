import { Response } from 'express';
import { ChangeRequestSQL } from '../models/ChangeRequestSQL.js';
import { UserSQL } from '../models/UserSQL.js';
import type { AuthRequest } from '../middleware/auth.js';
import { autoCalculateRisk } from '../utils/riskCalculator.js';

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
    const user = await UserSQL.findById(parseInt(req.user.id));
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

    const { changes, total } = await ChangeRequestSQL.findAll(options);

    res.status(200).json({
      success: true,
      data: changes.map(c => ChangeRequestSQL.formatChange(c)),
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

    const change = await ChangeRequestSQL.findById(parseInt(req.params.id));

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
    const user = await UserSQL.findById(parseInt(req.user.id));
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
      data: ChangeRequestSQL.formatChange(change),
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

    const user = await UserSQL.findById(parseInt(req.user.id));
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
    };

    console.log('Creating change with data:', JSON.stringify(changeData, null, 2));
    const change = await ChangeRequestSQL.create(changeData);

    res.status(201).json({
      success: true,
      data: ChangeRequestSQL.formatChange(change),
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

    const change = await ChangeRequestSQL.findById(parseInt(req.params.id));

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    const user = await UserSQL.findById(parseInt(req.user.id));
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

    console.log('Updating change with data:', req.body);

    // Convert ISO datetime to MySQL format (YYYY-MM-DD HH:MM:SS)
    const toMySQLDateTime = (isoString: string | undefined) => {
      if (!isoString) return undefined;
      return new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');
    };

    const updatedChange = await ChangeRequestSQL.update(change.id, {
      title: title,
      description: description,
      status: req.body.status,
      priority: req.body.priority,
      wizard_data: req.body.wizardData,
      scheduling_data: req.body.schedulingData,
      effort_score: req.body.effort_score,
      benefit_score: req.body.benefit_score,
      effort_calculated_at: toMySQLDateTime(req.body.effort_calculated_at),
      benefit_calculated_at: toMySQLDateTime(req.body.benefit_calculated_at),
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
      data: ChangeRequestSQL.formatChange(updatedChange),
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

    const change = await ChangeRequestSQL.findById(parseInt(req.params.id));

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    const user = await UserSQL.findById(parseInt(req.user.id));
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
    await ChangeRequestSQL.delete(change.id);

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

    const change = await ChangeRequestSQL.findById(parseInt(req.params.id));

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    // Update change status to approved
    const updatedChange = await ChangeRequestSQL.update(change.id, {
      status: 'approved',
    });

    // TODO: Create CAB review record in cab_reviews table

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
      data: ChangeRequestSQL.formatChange(updatedChange),
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

    const change = await ChangeRequestSQL.findById(parseInt(req.params.id));

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    // Update change status to rejected
    const updatedChange = await ChangeRequestSQL.update(change.id, {
      status: 'rejected',
    });

    // TODO: Create CAB review record in cab_reviews table

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
      data: ChangeRequestSQL.formatChange(updatedChange),
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

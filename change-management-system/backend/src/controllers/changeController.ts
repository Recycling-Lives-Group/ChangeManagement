import { Response } from 'express';
import { ChangeRequest } from '../models/ChangeRequest.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { FilterParams, PaginationParams } from '@cm/types';

// @desc    Get all change requests
// @route   GET /api/changes
// @access  Private
export const getChanges = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const skip = (page - 1) * pageSize;

    // Build filter query
    const filter: any = {};
    if (req.query.status) {
      filter.status = { $in: (req.query.status as string).split(',') };
    }
    if (req.query.changeType) {
      filter.changeType = { $in: (req.query.changeType as string).split(',') };
    }
    if (req.query.riskLevel) {
      filter.riskLevel = { $in: (req.query.riskLevel as string).split(',') };
    }
    if (req.query.requester) {
      filter['requester.email'] = req.query.requester;
    }

    // If user is not admin/coordinator, only show their requests
    if (req.user && !['Admin', 'Coordinator', 'CAB_Member'].includes(req.user.role)) {
      filter['requester.email'] = req.user.email;
    }

    const total = await ChangeRequest.countDocuments(filter);
    const changes = await ChangeRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      data: changes,
      meta: {
        page,
        pageSize,
        total,
      },
    });
  } catch (error) {
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
    const change = await ChangeRequest.findById(req.params.id);

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    // Check if user has permission to view this change
    if (
      req.user &&
      !['Admin', 'Coordinator', 'CAB_Member'].includes(req.user.role) &&
      change.requester.email !== req.user.email
    ) {
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
      data: change,
    });
  } catch (error) {
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

    // Set requester info from authenticated user
    const changeData = {
      ...req.body,
      requester: {
        name: req.user.name,
        department: req.user.department,
        email: req.user.email,
        phone: req.user.phone,
      },
      status: 'New',
    };

    const change = await ChangeRequest.create(changeData);

    res.status(201).json({
      success: true,
      data: change,
    });
  } catch (error) {
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
    let change = await ChangeRequest.findById(req.params.id);

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    // Check if user has permission to update
    if (
      req.user &&
      !['Admin', 'Coordinator'].includes(req.user.role) &&
      change.requester.email !== req.user.email
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to update this change request',
        },
      });
    }

    change = await ChangeRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: change,
    });
  } catch (error) {
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
    const change = await ChangeRequest.findById(req.params.id);

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    // Check permissions
    if (
      req.user &&
      !['Admin', 'Coordinator'].includes(req.user.role) &&
      change.requester.email !== req.user.email
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to cancel this change request',
        },
      });
    }

    // Mark as cancelled instead of deleting
    change.status = 'Cancelled';
    await change.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
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
    const change = await ChangeRequest.findById(req.params.id);

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized',
        },
      });
    }

    // Add approval
    const approval = {
      id: new Date().getTime().toString(),
      changeRequestId: change._id.toString(),
      approver: {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
      },
      level: req.body.level || 'L1',
      status: 'Approved',
      comments: req.body.comments,
      approvedAt: new Date(),
      createdAt: new Date(),
    };

    change.approvals.push(approval);

    // Update status based on approval level
    if (change.status === 'New' || change.status === 'In Review') {
      change.status = 'Approved';
    }

    await change.save();

    res.status(200).json({
      success: true,
      data: change,
    });
  } catch (error) {
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
    const change = await ChangeRequest.findById(req.params.id);

    if (!change) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Change request not found',
        },
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized',
        },
      });
    }

    // Add rejection
    const approval = {
      id: new Date().getTime().toString(),
      changeRequestId: change._id.toString(),
      approver: {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
      },
      level: req.body.level || 'L1',
      status: 'Rejected',
      comments: req.body.comments || 'No comments provided',
      approvedAt: new Date(),
      createdAt: new Date(),
    };

    change.approvals.push(approval);
    change.status = 'Cancelled';

    await change.save();

    res.status(200).json({
      success: true,
      data: change,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

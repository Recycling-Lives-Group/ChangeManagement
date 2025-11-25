import mongoose, { Schema, Document } from 'mongoose';
import type { ChangeRequest as IChangeRequest } from '@cm/types';

export interface ChangeRequestDocument extends Omit<IChangeRequest, 'id' | 'requestDate' | 'createdAt' | 'updatedAt' | 'proposedDate' | 'actualImplementationDate'>, Document {
  requestDate: Date;
  proposedDate: Date;
  actualImplementationDate?: Date;
}

const changeRequestSchema = new Schema<ChangeRequestDocument>(
  {
    requester: {
      name: { type: String, required: true },
      department: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    changeTitle: {
      type: String,
      required: true,
    },
    changeType: {
      type: String,
      enum: ['Emergency', 'Major', 'Minor', 'Standard'],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'New',
        'In Review',
        'Approved',
        'In Progress',
        'Testing',
        'Scheduled',
        'Implementing',
        'Completed',
        'Failed',
        'Cancelled',
        'On Hold',
      ],
      default: 'New',
    },
    businessJustification: {
      type: String,
      required: true,
    },
    systemsAffected: [String],
    riskLevel: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      required: true,
    },
    impactedUsers: {
      type: Number,
      required: true,
    },
    departments: [String],
    financialImpact: {
      type: Number,
      default: 0,
    },
    complianceImpact: {
      type: Boolean,
      default: false,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    proposedDate: {
      type: Date,
      required: true,
    },
    actualImplementationDate: Date,
    rollbackPlan: {
      type: String,
      required: true,
    },
    testingPlan: {
      type: String,
      required: true,
    },
    successCriteria: [String],
    attachments: [
      {
        id: String,
        filename: String,
        fileUrl: String,
        uploadedBy: String,
        uploadedAt: Date,
        fileSize: Number,
        mimeType: String,
      },
    ],
    dependencies: [String],
    relatedChanges: [String],
    approvals: [
      {
        id: String,
        changeRequestId: String,
        approver: {
          id: String,
          name: String,
          email: String,
        },
        level: {
          type: String,
          enum: ['L1', 'L2', 'L3', 'L4'],
        },
        status: {
          type: String,
          enum: ['Pending', 'Approved', 'Rejected'],
        },
        comments: String,
        approvedAt: Date,
        createdAt: Date,
      },
    ],
    comments: [
      {
        id: String,
        changeRequestId: String,
        author: {
          id: String,
          name: String,
        },
        content: String,
        createdAt: Date,
        updatedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
changeRequestSchema.index({ status: 1, createdAt: -1 });
changeRequestSchema.index({ 'requester.email': 1 });
changeRequestSchema.index({ changeType: 1 });
changeRequestSchema.index({ proposedDate: 1 });

export const ChangeRequest = mongoose.model<ChangeRequestDocument>('ChangeRequest', changeRequestSchema);

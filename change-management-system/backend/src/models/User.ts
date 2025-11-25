import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { User as IUser, UserRole, UserPermissions, ApprovalLevel } from '@cm/types';

export interface UserDocument extends Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>, Document {
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getPermissions(): UserPermissions;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Requester', 'Coordinator', 'CAB_Member', 'Dept_Head', 'Implementer', 'Admin'],
      default: 'Requester',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user permissions based on role
userSchema.methods.getPermissions = function (): UserPermissions {
  const rolePermissions: Record<UserRole, UserPermissions> = {
    Requester: {
      createRequest: true,
      viewAllRequests: false,
      approve: [],
      modifyEngine: false,
      generateReports: false,
      manageUsers: false,
    },
    Coordinator: {
      createRequest: true,
      viewAllRequests: true,
      approve: ['L1'],
      modifyEngine: false,
      generateReports: true,
      manageUsers: false,
    },
    CAB_Member: {
      createRequest: true,
      viewAllRequests: true,
      approve: ['L1', 'L2'],
      modifyEngine: false,
      generateReports: true,
      manageUsers: false,
    },
    Dept_Head: {
      createRequest: true,
      viewAllRequests: true,
      approve: ['L1', 'L2', 'L3'],
      modifyEngine: false,
      generateReports: true,
      manageUsers: false,
    },
    Implementer: {
      createRequest: true,
      viewAllRequests: true,
      approve: [],
      modifyEngine: false,
      generateReports: false,
      manageUsers: false,
    },
    Admin: {
      createRequest: true,
      viewAllRequests: true,
      approve: ['L1', 'L2', 'L3', 'L4'],
      modifyEngine: true,
      generateReports: true,
      manageUsers: true,
    },
  };

  return rolePermissions[this.role];
};

export const User = mongoose.model<UserDocument>('User', userSchema);

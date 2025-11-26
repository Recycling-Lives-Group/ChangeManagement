import bcrypt from 'bcryptjs';
import { getDatabase } from '../config/database.js';
import type { UserRole, UserPermissions } from '@cm/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface UserData {
  id: number;
  email: string;
  username: string;
  password_hash?: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  department: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UserSQL {
  static async findByEmail(email: string): Promise<UserData | null> {
    const db = getDatabase();
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? (rows[0] as UserData) : null;
  }

  static async findById(id: number): Promise<UserData | null> {
    const db = getDatabase();
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT id, email, username, first_name, last_name, role, department, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as UserData) : null;
  }

  static async create(data: {
    email: string;
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    department?: string;
  }): Promise<UserData> {
    const db = getDatabase();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, role, department)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.email,
        data.username,
        password_hash,
        data.first_name || null,
        data.last_name || null,
        data.role || 'user',
        data.department || null,
      ]
    );

    const user = await this.findById(result.insertId);
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  }

  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static getPermissions(role: string): UserPermissions {
    // Map SQL roles to application roles
    const roleMap: Record<string, UserRole> = {
      'user': 'Requester',
      'manager': 'Coordinator',
      'cab_member': 'CAB_Member',
      'admin': 'Admin',
    };

    const appRole = roleMap[role] || 'Requester';

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

    return rolePermissions[appRole];
  }

  static formatUser(user: UserData) {
    return {
      id: user.id,
      email: user.email,
      name: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      department: user.department,
      role: user.role,
      permissions: this.getPermissions(user.role),
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}

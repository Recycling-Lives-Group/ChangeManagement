import { getDatabase } from '../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface ChangeRequestData {
  id: number;
  request_number: string;
  title: string;
  description: string | null;
  requester_id: number;
  status: string;
  priority: string;
  wizard_data: any;
  scheduling_data: any;
  metrics_data: any;
  prioritization_data: any;
  custom_fields: any;
  submitted_at: Date | null;
  scheduled_start: Date | null;
  scheduled_end: Date | null;
  actual_start: Date | null;
  actual_end: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ChangeRequestWithUser extends ChangeRequestData {
  requester_email?: string;
  requester_username?: string;
  requester_first_name?: string;
  requester_last_name?: string;
  requester_department?: string;
}

export class ChangeRequestSQL {
  static async findAll(options: {
    page?: number;
    pageSize?: number;
    status?: string[];
    requesterId?: number;
  } = {}): Promise<{ changes: ChangeRequestWithUser[]; total: number }> {
    const db = getDatabase();
    const { page = 1, pageSize = 10, status, requesterId } = options;
    const offset = (page - 1) * pageSize;

    let whereClause = '';
    const params: any[] = [];

    const conditions: string[] = [];
    if (status && status.length > 0) {
      conditions.push(`cr.status IN (${status.map(() => '?').join(',')})`);
      params.push(...status);
    }
    if (requesterId) {
      conditions.push('cr.requester_id = ?');
      params.push(requesterId);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Get total count
    const [countRows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM change_requests cr ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Get paginated results with user info
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT
        cr.*,
        u.email as requester_email,
        u.username as requester_username,
        u.first_name as requester_first_name,
        u.last_name as requester_last_name,
        u.department as requester_department
      FROM change_requests cr
      LEFT JOIN users u ON cr.requester_id = u.id
      ${whereClause}
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return {
      changes: rows as ChangeRequestWithUser[],
      total,
    };
  }

  static async findById(id: number): Promise<ChangeRequestWithUser | null> {
    const db = getDatabase();
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT
        cr.*,
        u.email as requester_email,
        u.username as requester_username,
        u.first_name as requester_first_name,
        u.last_name as requester_last_name,
        u.department as requester_department
      FROM change_requests cr
      LEFT JOIN users u ON cr.requester_id = u.id
      WHERE cr.id = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as ChangeRequestWithUser) : null;
  }

  static async create(data: {
    title: string;
    description?: string;
    requester_id: number;
    status?: string;
    priority?: string;
    wizard_data?: any;
    scheduling_data?: any;
    risk_score?: number;
    risk_level?: string;
  }): Promise<ChangeRequestWithUser> {
    const db = getDatabase();

    // Generate request number
    const [countRows] = await db.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM change_requests WHERE YEAR(created_at) = YEAR(CURRENT_DATE)'
    );
    const count = countRows[0].count + 1;
    const request_number = `CHG-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    // Format date for MySQL
    const submittedAt = (data.status === 'submitted' || data.status === 'under_review')
      ? new Date().toISOString().slice(0, 19).replace('T', ' ')
      : null;

    const params = [
      request_number,
      data.title || '',
      data.description || null,
      data.requester_id,
      data.status || 'draft',
      data.priority || 'medium',
      data.wizard_data ? JSON.stringify(data.wizard_data) : null,
      data.scheduling_data ? JSON.stringify(data.scheduling_data) : null,
      submittedAt,
      data.risk_score || null,
      data.risk_level || null,
    ];

    console.log('SQL INSERT params:', params);
    console.log('Checking for undefined:', params.map((p, i) => ({ index: i, isUndefined: p === undefined, value: p })));

    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO change_requests
        (request_number, title, description, requester_id, status, priority, wizard_data, scheduling_data, submitted_at, risk_score, risk_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    const change = await this.findById(result.insertId);
    if (!change) {
      throw new Error('Failed to create change request');
    }
    return change;
  }

  static async update(id: number, data: Partial<ChangeRequestData>): Promise<ChangeRequestWithUser | null> {
    const db = getDatabase();

    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
      if (data.status === 'submitted' && !data.submitted_at) {
        updates.push('submitted_at = ?');
        params.push(new Date());
      }
    }
    if (data.priority !== undefined) {
      updates.push('priority = ?');
      params.push(data.priority);
    }
    if (data.wizard_data !== undefined) {
      updates.push('wizard_data = ?');
      params.push(JSON.stringify(data.wizard_data));
    }
    if (data.scheduling_data !== undefined) {
      updates.push('scheduling_data = ?');
      params.push(JSON.stringify(data.scheduling_data));
    }
    if (data.effort_score !== undefined) {
      updates.push('effort_score = ?');
      params.push(data.effort_score);
    }
    if (data.benefit_score !== undefined) {
      updates.push('benefit_score = ?');
      params.push(data.benefit_score);
    }
    if (data.effort_calculated_at !== undefined) {
      updates.push('effort_calculated_at = ?');
      params.push(data.effort_calculated_at);
    }
    if (data.benefit_calculated_at !== undefined) {
      updates.push('benefit_calculated_at = ?');
      params.push(data.benefit_calculated_at);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    await db.execute(
      `UPDATE change_requests SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const db = getDatabase();
    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE change_requests SET status = ? WHERE id = ?',
      ['cancelled', id]
    );
    return result.affectedRows > 0;
  }

  static formatChange(change: ChangeRequestWithUser) {
    // Parse JSON fields if they're strings
    let wizardData = change.wizard_data;
    if (typeof wizardData === 'string') {
      try {
        wizardData = JSON.parse(wizardData);
      } catch (e) {
        wizardData = null;
      }
    }

    let schedulingData = change.scheduling_data;
    if (typeof schedulingData === 'string') {
      try {
        schedulingData = JSON.parse(schedulingData);
      } catch (e) {
        schedulingData = null;
      }
    }

    let metricsData = change.metrics_data;
    if (typeof metricsData === 'string') {
      try {
        metricsData = JSON.parse(metricsData);
      } catch (e) {
        metricsData = null;
      }
    }

    return {
      id: change.id.toString(),
      requestNumber: change.request_number,
      title: change.title,
      description: change.description,
      requester: {
        id: change.requester_id.toString(),
        email: change.requester_email,
        name: change.requester_username,
        firstName: change.requester_first_name,
        lastName: change.requester_last_name,
        department: change.requester_department,
      },
      status: change.status,
      priority: change.priority,
      wizardData: wizardData,
      schedulingData: schedulingData,
      metricsData: metricsData,
      submittedAt: change.submitted_at,
      scheduledStart: change.scheduled_start,
      scheduledEnd: change.scheduled_end,
      actualStart: change.actual_start,
      actualEnd: change.actual_end,
      createdAt: change.created_at,
      updatedAt: change.updated_at,
      // Assessment scores
      effortScore: change.effort_score,
      benefitScore: change.benefit_score,
      effortCalculatedAt: change.effort_calculated_at,
      benefitCalculatedAt: change.benefit_calculated_at,
      // Risk scores
      riskScore: change.risk_score,
      riskLevel: change.risk_level,
      riskCalculatedAt: change.risk_calculated_at,
      riskCalculatedBy: change.risk_calculated_by,
      approvals: [], // TODO: Load from cab_reviews table
      comments: [], // TODO: Load from change_comments table
    };
  }
}

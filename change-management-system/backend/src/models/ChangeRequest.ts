import { getDatabase } from '../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

// Effort factor breakdown (8 factors, scored 1-5)
export interface EffortFactors {
  impactScope: number;          // 1-5: Number of users/systems affected
  businessCritical: number;     // 1-5: How critical is the affected system
  complexity: number;           // 1-5: Technical difficulty and complexity
  testingCoverage: number;      // 1-5: Quality and extent of testing (inverse - higher is better)
  rollbackCapability: number;   // 1-5: Ease of reverting changes (inverse - higher is better)
  historicalFailures: number;   // 1-5: Past failure rate for similar changes
  costToImplement: number;      // 1-5: Financial cost of implementation
  timeToImplement: number;      // 1-5: Time required for implementation
}

// Individual benefit detail (for benefits that were selected)
export interface BenefitDetail {
  selected: true;
  rawValue: number;           // £ or hours or count depending on benefit type
  rawTimeline: number;        // months to realise
  explanation: string;
  valueScore: number;         // calculated from rawValue using config
  timeScore: number;          // calculated from rawTimeline using config
  combinedScore: number;      // valueScore + timeScore
  weightedScore: number;      // combinedScore * weight
}

// Benefit factor breakdown - stores details for each benefit type
export interface BenefitFactors {
  revenueImprovement: BenefitDetail | null;   // £ annual revenue improvement
  costSavings: BenefitDetail | null;          // £ annual cost reduction
  customerImpact: BenefitDetail | null;       // number of customers affected
  processImprovement: BenefitDetail | null;   // hours saved (hours * users)
  internalQoL: BenefitDetail | null;          // hours saved for internal staff
  strategicAlignment: {                       // manual score by admin
    selected: true;
    score: number;                            // 1-10 manual score
    explanation: string;
    weightedScore: number;                    // score * 10 * weight
  } | null;
}

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
  // Risk assessment fields
  risk_score: number | null;
  risk_level: string | null;
  risk_calculated_at: Date | null;
  risk_calculated_by: number | null;
  // Effort assessment fields
  effort_score: number | null;
  effort_factors: EffortFactors | null;
  effort_calculated_at: Date | null;
  // Benefit assessment fields
  benefit_score: number | null;
  benefit_factors: BenefitFactors | null;
  benefit_calculated_at: Date | null;
}

export interface ChangeRequestWithUser extends ChangeRequestData {
  requester_email?: string;
  requester_username?: string;
  requester_first_name?: string;
  requester_last_name?: string;
  requester_department?: string;
}

export class ChangeRequest {
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

    if (rows.length === 0) return null;

    const change = rows[0] as ChangeRequestWithUser;

    // Load CAB reviews
    const [reviews] = await db.execute<RowDataPacket[]>(
      `SELECT
        cr.*,
        u.id as reviewer_user_id,
        u.username as reviewer_name,
        u.email as reviewer_email,
        u.first_name as reviewer_first_name,
        u.last_name as reviewer_last_name
      FROM cab_reviews cr
      LEFT JOIN users u ON cr.reviewer_id = u.id
      WHERE cr.change_request_id = ?
      ORDER BY cr.reviewed_at DESC`,
      [id]
    );
    (change as any).cab_reviews = reviews;

    // Load comments
    const [comments] = await db.execute<RowDataPacket[]>(
      `SELECT
        cc.*,
        u.id as commenter_user_id,
        u.username as commenter_name,
        u.email as commenter_email,
        u.first_name as commenter_first_name,
        u.last_name as commenter_last_name
      FROM change_comments cc
      LEFT JOIN users u ON cc.user_id = u.id
      WHERE cc.change_request_id = ?
      ORDER BY cc.created_at DESC`,
      [id]
    );
    (change as any).change_comments = comments;

    return change;
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
    if (data.metrics_data !== undefined) {
      updates.push('metrics_data = ?');
      params.push(JSON.stringify(data.metrics_data));
    }
    if (data.prioritization_data !== undefined) {
      updates.push('prioritization_data = ?');
      params.push(JSON.stringify(data.prioritization_data));
    }
    if (data.custom_fields !== undefined) {
      updates.push('custom_fields = ?');
      params.push(JSON.stringify(data.custom_fields));
    }
    // Effort assessment fields
    if (data.effort_score !== undefined) {
      updates.push('effort_score = ?');
      params.push(data.effort_score);
    }
    if (data.effort_factors !== undefined) {
      updates.push('effort_factors = ?');
      params.push(data.effort_factors ? JSON.stringify(data.effort_factors) : null);
    }
    if (data.effort_calculated_at !== undefined) {
      updates.push('effort_calculated_at = ?');
      params.push(data.effort_calculated_at);
    }
    // Benefit assessment fields
    if (data.benefit_score !== undefined) {
      updates.push('benefit_score = ?');
      params.push(data.benefit_score);
    }
    if (data.benefit_factors !== undefined) {
      updates.push('benefit_factors = ?');
      params.push(data.benefit_factors ? JSON.stringify(data.benefit_factors) : null);
    }
    if (data.benefit_calculated_at !== undefined) {
      updates.push('benefit_calculated_at = ?');
      params.push(data.benefit_calculated_at);
    }
    // Risk assessment fields
    if (data.risk_score !== undefined) {
      updates.push('risk_score = ?');
      params.push(data.risk_score);
    }
    if (data.risk_level !== undefined) {
      updates.push('risk_level = ?');
      params.push(data.risk_level);
    }
    if (data.risk_calculated_at !== undefined) {
      updates.push('risk_calculated_at = ?');
      params.push(data.risk_calculated_at);
    }
    if (data.risk_calculated_by !== undefined) {
      updates.push('risk_calculated_by = ?');
      params.push(data.risk_calculated_by);
    }
    // Scheduling fields
    if (data.scheduled_start !== undefined) {
      updates.push('scheduled_start = ?');
      params.push(data.scheduled_start);
    }
    if (data.scheduled_end !== undefined) {
      updates.push('scheduled_end = ?');
      params.push(data.scheduled_end);
    }
    if (data.actual_start !== undefined) {
      updates.push('actual_start = ?');
      params.push(data.actual_start);
    }
    if (data.actual_end !== undefined) {
      updates.push('actual_end = ?');
      params.push(data.actual_end);
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
    // Helper function to parse JSON fields
    const parseJSON = (field: any) => {
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (e) {
          return null;
        }
      }
      return field;
    };

    // Parse all JSON fields
    const wizardData = parseJSON(change.wizard_data);
    const schedulingData = parseJSON(change.scheduling_data);
    const metricsData = parseJSON(change.metrics_data);
    const prioritizationData = parseJSON(change.prioritization_data);
    const customFields = parseJSON(change.custom_fields);
    const effortFactors = parseJSON(change.effort_factors);
    const benefitFactors = parseJSON(change.benefit_factors);

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
      prioritizationData: prioritizationData,
      customFields: customFields,
      submittedAt: change.submitted_at,
      scheduledStart: change.scheduled_start,
      scheduledEnd: change.scheduled_end,
      actualStart: change.actual_start,
      actualEnd: change.actual_end,
      createdAt: change.created_at,
      updatedAt: change.updated_at,
      // Effort assessment
      effortScore: change.effort_score,
      effortFactors: effortFactors,
      effortCalculatedAt: change.effort_calculated_at,
      // Benefit assessment
      benefitScore: change.benefit_score,
      benefitFactors: benefitFactors,
      benefitCalculatedAt: change.benefit_calculated_at,
      // Risk assessment
      riskScore: change.risk_score,
      riskLevel: change.risk_level,
      riskCalculatedAt: change.risk_calculated_at,
      riskCalculatedBy: change.risk_calculated_by?.toString(),
      approvals: (change as any).cab_reviews?.map((review: any) => ({
        id: review.id.toString(),
        reviewerId: review.reviewer_user_id?.toString(),
        reviewerName: review.reviewer_name || `${review.reviewer_first_name || ''} ${review.reviewer_last_name || ''}`.trim(),
        reviewerEmail: review.reviewer_email,
        vote: review.vote,
        riskLevel: review.risk_level,
        comments: review.comments,
        reviewedAt: review.reviewed_at,
        createdAt: review.created_at,
      })) || [],
      comments: (change as any).change_comments?.map((comment: any) => ({
        id: comment.id.toString(),
        userId: comment.commenter_user_id?.toString(),
        userName: comment.commenter_name || `${comment.commenter_first_name || ''} ${comment.commenter_last_name || ''}`.trim(),
        userEmail: comment.commenter_email,
        comment: comment.comment,
        isInternal: comment.is_internal,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
      })) || [],
    };
  }
}

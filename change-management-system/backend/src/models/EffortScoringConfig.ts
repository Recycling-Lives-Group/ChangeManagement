import { getDatabase } from '../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

interface EffortScoringConfigRow extends RowDataPacket {
  id: number;
  effort_type: string;
  display_name: string;
  value_for_100_points: number;
  value_unit: string;
  thresholds: string;
  description: string;
  time_decay_per_month: number;
  is_active: boolean;
  updated_at: Date;
}

export class EffortScoringConfig {
  static async findAll(): Promise<EffortScoringConfigRow[]> {
    const db = getDatabase();
    const [rows] = await db.query<EffortScoringConfigRow[]>(
      'SELECT * FROM effort_scoring_config WHERE is_active = 1 ORDER BY effort_type'
    );
    return rows;
  }

  static async findById(id: number): Promise<EffortScoringConfigRow | null> {
    const db = getDatabase();
    const [rows] = await db.query<EffortScoringConfigRow[]>(
      'SELECT * FROM effort_scoring_config WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async findByType(effortType: string): Promise<EffortScoringConfigRow | null> {
    const db = getDatabase();
    const [rows] = await db.query<EffortScoringConfigRow[]>(
      'SELECT * FROM effort_scoring_config WHERE effort_type = ?',
      [effortType]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async create(data: {
    effort_type: string;
    display_name: string;
    value_for_100_points: number;
    value_unit: string;
    thresholds: string;
    description?: string;
    time_decay_per_month?: number;
  }): Promise<EffortScoringConfigRow> {
    const db = getDatabase();
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO effort_scoring_config
       (effort_type, display_name, value_for_100_points, value_unit, thresholds, description, time_decay_per_month)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.effort_type,
        data.display_name,
        data.value_for_100_points,
        data.value_unit,
        data.thresholds,
        data.description || null,
        data.time_decay_per_month || 0,
      ]
    );

    const newConfig = await this.findById(result.insertId);
    if (!newConfig) {
      throw new Error('Failed to retrieve created effort scoring config');
    }
    return newConfig;
  }

  static async update(id: number, data: Partial<{
    display_name: string;
    value_for_100_points: number;
    value_unit: string;
    thresholds: string;
    description: string;
    time_decay_per_month: number;
    is_active: boolean;
  }>): Promise<EffortScoringConfigRow | null> {
    const db = getDatabase();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.display_name !== undefined) {
      updates.push('display_name = ?');
      values.push(data.display_name);
    }
    if (data.value_for_100_points !== undefined) {
      updates.push('value_for_100_points = ?');
      values.push(data.value_for_100_points);
    }
    if (data.value_unit !== undefined) {
      updates.push('value_unit = ?');
      values.push(data.value_unit);
    }
    if (data.thresholds !== undefined) {
      updates.push('thresholds = ?');
      values.push(data.thresholds);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.time_decay_per_month !== undefined) {
      updates.push('time_decay_per_month = ?');
      values.push(data.time_decay_per_month);
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await db.execute(
      `UPDATE effort_scoring_config SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const db = getDatabase();
    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE effort_scoring_config SET is_active = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static formatConfig(config: EffortScoringConfigRow): any {
    return {
      id: config.id,
      effortType: config.effort_type,
      displayName: config.display_name,
      valueFor100Points: parseFloat(config.value_for_100_points.toString()),
      valueUnit: config.value_unit,
      thresholds: config.thresholds ? config.thresholds.split(',').map(t => parseFloat(t.trim())) : [],
      description: config.description,
      timeDecayPerMonth: config.time_decay_per_month,
      isActive: Boolean(config.is_active),
      updatedAt: config.updated_at,
    };
  }
}

import { getDatabase } from '../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface BenefitScoringConfigData {
  id: number;
  benefit_type: string;
  display_name: string;
  value_for_100_points: number;
  value_unit: string;
  time_decay_per_month: number;
  is_active: boolean;
  description: string | null;
  updated_at: Date;
}

export class BenefitScoringConfigSQL {
  static async findAll(): Promise<BenefitScoringConfigData[]> {
    const db = getDatabase();
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM benefit_scoring_config WHERE is_active = 1 ORDER BY benefit_type'
    );
    return rows as BenefitScoringConfigData[];
  }

  static async findByType(benefitType: string): Promise<BenefitScoringConfigData | null> {
    const db = getDatabase();
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM benefit_scoring_config WHERE benefit_type = ? AND is_active = 1',
      [benefitType]
    );
    return rows.length > 0 ? (rows[0] as BenefitScoringConfigData) : null;
  }

  static async findById(id: number): Promise<BenefitScoringConfigData | null> {
    const db = getDatabase();
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM benefit_scoring_config WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as BenefitScoringConfigData) : null;
  }

  static async create(data: {
    benefit_type: string;
    display_name: string;
    value_for_100_points: number;
    value_unit: string;
    time_decay_per_month: number;
    description?: string;
  }): Promise<BenefitScoringConfigData> {
    const db = getDatabase();

    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO benefit_scoring_config
        (benefit_type, display_name, value_for_100_points, value_unit, time_decay_per_month, description)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.benefit_type,
        data.display_name,
        data.value_for_100_points,
        data.value_unit,
        data.time_decay_per_month,
        data.description || null,
      ]
    );

    const config = await this.findById(result.insertId);
    if (!config) {
      throw new Error('Failed to create benefit scoring config');
    }
    return config;
  }

  static async update(id: number, data: Partial<BenefitScoringConfigData>): Promise<BenefitScoringConfigData | null> {
    const db = getDatabase();

    const updates: string[] = [];
    const params: any[] = [];

    if (data.display_name !== undefined) {
      updates.push('display_name = ?');
      params.push(data.display_name);
    }
    if (data.value_for_100_points !== undefined) {
      updates.push('value_for_100_points = ?');
      params.push(data.value_for_100_points);
    }
    if (data.value_unit !== undefined) {
      updates.push('value_unit = ?');
      params.push(data.value_unit);
    }
    if (data.time_decay_per_month !== undefined) {
      updates.push('time_decay_per_month = ?');
      params.push(data.time_decay_per_month);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(data.is_active);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    await db.execute(
      `UPDATE benefit_scoring_config SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const db = getDatabase();
    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE benefit_scoring_config SET is_active = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static formatConfig(config: BenefitScoringConfigData) {
    return {
      id: config.id,
      benefitType: config.benefit_type,
      displayName: config.display_name,
      valueFor100Points: config.value_for_100_points,
      valueUnit: config.value_unit,
      timeDecayPerMonth: config.time_decay_per_month,
      isActive: config.is_active,
      description: config.description,
      updatedAt: config.updated_at,
    };
  }

  // Calculate score based on config
  static calculateScore(rawValue: number, rawTimeline: number, config: BenefitScoringConfigData): {
    valueScore: number;
    timeScore: number;
    combinedScore: number;
  } {
    // Calculate value score (0-100 scale)
    const valueScore = Math.min(100, (rawValue / config.value_for_100_points) * 100);

    // Calculate time score (100 points at instant, decay per month)
    const timeScore = Math.max(0, 100 - (rawTimeline * config.time_decay_per_month));

    // Combined score is sum of both
    const combinedScore = valueScore + timeScore;

    return {
      valueScore: Math.round(valueScore * 10) / 10,
      timeScore: Math.round(timeScore * 10) / 10,
      combinedScore: Math.round(combinedScore * 10) / 10,
    };
  }
}

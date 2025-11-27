import { Request, Response } from 'express';
import { BenefitScoringConfigSQL } from '../models/BenefitScoringConfigSQL.js';

// Get all benefit scoring configs
export const getAllBenefitConfigs = async (req: Request, res: Response) => {
  try {
    const configs = await BenefitScoringConfigSQL.findAll();
    const formattedConfigs = configs.map(config => BenefitScoringConfigSQL.formatConfig(config));

    res.status(200).json({
      success: true,
      data: formattedConfigs,
    });
  } catch (error: any) {
    console.error('Error fetching benefit configs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CONFIGS_ERROR',
        message: error.message || 'Failed to fetch benefit configs',
      },
    });
  }
};

// Get benefit scoring config by ID
export const getBenefitConfigById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = await BenefitScoringConfigSQL.findById(parseInt(id));

    if (!config) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Benefit scoring config not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: BenefitScoringConfigSQL.formatConfig(config),
    });
  } catch (error: any) {
    console.error('Error fetching benefit config:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CONFIG_ERROR',
        message: error.message || 'Failed to fetch benefit config',
      },
    });
  }
};

// Get benefit scoring config by type
export const getBenefitConfigByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const config = await BenefitScoringConfigSQL.findByType(type);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: `Benefit scoring config for type '${type}' not found`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: BenefitScoringConfigSQL.formatConfig(config),
    });
  } catch (error: any) {
    console.error('Error fetching benefit config by type:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CONFIG_ERROR',
        message: error.message || 'Failed to fetch benefit config',
      },
    });
  }
};

// Create new benefit scoring config
export const createBenefitConfig = async (req: Request, res: Response) => {
  try {
    const { benefitType, displayName, valueFor100Points, valueUnit, timeDecayPerMonth, description } = req.body;

    // Validation
    if (!benefitType || !displayName || !valueFor100Points || !valueUnit || timeDecayPerMonth === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
        },
      });
    }

    const config = await BenefitScoringConfigSQL.create({
      benefit_type: benefitType,
      display_name: displayName,
      value_for_100_points: valueFor100Points,
      value_unit: valueUnit,
      time_decay_per_month: timeDecayPerMonth,
      description: description,
    });

    res.status(201).json({
      success: true,
      data: BenefitScoringConfigSQL.formatConfig(config),
    });
  } catch (error: any) {
    console.error('Error creating benefit config:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_CONFIG_ERROR',
        message: error.message || 'Failed to create benefit config',
      },
    });
  }
};

// Update benefit scoring config
export const updateBenefitConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { displayName, valueFor100Points, valueUnit, timeDecayPerMonth, description, isActive } = req.body;

    const updateData: any = {};
    if (displayName !== undefined) updateData.display_name = displayName;
    if (valueFor100Points !== undefined) updateData.value_for_100_points = valueFor100Points;
    if (valueUnit !== undefined) updateData.value_unit = valueUnit;
    if (timeDecayPerMonth !== undefined) updateData.time_decay_per_month = timeDecayPerMonth;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.is_active = isActive;

    const config = await BenefitScoringConfigSQL.update(parseInt(id), updateData);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Benefit scoring config not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: BenefitScoringConfigSQL.formatConfig(config),
    });
  } catch (error: any) {
    console.error('Error updating benefit config:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_CONFIG_ERROR',
        message: error.message || 'Failed to update benefit config',
      },
    });
  }
};

// Delete (soft delete) benefit scoring config
export const deleteBenefitConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await BenefitScoringConfigSQL.delete(parseInt(id));

    if (!success) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Benefit scoring config not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Benefit scoring config deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting benefit config:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_CONFIG_ERROR',
        message: error.message || 'Failed to delete benefit config',
      },
    });
  }
};

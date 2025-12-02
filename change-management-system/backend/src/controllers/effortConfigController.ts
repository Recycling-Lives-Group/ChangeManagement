import { Request, Response } from 'express';
import { EffortScoringConfig } from '../models/EffortScoringConfig.js';

// Get all effort scoring configs
export const getAllEffortConfigs = async (req: Request, res: Response) => {
  try {
    const configs = await EffortScoringConfig.findAll();
    const formattedConfigs = configs.map(config => EffortScoringConfig.formatConfig(config));

    res.status(200).json({
      success: true,
      data: formattedConfigs,
    });
  } catch (error: any) {
    console.error('Error fetching effort configs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CONFIGS_ERROR',
        message: error.message || 'Failed to fetch effort configs',
      },
    });
  }
};

// Get effort scoring config by ID
export const getEffortConfigById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = await EffortScoringConfig.findById(parseInt(id));

    if (!config) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Effort scoring config not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: EffortScoringConfig.formatConfig(config),
    });
  } catch (error: any) {
    console.error('Error fetching effort config:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CONFIG_ERROR',
        message: error.message || 'Failed to fetch effort config',
      },
    });
  }
};

// Get effort scoring config by type
export const getEffortConfigByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const config = await EffortScoringConfig.findByType(type);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: `Effort scoring config for type '${type}' not found`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: EffortScoringConfig.formatConfig(config),
    });
  } catch (error: any) {
    console.error('Error fetching effort config by type:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CONFIG_ERROR',
        message: error.message || 'Failed to fetch effort config',
      },
    });
  }
};

// Update effort scoring config
export const updateEffortConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { displayName, valueFor100Points, valueUnit, thresholds, timeDecayPerMonth, description, isActive } = req.body;

    const updateData: any = {};
    if (displayName !== undefined) updateData.display_name = displayName;
    if (valueFor100Points !== undefined) updateData.value_for_100_points = valueFor100Points;
    if (valueUnit !== undefined) updateData.value_unit = valueUnit;
    if (thresholds !== undefined) {
      updateData.thresholds = Array.isArray(thresholds) ? thresholds.join(',') : thresholds;
    }
    if (timeDecayPerMonth !== undefined) updateData.time_decay_per_month = timeDecayPerMonth;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.is_active = isActive;

    const config = await EffortScoringConfig.update(parseInt(id), updateData);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Effort scoring config not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: EffortScoringConfig.formatConfig(config),
    });
  } catch (error: any) {
    console.error('Error updating effort config:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_CONFIG_ERROR',
        message: error.message || 'Failed to update effort config',
      },
    });
  }
};

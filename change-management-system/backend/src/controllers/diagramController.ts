import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

export const getDiagramState = async (req: AuthRequest, res: Response) => {
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

    const db = (await import('../config/database.js')).getDatabase();

    // Get the latest diagram state
    const [rows] = await db.query(
      'SELECT nodes, edges FROM diagram_state ORDER BY updated_at DESC LIMIT 1'
    ) as any;

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {
          nodes: [],
          edges: [],
        },
      });
    }

    res.json({
      success: true,
      data: {
        nodes: rows[0].nodes,
        edges: rows[0].edges,
      },
    });
  } catch (error) {
    console.error('Get diagram state error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch diagram state',
      },
    });
  }
};

export const saveDiagramState = async (req: AuthRequest, res: Response) => {
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

    const { nodes, edges } = req.body;

    if (!nodes || !edges) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Nodes and edges are required',
        },
      });
    }

    const db = (await import('../config/database.js')).getDatabase();

    // Delete old states and insert new one
    await db.query('DELETE FROM diagram_state');
    await db.query(
      'INSERT INTO diagram_state (nodes, edges) VALUES (?, ?)',
      [JSON.stringify(nodes), JSON.stringify(edges)]
    );

    res.json({
      success: true,
      message: 'Diagram state saved successfully',
    });
  } catch (error) {
    console.error('Save diagram state error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to save diagram state',
      },
    });
  }
};

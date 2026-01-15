const pool = require('../config/database');

class CommissionController {
  // Get all commission plans
  async getAll(req, res) {
    try {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.query(`
          SELECT 
            cp.*,
            p.nome as nome_parceiro
          FROM comissao_plano cp
          LEFT JOIN parceiro p ON cp.id_parceiro = p.id
          ORDER BY cp.id
        `);
        
        res.json({
          success: true,
          data: rows
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching commission plans:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching commission plans',
        error: error.message
      });
    }
  }

  // Get commission plan by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(`
          SELECT 
            cp.*,
            p.nome as nome_parceiro
          FROM comissao_plano cp
          LEFT JOIN parceiro p ON cp.id_parceiro = p.id
          WHERE cp.id = ?
        `, [id]);

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Commission plan not found'
          });
        }

        res.json({
          success: true,
          data: rows[0]
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching commission plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching commission plan',
        error: error.message
      });
    }
  }

  // Get commission plans by partner ID
  async getByPartnerId(req, res) {
    try {
      const { partnerId } = req.params;
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(`
          SELECT 
            cp.*,
            p.nome as nome_parceiro
          FROM comissao_plano cp
          LEFT JOIN parceiro p ON cp.id_parceiro = p.id
          WHERE cp.id_parceiro = ?
          ORDER BY cp.plano
        `, [partnerId]);

        res.json({
          success: true,
          data: rows
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching commission plans by partner:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching commission plans by partner',
        error: error.message
      });
    }
  }

  // Create a new commission plan
  async create(req, res) {
    try {
      const {
        id_parceiro,
        plano,
        comissao_parceiro = 0.0,
        comissao_revendedor = 0.0
      } = req.body;

      // Validate required fields
      if (!id_parceiro || !plano) {
        return res.status(400).json({
          success: false,
          message: 'Partner ID and plan name are required'
        });
      }

      const connection = await pool.getConnection();
      try {
        // Check if partner exists
        const [partnerCheck] = await connection.execute(
          'SELECT id FROM parceiro WHERE id = ?',
          [id_parceiro]
        );

        if (partnerCheck.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Partner not found'
          });
        }

        // Check if commission plan already exists for this partner and plan
        const [existingPlan] = await connection.execute(
          'SELECT id FROM comissao_plano WHERE id_parceiro = ? AND plano = ?',
          [id_parceiro, plano]
        );

        if (existingPlan.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Commission plan already exists for this partner and plan'
          });
        }

        const [result] = await connection.execute(
          `INSERT INTO comissao_plano (
            id_parceiro, plano, comissao_parceiro, comissao_revendedor
          ) VALUES (?, ?, ?, ?)`,
          [id_parceiro, plano, comissao_parceiro, comissao_revendedor]
        );

        res.status(201).json({
          success: true,
          message: 'Commission plan created successfully',
          id: result.insertId
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error creating commission plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating commission plan',
        error: error.message
      });
    }
  }

  // Update commission plan
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove id from updateData if present
      delete updateData.id;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No data provided for update'
        });
      }

      const connection = await pool.getConnection();
      try {
        // If updating partner, check if it exists
        if (updateData.id_parceiro) {
          const [partnerCheck] = await connection.execute(
            'SELECT id FROM parceiro WHERE id = ?',
            [updateData.id_parceiro]
          );

          if (partnerCheck.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'Partner not found'
            });
          }
        }

        // Create SET clause and values array for the SQL query
        const entries = Object.entries(updateData);
        const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
        const values = entries.map(([, value]) => value);
        values.push(id); // Add id for WHERE clause

        const [result] = await connection.execute(
          `UPDATE comissao_plano SET ${setClause} WHERE id = ?`,
          values
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Commission plan not found'
          });
        }

        res.json({
          success: true,
          message: 'Commission plan updated successfully'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error updating commission plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating commission plan',
        error: error.message
      });
    }
  }

  // Delete commission plan
  async delete(req, res) {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      try {
        const [result] = await connection.execute(
          'DELETE FROM comissao_plano WHERE id = ?',
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Commission plan not found'
          });
        }

        res.json({
          success: true,
          message: 'Commission plan deleted successfully'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error deleting commission plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting commission plan',
        error: error.message
      });
    }
  }
}

module.exports = new CommissionController();

const pool = require('../config/database');
const bcrypt = require('bcrypt');

class PartnerController {
  // Get active partners (public endpoint)
  async getActivePartners(req, res) {
    try {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.query(
          'SELECT id, nome, logotipo, url FROM parceiro WHERE ativo = 1'
        );
        
        res.json({
          success: true,
          data: rows
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching active partners:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching active partners',
        error: error.message
      });
    }
  }

  // Create a new partner
  async create(req, res) {
    try {
      const {
        nome,
        cnpj,
        agencia,
        conta,
        digito,
        pix,
        email,
        senha,
        ativo = 1,
        logotipo,
        url,
        comissao_parceiro = 0,
        comissao_revendedor = 0
      } = req.body;

      const connection = await pool.getConnection();
      try {
        const hashedPassword = await bcrypt.hash(senha, 10);

        const [result] = await connection.execute(
          `INSERT INTO parceiro (
            nome, cnpj, agencia, conta, digito, pix, email, senha, ativo, logotipo, url, comissao_parceiro, comissao_revendedor
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [nome, cnpj, agencia, conta, digito, pix, email, hashedPassword, ativo, logotipo, url, comissao_parceiro, comissao_revendedor]
        );

        res.status(201).json({
          success: true,
          message: 'Partner registered successfully',
          id: result.insertId
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error creating partner:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering partner',
        error: error.message
      });
    }
  }

  // Get all partners
  async getAll(req, res) {
    try {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.query('SELECT * FROM parceiro');
        res.json({
          success: true,
          data: rows
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching partners',
        error: error.message
      });
    }
  }

  // Get partner by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM parceiro WHERE id = ?',
          [id]
        );

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Partner not found'
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
      console.error('Error fetching partner:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching partner',
        error: error.message
      });
    }
  }

  // Update partner
  async update(req, res) {
    try {
      const { id } = req.params;
      let updateData = req.body;

      if (updateData.senha) {
        const hashedPassword = await bcrypt.hash(updateData.senha, 10);
        updateData.senha = hashedPassword;
      }else{
        delete updateData.senha;
      }

      const connection = await pool.getConnection();
      try {
        // Create SET clause and values array for the SQL query
        const entries = Object.entries(updateData);
        const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
        const values = entries.map(([, value]) => value);
        values.push(id); // Add id for WHERE clause

        const [result] = await connection.execute(
          `UPDATE parceiro SET ${setClause} WHERE id = ?`,
          [...values]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Partner not found'
          });
        }

        res.json({
          success: true,
          message: 'Partner updated successfully'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error updating partner:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating partner',
        error: error.message
      });
    }
  }

  // Delete partner
  async delete(req, res) {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      try {
        const [result] = await connection.execute(
          'DELETE FROM parceiro WHERE id = ?',
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Partner not found'
          });
        }

        res.json({
          success: true,
          message: 'Partner deleted successfully'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting partner',
        error: error.message
      });
    }
  }
}

module.exports = new PartnerController(); 
const pool = require('../config/database');
const bcrypt = require('bcrypt');

class ResellersController {
  // Create a new reseller
  async create(req, res) {
    try {
          const {
      id_filial,
      nome,
      cpf,
      cargo,
      email,
      telefone,
      pix,
      unidade_funcional,
      matricula,
      senha,
      ativo
    } = req.body;

      const connection = await pool.getConnection();
      try {
        const hashedPassword = await bcrypt.hash(senha, 10);

        const [result] = await connection.execute(
          `INSERT INTO revendedor (
            id_filial, nome, cpf, cargo, email, telefone, pix, unidade_funcional, matricula, senha, ativo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id_filial, nome, cpf, cargo, email, telefone, pix, unidade_funcional, matricula, hashedPassword, ativo]
        );

        res.status(201).json({
          success: true,
          message: 'Revendedor registrado com sucesso',
          id: result.insertId
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error creating reseller:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar revendedor',
        error: error.message
      });
    }
  }

  // Get all resellers
  async getAll(req, res) {
    try {
      
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.query(`
          SELECT r.*, f.titulo as filial_titulo, p.nome as parceiro_nome 
          FROM revendedor r
          LEFT JOIN filial f ON r.id_filial = f.id
          LEFT JOIN parceiro p ON f.id_parceiro = p.id
          ${req.user.userType === 'PARCEIRO' ? `WHERE f.id_parceiro = ${req.user.userId}` : ''}
          ${req.user.userType === 'FILIAL' ? `WHERE r.id_filial = ${req.user.userId}` : ''}

        `);
        
        res.json({
          success: true,
          data: rows
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching resellers:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar revendedores',
        error: error.message
      });
    }
  }

  // Get reseller by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(`
          SELECT r.*, f.titulo as filial_titulo, p.nome as parceiro_nome 
          FROM revendedor r
          LEFT JOIN filial f ON r.id_filial = f.id
          LEFT JOIN parceiro p ON f.id_parceiro = p.id
          WHERE r.id = ?
        `, [id]);

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Revendedor não encontrado'
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
      console.error('Error fetching reseller:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar revendedor',
        error: error.message
      });
    }
  }

  // Update reseller
  async update(req, res) {
    try {
      const { id } = req.params;
      let updateData = req.body;
      delete updateData.filial_titulo;
      delete updateData.parceiro_nome;
      delete updateData.id_parceiro;
      delete updateData.data_registro;

      const connection = await pool.getConnection();
      try {
        // Handle password hashing first
        if (updateData.senha) {
          const hashedPassword = await bcrypt.hash(updateData.senha, 10);
          updateData.senha = hashedPassword;
        } else {
          delete updateData.senha;
        }

        // Create SET clause and values array for the SQL query
        const entries = Object.entries(updateData);
        const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
        const values = entries.map(([, value]) => value);
        values.push(id); // Add id for WHERE clause

        const [result] = await connection.execute(
          `UPDATE revendedor SET ${setClause} WHERE id = ?`,
          values
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Revendedor não encontrado'
          });
        }

        res.json({
          success: true,
          message: 'Revendedor atualizado com sucesso'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error updating reseller:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar revendedor',
        error: error.message
      });
    }
  }

  // Delete reseller
  async delete(req, res) {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      try {
        const [result] = await connection.execute(
          'DELETE FROM revendedor WHERE id = ?',
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Revendedor não encontrado'
          });
        }

        res.json({
          success: true,
          message: 'Revendedor removido com sucesso'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error deleting reseller:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao remover revendedor',
        error: error.message
      });
    }
  }

  // Get report data for Excel export
  async getReportData(req, res) {
    try {
      const connection = await pool.getConnection();
      try {
        let query = `
          SELECT 
            p.nome AS parceiro, 
            fl.titulo AS titulo_filial, 
            fl.apelido AS apelido_filial, 
            rv.nome, 
            rv.cpf, 
            rv.cargo, 
            rv.email, 
            rv.telefone, 
            rv.unidade_funcional, 
            rv.matricula
          FROM revendedor rv, filial fl, parceiro p
          WHERE fl.id = rv.id_filial
          AND p.id = fl.id_parceiro
        `;

        // Apply filters based on user type
        if (req.user.userType === 'PARCEIRO') {
          query += ` AND p.id = ${req.user.userId}`;
        } else if (req.user.userType === 'FILIAL') {
          query += ` AND fl.id = ${req.user.userId}`;
        }

        query += ` ORDER BY p.nome, fl.titulo, rv.nome`;

        const [rows] = await connection.query(query);
        
        res.json({
          success: true,
          data: rows
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados do relatório',
        error: error.message
      });
    }
  }
}

module.exports = new ResellersController(); 
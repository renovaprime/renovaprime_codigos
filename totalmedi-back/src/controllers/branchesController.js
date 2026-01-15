const pool = require('../config/database');
const bcrypt = require('bcrypt');

class BranchesController {
  // Create a new branch
  async create(req, res) {
    try {
      const {
        id_parceiro,
        titulo,
        apelido,
        endereco,
        email,
        senha,
        ativo = 1
      } = req.body;

      const hashedPassword = await bcrypt.hash(senha, 10);

      const connection = await pool.getConnection();
      try {
        const [result] = await connection.execute(
          `INSERT INTO filial (
            id_parceiro, titulo, apelido, endereco, email, senha, ativo
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id_parceiro, titulo, apelido, endereco, email, hashedPassword, ativo]
        );

        res.status(201).json({
          success: true,
          message: 'Filial registrada com sucesso',
          id: result.insertId
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar filial',
        error: error.message
      });
    }
  }

  // Get all branches with partner information
  async getAll(req, res) {
    try {
      const connection = await pool.getConnection();

      console.log(req.user);

      try {
        const [rows] = await connection.query(`
          SELECT f.*, p.nome as parceiro_nome 
          FROM filial f
          LEFT JOIN parceiro p ON f.id_parceiro = p.id
          ${req.user.userType === 'PARCEIRO' ? `WHERE f.id_parceiro = ${req.user.userId}` : ''}
          ORDER BY f.titulo
        `);

        // Transform the data to match the frontend structure
        const branches = rows.map(branch => ({
          ...branch,
          parceiro: {
            nome: branch.parceiro_nome
          }
        }));

        res.json({
          success: true,
          data: branches
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar filiais',
        error: error.message
      });
    }
  }

  // Get branch by ID with partner information
  async getById(req, res) {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(`
          SELECT f.*, p.nome as parceiro_nome 
          FROM filial f
          LEFT JOIN parceiro p ON f.id_parceiro = p.id
          WHERE f.id = ?
        `, [id]);

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Filial não encontrada'
          });
        }

        // Transform the data to match the frontend structure
        const branch = {
          ...rows[0],
          parceiro: {
            nome: rows[0].parceiro_nome
          }
        };

        res.json({
          success: true,
          data: branch
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching branch:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar filial',
        error: error.message
      });
    }
  }

  // Update branch
  async update(req, res) {
    try {
      const { id } = req.params;
      let updateData = req.body;
      delete updateData.parceiro_nome;
      delete updateData.parceiro;

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
          `UPDATE filial SET ${setClause} WHERE id = ?`,
          [...values]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Filial não encontrada'
          });
        }

        res.json({
          success: true,
          message: 'Filial atualizada com sucesso'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error updating branch:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar filial',
        error: error.message
      });
    }
  }

  // Delete branch
  async delete(req, res) {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      try {
        const [result] = await connection.execute(
          'DELETE FROM filial WHERE id = ?',
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Filial não encontrada'
          });
        }

        res.json({
          success: true,
          message: 'Filial removida com sucesso'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao remover filial',
        error: error.message
      });
    }
  }
}

module.exports = new BranchesController(); 
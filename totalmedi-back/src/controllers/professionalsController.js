const pool = require('../config/database');
const upload = require('../utils/fileUpload');

class ProfessionalsController {
  // Middleware for handling file uploads
  uploadFiles = upload.fields([
    { name: 'doctor_photo', maxCount: 1 },
    { name: 'crm_copy', maxCount: 1 },
    { name: 'specialization_proof', maxCount: 1 },
    { name: 'acceptance_term', maxCount: 1 }
  ]);

  // Create a new professional
  async create(req, res) {
    try {
      const {
        full_name, cpf, dob, gender,
        crm, crm_state, rqe, other_certifications, specialties,
        email, mobile_phone, business_phone,
        street, neighborhood, city, state, zip,
        bank, agency, account, account_type, pix,
        availability, service_mode, languages, avg_consultation_time
      } = req.body;

      // Get file paths from uploaded files
      const files = req.files || {};
      const foto_medico = files.doctor_photo?.[0]?.path || null;
      const copia_crm = files.crm_copy?.[0]?.path || null;
      const comprovante_especialidade = files.specialization_proof?.[0]?.path || null;
      const termo_aceite = files.acceptance_term?.[0]?.path || null;

      const connection = await pool.getConnection();
      try {
        const [result] = await connection.execute(
          `INSERT INTO medicos (
            nome_completo, cpf, data_nascimento, sexo,
            crm, crm_estado, rqe, outras_certificacoes, especialidades,
            email, telefone_celular, telefone_comercial,
            rua, bairro, cidade, estado, cep,
            banco, agencia, conta_corrente, tipo_conta, pix,
            horarios_atendimento, modalidade_atendimento, idiomas_falados, tempo_medio_consulta,
            foto_medico, copia_crm, comprovante_especialidade, termo_aceite
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            full_name, cpf, dob, gender,
            crm, crm_state, rqe, other_certifications, specialties,
            email, mobile_phone, business_phone,
            street, neighborhood, city, state, zip,
            bank, agency, account, account_type, pix,
            availability, service_mode, languages, avg_consultation_time,
            foto_medico, copia_crm, comprovante_especialidade, termo_aceite
          ]
        );

        res.status(201).json({
          success: true,
          message: 'Professional registered successfully',
          id: result.insertId
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error creating professional:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering professional',
        error: error.message
      });
    }
  }

  // Get all professionals
  async getAll(req, res) {
    try {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.query('SELECT * FROM medicos');
        res.json({
          success: true,
          data: rows
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching professionals',
        error: error.message
      });
    }
  }

  // Get professional by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM medicos WHERE id = ?',
          [id]
        );

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Professional not found'
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
      console.error('Error fetching professional:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching professional',
        error: error.message
      });
    }
  }

  // Update professional
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const files = req.files || {};

      // Add file paths to update data if new files were uploaded
      if (files.doctor_photo) updateData.foto_medico = files.doctor_photo[0].path;
      if (files.crm_copy) updateData.copia_crm = files.crm_copy[0].path;
      if (files.specialization_proof) updateData.comprovante_especialidade = files.specialization_proof[0].path;
      if (files.acceptance_term) updateData.termo_aceite = files.acceptance_term[0].path;

      const connection = await pool.getConnection();
      try {
        // Create SET clause and values array for the SQL query
        const entries = Object.entries(updateData);
        const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
        const values = entries.map(([, value]) => value);
        values.push(id); // Add id for WHERE clause

        const [result] = await connection.execute(
          `UPDATE medicos SET ${setClause} WHERE id = ?`,
          values
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Professional not found'
          });
        }

        res.json({
          success: true,
          message: 'Professional updated successfully'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error updating professional:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating professional',
        error: error.message
      });
    }
  }

  // Soft delete professional
  async delete(req, res) {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      try {
        const [result] = await connection.execute(
          'DELETE FROM medicos WHERE id = ?',
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Professional not found'
          });
        }

        res.json({
          success: true,
          message: 'Professional deleted successfully'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error deleting professional:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting professional',
        error: error.message
      });
    }
  }
}

module.exports = new ProfessionalsController();
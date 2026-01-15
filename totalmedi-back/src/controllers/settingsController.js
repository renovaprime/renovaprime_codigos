const mysql = require("../config/database"); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configuração do multer para depoimentos
const createDepoimentosDirectory = () => {
  const uploadDir = path.join(__dirname, '../../public/depoimentos');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const depoimentosStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = createDepoimentosDirectory();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const depoimentosFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG and WebP files are allowed.'), false);
  }
};

const uploadDepoimento = multer({
  storage: depoimentosStorage,
  fileFilter: depoimentosFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

class SettingsController {
  // CREATE: Add a new parameter
  async create(req, res) {
    const { parametro, valor } = req.body;

    if (!parametro || !valor) {
      return res
        .status(400)
        .json({ success: false, message: "Parametro and Valor are required" });
    }

    try {
      const query = "INSERT INTO parametros (parametro, valor) VALUES (?, ?)";
      const [result] = await mysql.execute(query, [parametro, valor]);
      res
        .status(201)
        .json({
          success: true,
          message: "Parametro created successfully",
          data: result,
        });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // READ: Get all parameters
  async getAll(req, res) {
    try {
      const query = "SELECT * FROM parametros";
      const [rows] = await mysql.execute(query);
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // READ: Get a specific parameter by ID
  async getById(req, res) {
    const { id } = req.params;

    try {
      const query = "SELECT * FROM parametros WHERE id = ?";
      const [rows] = await mysql.execute(query, [id]);

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Parametro not found" });
      }

      res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // UPDATE: Update a parameter
  async update(req, res) {
    const { id } = req.params;
    const { valor } = req.body;

    if (!valor) {
      return res
        .status(400)
        .json({ success: false, message: "Valor is required" });
    }

    try {
      const query =
        "UPDATE parametros SET valor = ? WHERE id = ?";
      const [result] = await mysql.execute(query, [valor, id]);

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Parametro not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Parametro updated successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // DELETE: Delete a parameter by ID
  async delete(req, res) {
    const { id } = req.params;

    try {
      const query = "DELETE FROM parametros WHERE id = ?";
      const [result] = await mysql.execute(query, [id]);

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Parametro not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Parametro deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // ========== DEPOIMENTOS CRUD ==========

  // CREATE: Add a new depoimento
  async createDepoimento(req, res) {
    try {
      // Middleware para upload do arquivo
      uploadDepoimento.single('arquivo')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ 
            success: false, 
            message: err.message 
          });
        }

        const arquivo = req.file;

        if (!arquivo) {
          return res.status(400).json({ 
            success: false, 
            message: "Arquivo is required" 
          });
        }

        try {
          const arquivoPath = `depoimentos/${path.basename(arquivo.path)}`;
          
          const query = "INSERT INTO depoimentos (arquivo_path) VALUES (?)";
          const [result] = await mysql.execute(query, [arquivoPath]);
          
          res.status(201).json({
            success: true,
            message: "Depoimento created successfully",
            data: {
              id: result.insertId,
              arquivo_path: arquivoPath
            }
          });
        } catch (error) {
          // Remover arquivo em caso de erro
          if (arquivo && fs.existsSync(arquivo.path)) {
            fs.unlinkSync(arquivo.path);
          }
          console.error(error);
          res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
          });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  }

  // READ: Get all depoimentos
  async getAllDepoimentos(req, res) {
    try {
      const query = "SELECT * FROM depoimentos ORDER BY id ASC";
      const [rows] = await mysql.execute(query);
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  }

  // READ: Get a specific depoimento by ID
  async getDepoimentoById(req, res) {
    const { id } = req.params;

    try {
      const query = "SELECT * FROM depoimentos WHERE id = ?";
      const [rows] = await mysql.execute(query, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Depoimento not found" 
        });
      }

      res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  }

  // UPDATE: Update a depoimento
  async updateDepoimento(req, res) {
    const { id } = req.params;

    try {
      // Middleware para upload do arquivo (opcional)
      uploadDepoimento.single('arquivo')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ 
            success: false, 
            message: err.message 
          });
        }

        try {
          // Verificar se o depoimento existe
          const checkQuery = "SELECT arquivo_path FROM depoimentos WHERE id = ?";
          const [existing] = await mysql.execute(checkQuery, [id]);
          
          if (existing.length === 0) {
            return res.status(404).json({ 
              success: false, 
              message: "Depoimento not found" 
            });
          }

          if (req.file) {
            // Remover arquivo antigo
            const oldFilePath = path.join(__dirname, '../../public', existing[0].arquivo_path);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }

            const newArquivoPath = `depoimentos/${path.basename(req.file.path)}`;
            
            const updateQuery = "UPDATE depoimentos SET arquivo_path = ? WHERE id = ?";
            const updateParams = [newArquivoPath, id];

            const [result] = await mysql.execute(updateQuery, updateParams);

            res.status(200).json({ 
              success: true, 
              message: "Depoimento updated successfully" 
            });
          } else {
            return res.status(400).json({ 
              success: false, 
              message: "No file provided for update" 
            });
          }
        } catch (error) {
          // Remover arquivo em caso de erro
          if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          console.error(error);
          res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
          });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  }

  // DELETE: Delete a depoimento by ID
  async deleteDepoimento(req, res) {
    const { id } = req.params;

    try {
      // Primeiro, buscar o arquivo para removê-lo
      const selectQuery = "SELECT arquivo_path FROM depoimentos WHERE id = ?";
      const [rows] = await mysql.execute(selectQuery, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Depoimento not found" 
        });
      }

      // Remover arquivo físico
      const arquivoPath = path.join(__dirname, '../../public', rows[0].arquivo_path);
      if (fs.existsSync(arquivoPath)) {
        fs.unlinkSync(arquivoPath);
      }

      // Remover registro do banco
      const deleteQuery = "DELETE FROM depoimentos WHERE id = ?";
      const [result] = await mysql.execute(deleteQuery, [id]);

      res.status(200).json({ 
        success: true, 
        message: "Depoimento deleted successfully" 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  }

  // Reorder depoimentos
  async reorderDepoimentos(req, res) {
    const { depoimentos } = req.body; // Array de objetos {id, newOrder}

    if (!depoimentos || !Array.isArray(depoimentos)) {
      return res.status(400).json({ 
        success: false, 
        message: "Depoimentos array is required" 
      });
    }

    try {
      // Iniciar transação
      await mysql.execute('START TRANSACTION');

      for (const depoimento of depoimentos) {
        const { id, newOrder } = depoimento;
        
        if (!id || newOrder === undefined) {
          await mysql.execute('ROLLBACK');
          return res.status(400).json({ 
            success: false, 
            message: "Each depoimento must have id and newOrder" 
          });
        }

        // Since we don't have an order field, we'll use a temporary approach
        // This could be enhanced with a separate order table or by using the id field
        // For now, we'll just acknowledge the reorder request
        console.log(`Depoimento ${id} would be moved to position ${newOrder}`);
      }

      await mysql.execute('COMMIT');
      
      res.status(200).json({ 
        success: true, 
        message: "Depoimentos reorder request acknowledged" 
      });
    } catch (error) {
      await mysql.execute('ROLLBACK');
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  }
}

module.exports = new SettingsController();

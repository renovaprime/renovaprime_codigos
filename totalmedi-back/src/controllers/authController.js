const pool = require("../config/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class AuthController {
  // Login admin user
  async login(req, res) {
    try {
      const { login, senha, userType } = req.body;

      const connection = await pool.getConnection();
      try {
        // Get user from database
        const [users] = await connection.execute(
          "SELECT * FROM usuarios WHERE email = ?",
          [login]
        );

        let parceiros = [];

        if (userType === "PARCEIRO") {
          [parceiros] = await connection.execute(
            "SELECT * FROM parceiro WHERE email = ?",
            [login]
          );
        }

        let filiais = [];

        if (userType === "FILIAL") {
          [filiais] = await connection.execute(
            "SELECT * FROM filial WHERE email = ?",
            [login]
          );
        }

        let revendedores = [];

        if (userType === "REVENDEDOR") {
          [revendedores] = await connection.execute(
            "SELECT * FROM revendedor WHERE cpf = ?",
            [login]
          );
        }
        
        let user = users[0];
        const parceiro = parceiros[0];
        const filial = filiais[0];
        const revendedor = revendedores[0];

        // Check if user exists
        if (!user && !parceiro && !filial && !revendedor) {
          return res.status(401).json({
            success: false,
            message: "Email ou senha inválidos",
          });
        }
        
        if ((userType === "ADMINISTRADOR" && !user) || (userType === "PARCEIRO" && !parceiro) || (userType === "FILIAL" && !filial) || (userType === "REVENDEDOR" && !revendedor)) {
          return res.status(401).json({
            success: false,
            message: "Email ou senha inválidos",
          });
        }

        let isValidPassword = false;
        let password = "";
        let parceiroLogo = null;

        if (userType === "ADMINISTRADOR") {
          if (user.senha_hash) {
            isValidPassword = await bcrypt.compare(senha, user.senha_hash);
          }
          
          if (!isValidPassword && user.senha) {
            isValidPassword = senha === user.senha;
          }
        } else if (userType === "PARCEIRO") {
          user = parceiro;
          password = user.senha;
          parceiroLogo = user.logotipo;
          isValidPassword = await bcrypt.compare(senha, password);
        } else if (userType === "FILIAL") {
          user = filial;
          password = user.senha;
          const [logotipo] = await connection.execute(
            "SELECT logotipo FROM parceiro WHERE id = (select id_parceiro from filial where id = ?)",
            [filial.id]
          );
          parceiroLogo = logotipo[0].logotipo;
          isValidPassword = await bcrypt.compare(senha, password);
        } else if (userType === "REVENDEDOR") {
          user = revendedor;
          password = user.senha;
          const [logotipo] = await connection.execute(
            "SELECT logotipo FROM parceiro WHERE id = (SELECT id_parceiro FROM filial WHERE id = (select id_filial from revendedor where id = ?))",
            [revendedor.id]
          );
          parceiroLogo = logotipo[0].logotipo;
          isValidPassword = await bcrypt.compare(senha, password);
          
          if (!isValidPassword) {
            isValidPassword = user.cpf.substring(0,4) === senha;
          }
        }

        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: "Email ou senha inválidos",
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            userType: userType,
          },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "24h" }
        );

        // Return success response with token
        res.json({
          success: true,
          message: "Login realizado com sucesso",
          token,
          user: {
            id: user.id,
            email: user.email,
            nome: user.nome || user.apelido || user.titulo,
            userType: userType,
            parceiroLogo: parceiroLogo || null,
          },
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  // Verify if user is authenticated
  async verifyAuth(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token não fornecido",
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );

      const connection = await pool.getConnection();
      try {
        let user = null;
        let parceiroLogo = null;
        const userType = decoded.userType;
        const userId = decoded.userId;

        if (userType === "ADMINISTRADOR") {
          const [users] = await connection.execute(
            "SELECT id, email, nome FROM usuarios WHERE id = ?",
            [userId]
          );
          if (!users.length) {
            return res.status(401).json({
              success: false,
              message: "Usuário não encontrado",
            });
          }
          user = users[0];
        } else if (userType === "PARCEIRO") {
          const [parceiros] = await connection.execute(
            "SELECT id, email, nome, logotipo FROM parceiro WHERE id = ?",
            [userId]
          );
          if (!parceiros.length) {
            return res.status(401).json({
              success: false,
              message: "Parceiro não encontrado",
            });
          }
          user = parceiros[0];
          parceiroLogo = parceiros[0].logotipo;
        } else if (userType === "FILIAL") {
          const [filiais] = await connection.execute(
            "SELECT * FROM filial WHERE id = ?",
            [userId]
          );
          if (!filiais.length) {
            return res.status(401).json({
              success: false,
              message: "Filial não encontrada",
            });
          }
          user = filiais[0];
          // Get parceiro logo
          const [parceiros] = await connection.execute(
            "SELECT logotipo FROM parceiro WHERE id = ?",
            [user.id_parceiro]
          );
          if (parceiros.length) {
            parceiroLogo = parceiros[0].logotipo;
          }
        } else if (userType === "REVENDEDOR") {
          const [revendedores] = await connection.execute(
            "SELECT * FROM revendedor WHERE id = ?",
            [userId]
          );
          if (!revendedores.length) {
            return res.status(401).json({
              success: false,
              message: "Revendedor não encontrado",
            });
          }
          user = revendedores[0];
          // Get filial
          const [filiais] = await connection.execute(
            "SELECT * FROM filial WHERE id = ?",
            [user.id_filial]
          );
          if (filiais.length) {
            const filial = filiais[0];
            // Get parceiro logo
            const [parceiros] = await connection.execute(
              "SELECT logotipo FROM parceiro WHERE id = ?",
              [filial.id_parceiro]
            );
            if (parceiros.length) {
              parceiroLogo = parceiros[0].logotipo;
            }
          }
        }

        if (!user) {
          return res.status(401).json({
            success: false,
            message: "Usuário não encontrado",
          });
        }

        res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            nome: user.nome || user.apelido || user.titulo,
            userType: userType,
            parceiroLogo: parceiroLogo || null,
          },
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        return res.status(401).json({
          success: false,
          message: "Token inválido ou expirado",
        });
      }

      console.error("Error in verifyAuth:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId; // From auth middleware

      const connection = await pool.getConnection();
      try {
        const [users] = await connection.execute(
          "SELECT * FROM usuarios WHERE id = ?",
          [userId]
        );

        const user = users[0];
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "Usuário não encontrado",
          });
        }

        // Verify current password
        let isValidPassword = false;
        if (user.senha_hash) {
          isValidPassword = await bcrypt.compare(
            currentPassword,
            user.senha_hash
          );
        } else {
          isValidPassword = currentPassword === user.senha;
        }

        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: "Senha atual incorreta",
          });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await connection.execute(
          "UPDATE usuarios SET senha_hash = ?, senha = NULL WHERE id = ?",
          [hashedPassword, userId]
        );

        res.json({
          success: true,
          message: "Senha alterada com sucesso",
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error in changePassword:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

}

module.exports = new AuthController();

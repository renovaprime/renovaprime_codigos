const { User, Role, PasswordResetToken } = require('../models');
const { comparePassword, hashPassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const { Op } = require('sequelize');

class AuthService {
  async login(email, password) {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role }]
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    if (user.status === 'BLOCKED') {
      throw new Error('User is blocked');
    }

    const token = generateToken({ userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role.name,
        status: user.status
      }
    };
  }

  /**
   * Gera um codigo de 6 digitos para recuperacao de senha
   */
  generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Solicita recuperacao de senha - gera codigo e envia email
   */
  async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Por seguranca, nao revelamos se o email existe ou nao
      return { message: 'Se o email existir, voce recebera um codigo de recuperacao.' };
    }

    // Invalida tokens anteriores nao usados
    await PasswordResetToken.update(
      { used: true },
      { where: { user_id: user.id, used: false } }
    );

    // Gera novo codigo
    const code = this.generateResetCode();

    // Token expira em 15 minutos
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordResetToken.create({
      user_id: user.id,
      token: code,
      expires_at: expiresAt
    });

    // TODO: Implementar envio de email
    // Quando implementar, descomente o codigo abaixo e configure o servico de email
    /*
    const emailService = require('./emailService');
    await emailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      code: code,
      expiresInMinutes: 15
    });
    */

    // Log para desenvolvimento - remover em producao
    console.log(`[DEV] Codigo de recuperacao para ${email}: ${code}`);

    return { message: 'Se o email existir, voce recebera um codigo de recuperacao.' };
  }

  /**
   * Valida o codigo e altera a senha
   */
  async resetPassword(email, code, newPassword) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Codigo invalido ou expirado');
    }

    // Busca token valido
    const resetToken = await PasswordResetToken.findOne({
      where: {
        user_id: user.id,
        token: code,
        used: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!resetToken) {
      throw new Error('Codigo invalido ou expirado');
    }

    // Atualiza a senha
    const newPasswordHash = await hashPassword(newPassword);
    await user.update({ password_hash: newPasswordHash });

    // Marca token como usado
    await resetToken.update({ used: true });

    // Invalida todos os outros tokens do usuario
    await PasswordResetToken.update(
      { used: true },
      { where: { user_id: user.id, used: false } }
    );

    return { message: 'Senha alterada com sucesso' };
  }
}

module.exports = new AuthService();

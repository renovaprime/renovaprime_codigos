const { User, Role } = require('../models');
const { comparePassword, hashPassword } = require('../utils/hash');

class MeService {
  async getMe(userId) {
    const user = await User.findByPk(userId, {
      include: [{ model: Role }],
      attributes: ['id', 'name', 'email', 'phone', 'status', 'created_at']
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.Role.name,
      status: user.status,
      created_at: user.created_at
    };
  }

  async updateMe(userId, payload) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Whitelist: só permite atualizar name, email, phone
    const allowedFields = ['name', 'email', 'phone'];
    const updateData = {};

    for (const field of allowedFields) {
      if (payload[field] !== undefined) {
        updateData[field] = payload[field];
      }
    }

    // Verificar se email já existe (se estiver sendo alterado)
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: updateData.email }
      });

      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    // Atualizar updated_at
    updateData.updated_at = new Date();

    await user.update(updateData);

    // Retornar usuário atualizado
    return this.getMe(userId);
  }

  async updatePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verificar senha atual
    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash da nova senha
    const newPasswordHash = await hashPassword(newPassword);

    // Atualizar senha
    await user.update({
      password_hash: newPasswordHash,
      updated_at: new Date()
    });

    return { message: 'Password updated successfully' };
  }
}

module.exports = new MeService();

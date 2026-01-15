const { User, Role } = require('../models');
const { comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

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
}

module.exports = new AuthService();

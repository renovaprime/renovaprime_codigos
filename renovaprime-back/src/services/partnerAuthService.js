const { Partner, PartnerBranch, Reseller } = require('../models');
const { comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

class PartnerAuthService {
  async login(email, password) {
    // Search in order: Partner → PartnerBranch → Reseller
    const partner = await Partner.findOne({ where: { email } });
    if (partner) {
      return this._authenticate(partner, password, 'partner', {
        entityId: partner.id,
        partnerId: partner.id,
        branchId: null,
        partnerName: partner.name
      });
    }

    const branch = await PartnerBranch.findOne({
      where: { email },
      include: [{ model: Partner, attributes: ['id', 'name'] }]
    });
    if (branch) {
      return this._authenticate(branch, password, 'branch', {
        entityId: branch.id,
        partnerId: branch.partner_id,
        branchId: branch.id,
        partnerName: branch.Partner?.name || ''
      });
    }

    const reseller = await Reseller.findOne({
      where: { email },
      include: [{
        model: PartnerBranch,
        attributes: ['id', 'name', 'partner_id'],
        include: [{ model: Partner, attributes: ['id', 'name'] }]
      }]
    });
    if (reseller) {
      return this._authenticate(reseller, password, 'reseller', {
        entityId: reseller.id,
        partnerId: reseller.PartnerBranch?.partner_id || null,
        branchId: reseller.branch_id,
        partnerName: reseller.PartnerBranch?.Partner?.name || ''
      });
    }

    throw new Error('Credenciais inválidas');
  }

  async _authenticate(entity, password, entityType, meta) {
    const isPasswordValid = await comparePassword(password, entity.password_hash);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    if (!entity.active) {
      throw new Error('Conta desativada');
    }

    const token = generateToken({
      entityType,
      entityId: meta.entityId,
      partnerId: meta.partnerId,
      branchId: meta.branchId
    });

    return {
      token,
      entity: {
        id: meta.entityId,
        type: entityType,
        name: entity.name,
        email: entity.email,
        partnerId: meta.partnerId,
        branchId: meta.branchId,
        partnerName: meta.partnerName
      }
    };
  }
}

module.exports = new PartnerAuthService();

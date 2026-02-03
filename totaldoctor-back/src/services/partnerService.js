const { Partner, PartnerBranch, Reseller } = require('../models');
const { hashPassword } = require('../utils/hash');
const { Op } = require('sequelize');

class PartnerService {
  // ==================== Partners ====================

  async listPartners(filters = {}) {
    const where = {};

    if (filters.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters.status === 'active') {
      where.active = true;
    } else if (filters.status === 'inactive') {
      where.active = false;
    }

    const partners = await Partner.findAll({
      where,
      include: [{ model: PartnerBranch, as: 'branches', attributes: ['id', 'name', 'active'] }],
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash'] }
    });

    return partners;
  }

  async getPartnerById(id) {
    const partner = await Partner.findByPk(id, {
      include: [{ model: PartnerBranch, as: 'branches', attributes: { exclude: ['password_hash'] } }],
      attributes: { exclude: ['password_hash'] }
    });

    if (!partner) {
      throw new Error('Partner not found');
    }

    return partner;
  }

  async createPartner(data) {
    const hashedPassword = await hashPassword(data.password);

    const partner = await Partner.create({
      name: data.name,
      cnpj: data.cnpj || null,
      email: data.email,
      password_hash: hashedPassword,
      bank_agency: data.bank_agency || null,
      bank_account: data.bank_account || null,
      bank_digit: data.bank_digit || null,
      pix_key: data.pix_key || null,
      logo_url: data.logo_url || null,
      website_url: data.website_url || null,
      active: data.active !== false
    });

    const result = partner.toJSON();
    delete result.password_hash;
    return result;
  }

  async updatePartner(id, data) {
    const partner = await Partner.findByPk(id);

    if (!partner) {
      throw new Error('Partner not found');
    }

    const updateData = { ...data };
    delete updateData.password;

    if (data.password) {
      updateData.password_hash = await hashPassword(data.password);
    }

    await partner.update(updateData);

    const result = partner.toJSON();
    delete result.password_hash;
    return result;
  }

  async togglePartner(id) {
    const partner = await Partner.findByPk(id);

    if (!partner) {
      throw new Error('Partner not found');
    }

    await partner.update({ active: !partner.active });

    const result = partner.toJSON();
    delete result.password_hash;
    return result;
  }

  async deletePartner(id) {
    const partner = await Partner.findByPk(id);

    if (!partner) {
      throw new Error('Partner not found');
    }

    await partner.destroy();
  }

  // ==================== Branches ====================

  async listBranches(filters = {}) {
    const where = {};

    if (filters.partner_id) {
      where.partner_id = filters.partner_id;
    }
    if (filters.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters.status === 'active') {
      where.active = true;
    } else if (filters.status === 'inactive') {
      where.active = false;
    }

    const branches = await PartnerBranch.findAll({
      where,
      include: [
        { model: Partner, attributes: ['id', 'name'] },
        { model: Reseller, as: 'resellers', attributes: ['id', 'name', 'active'] }
      ],
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash'] }
    });

    return branches;
  }

  async getBranchById(id) {
    const branch = await PartnerBranch.findByPk(id, {
      include: [
        { model: Partner, attributes: ['id', 'name'] },
        { model: Reseller, as: 'resellers', attributes: { exclude: ['password_hash'] } }
      ],
      attributes: { exclude: ['password_hash'] }
    });

    if (!branch) {
      throw new Error('Branch not found');
    }

    return branch;
  }

  async createBranch(data) {
    const partner = await Partner.findByPk(data.partner_id);
    if (!partner) {
      throw new Error('Partner not found');
    }

    const hashedPassword = await hashPassword(data.password);

    const branch = await PartnerBranch.create({
      partner_id: data.partner_id,
      name: data.name,
      alias: data.alias || null,
      address: data.address || null,
      email: data.email,
      password_hash: hashedPassword,
      active: data.active !== false
    });

    const result = branch.toJSON();
    delete result.password_hash;
    return result;
  }

  async updateBranch(id, data) {
    const branch = await PartnerBranch.findByPk(id);

    if (!branch) {
      throw new Error('Branch not found');
    }

    if (data.partner_id) {
      const partner = await Partner.findByPk(data.partner_id);
      if (!partner) {
        throw new Error('Partner not found');
      }
    }

    const updateData = { ...data };
    delete updateData.password;

    if (data.password) {
      updateData.password_hash = await hashPassword(data.password);
    }

    await branch.update(updateData);

    const result = branch.toJSON();
    delete result.password_hash;
    return result;
  }

  async toggleBranch(id) {
    const branch = await PartnerBranch.findByPk(id);

    if (!branch) {
      throw new Error('Branch not found');
    }

    await branch.update({ active: !branch.active });

    const result = branch.toJSON();
    delete result.password_hash;
    return result;
  }

  async deleteBranch(id) {
    const branch = await PartnerBranch.findByPk(id);

    if (!branch) {
      throw new Error('Branch not found');
    }

    await branch.destroy();
  }

  // ==================== Resellers ====================

  async listResellers(filters = {}) {
    const where = {};

    if (filters.branch_id) {
      where.branch_id = filters.branch_id;
    }
    if (filters.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters.cpf) {
      where.cpf = { [Op.like]: `%${filters.cpf}%` };
    }
    if (filters.status === 'active') {
      where.active = true;
    } else if (filters.status === 'inactive') {
      where.active = false;
    }

    const resellers = await Reseller.findAll({
      where,
      include: [
        {
          model: PartnerBranch,
          attributes: ['id', 'name', 'partner_id'],
          include: [{ model: Partner, attributes: ['id', 'name'] }]
        }
      ],
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash'] }
    });

    return resellers;
  }

  async getResellerById(id) {
    const reseller = await Reseller.findByPk(id, {
      include: [
        {
          model: PartnerBranch,
          attributes: { exclude: ['password_hash'] },
          include: [{ model: Partner, attributes: ['id', 'name'] }]
        }
      ],
      attributes: { exclude: ['password_hash'] }
    });

    if (!reseller) {
      throw new Error('Reseller not found');
    }

    return reseller;
  }

  async createReseller(data) {
    const branch = await PartnerBranch.findByPk(data.branch_id);
    if (!branch) {
      throw new Error('Branch not found');
    }

    const hashedPassword = await hashPassword(data.password);

    const reseller = await Reseller.create({
      branch_id: data.branch_id,
      name: data.name,
      cpf: data.cpf,
      email: data.email || null,
      phone: data.phone || null,
      password_hash: hashedPassword,
      role: data.role || null,
      pix_key: data.pix_key || null,
      functional_unit: data.functional_unit || null,
      registration_code: data.registration_code || null,
      active: data.active !== false
    });

    const result = reseller.toJSON();
    delete result.password_hash;
    return result;
  }

  async updateReseller(id, data) {
    const reseller = await Reseller.findByPk(id);

    if (!reseller) {
      throw new Error('Reseller not found');
    }

    if (data.branch_id) {
      const branch = await PartnerBranch.findByPk(data.branch_id);
      if (!branch) {
        throw new Error('Branch not found');
      }
    }

    const updateData = { ...data };
    delete updateData.password;

    if (data.password) {
      updateData.password_hash = await hashPassword(data.password);
    }

    await reseller.update(updateData);

    const result = reseller.toJSON();
    delete result.password_hash;
    return result;
  }

  async toggleReseller(id) {
    const reseller = await Reseller.findByPk(id);

    if (!reseller) {
      throw new Error('Reseller not found');
    }

    await reseller.update({ active: !reseller.active });

    const result = reseller.toJSON();
    delete result.password_hash;
    return result;
  }

  async deleteReseller(id) {
    const reseller = await Reseller.findByPk(id);

    if (!reseller) {
      throw new Error('Reseller not found');
    }

    await reseller.destroy();
  }
}

module.exports = new PartnerService();

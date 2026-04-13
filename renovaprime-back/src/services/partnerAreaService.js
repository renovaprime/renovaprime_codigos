const { ResellerSale, Reseller, PartnerBranch, Partner, Beneficiary } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/hash');

class PartnerAreaService {
  _applyScopeFilter(partnerAuth) {
    const where = {};
    switch (partnerAuth.entityType) {
      case 'partner':
        where.partner_id = partnerAuth.partnerId;
        break;
      case 'branch':
        where.branch_id = partnerAuth.entityId;
        break;
      case 'reseller':
        where.reseller_id = partnerAuth.entityId;
        break;
    }
    return where;
  }

  _applyDateFilters(where, filters) {
    if (filters.start_date && filters.end_date) {
      where.created_at = {
        [Op.between]: [new Date(filters.start_date), new Date(filters.end_date + ' 23:59:59')]
      };
    } else if (filters.start_date) {
      where.created_at = { [Op.gte]: new Date(filters.start_date) };
    } else if (filters.end_date) {
      where.created_at = { [Op.lte]: new Date(filters.end_date + ' 23:59:59') };
    }
  }

  async getDashboardSummary(partnerAuth) {
    const where = this._applyScopeFilter(partnerAuth);

    const [summary] = await ResellerSale.findAll({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalSales'],
        [sequelize.fn('SUM', sequelize.col('value')), 'totalValue'],
        [sequelize.fn('SUM', sequelize.col('commission_partner')), 'totalCommissionPartner'],
        [sequelize.fn('SUM', sequelize.col('commission_branch')), 'totalCommissionBranch'],
        [sequelize.fn('SUM', sequelize.col('commission_reseller')), 'totalCommissionReseller'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'CONFIRMED' THEN 1 END")), 'confirmedCount'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'PENDING' THEN 1 END")), 'pendingCount']
      ],
      raw: true
    });

    let totalCommission = 0;
    switch (partnerAuth.entityType) {
      case 'partner':
        totalCommission = Number(summary.totalCommissionPartner) || 0;
        break;
      case 'branch':
        totalCommission = Number(summary.totalCommissionBranch) || 0;
        break;
      case 'reseller':
        totalCommission = Number(summary.totalCommissionReseller) || 0;
        break;
    }

    const result = {
      totalSales: Number(summary.totalSales) || 0,
      totalValue: Number(summary.totalValue) || 0,
      confirmedCount: Number(summary.confirmedCount) || 0,
      pendingCount: Number(summary.pendingCount) || 0,
      totalCommission
    };

    if (partnerAuth.entityType === 'partner') {
      const branchCount = await PartnerBranch.count({ where: { partner_id: partnerAuth.partnerId, active: true } });
      const resellerCount = await Reseller.count({
        include: [{ model: PartnerBranch, where: { partner_id: partnerAuth.partnerId }, attributes: [] }]
      });
      result.branchCount = branchCount;
      result.resellerCount = resellerCount;
    } else if (partnerAuth.entityType === 'branch') {
      const resellerCount = await Reseller.count({ where: { branch_id: partnerAuth.entityId, active: true } });
      result.resellerCount = resellerCount;
    }

    return result;
  }

  async getSales(partnerAuth, filters = {}) {
    const where = this._applyScopeFilter(partnerAuth);

    // Allow sub-filtering within scope
    if (filters.branch_id && partnerAuth.entityType === 'partner') {
      where.branch_id = filters.branch_id;
    }
    if (filters.reseller_id && ['partner', 'branch'].includes(partnerAuth.entityType)) {
      where.reseller_id = filters.reseller_id;
    }
    if (filters.plan_type) where.plan_type = filters.plan_type;
    if (filters.status) where.status = filters.status;

    this._applyDateFilters(where, filters);

    const sales = await ResellerSale.findAll({
      where,
      include: [
        { model: Reseller, attributes: ['id', 'name', 'cpf'] },
        {
          model: PartnerBranch,
          attributes: ['id', 'name'],
          include: [{ model: Partner, attributes: ['id', 'name'] }]
        },
        { model: Partner, attributes: ['id', 'name'] },
        { model: Beneficiary, attributes: ['id', 'name', 'cpf'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return sales;
  }

  async getSalesSummary(partnerAuth, filters = {}) {
    const where = this._applyScopeFilter(partnerAuth);

    if (filters.branch_id && partnerAuth.entityType === 'partner') {
      where.branch_id = filters.branch_id;
    }
    if (filters.reseller_id && ['partner', 'branch'].includes(partnerAuth.entityType)) {
      where.reseller_id = filters.reseller_id;
    }

    this._applyDateFilters(where, filters);

    const [summary] = await ResellerSale.findAll({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalSales'],
        [sequelize.fn('SUM', sequelize.col('value')), 'totalValue'],
        [sequelize.fn('SUM', sequelize.col('commission_reseller')), 'totalCommissionReseller'],
        [sequelize.fn('SUM', sequelize.col('commission_branch')), 'totalCommissionBranch'],
        [sequelize.fn('SUM', sequelize.col('commission_partner')), 'totalCommissionPartner'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'CONFIRMED' THEN 1 END")), 'confirmedCount'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'PENDING' THEN 1 END")), 'pendingCount']
      ],
      raw: true
    });

    return {
      totalSales: Number(summary.totalSales) || 0,
      totalValue: Number(summary.totalValue) || 0,
      totalCommissionReseller: Number(summary.totalCommissionReseller) || 0,
      totalCommissionBranch: Number(summary.totalCommissionBranch) || 0,
      totalCommissionPartner: Number(summary.totalCommissionPartner) || 0,
      confirmedCount: Number(summary.confirmedCount) || 0,
      pendingCount: Number(summary.pendingCount) || 0
    };
  }

  async getCommissions(partnerAuth, filters = {}) {
    const where = this._applyScopeFilter(partnerAuth);

    if (filters.branch_id && partnerAuth.entityType === 'partner') {
      where.branch_id = filters.branch_id;
    }

    this._applyDateFilters(where, filters);

    // Only count confirmed sales for commissions
    if (!filters.status) {
      where.status = 'CONFIRMED';
    }

    const commissions = await ResellerSale.findAll({
      where,
      attributes: [
        'reseller_id',
        'branch_id',
        'partner_id',
        [sequelize.fn('COUNT', sequelize.col('ResellerSale.id')), 'totalSales'],
        [sequelize.fn('SUM', sequelize.col('value')), 'totalValue'],
        [sequelize.fn('SUM', sequelize.col('commission_reseller')), 'commissionReseller'],
        [sequelize.fn('SUM', sequelize.col('commission_branch')), 'commissionBranch'],
        [sequelize.fn('SUM', sequelize.col('commission_partner')), 'commissionPartner']
      ],
      include: [
        { model: Reseller, attributes: ['id', 'name'] },
        {
          model: PartnerBranch,
          attributes: ['id', 'name'],
          include: [{ model: Partner, attributes: ['id', 'name'] }]
        }
      ],
      group: ['reseller_id', 'branch_id', 'partner_id', 'Reseller.id', 'PartnerBranch.id', 'PartnerBranch->Partner.id'],
      raw: false
    });

    return commissions;
  }

  async getProfile(partnerAuth) {
    switch (partnerAuth.entityType) {
      case 'partner': {
        const partner = await Partner.findByPk(partnerAuth.entityId, {
          attributes: { exclude: ['password_hash'] }
        });
        return { ...partner.toJSON(), type: 'partner' };
      }
      case 'branch': {
        const branch = await PartnerBranch.findByPk(partnerAuth.entityId, {
          attributes: { exclude: ['password_hash'] },
          include: [{ model: Partner, attributes: ['id', 'name'] }]
        });
        return { ...branch.toJSON(), type: 'branch' };
      }
      case 'reseller': {
        const reseller = await Reseller.findByPk(partnerAuth.entityId, {
          attributes: { exclude: ['password_hash'] },
          include: [{
            model: PartnerBranch,
            attributes: ['id', 'name'],
            include: [{ model: Partner, attributes: ['id', 'name'] }]
          }]
        });
        return { ...reseller.toJSON(), type: 'reseller' };
      }
    }
  }

  async getBranches(partnerAuth) {
    const branches = await PartnerBranch.findAll({
      where: { partner_id: partnerAuth.partnerId },
      attributes: { exclude: ['password_hash'] },
      include: [{
        model: Reseller,
        as: 'resellers',
        attributes: ['id']
      }],
      order: [['name', 'ASC']]
    });

    return branches.map(b => ({
      ...b.toJSON(),
      resellerCount: b.resellers?.length || 0,
      resellers: undefined
    }));
  }

  async getResellers(partnerAuth) {
    const where = {};

    if (partnerAuth.entityType === 'branch') {
      where.branch_id = partnerAuth.entityId;
    }

    const include = [{
      model: PartnerBranch,
      attributes: ['id', 'name', 'partner_id'],
      ...(partnerAuth.entityType === 'partner' ? { where: { partner_id: partnerAuth.partnerId } } : {})
    }];

    const resellers = await Reseller.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      include,
      order: [['name', 'ASC']]
    });

    return resellers;
  }

  async updateProfile(partnerAuth, data) {
    let entity;
    switch (partnerAuth.entityType) {
      case 'partner':
        entity = await Partner.findByPk(partnerAuth.entityId);
        break;
      case 'branch':
        entity = await PartnerBranch.findByPk(partnerAuth.entityId);
        break;
      case 'reseller':
        entity = await Reseller.findByPk(partnerAuth.entityId);
        break;
      default:
        throw new Error('Tipo de entidade inválido');
    }

    if (!entity) throw new Error('Entidade não encontrada');

    await entity.update(data);

    return this.getProfile(partnerAuth);
  }

  async changePassword(partnerAuth, currentPassword, newPassword) {
    let entity;
    switch (partnerAuth.entityType) {
      case 'partner':
        entity = await Partner.findByPk(partnerAuth.entityId);
        break;
      case 'branch':
        entity = await PartnerBranch.findByPk(partnerAuth.entityId);
        break;
      case 'reseller':
        entity = await Reseller.findByPk(partnerAuth.entityId);
        break;
      default:
        throw new Error('Tipo de entidade inválido');
    }

    if (!entity) throw new Error('Entidade não encontrada');

    const isValid = await comparePassword(currentPassword, entity.password_hash);
    if (!isValid) throw new Error('Senha atual incorreta');

    const newHash = await hashPassword(newPassword);
    await entity.update({ password_hash: newHash });
  }
}

module.exports = new PartnerAreaService();

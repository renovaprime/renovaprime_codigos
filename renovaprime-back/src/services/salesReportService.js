const { ResellerSale, Reseller, PartnerBranch, Partner, Beneficiary } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class SalesReportService {
  async getSales(filters = {}) {
    const where = {};

    if (filters.reseller_id) {
      where.reseller_id = filters.reseller_id;
    }
    if (filters.branch_id) {
      where.branch_id = filters.branch_id;
    }
    if (filters.partner_id) {
      where.partner_id = filters.partner_id;
    }
    if (filters.plan_type) {
      where.plan_type = filters.plan_type;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.start_date && filters.end_date) {
      where.created_at = {
        [Op.between]: [new Date(filters.start_date), new Date(filters.end_date + ' 23:59:59')]
      };
    } else if (filters.start_date) {
      where.created_at = { [Op.gte]: new Date(filters.start_date) };
    } else if (filters.end_date) {
      where.created_at = { [Op.lte]: new Date(filters.end_date + ' 23:59:59') };
    }

    const sales = await ResellerSale.findAll({
      where,
      include: [
        {
          model: Reseller,
          attributes: ['id', 'name', 'cpf']
        },
        {
          model: PartnerBranch,
          attributes: ['id', 'name'],
          include: [{ model: Partner, attributes: ['id', 'name'] }]
        },
        {
          model: Partner,
          attributes: ['id', 'name']
        },
        {
          model: Beneficiary,
          attributes: ['id', 'name', 'cpf']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return sales;
  }

  async getSalesSummary(filters = {}) {
    const where = {};

    if (filters.reseller_id) where.reseller_id = filters.reseller_id;
    if (filters.branch_id) where.branch_id = filters.branch_id;
    if (filters.partner_id) where.partner_id = filters.partner_id;
    if (filters.start_date && filters.end_date) {
      where.created_at = {
        [Op.between]: [new Date(filters.start_date), new Date(filters.end_date + ' 23:59:59')]
      };
    }

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

  async getCommissionReport(filters = {}) {
    const where = {};

    if (filters.partner_id) where.partner_id = filters.partner_id;
    if (filters.status) where.status = filters.status;
    if (filters.start_date && filters.end_date) {
      where.created_at = {
        [Op.between]: [new Date(filters.start_date), new Date(filters.end_date + ' 23:59:59')]
      };
    }

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
}

module.exports = new SalesReportService();

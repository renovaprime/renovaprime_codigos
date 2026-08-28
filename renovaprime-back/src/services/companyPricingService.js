const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

class CompanyPricingService {
  async countActiveLives(companyId) {
    const [row] = await sequelize.query(
      `SELECT
         COALESCE(SUM(status = 'ACTIVE'), 0) AS lives_active,
         COALESCE(SUM(status = 'ACTIVE' AND type = 'TITULAR'), 0) AS titulars_active
       FROM beneficiaries
       WHERE company_id = :companyId`,
      { replacements: { companyId }, type: QueryTypes.SELECT }
    );

    return {
      lives_active: Number(row?.lives_active) || 0,
      titulars_active: Number(row?.titulars_active) || 0
    };
  }

  findTierForVolume(tiers, volume) {
    if (!tiers || tiers.length === 0) {
      return null;
    }

    const sorted = [...tiers].sort((a, b) => a.lives_from - b.lives_from);

    for (const tier of sorted) {
      if (volume >= tier.lives_from && volume <= tier.lives_to) {
        return tier;
      }
    }

    return null;
  }

  getMaxTierVolume(tiers) {
    if (!tiers || tiers.length === 0) {
      return 0;
    }
    return Math.max(...tiers.map((t) => t.lives_to));
  }

  calculateBilling(contract, metrics, tiers) {
    const volume = metrics.lives_active;
    const tier = this.findTierForVolume(tiers, volume);

    if (!tier) {
      const maxVolume = this.getMaxTierVolume(tiers);
      if (volume > maxVolume) {
        const error = new Error('Volume de vidas acima da última faixa de preço');
        error.code = 'VOLUME_ABOVE_TIER';
        throw error;
      }
      const error = new Error('Plano sem faixas de preço ativas');
      error.code = 'NO_TIERS';
      throw error;
    }

    const unitPrice = Number(tier.unit_price);
    if (!unitPrice || unitPrice <= 0) {
      const error = new Error('Faixa de preço com valor inválido');
      error.code = 'INVALID_UNIT_PRICE';
      throw error;
    }

    const billingType = contract.billing_type;
    let totalAmount;

    if (billingType === 'PER_FAMILY') {
      totalAmount = metrics.titulars_active * unitPrice;
    } else {
      totalAmount = metrics.lives_active * unitPrice;
    }

    return {
      billing_type: billingType,
      total_lives: metrics.lives_active,
      total_families: metrics.titulars_active,
      unit_price: unitPrice,
      total_amount: Number(totalAmount.toFixed(2)),
      tier
    };
  }
}

module.exports = new CompanyPricingService();

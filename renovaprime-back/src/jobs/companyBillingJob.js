const cron = require('node-cron');
const companyBillingService = require('../services/companyBillingService');

function startCompanyBillingJob() {
  cron.schedule(
    '0 0 1 * *',
    async () => {
      console.log('[company_billing.job] Iniciando fechamento mensal B2B');
      try {
        const results = await companyBillingService.runMonthlyJobForAllCompanies();
        console.log('[company_billing.job] Concluído', { count: results.length });
      } catch (err) {
        console.error('[company_billing.job] Erro fatal', err.message);
      }
    },
    { timezone: 'America/Sao_Paulo' }
  );

  console.log('[company_billing.job] Cron agendado: 0 0 1 * * (America/Sao_Paulo)');
}

module.exports = { startCompanyBillingJob };

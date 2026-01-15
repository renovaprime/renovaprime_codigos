const { scheduleDeactivationJob } = require('./deactivateBeneficiaries');

// Função para inicializar todos os jobs
const initializeJobs = () => {
  console.log('Initializing cron jobs...');
  
  // Inicializar job de inativação de beneficiários
  scheduleDeactivationJob();
  console.log('All cron jobs initialized successfully');
};

module.exports = {
  initializeJobs
}; 
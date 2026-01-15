/**
 * Configuração centralizada de permissões por tela/rota
 * 
 * Este arquivo mapeia quais roles têm acesso a cada tela do sistema.
 * Facilita manutenção e visualização das permissões.
 * 
 * NOTA: A comparação é case-insensitive, então tanto 'ADMIN' quanto 'admin' funcionam.
 */

const SCREEN_PERMISSIONS = {
  // Telas administrativas - Apenas admin
  ADMIN: {
    parceiros: ['ADMIN'],
    medicosAtivos: ['ADMIN'],
    medicosPendentes: ['ADMIN'],
    especialidades: ['ADMIN'],
    relatorios: ['ADMIN'],
    gestaoSite: ['ADMIN'],
    adminAppointments: ['ADMIN'], // Visualização de todas as consultas
    approveDoctors: ['ADMIN'],
    rejectDoctors: ['ADMIN'],
    manageSpecialties: ['ADMIN'],
  },

  // Telas compartilhadas - Todos os tipos de usuário
  SHARED: {
    dashboard: ['ADMIN', 'MEDICO', 'PACIENTE'],
    consultas: ['ADMIN', 'MEDICO', 'PACIENTE'],
    historico: ['ADMIN', 'MEDICO', 'PACIENTE'],
    configuracoes: ['ADMIN', 'MEDICO', 'PACIENTE'],
  },

  // Telas específicas de médico
  DOCTOR: {
    schedules: ['MEDICO'],
    doctorAppointments: ['MEDICO'],
    startAppointment: ['MEDICO'],
    finishAppointment: ['MEDICO'],
    emitPrescription: ['MEDICO'],
  },

  // Telas específicas de paciente
  PATIENT: {
    patientAppointments: ['PACIENTE'],
  },

  // Ações que podem ser realizadas por múltiplos roles
  ACTIONS: {
    createAppointment: ['PACIENTE', 'MEDICO', 'ADMIN'],
    cancelAppointment: ['PACIENTE', 'MEDICO', 'ADMIN'],
    viewPrescriptions: ['PACIENTE', 'MEDICO', 'ADMIN'],
  },
};

/**
 * Verifica se um role tem permissão para acessar uma tela
 * @param {string} screenKey - Chave da tela (ex: 'dashboard', 'parceiros')
 * @param {string} userRole - Role do usuário (ex: 'admin', 'medico', 'paciente')
 * @returns {boolean} - true se o usuário tem permissão, false caso contrário
 */
function hasScreenPermission(screenKey, userRole) {
  // Percorre todas as categorias para encontrar a tela
  for (const category of Object.values(SCREEN_PERMISSIONS)) {
    if (category[screenKey]) {
      return category[screenKey].includes(userRole);
    }
  }
  return false;
}

/**
 * Retorna todas as telas que um role pode acessar
 * @param {string} userRole - Role do usuário
 * @returns {string[]} - Array com as chaves das telas permitidas
 */
function getAllowedScreens(userRole) {
  const allowedScreens = [];
  
  for (const category of Object.values(SCREEN_PERMISSIONS)) {
    for (const [screenKey, allowedRoles] of Object.entries(category)) {
      if (allowedRoles.includes(userRole)) {
        allowedScreens.push(screenKey);
      }
    }
  }
  
  return allowedScreens;
}

/**
 * Retorna o mapeamento completo de permissões
 * @returns {object} - Objeto com todas as permissões configuradas
 */
function getPermissionsConfig() {
  return SCREEN_PERMISSIONS;
}

module.exports = {
  SCREEN_PERMISSIONS,
  hasScreenPermission,
  getAllowedScreens,
  getPermissionsConfig,
};

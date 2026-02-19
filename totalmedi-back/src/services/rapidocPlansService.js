const api = require('./rapidocApi');

let cachedPlans = null;
let cacheTimestamp = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

/**
 * Busca e cacheia os planos disponíveis na Rapidoc.
 * Retorno da API: array de { paymentType?, plan: { uuid, name, serviceType, specialties[] } }
 */
const fetchPlans = async () => {
  const now = Date.now();
  if (cachedPlans && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedPlans;
  }

  const response = await api.get('/plans');
  cachedPlans = response.data;
  cacheTimestamp = now;
  console.log('Rapidoc plans fetched and cached:', cachedPlans.length, 'plans');
  return cachedPlans;
};

/**
 * Retorna todos os planos formatados para envio no beneficiário.
 * Usado para planos mensais (subscription) onde o beneficiário precisa de todos os planos.
 */
const getAllPlans = async (paymentType) => {
  const allPlans = await fetchPlans();

  return allPlans.map(entry => ({
    paymentType: entry.paymentType || paymentType,
    plan: { uuid: entry.plan.uuid }
  }));
};

/**
 * Busca o(s) plano(s) que contêm uma especialidade específica (por nome).
 * Usado para consultas avulsas onde o beneficiário só precisa do plano da especialidade.
 */
const getPlansForSpecialty = async (specialtyName, paymentType) => {
  const allPlans = await fetchPlans();

  const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const normalizedSearch = normalize(specialtyName);

  const matching = allPlans.filter(entry => {
    if (!entry.plan.specialties) return false;
    return entry.plan.specialties.some(s => normalize(s.name) === normalizedSearch);
  });

  if (matching.length === 0) {
    console.warn(`No plan found for specialty "${specialtyName}", returning all plans as fallback`);
    return getAllPlans(paymentType);
  }

  return matching.map(entry => ({
    paymentType: entry.paymentType || paymentType,
    plan: { uuid: entry.plan.uuid }
  }));
};

const clearCache = () => {
  cachedPlans = null;
  cacheTimestamp = null;
};

module.exports = { fetchPlans, getAllPlans, getPlansForSpecialty, clearCache };

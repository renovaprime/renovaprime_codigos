const axios = require('axios');
const rapidocApi = require('../config/rapidoc');

function normalizeCpf(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

function mapUpstreamError(error) {
  if (!axios.isAxiosError(error)) {
    return error;
  }

  const res = error.response;
  if (!res) {
    const e = new Error('Serviço Rapidoc indisponível');
    e.statusCode = 503;
    e.code = 'RAPIDOC_UNAVAILABLE';
    return e;
  }

  const data = res.data;
  let message = 'Erro ao comunicar com a Rapidoc';
  if (data && typeof data === 'object' && typeof data.message === 'string') {
    message = data.message;
  } else if (typeof data === 'string' && data.length > 0) {
    message = data;
  } else if (error.message) {
    message = error.message;
  }

  const upstreamStatus = res.status;
  let statusCode;
  if (upstreamStatus === 404) {
    statusCode = 404;
  } else if (upstreamStatus >= 500) {
    statusCode = 502;
  } else {
    statusCode = 400;
  }

  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = upstreamStatus === 404 ? 'NOT_FOUND' : 'RAPIDOC_ERROR';
  err.upstreamStatus = upstreamStatus;
  err.upstreamData = data;
  return err;
}

class RapidocService {
  async getBeneficiaryByCpf(cpf) {
    const normalized = normalizeCpf(cpf);
    try {
      const { data } = await rapidocApi.get(`/beneficiaries/${normalized}`);
      // Rapidoc pode responder HTTP 200 com { success: false, message } (ex.: não encontrado)
      if (data && typeof data === 'object' && data.success === false) {
        const msg =
          typeof data.message === 'string' && data.message.length > 0
            ? data.message
            : 'Beneficiário não encontrado na Rapidoc';
        const err = new Error(msg);
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
      }
      return data;
    } catch (error) {
      throw mapUpstreamError(error);
    }
  }

  /**
   * Solicita URL do Vital Scan para o beneficiário (webview deve abrir `data.url`).
   * @param {string} beneficiaryUuid UUID do beneficiário na Rapidoc
   * @returns {Promise<{ url: string, beneficiaryUuid: string, token: string }>}
   */
  async requestVitalScan(beneficiaryUuid) {
    const uuid = String(beneficiaryUuid || '').trim();
    if (!uuid) {
      const err = new Error('beneficiaryUuid é obrigatório');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    console.log(
      '[Rapidoc][VitalScan] POST /beneficiary-scans/request-vitalscan — beneficiaryUuid:',
      uuid
    );

    try {
      const { data } = await rapidocApi.post(
        '/beneficiary-scans/request-vitalscan',
        {},
        { params: { beneficiaryUuid: uuid } }
      );
      console.log(
        '[Rapidoc][VitalScan] resposta request-vitalscan:',
        JSON.stringify(data, null, 2)
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[Rapidoc][VitalScan] erro request-vitalscan HTTP', {
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('[Rapidoc][VitalScan] erro request-vitalscan:', error);
      }
      throw mapUpstreamError(error);
    }
  }

  async listPlans() {
    try {
      const { data } = await rapidocApi.get('/plans');
      return data;
    } catch (error) {
      throw mapUpstreamError(error);
    }
  }

  /**
   * @param {object[]} items Um ou mais beneficiários no formato Rapidoc (array no wire)
   */
  async createBeneficiaries(items) {
    if (!Array.isArray(items) || items.length === 0) {
      const err = new Error('Lista de beneficiários inválida');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    try {
      console.log(
        '[Rapidoc] POST /beneficiaries request — CPF(s):',
        items.map((i) => i && i.cpf).filter(Boolean)
      );
      const { data } = await rapidocApi.post('/beneficiaries', items);
      console.log(
        '[Rapidoc] POST /beneficiaries OK — corpo:',
        JSON.stringify(data, null, 2)
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[Rapidoc] POST /beneficiaries erro HTTP', {
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('[Rapidoc] POST /beneficiaries erro:', error);
      }
      throw mapUpstreamError(error);
    }
  }

  /**
   * Primeiro plano com assinatura recorrente (S) e serviceType GS (ex.: Premium).
   * @returns {Promise<string>}
   */
  async findSubscriptionGsPlanUuid() {
    const plans = await this.listPlans();
    if (!Array.isArray(plans)) {
      const err = new Error('Lista de planos Rapidoc em formato inesperado');
      err.statusCode = 502;
      err.code = 'RAPIDOC_ERROR';
      throw err;
    }

    const match = plans.find(
      (item) =>
        item &&
        item.paymentType === 'S' &&
        item.plan &&
        item.plan.serviceType === 'GS' &&
        typeof item.plan.uuid === 'string'
    );

    if (!match) {
      const err = new Error(
        'Nenhum plano subscription (S) com serviceType GS encontrado na Rapidoc'
      );
      err.statusCode = 422;
      err.code = 'RAPIDOC_PLAN_NOT_FOUND';
      throw err;
    }

    return match.plan.uuid;
  }

  /**
   * Extrai UUID do beneficiário a partir do GET /beneficiaries/:cpf (titular ou dependente).
   * @param {object} data Corpo da resposta Rapidoc
   * @param {string} cpfDigits CPF só dígitos
   * @returns {string|null}
   */
  extractBeneficiaryUuidFromGet(data, cpfDigits) {
    const b = data && data.beneficiary;
    if (!b || typeof b !== 'object') {
      return null;
    }

    if (normalizeCpf(b.cpf) === cpfDigits && b.uuid) {
      return String(b.uuid);
    }

    const deps = Array.isArray(b.dependents) ? b.dependents : [];
    const dep = deps.find((d) => d && normalizeCpf(d.cpf) === cpfDigits);
    if (dep && dep.uuid) {
      return String(dep.uuid);
    }

    return null;
  }

  /**
   * Extrai UUID a partir da resposta POST /beneficiaries.
   * @param {object} data
   * @param {string} cpfDigits
   * @returns {string|null}
   */
  extractBeneficiaryUuidFromCreate(data, cpfDigits) {
    const list = data && data.beneficiaries;
    if (!Array.isArray(list) || list.length === 0) {
      return null;
    }
    const row =
      list.find((item) => item && normalizeCpf(item.cpf) === cpfDigits) || list[0];
    return row && row.uuid ? String(row.uuid) : null;
  }

  /**
   * Modelo Sequelize ou objeto plano → payload cadastral Rapidoc (sem `plans`).
   * @param {object} beneficiary
   * @returns {{ name: string, cpf: string, birthday: string, phone: string, email: string, zipCode: string, address: string, city: string, state: string }}
   */
  buildRapidocPayloadFromBeneficiary(beneficiary) {
    const b =
      beneficiary && typeof beneficiary.get === 'function'
        ? beneficiary.get({ plain: true })
        : beneficiary || {};

    const cpfDigits = normalizeCpf(b.cpf);
    if (cpfDigits.length !== 11) {
      const err = new Error(
        'CPF inválido ou incompleto. Atualize o cadastro antes de ativar o Face Scan.'
      );
      err.statusCode = 422;
      err.code = 'FACE_SCAN_INCOMPLETE_DATA';
      throw err;
    }

    const phoneDigits = String(b.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      const err = new Error(
        'Telefone com 10 a 13 dígitos é obrigatório para cadastro na Rapidoc (Face Scan).'
      );
      err.statusCode = 422;
      err.code = 'FACE_SCAN_INCOMPLETE_DATA';
      throw err;
    }

    const zip = String(b.cep || '').replace(/\D/g, '');
    if (zip.length !== 8) {
      const err = new Error(
        'CEP com 8 dígitos é obrigatório para cadastro na Rapidoc (Face Scan).'
      );
      err.statusCode = 422;
      err.code = 'FACE_SCAN_INCOMPLETE_DATA';
      throw err;
    }

    const email = String(b.email || '').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const err = new Error(
        'E-mail válido é obrigatório para cadastro na Rapidoc (Face Scan).'
      );
      err.statusCode = 422;
      err.code = 'FACE_SCAN_INCOMPLETE_DATA';
      throw err;
    }

    const address = String(b.address || '').trim();
    if (address.length < 5) {
      const err = new Error(
        'Endereço (mín. 5 caracteres) é obrigatório para cadastro na Rapidoc (Face Scan).'
      );
      err.statusCode = 422;
      err.code = 'FACE_SCAN_INCOMPLETE_DATA';
      throw err;
    }

    const city = String(b.city || '').trim();
    if (city.length < 2) {
      const err = new Error(
        'Cidade é obrigatória para cadastro na Rapidoc (Face Scan).'
      );
      err.statusCode = 422;
      err.code = 'FACE_SCAN_INCOMPLETE_DATA';
      throw err;
    }

    const state = String(b.state || '').trim().toUpperCase();
    if (state.length !== 2) {
      const err = new Error(
        'UF com 2 letras é obrigatória para cadastro na Rapidoc (Face Scan).'
      );
      err.statusCode = 422;
      err.code = 'FACE_SCAN_INCOMPLETE_DATA';
      throw err;
    }

    const rawBirth = b.birth_date;
    const birthday =
      rawBirth instanceof Date
        ? rawBirth.toISOString().slice(0, 10)
        : String(rawBirth || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      const err = new Error(
        'Data de nascimento válida (YYYY-MM-DD) é obrigatória para Face Scan.'
      );
      err.statusCode = 422;
      err.code = 'FACE_SCAN_INCOMPLETE_DATA';
      throw err;
    }

    const name = String(b.name || '').trim();
    if (name.length < 3) {
      const err = new Error(
        'Nome com ao menos 3 caracteres é obrigatório para Face Scan.'
      );
      err.statusCode = 422;
      err.code = 'FACE_SCAN_INCOMPLETE_DATA';
      throw err;
    }

    return {
      name,
      cpf: cpfDigits,
      birthday,
      phone: phoneDigits,
      email,
      zipCode: zip,
      address,
      city,
      state
    };
  }

  /**
   * POST /beneficiaries com primeiro plano subscription S + serviceType GS.
   * @param {object} rapidocPayloadSansPlans mesmas chaves de buildRapidocPayloadFromBeneficiary ou body paciente
   * @returns {Promise<string>} beneficiaryUuid
   */
  async createBeneficiaryInRapidocWithSubscription(rapidocPayloadSansPlans) {
    const cpfDigits = normalizeCpf(rapidocPayloadSansPlans.cpf);
    if (cpfDigits.length !== 11) {
      const err = new Error('CPF inválido');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const planUuid = await this.findSubscriptionGsPlanUuid();
    const createPayload = {
      ...rapidocPayloadSansPlans,
      plans: [{ paymentType: 'S', plan: { uuid: planUuid } }]
    };

    const created = await this.createBeneficiaries([createPayload]);
    const beneficiaryUuid = this.extractBeneficiaryUuidFromCreate(created, cpfDigits);
    if (!beneficiaryUuid) {
      const parseErr = new Error(
        'Cadastro Rapidoc concluído mas UUID do beneficiário não retornado'
      );
      parseErr.statusCode = 502;
      parseErr.code = 'RAPIDOC_ERROR';
      throw parseErr;
    }
    return beneficiaryUuid;
  }

  /**
   * GET por CPF ou criação com plano; não chama VitalScan.
   * @param {object} beneficiary Sequelize ou plain
   * @returns {Promise<string>} beneficiaryUuid
   */
  async ensureBeneficiaryInRapidoc(beneficiary) {
    const rapidocBase = this.buildRapidocPayloadFromBeneficiary(beneficiary);
    const cpfDigits = normalizeCpf(rapidocBase.cpf);

    try {
      const existing = await this.getBeneficiaryByCpf(cpfDigits);
      const uuid = this.extractBeneficiaryUuidFromGet(existing, cpfDigits);
      if (uuid) {
        return uuid;
      }
      const parseErr = new Error(
        'Resposta Rapidoc sem UUID do beneficiário para este CPF'
      );
      parseErr.statusCode = 502;
      parseErr.code = 'RAPIDOC_ERROR';
      throw parseErr;
    } catch (error) {
      if (!(error.statusCode === 404 && error.code === 'NOT_FOUND')) {
        throw error;
      }
      return this.createBeneficiaryInRapidocWithSubscription(rapidocBase);
    }
  }

  /**
   * VitalScan apenas se beneficiário já existir na Rapidoc (sem criação).
   * @param {string} cpfDigits CPF só dígitos
   */
  async getVitalScanUrlForExistingBeneficiaryByCpf(cpfDigits) {
    const normalized = normalizeCpf(cpfDigits);
    if (normalized.length !== 11) {
      const err = new Error('CPF inválido');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const existing = await this.getBeneficiaryByCpf(normalized);
    const uuid = this.extractBeneficiaryUuidFromGet(existing, normalized);
    if (!uuid) {
      const err = new Error(
        'Beneficiário não localizado na Rapidoc para este CPF'
      );
      err.statusCode = 404;
      err.code = 'RAPIDOC_BENEFICIARY_NOT_FOUND';
      throw err;
    }

    return this.requestVitalScan(uuid);
  }

  /**
   * Garante beneficiário na Rapidoc (GET por CPF ou criação com plano S/GS) e retorna URL VitalScan.
   * @param {object} payload Campos Rapidoc (name, cpf, birthday, …) sem `plans`
   * @returns {Promise<{ url: string, beneficiaryUuid: string, token: string }>}
   */
  async getVitalScanUrlForBeneficiary(payload) {
    const cpfDigits = normalizeCpf(payload.cpf);
    if (cpfDigits.length !== 11) {
      const err = new Error('CPF inválido');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    console.log('[Rapidoc][VitalScan] fluxo iniciado — CPF:', cpfDigits);

    let beneficiaryUuid;

    try {
      const existing = await this.getBeneficiaryByCpf(cpfDigits);
      beneficiaryUuid = this.extractBeneficiaryUuidFromGet(existing, cpfDigits);
      if (!beneficiaryUuid) {
        console.warn(
          '[Rapidoc][VitalScan] GET retornou sem UUID extraível — success:',
          existing && existing.success,
          'tem beneficiary:',
          !!(existing && existing.beneficiary)
        );
        const parseErr = new Error(
          'Resposta Rapidoc sem UUID do beneficiário para este CPF'
        );
        parseErr.statusCode = 502;
        parseErr.code = 'RAPIDOC_ERROR';
        throw parseErr;
      }
      console.log(
        '[Rapidoc][VitalScan] beneficiário já existe na Rapidoc — uuid:',
        beneficiaryUuid
      );
    } catch (error) {
      if (!(error.statusCode === 404 && error.code === 'NOT_FOUND')) {
        console.error('[Rapidoc][VitalScan] falha no GET / tratar existente:', {
          message: error.message,
          statusCode: error.statusCode,
          code: error.code
        });
        throw error;
      }

      console.log(
        '[Rapidoc][VitalScan] beneficiário não encontrado — fluxo de cadastro (NOT_FOUND)'
      );

      beneficiaryUuid = await this.createBeneficiaryInRapidocWithSubscription(payload);
      console.log(
        '[Rapidoc][VitalScan] cadastro concluído — beneficiaryUuid:',
        beneficiaryUuid
      );
    }

    const vitalScanPayload = await this.requestVitalScan(beneficiaryUuid);
    console.log(
      '[Rapidoc][VitalScan] fluxo concluído — tem url:',
      !!(vitalScanPayload && vitalScanPayload.url)
    );
    return vitalScanPayload;
  }
}

module.exports = new RapidocService();

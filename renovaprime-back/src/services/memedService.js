const { memedApi, MEMED_API_KEY, MEMED_SECRET_KEY } = require('../config/memed');
const { v4: uuidv4 } = require('uuid');

class MemedService {
  /**
   * Registra um prescritor na Memed.
   * Retorna { externalId, token } em caso de sucesso, ou null em caso de falha.
   */
  async createPrescriber({ name, cpf, birthDate, gender, email, phone, registryType, registryNumber, registryUf, especialidade }) {
    const nameParts = name.trim().split(/\s+/);
    const nome = nameParts[0];
    const sobrenome = nameParts.slice(1).join(' ') || nome;

    const externalId = uuidv4();

    // Converter birth_date de YYYY-MM-DD para dd/mm/YYYY
    let dataNascimento = null;
    if (birthDate) {
      const [year, month, day] = birthDate.split('-');
      dataNascimento = `${day}/${month}/${year}`;
    }

    const payload = {
      data: {
        type: 'usuarios',
        attributes: {
          external_id: externalId,
          nome,
          sobrenome,
          cpf,
          board: {
            board_code: registryType,
            board_number: registryNumber,
            board_state: registryUf
          },
          data_nascimento: dataNascimento
        }
      }
    };

    // Campos opcionais
    if (email) payload.data.attributes.email = email;
    if (phone) payload.data.attributes.telefone = phone.replace(/\D/g, '');
    if (gender) payload.data.attributes.sexo = gender;
    if (especialidade) payload.data.attributes.especialidade = especialidade;

    try {
      const response = await memedApi.post(
        `sinapse-prescricao/usuarios`,
        payload,
        { params: { 'api-key': MEMED_API_KEY, 'secret-key': MEMED_SECRET_KEY } }
      );

      const userData = response.data?.data;
      const token = userData?.attributes?.token || null;

      return { externalId, token };
    } catch (error) {
      const detail = error.response?.data?.errors?.[0]?.detail || error.message;
      console.error('[MemedService] Erro ao cadastrar prescritor na Memed:', detail);

      // Se o prescritor já existe, a Memed retorna o id externo na mensagem de erro
      const existingIdMatch = detail.match(/id externo \(([0-9a-f-]+)\)/i);
      if (existingIdMatch) {
        const existingExternalId = existingIdMatch[1];
        console.log('[MemedService] Prescritor já existe na Memed, recuperando id externo:', existingExternalId);
        return { externalId: existingExternalId, token: null };
      }

      return null;
    }
  }

  /**
   * Busca um prescritor na Memed pelo identificador (external_id, CPF, ou registro+UF).
   * Retorna o data-token atualizado ou null em caso de falha.
   */
  async getPrescriber(identifier) {
    try {
      const response = await memedApi.get(
        `sinapse-prescricao/usuarios/${identifier}`,
        { params: { 'api-key': MEMED_API_KEY, 'secret-key': MEMED_SECRET_KEY } }
      );

      const userData = response.data?.data;
      const token = userData?.attributes?.token || null;
      const externalId = userData?.attributes?.external_id || null;

      return { externalId, token, data: userData };
    } catch (error) {
      const detail = error.response?.data?.errors?.[0]?.detail || error.message;
      console.error('[MemedService] Erro ao buscar prescritor na Memed:', detail);
      return null;
    }
  }
  /**
   * Obtém o link digital da prescrição e os dígitos de desbloqueio.
   * Endpoint Memed: GET /prescricoes/{prescricao_id}/get-digital-prescription-link
   * Retorna { link, digits } ou null em caso de falha.
   */
  async getDigitalPrescriptionLink(memedPrescriptionId) {
    try {
      const response = await memedApi.get(
        `prescricoes/${memedPrescriptionId}/get-digital-prescription-link`,
        { params: { 'api-key': MEMED_API_KEY, 'secret-key': MEMED_SECRET_KEY } }
      );

      const data = response.data?.data;
      const attrs = Array.isArray(data) ? data[0]?.attributes : data?.attributes;
      const link = attrs?.link || null;
      const digits = attrs?.digits || null;

      return { link, digits };
    } catch (error) {
      const detail = error.response?.data?.errors?.[0]?.detail || error.message;
      console.error('[MemedService] Erro ao obter link digital da prescrição:', detail);
      return null;
    }
  }
}

module.exports = new MemedService();

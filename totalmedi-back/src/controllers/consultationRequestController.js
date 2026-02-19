const db = require('../config/database');
const api = require('../services/rapidocApi');
const { getPlansForSpecialty } = require('../services/rapidocPlansService');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM solicitacao_consulta WHERE status = ? ORDER BY data_criacao DESC',
      ['pendente']
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching consultation requests:', error.message);
    return res.status(500).json({ success: false, message: 'Erro ao buscar solicitações de consulta' });
  }
};

exports.createBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT * FROM solicitacao_consulta WHERE id = ? AND status = ?', [id, 'pendente']);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Solicitação não encontrada ou já agendada' });
    }
    const request = rows[0];

    const plans = await getPlansForSpecialty(request.especialidade_nome, 'A');
    const beneficiaryData = {
      name: request.nome,
      cpf: request.cpf,
      birthday: '1990-01-01',
      phone: request.telefone || '',
      email: request.email || '',
      zipCode: request.cep || '',
      address: request.endereco || '',
      city: request.cidade || '',
      state: request.estado || '',
      plans,
    };

    let beneficiaryUuid;

    const extractUuid = (data) =>
      data?.beneficiary?.uuid || data?.beneficiaries?.[0]?.uuid || data?.[0]?.uuid;

    // Try to find existing beneficiary first
    try {
      const findResp = await api.get(`/beneficiaries/${request.cpf}`);
      console.log('Find beneficiary response:', findResp.data);
      beneficiaryUuid = extractUuid(findResp.data);
      if (beneficiaryUuid) {
        try {
          await api.put(`/beneficiaries/${beneficiaryUuid}/reactivate`);
        } catch (reactivateErr) {
          console.log('Reactivation not needed or failed:', reactivateErr.message);
        }
      }
    } catch (findErr) {
      // Not found, create new
    }

    if (!beneficiaryUuid) {
      const createResp = await api.post('/beneficiaries', [beneficiaryData]);
      const createdUuid = extractUuid(createResp.data);
      if (!createdUuid) {
        return res.status(400).json({ success: false, message: createResp.data.message || 'Erro ao criar beneficiário na Rapidoc' });
      }
      beneficiaryUuid = createdUuid;
    }

    // Save beneficiary UUID to consultation request
    await db.query(
      'UPDATE solicitacao_consulta SET beneficiary_uuid = ? WHERE id = ?',
      [beneficiaryUuid, id]
    );

    return res.json({ success: true, beneficiaryUuid });
  } catch (error) {
    console.error('Error creating beneficiary:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || 'Erro ao criar beneficiário';
    return res.status(500).json({ success: false, message: errorMessage });
  }
};

exports.schedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialtyUuid, availabilityUuid, beneficiaryUuid } = req.body;

    if (!specialtyUuid || !availabilityUuid || !beneficiaryUuid) {
      return res.status(400).json({ success: false, message: 'Especialidade, horário e beneficiário são obrigatórios' });
    }

    const [rows] = await db.query('SELECT * FROM solicitacao_consulta WHERE id = ? AND status = ?', [id, 'pendente']);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Solicitação não encontrada ou já agendada' });
    }

    const appointmentData = {
      specialtyUuid,
      beneficiaryUuid,
      availabilityUuid,
      approveAdditionalPayment: true,
    };

    const appointmentResp = await api.post('/appointments', appointmentData);

    await db.query(
      'UPDATE solicitacao_consulta SET status = ?, data_agendamento = NOW() WHERE id = ?',
      ['agendada', id]
    );

    return res.json({
      success: true,
      message: 'Consulta agendada com sucesso',
      appointment: appointmentResp.data,
    });
  } catch (error) {
    console.error('Error scheduling consultation:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || 'Erro ao agendar consulta';
    return res.status(500).json({ success: false, message: errorMessage });
  }
};

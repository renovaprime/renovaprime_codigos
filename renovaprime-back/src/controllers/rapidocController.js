const { Op } = require('sequelize');
const rapidocService = require('../services/rapidocService');
const patientService = require('../services/patientService');
const { Beneficiary, BeneficiaryFaceScanUsage } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

function normalizeCpf(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

async function assertUserOwnsCpf(userId, cpfDigits) {
  const titular = await Beneficiary.findOne({
    where: { user_id: userId, type: 'TITULAR' }
  });
  if (!titular) {
    return false;
  }

  const candidates = [
    normalizeCpf(titular.cpf),
    ...(await Beneficiary.findAll({
      attributes: ['cpf'],
      where: { titular_id: titular.id }
    })).map((b) => normalizeCpf(b.cpf))
  ];

  return candidates.includes(cpfDigits);
}

/**
 * Titular ou dependente: CPF pertence à rede do usuário e email bate com o cadastro local.
 */
async function assertBodyMatchesOwnedBeneficiary(userId, userEmail, body) {
  const cpfDigits = normalizeCpf(body.cpf);
  const allowed = await assertUserOwnsCpf(userId, cpfDigits);
  if (!allowed) {
    return false;
  }

  const titular = await Beneficiary.findOne({
    where: { user_id: userId, type: 'TITULAR' }
  });
  if (!titular) {
    return false;
  }

  const network = await Beneficiary.findAll({
    where: {
      [Op.or]: [{ id: titular.id }, { titular_id: titular.id }]
    }
  });

  const local = network.find((b) => normalizeCpf(b.cpf) === cpfDigits);
  if (!local) {
    return false;
  }

  const expectedEmail = (
    local.email ||
    (local.type === 'TITULAR' ? userEmail : '') ||
    ''
  )
    .trim()
    .toLowerCase();
  const received = (body.email || '').trim().toLowerCase();

  return expectedEmail === received;
}

class RapidocController {
  async getVitalScanUrl(req, res, next) {
    try {
      const cpfDigits = normalizeCpf(req.body.cpf);
      if (cpfDigits.length !== 11) {
        return res.status(400).json(errorResponse('CPF inválido', 'VALIDATION_ERROR'));
      }

      const allowed = await assertUserOwnsCpf(req.user.id, cpfDigits);
      if (!allowed) {
        return res
          .status(403)
          .json(errorResponse('Acesso negado a este CPF', 'FORBIDDEN'));
      }

      const matchesLocal = await assertBodyMatchesOwnedBeneficiary(
        req.user.id,
        req.user.email,
        req.body
      );
      if (!matchesLocal) {
        return res.status(403).json(
          errorResponse(
            'Os dados devem coincidir com o beneficiário vinculado à sua conta',
            'FORBIDDEN'
          )
        );
      }

      const data = await rapidocService.getVitalScanUrlForBeneficiary(req.body);
      return res.json(successResponse(data));
    } catch (error) {
      if (error.statusCode) {
        return res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.code));
      }
      next(error);
    }
  }

  /**
   * Face Scan só com CPF; beneficiário deve existir na Rapidoc e face_scan_enabled no TotalDoctor.
   */
  async getVitalScanUrlByCpf(req, res, next) {
    try {
      const cpfDigits = normalizeCpf(req.body.cpf);
      if (cpfDigits.length !== 11) {
        return res.status(400).json(errorResponse('CPF inválido', 'VALIDATION_ERROR'));
      }

      const local = await patientService.findOwnedBeneficiaryByCpf(
        req.user.id,
        cpfDigits
      );
      if (!local) {
        return res
          .status(403)
          .json(errorResponse('Acesso negado a este CPF', 'FORBIDDEN'));
      }

      if (!local.face_scan_enabled) {
        return res.status(403).json(
          errorResponse(
            'Face Scan não está liberado para este beneficiário.',
            'FACE_SCAN_DISABLED'
          )
        );
      }

      const data = await rapidocService.getVitalScanUrlForExistingBeneficiaryByCpf(
        cpfDigits
      );

      try {
        await BeneficiaryFaceScanUsage.create({
          beneficiary_id: local.id,
          user_id: req.user.id
        });
      } catch (logErr) {
        console.error(
          '[Rapidoc][VitalScan] falha ao registrar uso Face Scan:',
          logErr.message
        );
      }

      return res.json(successResponse(data));
    } catch (error) {
      if (error.statusCode) {
        return res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.code));
      }
      next(error);
    }
  }
}

module.exports = new RapidocController();

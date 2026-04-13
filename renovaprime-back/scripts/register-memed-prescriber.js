/**
 * Script para registrar um médico na MEMED
 * Uso: node scripts/register-memed-prescriber.js <user_id>
 */

require('dotenv').config();
const { User, Doctor, Specialty, DoctorSpecialty } = require('../src/models');
const memedService = require('../src/services/memedService');

async function registerPrescriber(userId) {
  try {
    console.log(`\n[Script] Buscando médico com user_id=${userId}...`);

    const doctor = await Doctor.findOne({
      where: { user_id: userId },
      include: [
        { model: User },
        { model: Specialty }
      ]
    });

    if (!doctor) {
      console.error('[Script] Médico não encontrado!');
      process.exit(1);
    }

    const user = doctor.User;
    console.log('\n[Script] Dados do médico:');
    console.log(`  Nome: ${user.name}`);
    console.log(`  CPF: ${user.cpf}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Telefone: ${user.phone}`);
    console.log(`  Data Nascimento: ${user.birth_date}`);
    console.log(`  Gênero: ${user.gender}`);
    console.log(`  Registro: ${doctor.registry_type} ${doctor.registry_number}/${doctor.registry_uf}`);
    console.log(`  memed_external_id atual: ${doctor.memed_external_id || 'NÃO REGISTRADO'}`);

    // Buscar especialidade
    let especialidadeName = null;
    if (doctor.Specialties && doctor.Specialties.length > 0) {
      especialidadeName = doctor.Specialties[0].name;
      console.log(`  Especialidade: ${especialidadeName}`);
    }

    if (doctor.memed_external_id) {
      console.log('\n[Script] Médico já possui memed_external_id. Tentando buscar token...');
      const result = await memedService.getPrescriber(doctor.memed_external_id);
      if (result?.token) {
        console.log('[Script] Token obtido com sucesso!');
        console.log(`  Token: ${result.token.substring(0, 50)}...`);
      } else {
        console.log('[Script] Não foi possível obter o token.');
      }
      process.exit(0);
    }

    console.log('\n[Script] Registrando prescritor na MEMED...');

    const memedResult = await memedService.createPrescriber({
      name: user.name,
      cpf: user.cpf,
      birthDate: user.birth_date,
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      registryType: doctor.registry_type,
      registryNumber: doctor.registry_number,
      registryUf: doctor.registry_uf,
      especialidade: especialidadeName
    });

    if (!memedResult) {
      console.error('[Script] Falha ao registrar na MEMED!');
      process.exit(1);
    }

    console.log('\n[Script] Prescritor registrado com sucesso!');
    console.log(`  external_id: ${memedResult.externalId}`);
    console.log(`  token: ${memedResult.token ? memedResult.token.substring(0, 50) + '...' : 'N/A'}`);

    // Atualizar o banco de dados
    await Doctor.update(
      { memed_external_id: memedResult.externalId },
      { where: { id: doctor.id } }
    );

    console.log('\n[Script] Banco de dados atualizado com memed_external_id!');
    console.log('[Script] Concluído com sucesso!\n');

    process.exit(0);
  } catch (error) {
    console.error('[Script] Erro:', error.message);
    process.exit(1);
  }
}

const userId = process.argv[2];

if (!userId) {
  console.error('Uso: node scripts/register-memed-prescriber.js <user_id>');
  process.exit(1);
}

registerPrescriber(parseInt(userId));

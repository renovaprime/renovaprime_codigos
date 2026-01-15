const cron = require('node-cron');
const db = require('../config/database');
const api = require('../services/rapidocApi');
const bcrypt = require('bcrypt');
// Função para buscar vendas de planos individuais criadas há mais de 24 horas
async function getExpiredIndividualPlans() {
  try {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.query(`
        SELECT 
          v.id,
          v.uuid,
          v.cpf_beneficiario,
          v.data_hora,
          v.tipo
        FROM venda v
        WHERE v.tipo = 'plano_individual'
        AND v.uuid IS NOT NULL
        AND v.data_hora <= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND v.processado IS NULL
        ORDER BY v.data_hora ASC
      `);

      return rows;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching expired individual plans:', error);
    return [];
  }
}

// Função para inativar beneficiário
async function deactivateBeneficiary(uuid) {
  try {
    console.log(`Attempting to deactivate beneficiary with UUID: ${uuid}`);
    
    const response = await api.delete(`/beneficiaries/${uuid}`);
    
    if (response.status === 200) {
      console.log(`Successfully deactivated beneficiary: ${uuid}`);
      return true;
    } else {
      console.error(`Failed to deactivate beneficiary ${uuid}:`, response.data);
      return false;
    }
  } catch (error) {
    console.error(`Error deactivating beneficiary ${uuid}:`, error.response?.data || error.message);
    return false;
  }
}

// Função para marcar venda como processada
async function markSaleAsProcessed(saleId, success = true) {
  try {
    const connection = await db.getConnection();
    try {
      await connection.query(`
        UPDATE venda 
        SET processado = ?, data_processamento = NOW()
        WHERE id = ?
      `, [success ? 'S' : 'N', saleId]);
      
      console.log(`Sale ${saleId} marked as processed: ${success ? 'SUCCESS' : 'FAILED'}`);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(`Error marking sale ${saleId} as processed:`, error);
  }
}

// Função principal do job
async function processExpiredIndividualPlans() {
  try {
    console.log('\n=== Starting expired individual plans deactivation job ===');
    console.log('Timestamp:', new Date().toISOString());

    const expiredPlans = await getExpiredIndividualPlans();
    
    if (expiredPlans.length === 0) {
      console.log('No expired individual plans found.');
      return;
    }

    console.log(`Found ${expiredPlans.length} expired individual plan(s) to process:`);
    
    for (const plan of expiredPlans) {
      console.log(`\nProcessing sale ID: ${plan.id}, UUID: ${plan.uuid}, CPF: ${plan.cpf_beneficiario}`);
      console.log(`Sale created at: ${plan.data_hora}`);
      
      const deactivated = await deactivateBeneficiary(plan.uuid);
      await markSaleAsProcessed(plan.id, deactivated);
      
      // Pequena pausa entre as requisições para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n=== Expired individual plans deactivation job completed ===\n');
    
  } catch (error) {
    console.error('Error in processExpiredIndividualPlans job:', error);
  }
}

// Configurar o cron job para executar a cada 2 horas
const scheduleDeactivationJob = () => {
  // Executa a cada 2 horas (0 */2 * * *)
  const job = cron.schedule('0 */2 * * *', () => {
    processExpiredIndividualPlans();
  }, {
    scheduled: false,
    timezone: "America/Sao_Paulo"
  });

  // Iniciar o job
  job.start();
  console.log('Deactivation cron job scheduled to run every 2 hours');
  
  // Executar imediatamente para teste (opcional)
  // processExpiredIndividualPlans();

  return job;
};

const updateAllPasswords = async () => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT * FROM filial where email like 'indi%@gmail.com'
    `);

    for (const row of rows) {
      const pass = row.email.split('@')[0];
      const newPassword = await bcrypt.hash(pass, 10);
      await connection.query(`UPDATE filial SET senha = ? WHERE id = ?`, [newPassword, row.id]);
      console.log(`Updated password for ${row.email} to ${newPassword}`);
    }
  } catch (error) {
    console.error('Error updating all passwords:', error);
  } finally {
    connection.release();
  }
}

const registerNewSellers = async () => {

  const raw = `
  NOME;CPF;FILIAL ;;
RICARDO MATOS RODRIGUES;1241717613;101;;
NAIRA PAMELA ALMEIDA DE AGUIAR GOMES;11321752679;101;;
BRUNO SERGIO LOIOLA DE AS;12127966678;101;;
ADRIELY SANTOS OLIVEIRA;13915384631;101;;
PATRICIA CRISTINA VAZ;13718365669;101;;
HELLEN ALVES VIANA;11377394603;101;;
LEIDIANE MAGEVES KI;93432291604;101;;
GABRIELLA SOUSA SILVA;.06870551642;101;;
SELMA FERNANDES BARBOSA;.04641186626;101;;
LUIZ GUSTAVO BENEVEIDES;14560719632;101;;
FERNANDA SILVA DE OLIVEIRA;15854966697;55;;
SOLANGE PEREIRA DA SILVA;.01790596610;55;;
CREESE RODRIGUES OLIVEIRA;.08920199647;55;;
DANIELE FAVID DA CRUZ;13985766622;55;;
VICTOR RODRIGUES;.05455672622;55;;
ALINE PEREIRA GONÇALVES;13291498666;55;;
LILLIAN FERNANDA TEIXEIRA;.09061549604;55;;
MARIA APARECIDA FERNANDES LIMA;13216479641;55;;
LUCAS FERREIRA ;18049475719;61;;
RODRIGO GOMES;36484034869;61;;
ALAN SOUSA SANTOS;1973101671;61;;
TALIA;13712475608;61;;
MARCIA REGINA ;14908795606;61;;
KENIA GUIMARAES ;.09497549601;61;;
ECIONE PEREIRA SANTOS;.09601621601;61;;
LUIZ CARLOS SANTOS;89704748353;61;;
MARCELO SANTOS VIEIRA;.01806433559;65;;
KAIQUE NOVAIS;.08814212600;65;;
JAMILLE SANTOS;.04786839523;65;;
ANDRE;.04655572624;65;;
ALEXANDRA;71866167563;65;;
ANTONIO LOPES DA SILVA;.00110754573;65;;
CLEITON ALCANTARA;.04622576570;65;;
SOLANGE ARAUJO;99367874553;65;;
LUANA OLIVEIRA;.02507877502;65;;
DANDARA RIBEIRO;.07564734540;65;;
VELMAR FARIAS;96862440500;65;;
EDUARDO RODRIGUES BASTOS;.09948130669;88;;
PAULINE ARAUJO;12205048660;88;;
CAMILA FEREIRA;38022217883;88;;
MARIANA PEREIRA DA SILVA;22407426827;88;;
OSMARE MARTINS;90460871668;88;;
DANIELA NASCIMENTO SILVA;10246426667;88;;
GILDESIO SOARES FRANCA;78886406649;88;;
BRUNO SOUZA RODRIGUES;13396429648;88;;
MAURICIO PEREIRA SILVA;.06176892619;88;;
JOSUE ESTEVÃO GONÇALVES;15088274602;99;;
JESSICA CRISTINA VIEIRA;.07964594605;99;;
KERCIELY GONÇALVES;10096022680;99;;
PATRICIA SILVA;11109473648;99;;
RODRIGO STEVAM;.03319225685;99;;
FERNANDA LOPES OLIVEIRA;.06179603642;99;;
WILSON DE SOUZA PEREIRA;14410655639;99;;
PAMELA ISADORA M. DE OLIVEIRA;15252758603;99;;
MARIA REGINE ALVES;.07857064610;99;;
SARA TALITA DONATO;13777902667;99;;
JALLYNE DE ALMEIDA;.02880488575;173;;
GIEGO DE JESUS;84766778553;173;;
PAULIANA PINTO FERREIRA;.01918917540;173;;
RITA DE CASSIO;83377123504;173;;
OSEAS PEREIRA;25042254587;173;;
EDIEME OLIVEIRA;.03798946531;173;;
RICARDO FREIRE;.03329276525;200;;
KETLYN FABIA ROCHA DAVID;10697159566;200;;
NAYARA GUIMARÃES;.02345885513;200;;
JUSSARA SALLES;67575471553;200;;
MARCELA ALMEIDA CURCINO;.07461523538;200;;
MARIANA ROCHA CRUZ;35960824809;200;;
ADRIANA VANESSA MARTINS;8679477729;101;;
POLIANA CRISTINA ARAUJO;10789611660;194;;
EDMILSON ALVES DE SOUZA;15472525616;194;;
VERA LUCIA DOS SANTOS;70430470649;194;;
BETANIA DE CASTRO LUTE;12742689664;194;;
ODNEY GOUVEIA DA SILVA;4984626605;113;;
CAMILA AGUIAR OLIVEIRA;8029883692;113;;
ANA FLAVIA MOREIRA SÁ;8127839647;113;;
`;

  const rows = raw.split('\n').map(row => row.split(';'));

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const [name, cpf, filial] = row;
    if (index <= 1 || !name) {
      continue;
    }
    //remove all non numbers and add 0 in the start if the length is less than 11
    const formattedCpf = cpf ? cpf.replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').replace(/\D/g, '').padStart(11, '0') : '';
    console.log(name, cpf, filial, formattedCpf);

    const newPassword = await bcrypt.hash(formattedCpf, 10);

    //insert into revendedores
    const connection = await db.getConnection();
    try {
      const [idFilial] = await connection.query(`
        SELECT f.id FROM filial f WHERE f.email = 'indi${filial}@gmail.com'
      `);
      console.log(idFilial);
      await connection.query(`
        INSERT INTO revendedor (id_filial, nome, cpf, cargo, senha, ativo, data_registro, email)
        VALUES(${idFilial[0].id}, '${name}', '${formattedCpf}', 'Revendedor', '${newPassword}', 1, '2025-07-07', '${formattedCpf}@totalmedi.com.br');
      `);
    } finally {
      connection.release();
    }

  }
}

const updateAllSellersPasswords = async () => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT * FROM revendedor where email like 'rev_indi%@gmail.com'
    `);

    for (const row of rows) {
      //pass should be first 4 numbers of cpf
      const pass = row.cpf;
      const newPassword = await bcrypt.hash(pass, 10);
      await connection.query(`UPDATE revendedor SET senha = ? WHERE id = ?`, [newPassword, row.id]);
      console.log(`Updated password for ${row.email} to ${pass} / ${newPassword}`);
    }
  } catch (error) {
    console.error('Error updating all passwords:', error);
  } finally {
    connection.release();
  }
}

module.exports = {
  scheduleDeactivationJob,
  processExpiredIndividualPlans,
}; 
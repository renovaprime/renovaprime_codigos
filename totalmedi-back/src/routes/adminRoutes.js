const express = require('express');
const { processExpiredIndividualPlans } = require('../jobs/deactivateBeneficiaries');
const db = require('../config/database');

const router = express.Router();

// Rota para executar manualmente o job de inativação
router.post('/run-deactivation-job', async (req, res) => {
  try {
    console.log('Manual execution of deactivation job requested');
    
    // Executar o job
    await processExpiredIndividualPlans();
    
    res.json({
      success: true,
      message: 'Deactivation job executed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error running deactivation job manually:', error);
    res.status(500).json({
      success: false,
      message: 'Error executing deactivation job',
      error: error.message
    });
  }
});

// Rota para verificar status das vendas a serem processadas
router.get('/pending-deactivations', async (req, res) => {
  try {
    const connection = await db.getConnection();
    try {
      // Vendas pendentes de processamento
      const [pendingRows] = await connection.query(`
        SELECT 
          v.id,
          v.uuid,
          v.cpf_beneficiario,
          v.data_hora,
          v.tipo,
          TIMESTAMPDIFF(HOUR, v.data_hora, NOW()) as hours_elapsed
        FROM venda v
        WHERE v.tipo = 'plano_individual'
        AND v.uuid IS NOT NULL
        AND v.processado IS NULL
        ORDER BY v.data_hora ASC
      `);

      // Vendas já processadas nas últimas 24 horas
      const [processedRows] = await connection.query(`
        SELECT 
          v.id,
          v.uuid,
          v.cpf_beneficiario,
          v.data_hora,
          v.data_processamento,
          v.processado,
          TIMESTAMPDIFF(HOUR, v.data_hora, v.data_processamento) as processing_delay_hours
        FROM venda v
        WHERE v.tipo = 'plano_individual'
        AND v.processado IS NOT NULL
        AND v.data_processamento >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY v.data_processamento DESC
      `);

      // Separar vendas prontas para processamento (mais de 24h)
      const readyForDeactivation = pendingRows.filter(row => row.hours_elapsed >= 24);
      const waitingForExpiration = pendingRows.filter(row => row.hours_elapsed < 24);

      res.json({
        success: true,
        data: {
          pending: {
            ready_for_deactivation: readyForDeactivation,
            waiting_for_expiration: waitingForExpiration
          },
          recently_processed: processedRows,
          summary: {
            total_pending: pendingRows.length,
            ready_for_deactivation: readyForDeactivation.length,
            waiting_for_expiration: waitingForExpiration.length,
            recently_processed: processedRows.length
          }
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching deactivation status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deactivation status',
      error: error.message
    });
  }
});

module.exports = router; 
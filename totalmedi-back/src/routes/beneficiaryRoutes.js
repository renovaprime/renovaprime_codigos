const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiaryController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/beneficiaries', beneficiaryController.create);
router.get('/commission-report', authenticateToken, beneficiaryController.getCommissionReport); 
router.get('/beneficiaries-report', authenticateToken, beneficiaryController.getAllSales);
router.post('/beneficiaries/asaas', beneficiaryController.createFromAsaas);
router.get('/beneficiaries', authenticateToken, beneficiaryController.getAll);
router.get('/beneficiaries/cpf/:cpf', beneficiaryController.getByCpf);
router.put('/beneficiaries/:uuid', beneficiaryController.update);
router.delete('/beneficiaries/:uuid', beneficiaryController.delete);
router.put('/beneficiaries/:uuid/reactivate', beneficiaryController.reactivate);
router.get('/beneficiaries/:uuid/request-appointment', beneficiaryController.requestAppointment);

module.exports = router;
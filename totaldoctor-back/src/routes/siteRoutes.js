const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const uploadController = require('../controllers/uploadController');
const validate = require('../validators/validate');
const { createPendingDoctorSchema } = require('../validators/siteDoctorValidator');
const multer = require('multer');

// Configurar multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG ou PDF.'));
    }
  }
});

// Rotas públicas (sem autenticação)

// Listar especialidades ativas
router.get('/specialties', siteController.listActiveSpecialties);

// Upload de documento (público)
router.post(
  '/upload/doctor-document',
  upload.single('file'),
  uploadController.uploadDoctorDocument
);

// Criar profissional pendente
router.post(
  '/doctors',
  validate(createPendingDoctorSchema),
  siteController.createPendingDoctor
);

module.exports = router;

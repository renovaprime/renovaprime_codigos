const uploadService = require('../services/uploadService');
const { successResponse, errorResponse } = require('../utils/response');

class UploadController {
  async uploadDoctorDocument(req, res, next) {
    try {
      // Verificar se o arquivo foi enviado
      if (!req.file) {
        return res.status(400).json(errorResponse('No file uploaded', 'BAD_REQUEST'));
      }

      // Obter tipo de documento do body ou query
      const documentType = req.body.documentType || req.query.documentType;
      
      if (!documentType) {
        return res.status(400).json(errorResponse('Document type is required', 'BAD_REQUEST'));
      }

      // Validar tipo de documento
      const validTypes = ['photo', 'council-doc', 'specialization-doc', 'acceptance-term'];
      if (!validTypes.includes(documentType)) {
        return res.status(400).json(errorResponse('Invalid document type', 'BAD_REQUEST'));
      }

      // Obter pasta baseada no tipo de documento
      const folder = uploadService.getFolderByDocumentType(documentType);

      // Fazer upload
      const url = await uploadService.uploadFile(
        req.file.buffer,
        folder,
        req.file.originalname,
        req.file.mimetype
      );

      return res.json(successResponse({ url }));
    } catch (error) {
      if (error.message === 'Failed to upload file to S3') {
        return res.status(500).json(errorResponse(error.message, 'UPLOAD_ERROR'));
      }
      next(error);
    }
  }

  async getSignedUrl(req, res, next) {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json(errorResponse('URL is required', 'BAD_REQUEST'));
      }

      const signedUrl = await uploadService.getSignedUrl(url);

      if (!signedUrl) {
        return res.status(400).json(errorResponse('Invalid URL format', 'BAD_REQUEST'));
      }

      return res.json(successResponse({ signedUrl }));
    } catch (error) {
      if (error.message === 'Failed to generate signed URL') {
        return res.status(500).json(errorResponse(error.message, 'SIGNING_ERROR'));
      }
      next(error);
    }
  }

  async getSignedUrlsForDoctor(req, res, next) {
    try {
      const urls = {
        photo_url: req.query.photo_url,
        council_doc_url: req.query.council_doc_url,
        specialization_doc_url: req.query.specialization_doc_url,
        acceptance_term_url: req.query.acceptance_term_url
      };

      const signedUrls = await uploadService.getSignedUrlsForDoctor(urls);

      return res.json(successResponse(signedUrls));
    } catch (error) {
      if (error.message === 'Failed to generate signed URLs') {
        return res.status(500).json(errorResponse(error.message, 'SIGNING_ERROR'));
      }
      next(error);
    }
  }
}

module.exports = new UploadController();

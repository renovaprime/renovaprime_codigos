const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, bucketName } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class UploadService {
  /**
   * Faz upload de um arquivo para o S3
   * @param {Buffer} fileBuffer - Buffer do arquivo
   * @param {string} folder - Pasta no S3 (ex: 'doctors/photos')
   * @param {string} originalName - Nome original do arquivo
   * @param {string} mimetype - Tipo MIME do arquivo
   * @returns {Promise<string>} - URL do arquivo no S3
   */
  async uploadFile(fileBuffer, folder, originalName, mimetype) {
    try {
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const uuid = uuidv4();
      const extension = path.extname(originalName);
      const fileName = `${uuid}-${timestamp}${extension}`;
      
      // Path completo no S3
      const key = `${folder}/${fileName}`;

      // Parâmetros do upload
      const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
        // ACL removido - bucket usa policy pública
      };

      // Fazer upload
      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      // Retornar URL do arquivo
      const region = process.env.AWS_REGION || 'us-east-2';
      const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
      
      return url;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Mapeamento de tipo de documento para pasta no S3
   */
  getFolderByDocumentType(documentType) {
    const folderMap = {
      'photo': 'doctors/photos',
      'council-doc': 'doctors/council-docs',
      'specialization-doc': 'doctors/specialization-docs',
      'acceptance-term': 'doctors/acceptance-terms'
    };

    return folderMap[documentType] || 'doctors/others';
  }

  /**
   * Gera uma URL assinada temporária para acesso a um arquivo no S3
   * @param {string} fileUrl - URL completa do arquivo no S3
   * @param {number} expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
   * @returns {Promise<string>} - URL assinada temporária
   */
  async getSignedUrl(fileUrl, expiresIn = 3600) {
    try {
      if (!fileUrl) {
        return null;
      }

      // Extrair a key (caminho) do arquivo da URL
      const region = process.env.AWS_REGION || 'us-east-2';
      const urlPattern = new RegExp(`https://${bucketName}\\.s3\\.${region}\\.amazonaws\\.com/(.+)`);
      const match = fileUrl.match(urlPattern);
      
      if (!match || !match[1]) {
        console.error('Invalid S3 URL format:', fileUrl);
        return null;
      }

      const key = decodeURIComponent(match[1]);

      // Criar comando para obter o objeto
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });

      // Gerar URL assinada
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Gera URLs assinadas para múltiplos arquivos
   * @param {Object} urls - Objeto com as URLs dos documentos
   * @returns {Promise<Object>} - Objeto com as URLs assinadas
   */
  async getSignedUrlsForDoctor(urls) {
    try {
      const signedUrls = {};

      if (urls.photo_url) {
        signedUrls.photo_url = await this.getSignedUrl(urls.photo_url);
      }
      if (urls.council_doc_url) {
        signedUrls.council_doc_url = await this.getSignedUrl(urls.council_doc_url);
      }
      if (urls.specialization_doc_url) {
        signedUrls.specialization_doc_url = await this.getSignedUrl(urls.specialization_doc_url);
      }
      if (urls.acceptance_term_url) {
        signedUrls.acceptance_term_url = await this.getSignedUrl(urls.acceptance_term_url);
      }

      return signedUrls;
    } catch (error) {
      console.error('Error generating signed URLs for doctor:', error);
      throw new Error('Failed to generate signed URLs');
    }
  }
}

module.exports = new UploadService();

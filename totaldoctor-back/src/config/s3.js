const { S3Client } = require('@aws-sdk/client-s3');

// Criar cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configurações do bucket
const bucketName = process.env.S3_BUCKET_NAME || 'totaldoctor-documents';

module.exports = {
  s3Client,
  bucketName
};

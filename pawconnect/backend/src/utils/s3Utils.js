const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, S3_BUCKET } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @param {string} folder - S3 folder (e.g., 'pets', 'users')
 * @returns {Promise<string>} - S3 URL
 */
const uploadToS3 = async (fileBuffer, fileName, mimeType, folder = 'pets') => {
  try {
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    // Return public URL
    const url = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
    return url;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload image to S3');
  }
};

/**
 * Upload multiple files to S3
 * @param {Array} files - Array of file objects with buffer, originalname, mimetype
 * @param {string} folder - S3 folder
 * @returns {Promise<Array<string>>} - Array of S3 URLs
 */
const uploadMultipleToS3 = async (files, folder = 'pets') => {
  try {
    const uploadPromises = files.map(file =>
      uploadToS3(file.buffer, file.originalname, file.mimetype, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple S3 upload error:', error);
    throw new Error('Failed to upload images to S3');
  }
};

/**
 * Delete a file from S3
 * @param {string} fileUrl - Full S3 URL
 * @returns {Promise<void>}
 */
const deleteFromS3 = async (fileUrl) => {
  try {
    // Extract key from URL
    const key = fileUrl.split('.com/')[1];
    
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete image from S3');
  }
};

/**
 * Delete multiple files from S3
 * @param {Array<string>} fileUrls - Array of S3 URLs
 * @returns {Promise<void>}
 */
const deleteMultipleFromS3 = async (fileUrls) => {
  try {
    const deletePromises = fileUrls.map(url => deleteFromS3(url));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Multiple S3 delete error:', error);
    throw new Error('Failed to delete images from S3');
  }
};

/**
 * Generate a presigned URL for secure file access
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
 * @returns {Promise<string>} - Presigned URL
 */
const getPresignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Presigned URL error:', error);
    throw new Error('Failed to generate presigned URL');
  }
};

module.exports = {
  uploadToS3,
  uploadMultipleToS3,
  deleteFromS3,
  deleteMultipleFromS3,
  getPresignedUrl,
};

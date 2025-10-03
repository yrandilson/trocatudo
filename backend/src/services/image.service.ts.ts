// backend/src/services/image.service.ts
import sharp from 'sharp';
import AWS from 'aws-sdk';

export class ImageService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
  }

  async processAndUpload(file: Express.Multer.File) {
    const sizes = [
      { name: 'thumb', width: 150, height: 150 },
      { name: 'medium', width: 500, height: 500 },
      { name: 'large', width: 1200, height: 1200 }
    ];

    const results = [];

    for (const size of sizes) {
      const buffer = await sharp(file.buffer)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      const key = `items/${Date.now()}-${size.name}-${file.originalname}`;
      
      await this.s3.upload({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg'
      }).promise();

      results.push({
        size: size.name,
        url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`
      });
    }

    return results;
  }
}
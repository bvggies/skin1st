# Cloudinary Setup

Cloudinary has been configured and integrated into the application. 

## Environment Variables

Add the following to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME="djqhvuyf4"
CLOUDINARY_API_KEY="615353295366598"
CLOUDINARY_API_SECRET="GvIXrhHC45yzmKpPVp7GuK1PvzI"
```

## Features

- ✅ Cloudinary package installed
- ✅ Image upload endpoint configured (`/api/upload.image`)
- ✅ Supports base64 file uploads
- ✅ Automatic image optimization (max 1200x1200, auto quality/format)
- ✅ Images stored in `skin1st/products` folder
- ✅ Fallback to URL acceptance if Cloudinary not configured

## Usage

### For Admin Users

When adding product images through the admin panel:
1. Upload images will be automatically sent to Cloudinary
2. Images are optimized and stored securely
3. URLs are returned and saved to the database

### API Endpoint

**POST** `/api/upload.image`

**Body:**
```json
{
  "file": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "alt": "Product image description"
}
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/djqhvuyf4/image/upload/...",
  "publicId": "skin1st/products/xyz123",
  "alt": "Product image description"
}
```

## Notes

- Images are automatically optimized for web delivery
- Maximum dimensions: 1200x1200px (maintains aspect ratio)
- Quality and format are automatically optimized
- All images use HTTPS (secure_url)


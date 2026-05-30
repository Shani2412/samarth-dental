const prisma      = require('../config/db');
const { success, error } = require('../utils/response');
const cloudinary  = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const VALID_CATEGORIES = ['CLINIC', 'DOCTOR', 'TREATMENT', 'BEFORE_AFTER', 'GALLERY'];

// Upload buffer to Cloudinary
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `samarth-dental/${folder}`, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (err, result) => err ? reject(err) : resolve(result)
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// ── POST /api/admin/photos ── Upload photo
async function uploadPhoto(req, res) {
  try {
    if (!req.file) return error(res, 'No file uploaded', 400);

    const { category = 'GALLERY', title = '', description = '' } = req.body;

    if (!VALID_CATEGORIES.includes(category.toUpperCase()))
      return error(res, `Invalid category. Use: ${VALID_CATEGORIES.join(', ')}`, 400);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, category.toLowerCase());

    const count = await prisma.photo.count({ where: { category: category.toUpperCase() } });

    const photo = await prisma.photo.create({
      data: {
        url:         result.secure_url,
        filename:    result.public_id,
        category:    category.toUpperCase(),
        title:       title || '',
        description: description || '',
        order:       count,
      },
    });

    return success(res, { photo }, 'Photo uploaded successfully!', 201);
  } catch (e) {
    console.error('[uploadPhoto]', e);
    return error(res, 'Upload failed');
  }
}

// ── GET /api/photos ── Public
async function getPhotos(req, res) {
  try {
    res.set('Cache-Control', 'public, max-age=60');
    const { category } = req.query;
    const where = category ? { category: category.toUpperCase() } : {};

    const photos = await prisma.photo.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });

    const grouped = photos.reduce((acc, photo) => {
      if (!acc[photo.category]) acc[photo.category] = [];
      acc[photo.category].push(photo);
      return acc;
    }, {});

    return success(res, { photos, grouped });
  } catch (e) {
    return error(res, 'Could not fetch photos');
  }
}

// ── GET /api/admin/photos ── Admin
async function getAllPhotos(req, res) {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
    return success(res, { photos });
  } catch (e) {
    return error(res, 'Could not fetch photos');
  }
}

// ── PATCH /api/admin/photos/:id ──
async function updatePhoto(req, res) {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

    const exists = await prisma.photo.findUnique({ where: { id } });
    if (!exists) return error(res, 'Photo not found', 404);

    const updated = await prisma.photo.update({
      where: { id },
      data: {
        ...(title       !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(order       !== undefined && { order: parseInt(order) }),
      },
    });

    return success(res, { photo: updated }, 'Photo updated');
  } catch (e) {
    return error(res, 'Could not update photo');
  }
}

// ── DELETE /api/admin/photos/:id ──
async function deletePhoto(req, res) {
  try {
    const { id } = req.params;
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) return error(res, 'Photo not found', 404);

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(photo.filename).catch(console.error);

    await prisma.photo.delete({ where: { id } });
    return success(res, {}, 'Photo deleted successfully');
  } catch (e) {
    return error(res, 'Could not delete photo');
  }
}

module.exports = { uploadPhoto, getPhotos, getAllPhotos, updatePhoto, deletePhoto };

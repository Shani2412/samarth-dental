const prisma = require('../config/db');
const path   = require('path');
const fs     = require('fs');
const { success, error } = require('../utils/response');

const VALID_CATEGORIES = ['CLINIC', 'DOCTOR', 'TREATMENT', 'BEFORE_AFTER', 'GALLERY'];

// ── POST /api/admin/photos ── Upload photo
async function uploadPhoto(req, res) {
  try {
    if (!req.file) return error(res, 'No file uploaded', 400);

    const { category = 'GALLERY', title = '', description = '' } = req.body;

    if (!VALID_CATEGORIES.includes(category.toUpperCase()))
      return error(res, `Invalid category. Use: ${VALID_CATEGORIES.join(', ')}`, 400);

    // Get next order number for this category
    const count = await prisma.photo.count({ where: { category: category.toUpperCase() } });

    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
    const url     = `${baseUrl}/uploads/${req.file.filename}`;

    const photo = await prisma.photo.create({
      data: {
        url,
        filename:    req.file.filename,
        category:    category.toUpperCase(),
        title:       title || '',
        description: description || '',
        order:       count,
      },
    });

    return success(res, { photo }, 'Photo uploaded successfully!', 201);
  } catch (e) {
    // Clean up uploaded file on error
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    console.error('[uploadPhoto]', e);
    return error(res, 'Upload failed');
  }
}

// ── GET /api/photos ── Public: get all photos (grouped by category)
async function getPhotos(req, res) {
  try {
    const { category } = req.query;
    const where = category ? { category: category.toUpperCase() } : {};

    const photos = await prisma.photo.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });

    // Group by category
    const grouped = photos.reduce((acc, photo) => {
      if (!acc[photo.category]) acc[photo.category] = [];
      acc[photo.category].push(photo);
      return acc;
    }, {});

    return success(res, { photos, grouped });
  } catch (e) {
    console.error('[getPhotos]', e);
    return error(res, 'Could not fetch photos');
  }
}

// ── GET /api/admin/photos ── Admin: get all photos with details
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

// ── PATCH /api/admin/photos/:id ── Update photo info
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
    console.error('[updatePhoto]', e);
    return error(res, 'Could not update photo');
  }
}

// ── DELETE /api/admin/photos/:id ── Delete photo
async function deletePhoto(req, res) {
  try {
    const { id } = req.params;
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) return error(res, 'Photo not found', 404);

    // Delete from filesystem
    const filePath = path.join(__dirname, '../../uploads', photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.photo.delete({ where: { id } });
    return success(res, {}, 'Photo deleted successfully');
  } catch (e) {
    console.error('[deletePhoto]', e);
    return error(res, 'Could not delete photo');
  }
}

module.exports = { uploadPhoto, getPhotos, getAllPhotos, updatePhoto, deletePhoto };

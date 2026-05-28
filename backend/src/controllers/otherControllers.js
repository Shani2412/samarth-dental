const prisma = require('../config/db');
const { success, error } = require('../utils/response');

// ── REVIEWS ──

async function getApproved(req, res) {
  try {
    const reviews = await prisma.review.findMany({
      where: { approved: true }, orderBy: { createdAt: 'desc' },
      select: { id:true, name:true, location:true, stars:true, text:true, createdAt:true },
    });
    return success(res, { reviews });
  } catch (e) { return error(res, 'Could not fetch reviews'); }
}

async function createReview(req, res) {
  try {
    const { stars, text, location } = req.body;
    const review = await prisma.review.create({
      data: { userId: req.user.id, name: req.user.name, location: location||'Mehsana', stars: +stars, text, approved: false },
    });
    return success(res, { review }, 'Review submitted! Appears after approval.', 201);
  } catch (e) { return error(res, 'Could not submit review'); }
}

async function getAllReviews(req, res) {
  try {
    const { approved } = req.query;
    const where = {};
    if (approved === 'true')  where.approved = true;
    if (approved === 'false') where.approved = false;
    const reviews = await prisma.review.findMany({ where, orderBy: { createdAt: 'desc' } });
    return success(res, { reviews });
  } catch (e) { return error(res, 'Could not fetch reviews'); }
}

async function updateReview(req, res) {
  try {
    const exists = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!exists) return error(res, 'Review not found', 404);
    const updated = await prisma.review.update({
      where: { id: req.params.id }, data: { approved: Boolean(req.body.approved) },
    });
    return success(res, { review: updated }, req.body.approved ? 'Review approved!' : 'Review unpublished');
  } catch (e) { return error(res, 'Could not update review'); }
}

async function deleteReview(req, res) {
  try {
    const exists = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!exists) return error(res, 'Review not found', 404);
    await prisma.review.delete({ where: { id: req.params.id } });
    return success(res, {}, 'Review deleted');
  } catch (e) { return error(res, 'Could not delete review'); }
}

// ── ADMIN ──

async function getStats(req, res) {
  try {
    const [total, pending, confirmed, cancelled, totalRev, pendingRev, users] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
      prisma.review.count(),
      prisma.review.count({ where: { approved: false } }),
      prisma.user.count({ where: { role: 'USER' } }),
    ]);
    return success(res, { appointments: { total, pending, confirmed, cancelled }, reviews: { total: totalRev, pending: pendingRev }, users: { total: users } });
  } catch (e) { return error(res, 'Could not fetch stats'); }
}

async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' }, orderBy: { createdAt: 'desc' },
      select: { id:true, name:true, email:true, createdAt:true, _count: { select: { appointments:true, reviews:true } } },
    });
    return success(res, { users });
  } catch (e) { return error(res, 'Could not fetch users'); }
}


// ── REPORTS ──

async function getReports(req, res) {
  try {
    const now   = new Date();
    const year  = parseInt(req.query.year) || now.getFullYear();

    // Monthly appointments for the year
    const allAppointments = await prisma.appointment.findMany({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31T23:59:59`),
        },
      },
      select: { createdAt: true, status: true, service: true },
    });

    // Monthly visit revenue
    const allVisits = await prisma.visitRecord.findMany({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31T23:59:59`),
        },
      },
      select: { amountCharged: true, createdAt: true, treatment: true },
    });

    // Build monthly data
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      name: new Date(year, i).toLocaleString('en-IN', { month: 'short' }),
      appointments: 0,
      confirmed: 0,
      cancelled: 0,
      revenue: 0,
    }));

    allAppointments.forEach(a => {
      const m = new Date(a.createdAt).getMonth();
      months[m].appointments++;
      if (a.status === 'CONFIRMED') months[m].confirmed++;
      if (a.status === 'CANCELLED') months[m].cancelled++;
    });

    allVisits.forEach(v => {
      const m = new Date(v.createdAt).getMonth();
      months[m].revenue += v.amountCharged || 0;
    });

    // Service popularity
    const serviceCounts = {};
    allAppointments.forEach(a => {
      serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1;
    });
    const popularServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Treatment revenue breakdown
    const treatmentRevenue = {};
    allVisits.forEach(v => {
      if (v.amountCharged) {
        treatmentRevenue[v.treatment] = (treatmentRevenue[v.treatment] || 0) + v.amountCharged;
      }
    });
    const revenueByTreatment = Object.entries(treatmentRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, amount]) => ({ name, amount }));

    // Summary totals
    const totalAppointments = allAppointments.length;
    const totalConfirmed    = allAppointments.filter(a => a.status === 'CONFIRMED').length;
    const totalCancelled    = allAppointments.filter(a => a.status === 'CANCELLED').length;
    const totalRevenue      = allVisits.reduce((sum, v) => sum + (v.amountCharged || 0), 0);

    // New patients this year
    const newPatients = await prisma.user.count({
      where: {
        role: 'USER',
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31T23:59:59`),
        },
      },
    });

    return success(res, {
      year,
      summary: { totalAppointments, totalConfirmed, totalCancelled, totalRevenue, newPatients },
      monthly: months,
      popularServices,
      revenueByTreatment,
    });
  } catch (e) { console.error(e); return error(res, 'Could not fetch reports'); }
}

module.exports = {
  getApproved, createReview, getAllReviews, updateReview, deleteReview,
  getStats, getAllUsers, getReports,
};

const prisma = require('../config/db');
const config = require('../config/env');
const { success, error, paginate } = require('../utils/response');
const { sendEmail, templates }     = require('../utils/email');
const { notifyNewBooking, notifyBookingConfirmed, notifyPatientBooking, notifyPatientConfirmed } = require('../utils/whatsapp');

// POST /api/appointments
async function create(req, res) {
  try {
    const { phone, service, date, time, message } = req.body;
    const { user } = req;

    const appointment = await prisma.appointment.create({
      data: { userId: user.id, name: user.name, email: user.email, phone, service, date: date||null, time: time||null, message: message||null },
    });

    // Notify clinic
    if (config.email.clinicEmail)
      sendEmail(config.email.clinicEmail, `🦷 New Appointment – ${user.name}`,
        templates.newBookingAdmin({ name: user.name, email: user.email, phone, service, date, time, message }));

    // WhatsApp to doctor
    notifyNewBooking({ name: user.name, phone, service, date, time, message }).catch(console.error);

    // WhatsApp confirmation to patient
    notifyPatientBooking({ name: user.name, phone, service, date, time }).catch(console.error);

    // Confirm to patient
    sendEmail(user.email, `✅ Appointment Received – ${config.clinic.name}`,
      templates.appointmentReceived(user.name, service, date, time));

    return success(res, { appointment }, 'Appointment booked!', 201);
  } catch (e) {
    console.error('[createAppointment]', e);
    return error(res, 'Could not book appointment');
  }
}

// GET /api/appointments/my
async function getMyAppointments(req, res) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: req.user.id }, orderBy: { createdAt: 'desc' },
    });
    return success(res, { appointments });
  } catch (e) { return error(res, 'Could not fetch appointments'); }
}

// GET /api/admin/appointments (admin)
async function getAll(req, res) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status && status !== 'all') where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { name:    { contains: search, mode: 'insensitive' } },
        { phone:   { contains: search } },
        { service: { contains: search, mode: 'insensitive' } },
        { email:   { contains: search, mode: 'insensitive' } },
      ];
    }
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: +limit }),
      prisma.appointment.count({ where }),
    ]);
    return paginate(res, appointments, total, page, limit);
  } catch (e) { return error(res, 'Could not fetch appointments'); }
}

// PATCH /api/admin/appointments/:id
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) return error(res, 'Appointment not found', 404);

    const updated = await prisma.appointment.update({
      where: { id }, data: { status: status.toUpperCase() },
    });

    if (status.toUpperCase() === 'CONFIRMED') {
      notifyBookingConfirmed({ name: appt.name, phone: appt.phone, service: appt.service, date: appt.date, time: appt.time }).catch(console.error);
      notifyPatientConfirmed({ name: appt.name, phone: appt.phone, service: appt.service, date: appt.date, time: appt.time }).catch(console.error);
      if (appt.email)
      sendEmail(appt.email, `🎉 Appointment Confirmed – ${config.clinic.name}`,
        templates.appointmentConfirmed(appt.name, appt.service, appt.date, appt.time));
    }

    return success(res, { appointment: updated }, 'Status updated');
  } catch (e) { return error(res, 'Could not update appointment'); }
}

// DELETE /api/admin/appointments/:id
async function remove(req, res) {
  try {
    const exists = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!exists) return error(res, 'Appointment not found', 404);
    await prisma.appointment.delete({ where: { id: req.params.id } });
    return success(res, {}, 'Appointment deleted');
  } catch (e) { return error(res, 'Could not delete appointment'); }
}

module.exports = { create, getMyAppointments, getAll, updateStatus, remove };

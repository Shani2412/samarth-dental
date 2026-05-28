const prisma = require('../config/db');
const { success, error } = require('../utils/response');

// ── ADMIN: Get all patients with records ──
async function getAllPatients(req, res) {
  try {
    const { search = '' } = req.query;
    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
        OR: search ? [
          { name:  { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        patientRecord: { include: { visits: { orderBy: { visitDate: 'desc' }, take: 1 } } },
        appointments:  { orderBy: { createdAt: 'desc' }, take: 1 },
        _count:        { select: { appointments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return success(res, { patients: users });
  } catch (e) { return error(res, 'Could not fetch patients'); }
}

// ── ADMIN: Get single patient full record ──
async function getPatient(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        patientRecord: { include: { visits: { orderBy: { visitDate: 'desc' } } } },
        appointments:  { orderBy: { createdAt: 'desc' } },
        _count:        { select: { appointments: true } },
      },
    });
    if (!user) return error(res, 'Patient not found', 404);
    return success(res, { patient: user });
  } catch (e) { return error(res, 'Could not fetch patient'); }
}

// ── ADMIN: Create or update patient medical record ──
async function upsertRecord(req, res) {
  try {
    const { bloodGroup, allergies, existingProblems, lastDentalVisit, notes } = req.body;
    const record = await prisma.patientRecord.upsert({
      where:  { userId: req.params.id },
      create: { userId: req.params.id, bloodGroup, allergies, existingProblems, lastDentalVisit, notes },
      update: { bloodGroup, allergies, existingProblems, lastDentalVisit, notes },
    });
    return success(res, { record }, 'Patient record saved!');
  } catch (e) { return error(res, 'Could not save record'); }
}

// ── ADMIN: Add visit record ──
async function addVisit(req, res) {
  try {
    const { visitDate, treatment, toothNumbers, medicines, notes, nextVisitDate, amountCharged, appointmentId } = req.body;
    if (!visitDate || !treatment) return error(res, 'Visit date and treatment are required', 400);

    // Ensure patient record exists
    let record = await prisma.patientRecord.findUnique({ where: { userId: req.params.id } });
    if (!record) {
      record = await prisma.patientRecord.create({ data: { userId: req.params.id } });
    }

    const visit = await prisma.visitRecord.create({
      data: {
        patientRecordId: record.id,
        appointmentId:   appointmentId || null,
        visitDate, treatment,
        toothNumbers: toothNumbers || null,
        medicines:    medicines    || null,
        notes:        notes        || null,
        nextVisitDate: nextVisitDate || null,
        amountCharged: amountCharged ? parseFloat(amountCharged) : null,
      },
    });
    return success(res, { visit }, 'Visit added!', 201);
  } catch (e) { console.error(e); return error(res, 'Could not add visit'); }
}

// ── ADMIN: Update visit record ──
async function updateVisit(req, res) {
  try {
    const visit = await prisma.visitRecord.findUnique({ where: { id: req.params.visitId } });
    if (!visit) return error(res, 'Visit not found', 404);
    const updated = await prisma.visitRecord.update({
      where: { id: req.params.visitId },
      data:  req.body,
    });
    return success(res, { visit: updated }, 'Visit updated!');
  } catch (e) { return error(res, 'Could not update visit'); }
}

// ── ADMIN: Delete visit ──
async function deleteVisit(req, res) {
  try {
    await prisma.visitRecord.delete({ where: { id: req.params.visitId } });
    return success(res, {}, 'Visit deleted');
  } catch (e) { return error(res, 'Could not delete visit'); }
}

// ── PATIENT: View own record ──
async function myRecord(req, res) {
  try {
    const record = await prisma.patientRecord.findUnique({
      where:   { userId: req.user.id },
      include: { visits: { orderBy: { visitDate: 'desc' } } },
    });
    return success(res, { record: record || null });
  } catch (e) { return error(res, 'Could not fetch your record'); }
}

module.exports = { getAllPatients, getPatient, upsertRecord, addVisit, updateVisit, deleteVisit, myRecord };

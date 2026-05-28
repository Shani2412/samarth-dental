
const prisma = require('../config/db');
const { success, error } = require('../utils/response');


// ADMIN add treatment
async function createTreatment(req, res) {

  try {

    const {
      patientId,
      appointmentId,
      treatmentName,
      treatmentDetails,
      medicines,
      doctorNotes,
      cost
    } = req.body;

    const treatment = await prisma.treatmentRecord.create({

      data: {
        patientId,
        appointmentId,
        treatmentName,
        treatmentDetails,
        medicines,
        doctorNotes,
        cost: cost ? parseFloat(cost) : null
      }

    });

    return success(res, { treatment }, 'Treatment added');

  } catch (e) {

    console.error(e);

    return error(res, 'Could not create treatment');

  }

}


// PATIENT own history
async function getMyHistory(req, res) {

  try {

    const history = await prisma.treatmentRecord.findMany({

      where: {
        patientId: req.user.id
      },

      orderBy: {
        visitDate: 'desc'
      }

    });

    return success(res, { history });

  } catch (e) {

    console.error(e);

    return error(res, 'Could not fetch history');

  }

}


// ADMIN patient history
async function getPatientHistory(req, res) {

  try {

    const history = await prisma.treatmentRecord.findMany({

      where: {
        patientId: req.params.patientId
      },

      orderBy: {
        visitDate: 'desc'
      }

    });

    return success(res, { history });

  } catch (e) {

    console.error(e);

    return error(res, 'Could not fetch patient history');

  }

}


module.exports = {
  createTreatment,
  getMyHistory,
  getPatientHistory
};
/*
  Warnings:

  - The values [COMPLETED] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `patient_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `treatment_records` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
ALTER TABLE "appointments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "AppointmentStatus_old";
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "patient_profiles" DROP CONSTRAINT "patient_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "treatment_records" DROP CONSTRAINT "treatment_records_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "treatment_records" DROP CONSTRAINT "treatment_records_patientId_fkey";

-- DropTable
DROP TABLE "patient_profiles";

-- DropTable
DROP TABLE "treatment_records";

-- CreateTable
CREATE TABLE "patient_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "allergies" TEXT,
    "existingProblems" TEXT,
    "lastDentalVisit" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_records" (
    "id" TEXT NOT NULL,
    "patientRecordId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "visitDate" TEXT NOT NULL,
    "treatment" TEXT NOT NULL,
    "toothNumbers" TEXT,
    "medicines" TEXT,
    "notes" TEXT,
    "nextVisitDate" TEXT,
    "amountCharged" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visit_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_records_userId_key" ON "patient_records"("userId");

-- AddForeignKey
ALTER TABLE "patient_records" ADD CONSTRAINT "patient_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_records" ADD CONSTRAINT "visit_records_patientRecordId_fkey" FOREIGN KEY ("patientRecordId") REFERENCES "patient_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

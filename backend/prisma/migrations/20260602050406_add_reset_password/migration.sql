-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetExpiry" TIMESTAMP(3),
ADD COLUMN     "resetToken" TEXT;

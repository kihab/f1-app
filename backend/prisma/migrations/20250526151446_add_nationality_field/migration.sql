/*
  Warnings:

  - You are about to alter the column `driverRef` on the `Driver` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `name` on the `Driver` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `name` on the `Race` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- DropIndex
DROP INDEX "Season_year_championDriverId_key";

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "nationality" VARCHAR(50),
ALTER COLUMN "driverRef" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Race" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- CreateIndex
CREATE INDEX "Race_seasonYear_idx" ON "Race"("seasonYear");

-- CreateIndex
CREATE INDEX "Race_winnerDriverId_idx" ON "Race"("winnerDriverId");

-- CreateIndex
CREATE INDEX "Season_championDriverId_idx" ON "Season"("championDriverId");

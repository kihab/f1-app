-- CreateTable
CREATE TABLE "Driver" (
    "id" SERIAL NOT NULL,
    "driverRef" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "year" INTEGER NOT NULL,
    "championDriverId" INTEGER NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "Race" (
    "id" SERIAL NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "winnerDriverId" INTEGER NOT NULL,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_driverRef_key" ON "Driver"("driverRef");

-- CreateIndex
CREATE UNIQUE INDEX "Season_year_championDriverId_key" ON "Season"("year", "championDriverId");

-- CreateIndex
CREATE UNIQUE INDEX "Race_seasonYear_round_key" ON "Race"("seasonYear", "round");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_championDriverId_fkey" FOREIGN KEY ("championDriverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_winnerDriverId_fkey" FOREIGN KEY ("winnerDriverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_seasonYear_fkey" FOREIGN KEY ("seasonYear") REFERENCES "Season"("year") ON DELETE RESTRICT ON UPDATE CASCADE;

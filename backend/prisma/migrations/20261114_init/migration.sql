-- CreateTable
CREATE TABLE "TaxGroup" (
    "id" SERIAL NOT NULL,
    "taxName" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxGroup_pkey" PRIMARY KEY ("id")
);

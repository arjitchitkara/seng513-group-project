-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('APPROVE', 'REJECT', 'NEW');

-- CreateTable
CREATE TABLE "ModeratorActivity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "documentTitle" TEXT NOT NULL,
    "documentId" TEXT,
    "moderatorId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModeratorActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModeratorActivity" ADD CONSTRAINT "ModeratorActivity_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeratorActivity" ADD CONSTRAINT "ModeratorActivity_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE; 
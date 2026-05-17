-- CreateTable
CREATE TABLE "Design" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "input" JSONB NOT NULL,
    "architecture" JSONB NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Design_parentId_idx" ON "Design"("parentId");

-- CreateIndex
CREATE INDEX "Design_createdAt_idx" ON "Design"("createdAt");

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Design"("id") ON DELETE SET NULL ON UPDATE CASCADE;

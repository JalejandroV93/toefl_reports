-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "group" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "recommendations" JSONB NOT NULL,
    "distribution" JSONB NOT NULL,
    "analysis" JSONB,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "reading" DOUBLE PRECISION NOT NULL,
    "listening" DOUBLE PRECISION NOT NULL,
    "speaking" DOUBLE PRECISION NOT NULL,
    "writing" DOUBLE PRECISION NOT NULL,
    "speakingFeedback" TEXT,
    "writingFeedback" TEXT,
    "shareToken" TEXT NOT NULL,
    "recommendations" JSONB NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedAccess" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SharedAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Report_shareToken_key" ON "Report"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "Student_shareToken_key" ON "Student"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "SharedAccess_token_key" ON "SharedAccess"("token");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

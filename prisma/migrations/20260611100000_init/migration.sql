-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'ACTIVE', 'WAITING', 'DEMO_BOOKED', 'DOCUMENTS_REQUESTED', 'DOCUMENTS_RECEIVED', 'LOOM_SENT', 'PILOT_PROPOSED', 'CLOSED_WON', 'CLOSED_LOST', 'DISQUALIFIED', 'NOT_INTERESTED', 'PAUSED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "StepChannel" AS ENUM ('EMAIL', 'PHONE', 'VOICEMAIL', 'DEMO', 'DOCUMENT_REQUEST', 'LOOM', 'MANUAL', 'CLOSE', 'BREAKUP');

-- CreateEnum
CREATE TYPE "JourneyEventType" AS ENUM ('LEAD_STARTED', 'STEP_ENTERED', 'TASK_CREATED', 'TASK_COMPLETED', 'OUTCOME_SELECTED', 'NEXT_STEP_SCHEDULED', 'TERMINAL_REACHED', 'MANUAL_OVERRIDE', 'CUSTOM_OUTCOME_SELECTED', 'SCRIPT_VERSION_MIGRATED', 'CLOSED_WON', 'CLOSED_LOST', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('LEAD_CREATED', 'LEAD_STARTED', 'TASK_CREATED', 'TASK_COMPLETED', 'OUTCOME_SELECTED', 'EMAIL_SENT', 'PHONE_CALL', 'VOICEMAIL_LEFT', 'DEMO_BOOKED', 'DOCUMENTS_REQUESTED', 'DOCUMENTS_RECEIVED', 'LOOM_SENT', 'PILOT_PROPOSED', 'STATUS_CHANGED', 'NOTE_ADDED', 'MANUAL_OVERRIDE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Script" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScriptVersion" (
    "id" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScriptVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScriptStep" (
    "id" TEXT NOT NULL,
    "scriptVersionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "StepChannel" NOT NULL,
    "subject" TEXT,
    "scriptText" TEXT NOT NULL,
    "instructions" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isStartStep" BOOLEAN NOT NULL DEFAULT false,
    "isTerminalStep" BOOLEAN NOT NULL DEFAULT false,
    "defaultDelayDays" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "positionX" DOUBLE PRECISION,
    "positionY" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScriptStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScriptOutcome" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "description" TEXT,
    "nextStepId" TEXT,
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "setLeadStatus" "LeadStatus",
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "requiresNote" BOOLEAN NOT NULL DEFAULT false,
    "requiresDateTime" BOOLEAN NOT NULL DEFAULT false,
    "requiresContact" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScriptOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "scriptVersionId" TEXT,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT,
    "website" TEXT,
    "source" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "currentStepId" TEXT,
    "nextTaskAt" TIMESTAMP(3),
    "lastContactedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "tags" JSONB,
    "customFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "userId" TEXT,
    "stepId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TaskPriority" NOT NULL DEFAULT 'NORMAL',
    "completedAt" TIMESTAMP(3),
    "completedOutcomeId" TEXT,
    "completedNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyEvent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "JourneyEventType" NOT NULL,
    "scriptVersionIdSnapshot" TEXT,
    "scriptVersionNumberSnapshot" INTEGER,
    "stepIdSnapshot" TEXT,
    "stepKey" TEXT,
    "stepMetricKey" TEXT,
    "stepNameSnapshot" TEXT,
    "outcomeIdSnapshot" TEXT,
    "outcomeKey" TEXT,
    "outcomeMetricKey" TEXT,
    "outcomeLabelSnapshot" TEXT,
    "leadStatusSnapshot" "LeadStatus",
    "title" TEXT NOT NULL,
    "body" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "userId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ScriptVersion_scriptId_version_key" ON "ScriptVersion"("scriptId", "version");

-- CreateIndex
CREATE INDEX "ScriptStep_scriptVersionId_idx" ON "ScriptStep"("scriptVersionId");

-- CreateIndex
CREATE INDEX "ScriptStep_metricKey_idx" ON "ScriptStep"("metricKey");

-- CreateIndex
CREATE UNIQUE INDEX "ScriptStep_scriptVersionId_key_key" ON "ScriptStep"("scriptVersionId", "key");

-- CreateIndex
CREATE INDEX "ScriptOutcome_stepId_idx" ON "ScriptOutcome"("stepId");

-- CreateIndex
CREATE INDEX "ScriptOutcome_nextStepId_idx" ON "ScriptOutcome"("nextStepId");

-- CreateIndex
CREATE INDEX "ScriptOutcome_metricKey_idx" ON "ScriptOutcome"("metricKey");

-- CreateIndex
CREATE UNIQUE INDEX "ScriptOutcome_stepId_key_key" ON "ScriptOutcome"("stepId", "key");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_nextTaskAt_idx" ON "Lead"("nextTaskAt");

-- CreateIndex
CREATE INDEX "Lead_companyName_idx" ON "Lead"("companyName");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Task_dueAt_idx" ON "Task"("dueAt");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_leadId_idx" ON "Task"("leadId");

-- CreateIndex
CREATE INDEX "Activity_leadId_idx" ON "Activity"("leadId");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE INDEX "JourneyEvent_leadId_idx" ON "JourneyEvent"("leadId");

-- CreateIndex
CREATE INDEX "JourneyEvent_type_idx" ON "JourneyEvent"("type");

-- CreateIndex
CREATE INDEX "JourneyEvent_stepKey_idx" ON "JourneyEvent"("stepKey");

-- CreateIndex
CREATE INDEX "JourneyEvent_stepMetricKey_idx" ON "JourneyEvent"("stepMetricKey");

-- CreateIndex
CREATE INDEX "JourneyEvent_outcomeKey_idx" ON "JourneyEvent"("outcomeKey");

-- CreateIndex
CREATE INDEX "JourneyEvent_outcomeMetricKey_idx" ON "JourneyEvent"("outcomeMetricKey");

-- CreateIndex
CREATE INDEX "JourneyEvent_occurredAt_idx" ON "JourneyEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "Note_leadId_idx" ON "Note"("leadId");

-- AddForeignKey
ALTER TABLE "Script" ADD CONSTRAINT "Script_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScriptVersion" ADD CONSTRAINT "ScriptVersion_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScriptStep" ADD CONSTRAINT "ScriptStep_scriptVersionId_fkey" FOREIGN KEY ("scriptVersionId") REFERENCES "ScriptVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScriptOutcome" ADD CONSTRAINT "ScriptOutcome_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ScriptStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScriptOutcome" ADD CONSTRAINT "ScriptOutcome_nextStepId_fkey" FOREIGN KEY ("nextStepId") REFERENCES "ScriptStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_scriptVersionId_fkey" FOREIGN KEY ("scriptVersionId") REFERENCES "ScriptVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_currentStepId_fkey" FOREIGN KEY ("currentStepId") REFERENCES "ScriptStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ScriptStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_completedOutcomeId_fkey" FOREIGN KEY ("completedOutcomeId") REFERENCES "ScriptOutcome"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyEvent" ADD CONSTRAINT "JourneyEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyEvent" ADD CONSTRAINT "JourneyEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


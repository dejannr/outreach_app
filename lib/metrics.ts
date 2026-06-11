import { prisma } from "@/lib/prisma";

export async function getStepDropoffByMetricKey(metricKey: string) {
  return prisma.journeyEvent.groupBy({
    by: ["leadStatusSnapshot"],
    where: {
      stepMetricKey: metricKey,
      type: "TERMINAL_REACHED",
    },
    _count: true,
  });
}

export async function getOutcomeCountsByMetricKey(metricKey: string) {
  return prisma.journeyEvent.groupBy({
    by: ["outcomeMetricKey"],
    where: {
      outcomeMetricKey: metricKey,
      type: "OUTCOME_SELECTED",
    },
    _count: true,
  });
}

export async function getConversionByScriptVersion(scriptVersionId: string) {
  const [started, won] = await Promise.all([
    prisma.journeyEvent.count({
      where: {
        scriptVersionIdSnapshot: scriptVersionId,
        type: "LEAD_STARTED",
      },
    }),
    prisma.journeyEvent.count({
      where: {
        scriptVersionIdSnapshot: scriptVersionId,
        type: "CLOSED_WON",
      },
    }),
  ]);

  return {
    started,
    won,
    conversionRate: started === 0 ? 0 : won / started,
  };
}

export async function getLeadFailurePoint(leadId: string) {
  return prisma.journeyEvent.findFirst({
    where: {
      leadId,
      type: {
        in: ["TERMINAL_REACHED", "CLOSED_LOST", "DISQUALIFIED"],
      },
    },
    orderBy: {
      occurredAt: "desc",
    },
  });
}

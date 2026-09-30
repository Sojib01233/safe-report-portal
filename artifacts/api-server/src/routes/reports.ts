import { randomInt } from "node:crypto";
import { Router, type IRouter } from "express";
import { and, count, gte, lt, sql } from "drizzle-orm";
import { db, safeReportsTable } from "@workspace/db";
import { CreateReportBody, CreateReportResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const localizedNextSteps = {
  en: {
    actionNote: "Your report has been received and is ready for review.",
    nextStep: "Review the safety resources and choose one action that feels possible.",
  },
  bn: {
    actionNote: "আপনার রিপোর্ট পাওয়া গেছে এবং পর্যালোচনার জন্য প্রস্তুত।",
    nextStep: "নিরাপত্তা রিসোর্সগুলো দেখুন এবং সম্ভব মনে হয় এমন একটি পদক্ষেপ বেছে নিন।",
  },
} as const;

function createTrackingId(): string {
  return `NRB-${new Date().getFullYear().toString().slice(-2)}-${randomInt(1000, 10000)}`;
}

function formatDateOnly(value: Date): string {
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

router.get("/reports/stats", async (req, res): Promise<void> => {
  try {
    const [totalRows, typeRows, dailyRows] = await Promise.all([
      db.select({ count: count() }).from(safeReportsTable),
      db
        .select({ typeId: safeReportsTable.typeId, count: count() })
        .from(safeReportsTable)
        .groupBy(safeReportsTable.typeId),
      db
        .select({
          date: sql<string>`to_char((${safeReportsTable.createdAt} AT TIME ZONE 'Asia/Dhaka')::date, 'YYYY-MM-DD')`,
          total: count(),
          solved: sql<number>`count(*) FILTER (WHERE ${safeReportsTable.status} = 'Closed')`.mapWith(Number),
          pending: sql<number>`count(*) FILTER (WHERE ${safeReportsTable.status} <> 'Closed')`.mapWith(Number),
        })
        .from(safeReportsTable)
        .where(
          and(
            gte(safeReportsTable.createdAt, sql`(((now() AT TIME ZONE 'Asia/Dhaka')::date - 29)::timestamp AT TIME ZONE 'Asia/Dhaka')`),
            lt(safeReportsTable.createdAt, sql`(((now() AT TIME ZONE 'Asia/Dhaka')::date + 1)::timestamp AT TIME ZONE 'Asia/Dhaka')`),
          ),
        )
        .groupBy(sql`(${safeReportsTable.createdAt} AT TIME ZONE 'Asia/Dhaka')::date`)
        .orderBy(sql`(${safeReportsTable.createdAt} AT TIME ZONE 'Asia/Dhaka')::date`),
    ]);

    const totalReports = Number(totalRows[0]?.count ?? 0);
    const response = {
      totalReports,
      successfulReports: totalReports,
      byType: typeRows.map((row) => ({
        typeId: row.typeId,
        count: Number(row.count),
      })),
      dailyStats: dailyRows.map((row) => ({
        date: row.date,
        total: Number(row.total),
        solved: Number(row.solved),
        pending: Number(row.pending),
      })),
    };

    res.json(response);
  } catch (error) {
    req.log.error({ err: error }, "Failed to load report statistics");
    res.status(500).json({ error: "Report statistics could not be loaded." });
  }
});

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.flatten() }, "Invalid safe report submission");
    res.status(400).json({ error: "Please check the report details and consent." });
    return;
  }

  if (!parsed.data.consent) {
    res.status(400).json({ error: "Consent is required before saving the report." });
    return;
  }

  const copy = localizedNextSteps[parsed.data.language];
  const trackingId = createTrackingId();
  const incidentDate = formatDateOnly(parsed.data.incidentDate);
  const location = [parsed.data.division, parsed.data.district, parsed.data.policeStation, parsed.data.village].join(" / ");
  const identityHidden = parsed.data.typeId === "drugs" && parsed.data.hideIdentity === true;

  try {
    const [savedReport] = await db
      .insert(safeReportsTable)
      .values({
        id: crypto.randomUUID(),
        trackingId,
        typeId: parsed.data.typeId,
        incidentDate,
        division: parsed.data.division,
        district: parsed.data.district,
        policeStation: parsed.data.policeStation,
        village: parsed.data.village,
        location,
        identityHidden,
        summary: parsed.data.summary,
        evidence: parsed.data.evidence ?? "",
        language: parsed.data.language,
        status: "Received",
        priority: "Standard",
        actionNote: copy.actionNote,
        nextStep: copy.nextStep,
      })
      .returning();

    req.log.info({ reportId: savedReport.trackingId }, "Safe report saved");
    const response = {
      id: savedReport.trackingId,
      typeId: savedReport.typeId,
      date: savedReport.incidentDate,
      location: savedReport.location,
      division: savedReport.division,
      district: savedReport.district,
      policeStation: savedReport.policeStation,
      village: savedReport.village,
      identityHidden: savedReport.identityHidden,
      summary: savedReport.summary,
      evidence: savedReport.evidence,
      language: savedReport.language,
      status: savedReport.status,
      priority: savedReport.priority,
      actionNote: savedReport.actionNote,
      nextStep: savedReport.nextStep,
    };
    CreateReportResponse.parse(response);
    res.status(201).json(response);
  } catch (error) {
    req.log.error({ err: error }, "Failed to save safe report");
    res.status(500).json({ error: "The report could not be saved. Please try again." });
  }
});

export default router;
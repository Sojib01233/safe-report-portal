import { randomInt } from "node:crypto";
import { Router, type IRouter } from "express";
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

  try {
    const [savedReport] = await db
      .insert(safeReportsTable)
      .values({
        id: crypto.randomUUID(),
        trackingId,
        typeId: parsed.data.typeId,
        incidentDate,
        location: parsed.data.location ?? "",
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
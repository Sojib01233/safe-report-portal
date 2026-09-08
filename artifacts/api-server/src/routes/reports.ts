import { Router, type IRouter } from "express";
import { db, reportsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/reports", async (req, res) => {
  try {
    const {
      id,
      typeId,
      date,
      location,
      summary,
      evidence,
      status,
      priority,
      actionNote,
      nextStep,
    } = req.body;

    if (!id || !typeId || !date || !summary) {
      return res.status(400).json({
        error: "id, typeId, date and summary are required",
      });
    }

    const [report] = await db
      .insert(reportsTable)
      .values({
        id,
        typeId,
        date,
        location: location || null,
        summary,
        evidence: evidence || null,
        status: status || "Received",
        priority: priority || "Standard",
        actionNote: actionNote || null,
        nextStep: nextStep || null,
      })
      .returning();

    return res.status(201).json(report);
  } catch (error) {
    console.error("Failed to create report:", error);

    return res.status(500).json({
      error: "Failed to create report",
    });
  }
});

router.get("/reports", async (_req, res) => {
  try {
    const reports = await db
      .select()
      .from(reportsTable);

    return res.json(reports);
  } catch (error) {
    console.error("Failed to fetch reports:", error);

    return res.status(500).json({
      error: "Failed to fetch reports",
    });
  }
});

export default router;

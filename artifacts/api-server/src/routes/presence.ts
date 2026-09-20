import { Router, type IRouter } from "express";
import { GetPresenceResponse, UpdatePresenceBody, UpdatePresenceResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const activeVisitors = new Map<string, number>();
const PRESENCE_TTL_MS = 45_000;

function getLiveCount(): number {
  const cutoff = Date.now() - PRESENCE_TTL_MS;
  for (const [clientId, lastSeen] of activeVisitors) {
    if (lastSeen < cutoff) activeVisitors.delete(clientId);
  }
  return activeVisitors.size;
}

router.get("/presence", (_req, res) => {
  res.json(GetPresenceResponse.parse({ count: getLiveCount() }));
});

router.post("/presence", (req, res) => {
  const parsed = UpdatePresenceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A valid anonymous client ID is required." });
    return;
  }

  activeVisitors.set(parsed.data.clientId, Date.now());
  res.json(UpdatePresenceResponse.parse({ count: getLiveCount() }));
});

export default router;
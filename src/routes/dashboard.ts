// Dashboard metrics routes
import { Router, type Router as RouterType } from "express";
import { auth } from "../middleware/auth";
import { ok, fail } from "../utils/resp";
import { getDashboardData, saveDashboardData } from "../utils/data";

type DashboardData = {
  today_new_reward?: number;
  today_secret_apply?: number;
  active_creator_count?: number;
  total_reward?: number;
  [key: string]: unknown;
};

const router: RouterType = Router();

// auth required
router.use(auth);

// GET /api/v1/dashboard/summary
router.get("/summary", async (_req, res) => {
  try {
    const data = (await getDashboardData()) as DashboardData;

    return ok(res, {
      today_new_reward: data.today_new_reward ?? 0,
      today_secret_apply: data.today_secret_apply ?? 0,
      active_creator_count: data.active_creator_count ?? 0,
      total_reward: data.total_reward ?? 0,
    });
  } catch (err) {
    const file =
      err instanceof Error && "file" in err
        ? String((err as { file?: string }).file)
        : "data/dashboard.json";

    return fail(res, 5000, "mock data load failed", { file });
  }
});

// POST /api/v1/dashboard/summary
// body: { today_new_reward: number }
router.post("/summary", async (req, res) => {
  const raw = (req.body ?? {}) as { today_new_reward?: unknown };
  const parsed = typeof raw.today_new_reward === "number"
    ? raw.today_new_reward
    : Number(raw.today_new_reward);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fail(res, 4001, "invalid today_new_reward", null);
  }

  try {
    const next = await saveDashboardData({ today_new_reward: parsed });
    return ok(res, {
      today_new_reward: next.today_new_reward ?? parsed,
    });
  } catch (err) {
    const file =
      err instanceof Error && "file" in err
        ? String((err as { file?: string }).file)
        : "data/dashboard.json";

    return fail(res, 5000, "mock data save failed", { file });
  }
});

export default router;

// 用户信息路由
import { Router, type Router as RouterType } from "express";
import { auth } from "../middleware/auth";
import { ok, fail } from "../utils/resp";
import { getUserData } from "../utils/data";

const router: RouterType = Router();

// 先经过鉴权中间件
router.use(auth);

// GET /api/user/info
// 从 data/user.json 读取基础模板，并合并当前用户身份信息
router.get("/info", async (req: any, res) => {
  try {
    const data = await getUserData();
    const user = {
      ...data,
      uid: req.user?.uid ?? "u_10001",
      name: req.user?.name ?? (data as { name?: string }).name ?? "Mock User",
    };

    return ok(res, user);
  } catch (err) {
    // 数据加载失败时返回业务错误
    const file =
      err instanceof Error && "file" in err
        ? String((err as { file?: string }).file)
        : "data/user.json";

    return fail(res, 5000, "mock data load failed", { file });
  }
});

export default router;

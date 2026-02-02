// 认证相关路由：仅示例 login
import { Router, type Router as RouterType } from "express";
import { ok } from "../utils/resp";

const router: RouterType = Router();

// POST /api/auth/login
// 返回固定 token，方便前端在后续接口中使用
router.post("/login", (req, res) => {
  const body = (req.body ?? {}) as { username?: string };
  const username = typeof body.username === "string" ? body.username.trim() : "";

  return ok(res, {
    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.xxx.yyy",
    name: username.length > 0 ? username : "Mock User",
  });
});

export default router;

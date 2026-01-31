// 简易鉴权中间件：校验固定 token
import type { Request, Response, NextFunction } from "express";
import { fail } from "../utils/resp";

// 固定 token（与 login 返回一致）
const TOKEN = "mock-token-123";

// Authorization: Bearer <token>
export function auth(req: Request | any, res: Response, next: NextFunction): void {
  const authHeader = req.get("authorization") ?? req.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (token !== TOKEN) {
    fail(res, 401, "unauthorized", null);
    return;
  }

  // 注入模拟用户信息
  req.user = {
    uid: "u_10001",
    name: "Mock User",
  };

  next();
}

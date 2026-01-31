// 错误注入中间件：通过 query 参数直接返回业务错误
import type { Request, Response, NextFunction } from "express";
import { fail } from "../utils/resp";

// 统一读取 query 字符串参数（兼容数组形式）
function getQueryString(req: Request, key: string): string | undefined {
  const value = req.query[key];
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }
  if (typeof value === "string") return value;
  return undefined;
}

// 当 __fail=1 时立即返回，不进入后续中间件/路由
export function inject(req: Request, res: Response, next: NextFunction): void {
  const failFlag = getQueryString(req, "__fail");
  if (failFlag === "1") {
    const codeRaw = getQueryString(req, "code");
    const msgRaw = getQueryString(req, "msg");
    const parsedCode = codeRaw ? Number(codeRaw) : Number.NaN;
    const resultCode = Number.isFinite(parsedCode) ? parsedCode : 5001;
    const resultMsg = msgRaw && msgRaw.length > 0 ? msgRaw : "mock injected error";

    fail(res, resultCode, resultMsg, null);
    return;
  }

  next();
}

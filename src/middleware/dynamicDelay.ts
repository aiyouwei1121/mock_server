// 动态延迟中间件：支持 __delay 覆盖默认延迟
import type { Request, Response, NextFunction } from "express";

// 默认全局延迟（未传 __delay 时）
const DEFAULT_DELAY_MS = 300;

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

// 解析延迟：非法值回退到默认值
function resolveDelay(req: Request): number {
  const raw = getQueryString(req, "__delay");
  if (!raw) return DEFAULT_DELAY_MS;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return DEFAULT_DELAY_MS;
  return Math.floor(parsed);
}

// 在进入路由之前统一延迟
export function dynamicDelay(req: Request, _res: Response, next: NextFunction): void {
  const delayMs = resolveDelay(req);
  setTimeout(next, delayMs);
}

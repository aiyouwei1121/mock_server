// 数据读取工具：统一从 data/*.json 读取，并带缓存
import fs from "node:fs/promises";
import path from "node:path";

// 缓存结构
type CacheEntry = {
  data: unknown;
  ts: number;
};

// 缓存过期时间（开发期热更新友好）
const CACHE_TTL_MS = 3000;
// 以绝对路径为 key 的缓存
const cache = new Map<string, CacheEntry>();

// 读取任意 JSON 文件（data 目录下）
export async function loadJson<T>(filename: string): Promise<T> {
  const filePath = path.join(process.cwd(), "data", filename);
  const now = Date.now();
  const cached = cache.get(filePath);

  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return cached.data as T;
  }

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw) as T;
    cache.set(filePath, { data, ts: now });
    return data;
  } catch (err) {
    // 将文件路径附在 error 上，便于路由返回具体失败文件
    const error = err instanceof Error ? err : new Error("mock data load failed");
    (error as { file?: string }).file = filePath;
    throw error;
  }
}

// user.json 读取封装
export async function getUserData(): Promise<Record<string, unknown>> {
  return loadJson<Record<string, unknown>>("user.json");
}

// orders.json 读取封装
export async function getOrdersData(): Promise<Record<string, unknown>> {
  return loadJson<Record<string, unknown>>("orders.json");
}

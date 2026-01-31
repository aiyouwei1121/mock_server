// 订单列表路由
import { Router, type Router as RouterType } from "express";
import { auth } from "../middleware/auth";
import { ok, fail } from "../utils/resp";
import { getOrdersData } from "../utils/data";

// 单条订单结构（必要字段 + 可扩展字段）
type OrderItem = {
  id: string;
  no: string;
  amount: number;
  status: string;
  created_at: string;
  [key: string]: unknown;
};

// orders.json 可能的结构（模板或直接 list）
type OrdersData = {
  total?: number;
  list?: OrderItem[];
  statusPool?: string[];
  amountMin?: number;
  amountMax?: number;
  template?: Record<string, unknown>;
};

const router: RouterType = Router();

// 先经过鉴权中间件
router.use(auth);

// 安全数字解析：非数字返回 undefined
function toNumber(value: unknown): number | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  }

  return undefined;
}

// 统一分页参数校验与兜底
function normalizePage(value: unknown, fallback: number, min = 1, max = 200): number {
  const num = toNumber(value);
  if (num === undefined) return fallback;
  const int = Math.floor(num);
  if (int < min) return min;
  if (int > max) return max;
  return int;
}

// 当 orders.json 仅提供模板时，按分页动态生成 list
function buildOrderList(
  total: number,
  page: number,
  pageSize: number,
  data: OrdersData
): OrderItem[] {
  const startIndex = (page - 1) * pageSize;
  if (startIndex >= total) return [];

  const endIndex = Math.min(startIndex + pageSize, total);
  const statusPool =
    Array.isArray(data.statusPool) && data.statusPool.length > 0
      ? data.statusPool
      : ["WAIT", "PASS", "REJECT"];
  const amountMin = typeof data.amountMin === "number" ? data.amountMin : 1;
  const amountMax = typeof data.amountMax === "number" ? data.amountMax : 9999;
  const amountSpan = Math.max(amountMax - amountMin + 1, 1);
  const template = data.template ?? {};

  const list: OrderItem[] = [];
  for (let i = startIndex; i < endIndex; i += 1) {
    const amount = amountMin + ((i * 37) % amountSpan);
    const createdAt = new Date(Date.now() - i * 86400000).toISOString();

    list.push({
      id: `order_${i + 1}`,
      no: `NO${String(i + 1).padStart(6, "0")}`,
      amount,
      status: statusPool[i % statusPool.length] ?? "WAIT",
      created_at: createdAt,
      ...template,
    });
  }

  return list;
}

// GET /api/orders/list
// 1) 如果 orders.json 提供 list，则直接分页
// 2) 否则基于模板生成
router.get("/list", async (req, res) => {
  try {
    const data = (await getOrdersData()) as OrdersData;
    const page = normalizePage(req.query.page, 1);
    const pageSize = normalizePage(req.query.pageSize, 10, 1, 100);

    if (Array.isArray(data.list) && data.list.length > 0) {
      const total = typeof data.total === "number" ? data.total : data.list.length;
      const startIndex = (page - 1) * pageSize;
      const list = data.list.slice(startIndex, startIndex + pageSize);

      return ok(res, {
        page,
        pageSize,
        total,
        list,
      });
    }

    const total = typeof data.total === "number" ? data.total : 0;
    const list = buildOrderList(total, page, pageSize, data);

    return ok(res, {
      page,
      pageSize,
      total,
      list,
    });
  } catch (err) {
    // 数据加载失败时返回业务错误
    const file =
      err instanceof Error && "file" in err
        ? String((err as { file?: string }).file)
        : "data/orders.json";

    return fail(res, 5000, "mock data load failed", { file });
  }
});

export default router;

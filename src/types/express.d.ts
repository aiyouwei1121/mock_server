// 扩展 Express Request 类型，增加 user 字段
import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    // 鉴权中间件注入的用户信息
    user?: {
      uid: string;
      name: string;
    };
  }
}

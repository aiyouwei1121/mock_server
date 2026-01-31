// 入口文件：创建 Express 应用、挂载全局中间件与路由
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import ordersRoutes from "./routes/orders";
import { inject } from "./middleware/inject";
import { dynamicDelay } from "./middleware/dynamicDelay";

// 创建应用实例
const app = express();

// 1) 跨域
app.use(cors());
// 2) JSON body 解析
app.use(express.json());
// 3) 错误注入：优先级最高（命中即短路）
app.use(inject);
// 4) 动态延迟：在路由前统一延迟
app.use(dynamicDelay);

// 5) 路由挂载
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", ordersRoutes);

// 端口：环境变量优先，否则 3000
const port = Number(process.env.PORT ?? 3000);

// 启动服务
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[mock-server] listening on ${port}`);
});

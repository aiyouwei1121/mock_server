// 响应结构与工具函数：统一返回格式
import type { Response } from "express";

// 统一响应结构
export interface ApiResponse<T = unknown> {
  result_code: number;
  result_msg: string;
  result_object: T | null;
}

// 成功返回：result_code=0
export function ok<T>(res: Response, resultObject: T): Response<ApiResponse<T>> {
  return res.status(200).json({
    result_code: 0,
    result_msg: "ok",
    result_object: resultObject,
  });
}

// 失败返回：HTTP 仍为 200，业务码体现错误
export function fail(
  res: Response,
  code: number,
  msg: string,
  resultObject: unknown = null
): Response<ApiResponse<unknown>> {
  return res.status(200).json({
    result_code: code,
    result_msg: msg,
    result_object: resultObject ?? null,
  });
}

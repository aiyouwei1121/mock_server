import { Router, type Router as RouterType } from "express";
import { ok } from "../utils/resp";

const router: RouterType = Router();

router.post("/login", (req, res) => {
  return ok(res, {
    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.xxx.yyy",
    token_type: "Bearer",
  });
});

export default router;

import type { Request, Response } from "express";

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({
    ok: false,
    error: { code: "NOT_FOUND", message: "Not found" },
  });
}

import { z } from "zod";
import { Request, Response, NextFunction } from "express";

type ExpressValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

const defaultValidator: ExpressValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next();
};

const dataValidator: (schema: z.ZodTypeAny) => ExpressValidator = (
  schema: z.ZodTypeAny
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const parsed = schema.safeParse(data);

    return parsed.success ? next() : res.status(401).send(parsed).end();
  };
};

export { defaultValidator, dataValidator, ExpressValidator };

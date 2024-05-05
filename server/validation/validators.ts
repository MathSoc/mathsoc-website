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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  return res
    .status(415)
    .send(
      "A schema validator has not been set up for this data file. Please set one up and try again. Contact Aryaman or River for help :)"
    );
};

const dataValidator: (schema: z.ZodTypeAny) => ExpressValidator = (
  schema: z.ZodTypeAny
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const parsed = schema.safeParse(data);

    return parsed.success ? next() : res.status(406).send(parsed).end();
  };
};

export { defaultValidator, dataValidator, ExpressValidator };

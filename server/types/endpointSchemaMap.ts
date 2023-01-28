import { NextFunction, Request, Response } from "express";
import {
  defaultValidator,
  dataValidator,
  ExpressValidator,
} from "./validators";
import * as schemas from "./types";

// MAPPING OF FILEPATH TO FILE SCHEMA
// 'get-involved/volunteer' refers to /data/get-involved/volunteer.json
export const mapping = {
  "get-involved/volunteer": schemas.VolunteerDataSchema,
  home: schemas.HomeDataSchema,
  "cartoons/about-us": schemas.CartoonsAboutUsDataSchema,
  "resources/mental-wellness": schemas.MentalWellnessDataSchema,
  elections: schemas.ElectionsDataSchema,
};

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const filePath = req.query.path;
  let validator: ExpressValidator = defaultValidator;
  for (const [key, value] of Object.entries(mapping)) {
    if (key == filePath) {
      validator = dataValidator(value);
    }
  }

  validator(req, res, next);
};

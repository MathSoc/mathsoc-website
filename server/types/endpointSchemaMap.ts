import { NextFunction, Request, Response } from "express";
import {
  defaultValidator,
  dataValidator,
  ExpressValidator,
} from "./validators";
import * as schemas from "./types";
import { DataPaths } from "./dataPaths";

// MAPPING OF FILEPATH TO FILE SCHEMA
// 'get-involved/volunteer' refers to /data/get-involved/volunteer.json
export const mapping = {
  [DataPaths.GET_INVOLVED_VOLUNTEER]: schemas.VolunteerDataSchema,
  [DataPaths.HOME]: schemas.HomeDataSchema,
  [DataPaths.CARTOONS_ABOUT_US]: schemas.CartoonsAboutUsDataSchema,
  [DataPaths.RESOUCES_MENTAL_WELLNESS]: schemas.MentalWellnessDataSchema,
  [DataPaths.ELECTIONS]: schemas.ElectionsDataSchema,
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

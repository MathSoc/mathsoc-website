import { NextFunction, Request, Response } from "express";
import {
  defaultValidator,
  dataValidator,
  ExpressValidator,
} from "./validators";
import * as schemas from "../types/schemas";
import { DataPaths } from "./data-paths";

// MAPPING OF FILEPATH TO FILE SCHEMA
// 'get-involved/volunteer' refers to /data/get-involved/volunteer.json
export const mapping: Partial<Record<DataPaths, Zod.ZodTypeAny>> = {
  [DataPaths.GET_INVOLVED_VOLUNTEER]: schemas.VolunteerDataSchema,
  [DataPaths.GET_INVOLVED_VOLUNTEER_APPLICATION]: schemas.VolunteerApplicationSchema,
  [DataPaths.HOME]: schemas.HomeDataSchema,
  [DataPaths.CARTOONS_ABOUT_US]: schemas.CartoonsAboutUsDataSchema,
  [DataPaths.RESOUCES_MENTAL_WELLNESS]: schemas.MentalWellnessDataSchema,
  [DataPaths.RESOURCES_CHEQUE_REQUESTS]: schemas.ChequeRequestSchema,
  [DataPaths.RESOURCES_DISCORD_ACCESS]: schemas.DiscordAccessSchema,
  [DataPaths.ELECTIONS]: schemas.ElectionsDataSchema,
  [DataPaths.STUDENT_SERVICES]: schemas.StudentServicesSchema,
  [DataPaths.COUNCIL_DATA]: schemas.CouncilDataSchema,
  [DataPaths.CLUBS_DATA]: schemas.ClubsSchema,
  [DataPaths.COMMUNITY_DATA]: schemas.CommunitySchema,
  [DataPaths.CONTACT_US]: schemas.ContactUsDataSchema,
  [DataPaths.SHARED_FOOTER]: schemas.SharedFooterSchema,
  [DataPaths.SHARED_EXECS]: schemas.SharedExecsSchema,
};

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const filePath = req.query.path;
  const validator: ExpressValidator =
    filePath && mapping[filePath as string]
      ? dataValidator(mapping[filePath as string])
      : defaultValidator;

  validator(req, res, next);
};

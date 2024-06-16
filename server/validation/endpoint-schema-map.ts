import { NextFunction, Request, Response } from "express";
import {
  defaultValidator,
  dataValidator,
  ExpressValidator,
} from "./validators";
import * as schemas from "../types/schemas";
import { DataPaths } from "./data-paths";
import Zod from "zod";

// MAPPING OF FILEPATH TO FILE SCHEMA
// 'get-involved/volunteer' refers to /data/get-involved/volunteer.json
export const mapping: Partial<Record<DataPaths, Zod.ZodTypeAny>> = {
  [DataPaths.CARTOONS_ABOUT_US]: schemas.CartoonsAboutUsDataSchema,
  [DataPaths.CLUBS_DATA]: schemas.ClubsSchema,
  [DataPaths.COMMUNITY_DATA]: schemas.CommunitySchema,
  [DataPaths.CONTACT_US]: schemas.ContactUsDataSchema,
  [DataPaths.COUNCIL_DATA]: schemas.CouncilDataSchema,
  [DataPaths.ELECTIONS]: schemas.ElectionsDataSchema,
  [DataPaths.GET_INVOLVED_VOLUNTEER]: schemas.VolunteerDataSchema,
  [DataPaths.GET_INVOLVED_VOLUNTEER_APPLICATION]:
    schemas.VolunteerApplicationSchema,
  [DataPaths.HOME]: schemas.HomeDataSchema,
  [DataPaths.INVENTORY]: schemas.InventorySchema,
  [DataPaths.RESOUCES_MENTAL_WELLNESS]: schemas.MentalWellnessDataSchema,
  [DataPaths.RESOURCES_CHEQUE_REQUESTS]: schemas.ChequeRequestSchema,
  [DataPaths.RESOURCES_DISCORD_ACCESS]: schemas.DiscordAccessSchema,
  [DataPaths.RESOURCES_IMPORTANT_LINKS]: schemas.ImportantLinksSchema,
  [DataPaths.RESOURCES_BUDGETS]: schemas.BudgetsSchema,
  [DataPaths.RESOURCES_MEETINGS]: schemas.MeetingsSchema,
  [DataPaths.SHARED_FOOTER]: schemas.SharedFooterSchema,
  [DataPaths.SHARED_EXECS]: schemas.SharedExecsSchema,
  [DataPaths.STUDENT_SERVICES]: schemas.StudentServicesSchema,
  [DataPaths.SERVICES_MATHSOC_OFFICE]: schemas.ServicesMathsocOffice,
};

const buildShapeFromZodSchema = (schema: Zod.ZodTypeAny) => {
  if (schema === null || schema === undefined)
    throw new Error("Unexpected state: undefined schema");

  // check if schema is an array
  if (schema instanceof Zod.ZodArray) {
    return [buildShapeFromZodSchema(schema.element)];
  }

  // check if schema is an object
  if (schema instanceof Zod.ZodObject) {
    const entries = Object.keys(schema.shape);
    const constructed = {};

    entries.forEach((key) => {
      constructed[key] = buildShapeFromZodSchema(schema.shape[key]);
    });

    return constructed;
  }

  // base case: no keys
  return "";
};

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const filePath = req.query.path;
  const validator: ExpressValidator =
    filePath && mapping[filePath as string]
      ? dataValidator(mapping[filePath as string])
      : defaultValidator;

  validator(req, res, next);
};

export const getSchema = (filePath: string): object => {
  return buildShapeFromZodSchema(mapping[filePath as string]);
};

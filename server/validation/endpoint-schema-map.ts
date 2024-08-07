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
  [DataPaths.CARTOONS_ARCHIVE]: schemas.CartoonsArchiveSchema,
  [DataPaths.CARTOONS_TEAM]: schemas.CartoonsTeamDataSchema,
  [DataPaths.CONTACT_US]: schemas.ContactUsDataSchema,
  [DataPaths.ELECTIONS]: schemas.ElectionsDataSchema,
  [DataPaths.GET_INVOLVED_CLUBS_DATA]: schemas.ClubsSchema,
  [DataPaths.GET_INVOLVED_COMMUNITY_DATA]: schemas.CommunitySchema,
  [DataPaths.GET_INVOLVED_COUNCIL_DATA]: schemas.CouncilDataSchema,
  [DataPaths.GET_INVOLVED_VOLUNTEER]: schemas.VolunteerDataSchema,
  [DataPaths.GET_INVOLVED_VOLUNTEER_APPLICATION]:
    schemas.VolunteerApplicationSchema,
  [DataPaths.HOME]: schemas.HomeDataSchema,
  [DataPaths.INVENTORY]: schemas.InventorySchema,
  [DataPaths.RESOURCES_BUDGETS]: schemas.BudgetsSchema,
  [DataPaths.RESOURCES_DISCORD_ACCESS]: schemas.DiscordAccessSchema,
  [DataPaths.RESOURCES_FORMS]: schemas.FormsSchema,
  [DataPaths.RESOURCES_IMPORTANT_LINKS]: schemas.ImportantLinksSchema,
  [DataPaths.RESOURCES_MEETINGS]: schemas.MeetingsSchema,
  [DataPaths.RESOURCES_MENTAL_WELLNESS]: schemas.MentalWellnessDataSchema,
  [DataPaths.RESOURCES_POLICIES_AND_BYLAWS]: schemas.PoliciesBylawsSchema,
  [DataPaths.SHARED_EXECS]: schemas.SharedExecsSchema,
  [DataPaths.SHARED_FOOTER]: schemas.SharedFooterSchema,
  [DataPaths.SERVICES_MATHSOC_OFFICE]: schemas.ServicesMathsocOffice,
  [DataPaths.SERVICES_STUDENT_SERVICES]: schemas.StudentServicesSchema,
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

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const filePath = req.query.path;
  const validator: ExpressValidator =
    filePath && mapping[filePath as string]
      ? dataValidator(mapping[filePath as string])
      : defaultValidator;

  validator(req, res, next);
};

export const validateDataPath = (path: string, data: any) => {
  if (path[0] === "/") path = path.slice(1);
  path = path.replace(".json", "");

  if (!mapping[path]) {
    throw new Error(`No schema found for path: ${path}`);
  }

  const schema: Zod.ZodTypeAny = mapping[path];
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new Error(
      `Data validation failed for path: ${path}. Errors: ${parsed.error.toString()}`
    );
  }

  return parsed.data;
};

export const getSchema = (filePath: string): object => {
  return buildShapeFromZodSchema(mapping[filePath as string]);
};

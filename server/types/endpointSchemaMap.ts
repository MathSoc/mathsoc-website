import { NextFunction, Request, Response } from "express";
import { defaultValidator, volunteerDataValidator } from "./validators";

// MAPPING OF FILEPATH TO VALIDATOR OF FILE SCHEMA
// 'get-involved/volunteer' refers to /data/get-involved/volunteer.json
export const mapping = {
    'get-involved/volunteer': volunteerDataValidator
}


export const validate = (req: Request, res: Response, next: NextFunction) => {
    const filePath = req.query.path;
    let validator = defaultValidator;
    for (const [key, value] of Object.entries(mapping)) {
        if(key == filePath) {
            validator = value;
        }
    }

    validator(req, res, next);
}
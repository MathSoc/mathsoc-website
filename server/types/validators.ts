import { VolunteerDataSchema } from './types'
import { Request, Response, NextFunction } from 'express';

const defaultValidator = (req: Request, res: Response, next: NextFunction) => {
    next();
}

const volunteerDataValidator = (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const parsed = VolunteerDataSchema.safeParse(data);

        if(parsed.success == true) {
            next();
        } else {
            res.status(401).end();
        }
    } catch (err) {
        res.status(401).end();
    } 
}

export { defaultValidator, volunteerDataValidator };

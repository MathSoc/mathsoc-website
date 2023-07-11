import { Request, Response } from "express";
import { Logger } from "../../util/logger";
// import { ReadWriteAPIController } from "./read-write-api-controller";
// import { ReadWriteController } from "./read-write-controller";
import LockerData from "../../data/_hidden/locker-list.json";
import { Locker } from "../../types/locker";

/* Assuming locker-list.json will have the following structure: 
[
    {
        "userid": "userid",    
        "lockernumber": "lockerid",
        "lockercombination": "lockercombination",
    }
    ...
]
*/
export class LockerSignoutController {
    static logger = new Logger();
    
    
    static requestLocker(req: Request, res: Response) {
        const { userId } = req.body;
        const availableLocker = LockerData.find((locker: Locker) => !locker.userId);
        if (!availableLocker) {
            res.status(404).json({ error: "No available lockers" });
            return;
        }
        availableLocker.userId = userId;
        res.status(201).json({ lockerNumber: availableLocker.lockerNumber });
    }

    static getLockerByUserId(req: Request, res: Response) {
        const { userId } = req.query;
        const assignedLocker = LockerData.find(
          (locker: Locker) => locker.userId === userId
        );

        if (!assignedLocker) {
          res.status(404).json({ error: "User ID not found or no locker assigned" });
          return;
        }
        res.status(200).json({ lockerNumber: assignedLocker.lockerNumber });
    }

    static getUserIdByLocker(req: Request, res: Response) {
        const { lockerNumber } = req.query;
        const lockerWithUserId = LockerData.find(
          (locker: Locker) => locker.lockerNumber === lockerNumber
        );

        if (!lockerWithUserId) {
          res.status(404).json({ error: "Locker number not found or unassigned" });
          return;
        }
        res.json({ userId: lockerWithUserId.userId });
    }

    static getAvailableLockers(req: Request, res: Response) {
        const { term } = req.query;
        const availableLockers = LockerData.filter(
          (locker: Locker) => !locker.userId
        );
        res.status(200).json({ lockers: availableLockers });
    }

    static checkLockerAvailability(req: Request, res: Response) {
        const { lockerNumber } = req.query;
        const isAvailable = LockerData.some(
          (locker: Locker) => locker.lockerNumber === lockerNumber && !locker.userId
        );
        res.status(200).json({ available: isAvailable });
    }
}
import { Request, Response } from "express";
import { Logger } from "../../util/logger";
// import { ReadWriteAPIController } from "./read-write-api-controller";
// import { ReadWriteController } from "./read-write-controller";
import LockerData from "../../data/_hidden/locker-list.json";
import { Locker } from "../../types/locker";

export class LockerSignoutController {
    static logger = new Logger("Locker Signout");
    
    /*
      Handles the POST /api/locker-signout/request endpoint
      - checks if a locker is available
      - if available, assigns the locker to the given user
    */
    static requestLocker(req: Request, res: Response) : void {
      const { userId } = req.body;
      const term = "placeholderTerm1"; // will set current term later
  
      const availableLocker = LockerData[term].find((locker: Locker) => !locker.userId);
      if (!availableLocker) {
        res.status(409).json({ error: "No available lockers" });
        return;
      }
      availableLocker.userId = userId;
      res.status(201).json({ lockerNumber: availableLocker.lockerNumber });
    }

    /*
      Handles the GET /api/locker-signout/locker-by-user endpoint
      - checks if the locker is assigned to the given user
      - returns the locker number assigned to the given user if it exists
    */
    static getLockerByUserId(req: Request, res: Response) {
      const { userId, term } = req.query;
      const termValue = String(term);
      const assignedLocker = LockerData[termValue].find((locker: Locker) => String(locker.userId) === userId);
  
      if (!assignedLocker) {
        res.status(404).json({ error: "User ID not found or no locker assigned" });
        return;
      }
      res.status(200).json({ lockerNumber: assignedLocker.lockerNumber });
    }

    /*
      Handles the GET /api/locker-signout/user-by-locker endpoint
      - checks if the locker is assigned to the given user
      - returns the user ID assigned to the given locker if it exists
    */
    static getUserIdByLocker(req: Request, res: Response) {
      const { lockerNumber, term } = req.query;
      const termValue = String(term);
  
      const lockerWithUserId = LockerData[termValue].find(
        (locker: Locker) => String(locker.lockerNumber) === lockerNumber
      );
  
      if (!lockerWithUserId) {
        res.status(404).json({ error: "Locker number not found or unassigned" });
        return;
      }
      res.status(200).json({ userId: lockerWithUserId.userId });
    }

    /*
      Handles the GET /api/locker-signout/all-available endpoint
      - returns all available lockers
    */
    static getAvailableLockers(req: Request, res: Response) {
      const { term } = req.query;
      const termValue = String(term);
  
      const availableLockers = LockerData[termValue].filter((locker: Locker) => locker.userId === 0);
      res.status(200).json({ lockers: availableLockers });
    }

    /*
      Handles the GET /api/locker-signout/locker-available endpoint
      - checks if the given locker is available
    */
    static checkLockerAvailability(req: Request, res: Response) {
      const { lockerNumber, term } = req.query;
      const termValue = String(term);
  
      const isAvailable = LockerData[termValue].some(
        (locker: Locker) => String(locker.lockerNumber) === lockerNumber && locker.userId === 0
      );
      res.status(200).json({ available: isAvailable });
    }
}
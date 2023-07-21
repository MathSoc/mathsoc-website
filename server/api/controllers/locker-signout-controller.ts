import { Request, Response } from "express";
import { Logger } from "../../util/logger";
// import { ReadWriteAPIController } from "./read-write-api-controller";
import { ReadWriteController } from "./read-write-controller";
import LockerData from "../../data/_hidden/locker-list.json";
import { Locker } from "../../types/locker";
import fs from "fs";

export class LockerSignoutController {
    static logger = new Logger("Locker Signout");

    private static updateLockerStatus(term: string, userId: number, lockerNumber: number): boolean {
      const lockerData = this.readLockerData();
  
      const targetTerm = lockerData[term];
      const targetLocker = targetTerm.find((locker: Locker) => locker.lockerNumber === lockerNumber);
  
      if (targetLocker && targetLocker.userId === 0) {
        targetLocker.userId = userId;
        this.writeLockerData(lockerData); 
        return true;
      }
  
      return false;
    }
  
    private static readLockerData(): { [key: string]: Locker[] } {
      const jsonData = fs.readFileSync("server/data/_hidden/locker-list.json", "utf-8");
      return JSON.parse(jsonData);
    }
  
    private static writeLockerData(lockerData: { [key: string]: Locker[] }): void {
      const jsonData = JSON.stringify(lockerData, null, 2);
      fs.writeFileSync("server/data/_hidden/locker-list.json", jsonData, "utf-8");
    }

    private static generateJson(lockerData: { [key: string]: Locker[] }): string {
      return JSON.stringify(lockerData, null, 2);
    }
    
    /*
      Handles the POST /api/locker-signout/request endpoint
      - requires: userId
      - checks if a locker is available
      - if available, assigns the locker to the given user
    */
    static requestLocker(req: Request, res: Response) : void {
      const { userId } = req.body;
      const term = "placeholderTerm1"; // will set current term later
  
      const availableLocker = LockerData[term].find((locker: Locker) => locker.userId == 0);
      if (!availableLocker) {
        res.status(409).json({ error: "No available lockers" });
        return;
      }
      const url = "_hidden/locker-list.json"
      availableLocker.userId = userId;
      ReadWriteController.overwriteJSONDataPath(
        url,
        () => {
          return;
        },
        // need to generate json file -- currently only overwriting locally
        LockerData
      );
      res.status(201).json({ lockerNumber: availableLocker.lockerNumber });
      console.log(LockerData);
      console.log("this is working")
    }

    static getAvailableLocker(term: string): number {
      const lockerData = this.readLockerData();
      const availableLocker = lockerData[term].find((locker: Locker) => locker.userId === 0);
  
      return availableLocker ? availableLocker.lockerNumber : -1;
    }

    /*
      Handles the GET /api/locker-signout/locker-by-user endpoint
      - requires: userId, term
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
      console.log("getLockerByUserId");
    }

    /*
      Handles the GET /api/locker-signout/user-by-locker endpoint
      - requires: lockerNumber, term
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
      - requires: term
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
      - requires: lockerNumber, term
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
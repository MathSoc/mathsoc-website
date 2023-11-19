import { Request, Response } from "express";
import { Logger } from "../../util/logger";
// import { ReadWriteAPIController } from "./read-write-api-controller";
import { ReadWriteController } from "./read-write-controller";
import LockerData from "../../data/_hidden/locker-list.json";
import { Locker } from "../../types/locker";

export class LockerSignoutController {
    static logger = new Logger("Locker Signout");
    
    /*
      Handles the POST /api/locker-signout/assign endpoint
      - requires: lockerNumber, userId, lockerCombination, (optional)term
      - checks if the locker is available
      - if available, assigns the locker to the given user with the given combination
    */
      static requestLocker(req: Request, res: Response) : void {
        const { userId } = req.body;
        const term = "placeholderTerm1"; // Adjust as needed

        // Check if user already has a locker
        const assignedLocker = LockerData[term].find((locker: Locker) => locker.userId == userId);
        console.log(assignedLocker);
        if (assignedLocker) {
          res.status(404).json({ error: "User already has an assigned locker", lockerNumber: assignedLocker.lockerNumber });
          return;
        }

        // Proceed to assign a locker if none is already assigned
        const availableLocker = LockerData[term].find((locker: Locker) => locker.userId == "0");
        if (!availableLocker) {
            res.status(409).json({ error: "No available lockers" });
            return;
        }

        availableLocker.userId = userId;

        // Save the updated locker data
        const url = "_hidden/locker-list";
        ReadWriteController.overwriteJSONDataPath(
            url,
            () => { /* success callback */ },
            LockerData
        );

        res.status(201).json({ lockerNumber: availableLocker.lockerNumber });
    }


    /*
      Handles the POST /api/locker-signout/unassign endpoint
      - requires: userId || lockerNumber
      - unassigns the locker from the given user or locker number(locker userId set to "0")
    */
    static unassignLocker(req: Request, res: Response) : void {
      const { lockerNumber, userId } = req.body;
      const term = "placeholderTerm1"; // will set current term later

      if (lockerNumber != null && userId != null) {
        res.status(400).json({ error: "Please provide only lockerNumber or userId, not both." });
        return;
      }

      let assignedLocker: Locker | undefined;
      if(lockerNumber != null){
        assignedLocker = LockerData[term].find((locker: Locker) => locker.lockerNumber == lockerNumber);
      } else {
        assignedLocker = LockerData[term].find((locker: Locker) => locker.userId == userId);
      }
      if (!assignedLocker) {
        res.status(409).json({ error: "user or locker not assigned" });
        return;
      }
      assignedLocker.userId = "0";

      const url = "_hidden/locker-list"
      ReadWriteController.overwriteJSONDataPath(
        url,
        () => {
          return;
        },
        LockerData
      );
      res.status(201).json({ lockerNumber: assignedLocker.lockerNumber });
    }

    /*
      Handles the POST /api/locker-signout/unassign-all endpoint
      - unassigns all lockers (all locker userIds set to "0")
    */
    static unassignAllLockers(req: Request, res: Response) : void {
      const term = "placeholderTerm1"; // will set current term later

      LockerData[term].forEach((locker: Locker) => {
        locker.userId = "0";
      });

      const url = "_hidden/locker-list"
      ReadWriteController.overwriteJSONDataPath(
        url,
        () => {
          return;
        },
        LockerData
      );
      res.status(201).json({ message: "All lockers unassigned" });
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
      const assignedLocker = LockerData[termValue].find((locker: Locker) => locker.userId === userId);
  
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
  
      const availableLockers = LockerData[termValue].filter((locker: Locker) => locker.userId === "0");
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
        (locker: Locker) => String(locker.lockerNumber) === lockerNumber && locker.userId === "0"
      );
      res.status(200).json({ available: isAvailable });
    }
}
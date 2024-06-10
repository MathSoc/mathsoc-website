import { CronJob } from "cron";
import Rsync from "rsync";
import fs from "fs";
import { exit } from "process";
import path from "path";
import { sys } from "typescript";

process.title = "MathSoc Content Backup";

const createDirectory = (directory: string) => {
  const exists = fs.existsSync(directory);
  if (!exists) {
    try {
      console.info(`Making backup directory: ${directory}`);
      fs.mkdirSync(directory);
    } catch (err) {
      console.error(
        "Could not create directory: " + directory + " with error: " + err
      );
      exit(1);
    }
  }
};

const numBackups = (directory: string): number => {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory()).length;
};

const deleteOldestBackup = (directory: string): void => {
  try {
    console.info(`Finding oldest backup...`);
    const directories = fs
      .readdirSync(directory, { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .map((dirent) => ({
        name: dirent.name,
        lastEdited: fs
          .statSync(path.join(directory, dirent.name))
          .mtime.getTime(),
      }));

    directories.sort((a, b) => a.lastEdited - b.lastEdited);

    const oldestDirectoryName = directories[0].name;

    console.info(`Deleting the oldest backup: ${oldestDirectoryName}`);

    fs.rmSync(path.join(directory, oldestDirectoryName), {
      recursive: true,
    });
    console.info("Oldest backup deleted: " + oldestDirectoryName);
  } catch (err) {
    console.error("Unable to delete oldest backup with error: " + err);
  }
};

const runJobs = () => {
  const directoryName = "backups";

  const rsync = new Rsync()
    .flags("a")
    .source(["server/data", "public/assets/img/uploads", "public/exams"]);

  const job = new CronJob(
    sys.args[1] == "m" ? "* * * * *" : "0 0 * * 0",
    () => {
      const newDate = new Date().toISOString();
      rsync.destination(`backups/${newDate}`).execute((err, code) => {
        if (err) {
          console.error(err);
        }

        if (code == 0) {
          console.info("Backup completed successfully: " + newDate);
          const numberOfBackups = numBackups(directoryName);
          if (numberOfBackups == 7) deleteOldestBackup(directoryName);
        } else {
          console.error("Backup failed with code " + code);
        }
      });
    },
    null,
    true,
    "America/Toronto"
  );

  createDirectory(directoryName);
  job.start();
};

console.info("Initializing backup job...");
runJobs();
console.info("Backup job initialized!");
process.exit();

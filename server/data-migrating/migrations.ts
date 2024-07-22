import fs from "fs";
import { validateDataPath } from "../validation/endpoint-schema-map";

type VersionedData = {
  [key: string]: any;
  lastMigrationId?: string;
};

/**
 * When creating an UPDATE migration, ensure you:
 * - update the base file in /server/data-base
 * - update the schema in /server/types/schemas.ts
 */
interface UpdateMigration {
  dateAdded: Date;
  /** NEW is not an option, since this is handled automatically on startup; see preload.ts  */
  type: "UPDATE";
  /** Starts with a / */
  path: string;
  /**
   * Accepts the current state of the data, and returns a new version that fits your updated schema.
   */
  migrator: (old: VersionedData) => object;
}

/**
 * When creating a DELETE migration, ensure you
 * - delete the base file in /server/data-base
 */
interface DeleteMigration {
  type: "DELETE";
  /** Starts with a / */
  path: string;
}

type MigrationData = UpdateMigration | DeleteMigration;

export class DataMigrator {
  /**
   * Once you're confident your migration has been applied across production and staging
   * (i.e. a web dev lead has updated the production/staging site since you merged it),
   * please remove it from this array.
   */
  private static migrations: MigrationData[] = [
    /**
      EXAMPLE MIGRATION:
      {
        type: "UPDATE",
        dateAdded: new Date("2024-01-01"),
        path: "/events.json",
        migrator: (old) => {
          return { ...old, someNewEditableField: "My default value" };
        },
      },
     */
    {
      type: "UPDATE",
      dateAdded: new Date("2024-06-24"),
      path: "/volunteer-application.json",
      migrator: (old) => {
        return { ...old, roles: [], execs: [] };
      },
    },
    {
      type: "UPDATE",
      dateAdded: new Date("2024-06-24"),
      path: "/volunteer.json",
      migrator: (old) => {
        return { ...old, path: "get-involved/volunteer-application" };
      },
    },
  ];

  static async migrate() {
    for (const migration of DataMigrator.migrations) {
      switch (migration.type) {
        case "UPDATE": {
          await DataMigrator.handleUpdateMigration(migration);
          break;
        }
        case "DELETE": {
          await DataMigrator.handleDeleteMigration(migration);
          break;
        }
        default:
          throw new Error("Invalid migration type: " + migration);
      }
    }
  }

  private static async handleUpdateMigration<OldSchema extends VersionedData>(
    migration: UpdateMigration
  ) {
    if (!fs.existsSync(`server/data${migration.path}`)) {
      // No error thrown because the file could have been intentionally deleted
      console.error(
        // escape characters are for red text
        `\x1b[31mERROR:\x1b[0m Update migration on ${migration.path} failed; file does not exist.`
      );
      return;
    }

    if (
      (await fs.promises.stat(`server/data${migration.path}`)).isDirectory()
    ) {
      // Unsupported because I don't know what this would mean? Could be supported in the future if needed.
      throw new Error(
        `Unsupported migration for ${migration.path}: Cannot update directory.`
      );
    }

    const oldData = JSON.parse(
      fs.readFileSync(`server/data${migration.path}`, "utf-8")
    ) as OldSchema;

    if (oldData.lastMigrationId === undefined) {
      throw new Error(
        `No last migration attribute found in existing data file for ${migration.path}`
      );
    }

    if (oldData.lastMigrationId >= migration.dateAdded.toISOString()) {
      // escape characters are for yellow text
      console.warn(
        `\x1b[32m Migration ${migration.dateAdded.toISOString()} skipped for file ${
          migration.path
        }.` +
          ` ${migration.path} was last updated at ${oldData.lastMigrationId}. This is probably intentional.\x1b[0m`
      );

      // a totally arbitrary amount of time. this message is likely to only display if some other migration has occurred on this file since this one.
      const ONE_DAY = 1000 * 60 * 60 * 24;
      if (
        new Date(oldData.lastMigrationId).getTime() >
        migration.dateAdded.getTime() + ONE_DAY
      ) {
        console.info(
          "\x1b[33m Consider deleting this migration once you're certain it has been applied to the staging and prod environments. \x1b[0m"
        );
      }
      return;
    }

    const newData = migration.migrator(oldData) as VersionedData;

    if (Array.isArray(newData)) {
      throw new Error(
        "Must return object from migrator, otherwise we cannot track its last migration."
      );
    }

    newData.lastMigrationId = migration.dateAdded.toISOString(); // now

    console.info(`Validating new state of the data: ${migration.path}`);
    try {
      validateDataPath(migration.path, newData);
    } catch (e) {
      console.error(
        `\x1b[31mMIGRATION ERROR:\x1b[0m Migration for ${
          migration.path
        } failed validation. Attempted new state of the file:\n ${JSON.stringify(
          newData,
          null,
          2
        )}\n\n\x1b[31mProblems with this new state listed below:\x1b[0m\n`
      );

      throw e;
    }

    console.info(`Applying migration to update file: ${migration.path}`);
    fs.writeFileSync(
      `server/data${migration.path}`,
      JSON.stringify(newData, null, 2)
    );
  }

  private static async handleDeleteMigration(migration: DeleteMigration) {
    if (fs.existsSync(`server/data${migration.path}`)) {
      if (
        (await fs.promises.stat(`server/data${migration.path}`)).isDirectory()
      ) {
        /** @todo support deleting directories */
        throw new Error("Deleting /data directories currently unsupported.");
      }

      console.info(`Applying migration to delete file: ${migration.path}`);
      fs.unlinkSync(`server/data${migration.path}`);
    }
  }
}

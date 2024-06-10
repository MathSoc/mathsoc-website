import fs from "fs";

type VersionedData = { version?: number };

/**
 * When creating an UPDATE migration, ensure you:
 * - update the base file in /server/data-base
 * - update the schema in /server/types/schemas.ts
 */
interface UpdateMigration {
  versionToApplyTo: number;
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
        versionToApplyTo: 1,
        path: "/events.json",
        migrator: (old) => {
          return { ...old, someNewEditableField: "My default value" };
        },
      },
     */
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

    if (oldData.version === undefined) {
      throw new Error(
        `No version attribute found in existing data file for ${migration.path}`
      );
    }

    if (oldData.version !== migration.versionToApplyTo) {
      console.warn(
        `Migration skipped from versions ${migration.versionToApplyTo} to ${
          migration.versionToApplyTo + 1
        } for file ${migration.path}.` +
          ` ${migration.path} is at version ${oldData.version}.`
      );

      if (oldData.version > migration.versionToApplyTo) {
        console.info(
          "Consider deleting this migration once you're certain it has been applied to the staging and prod environments."
        );
      }
    }

    const newData = migration.migrator(oldData) as VersionedData;

    if (Array.isArray(newData)) {
      throw new Error(
        "Must return object from migrator, otherwise we cannot version it."
      );
    }

    newData.version = migration.versionToApplyTo + 1;

    console.info(`Applying migration to update file: ${migration.path}`);

    fs.writeFileSync(`server/data${migration.path}`, JSON.stringify(newData));
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

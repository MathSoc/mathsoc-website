import { DataFiller } from "./preload/data-filler";
import { DirectoryPrebuilder } from "./preload/directory-prebuilder";
import { DataMigrator } from "./server/data-migrating/migrations";

(async () => {
  await DirectoryPrebuilder.prebuild();
  await DataFiller.fillDataFolder();
  await DataMigrator.migrate();
  process.exit();
})();

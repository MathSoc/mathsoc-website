import { DataFiller } from "./preload/data-filler";
import { DirectoryPrebuilder } from "./preload/directory-prebuilder";

(async () => {
  await DirectoryPrebuilder.prebuild();
  await DataFiller.fillDataFolder();
  process.exit();
})();

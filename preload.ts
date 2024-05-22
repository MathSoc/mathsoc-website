import { DataFiller } from "./preload/data-filler";
import { DirectoryPrebuilder } from "./preload/directory-prebuilder";

DirectoryPrebuilder.prebuild();
DataFiller.fillDataFolder();

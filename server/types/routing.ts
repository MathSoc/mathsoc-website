import navigationItems from "../config/navbar.json";
import footerData from "../data/shared/footer.json";

export interface PageInflow {
  title: string;
  ref?: string; // if no ref specified, the "page" is just a category; no page route is created
  view?: string;
  // if noRouting is true, the router should not build a page at this ref.
  // This should be used for pages that are routed to in unique ways; not intended for categories.
  noRouting?: boolean;
  dataSources?: {
    [key: string]: string | undefined;
  };
  children?: PageInflow[];
  renderInExamBankMode?: boolean;
}

export interface PageOutflow {
  navItems: typeof navigationItems;
  footer: typeof footerData;
  data?;
  title: string;
  ref?: string;
  sources?: Record<string, object | any[] | null>;
  dataEndpoints?: string[];
  examBankOnly: boolean;
}

export interface AdminPageOutflow extends PageOutflow {
  adminNavSections: PageInflow[];
}

export type DirectoryEntry =
  | { name: string; type: "page"; ref: string }
  | {
      name: string;
      type: "directory";
      subdirectory: DirectoryEntry[];
      ref: string;
    }
  | DirectoryEntry[];

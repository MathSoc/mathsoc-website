export interface Page {
  title: string;
  ref?: string; // if no ref specified, the "page" is just a category; no page route is created
  view?: string;
  dataSources?: Record<string, string>;
  children?: Page[];
}

/**
 * Autogenerates a page title based on a URL.
 * @example getFormattedURL('/data?path=get-involved/volunteer.json') => 'Get Involved / Volunteer'
 */
export function getFormattedURL(url: string) {
  return url // get-involved/volunteer.json
    .replace(/-/g, " ") // get involved/volunteer.json
    .replace(/\.json/g, " ") // get involved/volunteer
    .replace(/\//g, " / ") // get involved / volunteer
    .split(" ")
    .map((word: string) => {
      if (word === "") return "";
      return word[0].toUpperCase() + word.substring(1);
    })
    .join(" ") // Get Involved / Volunteer
    .trim();
}

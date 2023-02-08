# Data Server README

This is the data server in this directory. All the page data is stored here, as well as other filed such as the `execs.json` file in the `data/shared/` directory which is used on multiple pages. In order to make use of this directory properly, use this README as a checklist.

- If you are creating a file for a specific page, like `get-involved/volunteer`, make sure you add the page to the the `pages.json` folder in the `config/` directory. When you add the page, if the `ref` and `view` fields are the same, you are done with this step. Otherwise, create a `dataSources` field in the page object and add the path to the file you want served to this page. This will ensure the proper data is piped to the frontend for your page.
- Once the above step is done, create a schema for your new file in `server/types/schemas.ts`. This schema ensures that the data sent back from the CMS is valid and exactly how we expect it. Take a look at the other schemas in the file to figure out how we want this done.
- Next, go to `server/validation/data-paths.ts` and add your new file and its path to the enum. This should be doable just by looking at the file.
- Next, go to `server/validation/endpoint-schema-map.ts` and add your addition to the enum into to endpoint mapping. This should also be doable just by looking at the file.

If you have any questions, feel free to reach out to Aryaman or River on Discord.

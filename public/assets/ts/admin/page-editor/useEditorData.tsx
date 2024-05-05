import React, { useCallback, useEffect, useMemo } from "react";
import { usePageSources } from "./usePageSources";

export const useEditorData = (source: string) => {
  const [data, setData] = React.useState<object>();
  const [originalDataString, setOriginalDataString] = React.useState<string>();

  /**
   * The schema for this editor is stored as a JSON.stringify()ed object. This resolves
   * a bug where certain elements of the schema would aribtrarily be set to `undefined`.
   */
  const [schema, setSchema] = React.useState<string>(null);

  const queryData = usePageSources(source).data;

  const isModified = useMemo(() => {
    return !(originalDataString === JSON.stringify(data));
  }, [data, originalDataString]);

  const getDataValueRecursive = useCallback(
    (path: string[], remainingData: object) => {
      if (path.length === 0) {
        return remainingData;
      }

      const smallerValue = remainingData[path[0]];
      const remainingPath = path.slice(1);

      return getDataValueRecursive(remainingPath, smallerValue);
    },
    []
  );

  /**
   * Returns data[path]. This can be used to obtain nested values.
   */
  const getDataValue = useCallback(
    (path: string[]) => {
      return getDataValueRecursive(path, data);
    },
    [data, getDataValueRecursive]
  );

  /**
   * Returns whether an object is arraylike; that is, whether it is of the shape {0: ..., 1: ..., ...}
   */
  const couldBeArray = useCallback((array: object) => {
    return Object.keys(array)
      .map((key) => parseInt(key))
      .every((key) => !isNaN(key));
  }, []);

  const getSaveableDataRecursive = useCallback(
    (subData: object) => {
      if (typeof subData === "object") {
        if (Array.isArray(subData)) {
          subData = subData
            .filter((entry) => !!entry) // filter out null data
            .map((entry) => {
              return getSaveableDataRecursive(entry);
            });
        } else {
          if (couldBeArray(subData)) {
            return getSaveableDataRecursive(
              Object.entries(subData)
                .sort((a, b) => (a[0] < b[0] ? -1 : 1))
                .map((a) => a[1])
            );
          } else {
            for (const key in subData) {
              subData[key] = getSaveableDataRecursive(subData[key]);
            }
            return subData;
          }
        }
      }

      return subData;
    },
    [couldBeArray]
  );

  /**
   * Returns `data` with all arraylike objects turned into arrays
   */
  const getSaveableData = useCallback(() => {
    return getSaveableDataRecursive(data);
  }, [data, getSaveableDataRecursive]);

  const getSchemaValueRecursive = useCallback(
    (path: string[], remainingSchema: object) => {
      if (path.length === 0) {
        return remainingSchema;
      }

      // whereas data has several entries per array, a schema only ever has one. this allows us to use the same
      //  path regardless
      let smallerValue: object;
      if (!isNaN(parseInt(path[0]))) {
        smallerValue = remainingSchema[0];
      } else {
        smallerValue = remainingSchema[path[0]];
      }

      const remainingPath = path.slice(1);

      return getSchemaValueRecursive(remainingPath, smallerValue);
    },
    []
  );

  /**
   * Returns schema[path]. This can be used to obtain nested values.
   */
  const getSchemaValue = useCallback(
    (path: string[]) => {
      const parsedSchema = JSON.parse(schema);
      return getSchemaValueRecursive(path, parsedSchema);
    },
    [schema, getSchemaValueRecursive]
  );

  const setDataValueRecursive = useCallback(
    (path: string[], remainingData: object, value: any): object => {
      if (path.length === 1) {
        remainingData[path[0]] = value;
      } else {
        remainingData[path[0]] = setDataValueRecursive(
          path.slice(1),
          remainingData[path[0]],
          value
        );
      }

      return remainingData;
    },
    []
  );

  /**
   * Sets `data[path] = value`. This can be used to set nested values.
   */
  const setDataValue = useCallback(
    (path: string[], value: any) => {
      setData({ ...setDataValueRecursive(path, data, value) });
    },
    [data, setDataValueRecursive]
  );

  /**
   * Fetches the data schema from the server
   */
  const resetSchema = useCallback(() => {
    fetch(`/api/data/schema/?path=${source}`).then(async (response) => {
      const parsedResponse = JSON.stringify(await response.json());
      setSchema(parsedResponse);
    });
  }, [source]);

  /**
   * Updates the local copy of `data` with the response from the server once it arrives.
   * This should only trigger once.
   */
  useEffect(() => {
    if (queryData != null) {
      setData(queryData);
      setOriginalDataString(JSON.stringify(queryData));
    }
  }, [queryData]);

  /**
   * Fetches the schema for this page. Should only trigger once.
   */
  useEffect(() => resetSchema(), [resetSchema]);

  return {
    data,
    isModified,

    getDataValue,
    setDataValue,

    getSaveableData,
    getSchemaValue,

    couldBeArray,
  };
};

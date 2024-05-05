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

  const getDataValue = useCallback(
    (path: string[]) => {
      return getDataValueRecursive(path, data);
    },
    [data, getDataValueRecursive]
  );

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

  const setDataValue = useCallback(
    (path: string[], value: any) => {
      setData({ ...setDataValueRecursive(path, data, value) });
    },
    [data, setDataValueRecursive]
  );

  const couldBeArray = useCallback((array: object) => {
    return Object.keys(array)
      .map((key) => parseInt(key))
      .every((key) => !isNaN(key));
  }, []);

  const removeDataArrayElementRecursive = useCallback(
    (path: string[], remainingData: object, index: number): object => {
      if (path.length === 0) {
        if (!couldBeArray(remainingData)) {
          throw new Error(
            `No array found at ${path} with ${JSON.stringify(remainingData)}`
          );
        }

        remainingData[index] = null;
      } else {
        remainingData[path[0]] = removeDataArrayElementRecursive(
          path.slice(1),
          remainingData[path[0]],
          index
        );
      }

      return remainingData;
    },
    [couldBeArray]
  );

  const removeDataArrayElement = useCallback(
    (path: string[], index: number) => {
      setData(removeDataArrayElementRecursive(path, data, index));
    },
    [data, removeDataArrayElementRecursive]
  );

  const resetSchema = useCallback(() => {
    fetch(`/api/data/schema/?path=${source}`).then(async (response) => {
      const parsedResponse = JSON.stringify(await response.json());
      setSchema(parsedResponse);
      console.log("schema fetched", parsedResponse);
    });
  }, [source]);

  useEffect(() => {
    if (queryData != null) {
      setData(queryData);
      setOriginalDataString(JSON.stringify(queryData));
    }
  }, [queryData]);

  useEffect(() => resetSchema(), [resetSchema]);

  return {
    data,
    isModified,

    getDataValue,
    setDataValue,

    getSchemaValue,

    couldBeArray,
    removeDataArrayElement,
  };
};

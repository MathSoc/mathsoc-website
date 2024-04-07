import React, { useEffect, useMemo } from "react";
import { usePageSources } from "./usePageSources";

export const useEditorData = (source: string) => {
  const [data, setData] = React.useState<object>();
  const [originalDataString, setOriginalDataString] = React.useState<string>();
  const queryData = usePageSources(source).data;

  const isModified = useMemo(() => {
    console.log(originalDataString, JSON.stringify(data));
    return !(originalDataString === JSON.stringify(data));
  }, [data, originalDataString]);

  const getDataValue = (path: string[]) => {
    return getDataValueRecursive(path, data);
  };

  const getDataValueRecursive = (path: string[], remainingData: object) => {
    if (path.length === 0) {
      return remainingData;
    }

    const smallerValue = remainingData[path[0]];
    const remainingPath = path.slice(1);

    return getDataValueRecursive(remainingPath, smallerValue);
  };

  const setDataValue = (path: string[], value: string) => {
    setData({ ...setDataValueRecursive(path, data, value) });
  };

  const setDataValueRecursive = (
    path: string[],
    remainingData: object,
    value: string
  ): object => {
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
  };

  const couldBeArray = (array: object) => {
    return Object.keys(array)
      .map((key) => parseInt(key))
      .every((key) => !isNaN(key));
  };

  const arrayLiketoArray = (arrayLike: object | any[]) => {
    return Object.keys(arrayLike).map((key) => arrayLike[key]);
  };

  const removeDataArrayElement = (path: string[], index: number) => {
    setData(removeDataArrayElementRecursive(path, data, index));
  };

  const removeDataArrayElementRecursive = (
    path: string[],
    remainingData: object,
    index: number
  ): object => {
    if (path.length === 0) {
      if (!couldBeArray(remainingData)) {
        throw new Error(
          `No array found at ${path} with ${JSON.stringify(remainingData)}`
        );
      }

      const array = arrayLiketoArray(remainingData);
      array.splice(index, 1);
      remainingData = array;
    } else {
      remainingData[path[0]] = removeDataArrayElementRecursive(
        path.slice(1),
        remainingData[path[0]],
        index
      );
    }

    return remainingData;
  };

  useEffect(() => {
    if (queryData != null) {
      setData(queryData);
      setOriginalDataString(JSON.stringify(queryData));
    }
  }, [queryData]);

  return {
    data,
    isModified,

    getDataValue,
    setDataValue,

    couldBeArray,
    removeDataArrayElement,
  };
};

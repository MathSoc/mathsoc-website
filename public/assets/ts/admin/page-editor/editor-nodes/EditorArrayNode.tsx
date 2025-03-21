import React, { useMemo, useState } from "react";
import { EditorNodeProps, EditorNodeTemplate } from "./EditorNodeTemplate";
import { EditorContext } from "../EditorV2";
import { EditorNode } from "./EditorNode";

export const EditorArrayNode: React.FC<EditorNodeProps> = (props) => {
  const { path } = props;
  const { getDataValue, getSchemaValue, setDataValue, couldBeArray } =
    React.useContext(EditorContext);
  const [version, setVersion] = useState(0);

  const data = getDataValue(path);

  if (data === undefined) {
    throw new Error(`Data does not exist at ${path}.`);
  }

  if (!couldBeArray(data)) {
    throw new Error(`Bad array node: ${path}`);
  }

  const transformedData = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    } else {
      return Object.values(data);
    }
  }, [data]);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= transformedData.length) {
      return;
    }

    const newData = [...transformedData];
    [newData[fromIndex], newData[toIndex]] = [newData[toIndex], newData[fromIndex]]; 
  
    setDataValue(path, newData);
    setVersion(version + 1);
  };
  
  const removeItem = (index: number) => {
    setDataValue(path.concat(index.toString()), null);
    setVersion(version + 1);
  };

  // Deletes all elements of any array anywhere in an object(?) v
  const clearArrays = (v: any) => {
    if (Array.isArray(v)) {
      return [];
    } else if (typeof v == "object") {
      for (const key in v) {
        v[key] = clearArrays(v[key]);
      }
    }

    return v;
  };

  const addItem = () => {
    const newItemPath = path.concat(transformedData.length.toString());
    const newItemSchema = getSchemaValue(path)[0];

    setDataValue(newItemPath, clearArrays(newItemSchema));
  };

  return (
    <EditorNodeTemplate
      {...props}
      headerButtons={[{ name: "Add", onClick: addItem }]}
    >
      {transformedData.map((entry, index) => {
        if (entry === null) {
          return null;
        }

        const nextPath = path.concat(index.toString());
        return (
          <EditorNode
            key={`${index}-${version}`} 
            name={`${props.name} item ${index + 1}`}
            headerButtons={[
              {
                name: "Move Up",
                onClick: () => moveItem(index, index - 1),
              },
              {
                name: "Move Down",
                onClick: () => moveItem(index, index + 1),
              },
              { name: "Remove", onClick: () => removeItem(index) },
            ]}
            /**
             * The data index is persistent across re-renders
             */
            path={nextPath}
            value={entry}
            theme={"grey"}
          />
        );
      })}
    </EditorNodeTemplate>
  );
};

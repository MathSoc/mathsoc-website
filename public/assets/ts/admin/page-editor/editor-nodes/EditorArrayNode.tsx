import React, { useMemo, useState } from "react";
import { EditorNodeProps, EditorNodeTemplate } from "./EditorNodeTemplate";
import { EditorContext } from "../EditorV2";
import { EditorNode } from "./EditorNode";

export const EditorArrayNode: React.FC<EditorNodeProps> = (props) => {
  const { path } = props;
  const {
    getDataValue,
    getSchemaValue,
    setDataValue,
    couldBeArray,
    removeDataArrayElement,
  } = React.useContext(EditorContext);
  const [version, setVersion] = useState(0);

  const data = getDataValue(path);

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

  const removeItem = (index: number) => {
    removeDataArrayElement(path, index);
    setVersion(version + 1);
  };

  const addItem = () => {
    const newItemPath = path.concat(transformedData.length.toString());
    const newItemSchema = getSchemaValue(path)[0];

    setDataValue(newItemPath, newItemSchema);
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
            name={`${props.name} item ${index + 1}`}
            headerButtons={[
              { name: "Remove", onClick: () => removeItem(index) },
            ]}
            /**
             * The data index is persistent across re-renders
             */
            key={index}
            path={nextPath}
            value={entry}
            theme={"grey"}
          />
        );
      })}
    </EditorNodeTemplate>
  );
};

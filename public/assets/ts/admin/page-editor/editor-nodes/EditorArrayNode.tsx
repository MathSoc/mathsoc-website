import React, { useMemo, useState } from "react";
import { EditorNodeProps, EditorNodeTemplate } from "./EditorNodeTemplate";
import { EditorContext } from "../EditorV2";
import { EditorNode } from "./EditorNode";

export const EditorArrayNode: React.FC<EditorNodeProps> = (props) => {
  const { path } = props;
  const { getDataValue, couldBeArray, removeDataArrayElement } =
    React.useContext(EditorContext);
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

  return (
    <EditorNodeTemplate
      {...props}
      headerButtons={[{ name: "Add", onClick: () => null }]}
    >
      {transformedData.map((entry, index) => {
        const nextPath = path.concat(index.toString());
        return (
          <EditorNode
            name={`Item ${index + 1}`}
            headerButtons={[
              { name: "Remove", onClick: () => removeItem(index) },
            ]}
            // need both the entry and index for a unique key that maintains uniqueness after array reordering
            key={`${JSON.stringify(entry)}-${index}`}
            path={nextPath}
            value={entry}
            theme={"grey"}
          />
        );
      })}
    </EditorNodeTemplate>
  );
};

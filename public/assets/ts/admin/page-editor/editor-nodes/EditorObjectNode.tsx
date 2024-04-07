import React from "react";
import { EditorNodeProps, EditorNodeTemplate } from "./EditorNodeTemplate";
import { EditorContext } from "../EditorV2";
import { EditorNode } from "./EditorNode";

export const EditorObjectNode: React.FC<EditorNodeProps> = (props) => {
  const { path } = props;
  const { getDataValue } = React.useContext(EditorContext);

  const data = getDataValue(path);

  if (typeof data !== "object") {
    throw new Error(`Bad object node at ${path}: ${JSON.stringify(data)}`);
  }

  const entries = Object.entries(data);

  return (
    <EditorNodeTemplate {...props}>
      {entries.map((entry) => {
        const nextPath = path.concat(entry[0]);
        return (
          <EditorNode
            name={entry[0]}
            key={entry[0]}
            value={entry[1]}
            path={nextPath}
          />
        );
      })}
    </EditorNodeTemplate>
  );
};

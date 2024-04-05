import React from "react";
import { EditorNodeTemplate } from "./EditorNodeTemplate";
import { EditorContext } from "../EditorV2";
import { EditorNode } from "./EditorNode";

export const EditorObjectNode: React.FC<{
  name: string;
  path: string[];
}> = ({ name, path }) => {
  const { getDataValue } = React.useContext(EditorContext);

  const data = getDataValue(path);

  if (typeof data !== "object") {
    throw new Error(`Bad object node: ${path}`);
  }

  const entries = Object.entries(data);

  return (
    <EditorNodeTemplate name={name}>
      {entries.map((entry) => {
        const nextPath = path.concat(entry[0]);
        return (
          <EditorNode
            name={entry[0]}
            key={entry[0]}
            path={nextPath}
            value={entry[1]}
          />
        );
      })}
    </EditorNodeTemplate>
  );
};

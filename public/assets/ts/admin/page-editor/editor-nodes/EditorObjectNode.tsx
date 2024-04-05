import React from "react";
import { EditorMarkdownNode } from "./EditorMarkdownNode";
import { EditorNode } from "./EditorNode";
import { EditorContext } from "../EditorV2";
import { EditorLabelNode } from "./EditorLabelNode";

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
    <EditorNode name={name}>
      {entries.map((entry) => {
        const nextPath = path.concat(entry[0]);
        if (typeof entry[1] === "object") {
          return (
            <EditorObjectNode name={entry[0]} key={entry[0]} path={nextPath} />
          );
        } else if (entry[0].includes("Markdown")) {
          return (
            <EditorMarkdownNode
              path={nextPath}
              name={entry[0]}
              key={entry[0]}
            />
          );
        } else {
          return (
            <EditorLabelNode name={entry[0]} key={entry[0]} path={nextPath} />
          );
        }
      })}
    </EditorNode>
  );
};

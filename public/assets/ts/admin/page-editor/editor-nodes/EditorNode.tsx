import React from "react";
import { EditorObjectNode } from "./EditorObjectNode";
import { EditorMarkdownNode } from "./EditorMarkdownNode";
import { EditorLabelNode } from "./EditorLabelNode";

export const EditorNode: React.FC<{
  name: string;
  path: string[];
  value: any;
}> = ({ name, path, value }) => {
  if (typeof value === "object") {
    return <EditorObjectNode name={name} path={path} />;
  } else if (name.includes("Markdown")) {
    return <EditorMarkdownNode name={name} path={path} />;
  } else {
    return <EditorLabelNode name={name} path={path} />;
  }
};

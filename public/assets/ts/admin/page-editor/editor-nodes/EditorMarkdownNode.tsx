import React from "react";
import ReactQuill from "react-quill";
import { EditorContext } from "../EditorV2";
import { EditorNode } from "./EditorNode";

export const EditorMarkdownNode: React.FC<{
  name: string;
  path: string[];
}> = ({ name, path }) => {
  const { getDataValue, setDataValue } = React.useContext(EditorContext);

  return (
    <EditorNode name={name}>
      <ReactQuill
        theme="snow"
        value={getDataValue(path)}
        onChange={(newValue) => {
          setDataValue(path, newValue);
        }}
      />
    </EditorNode>
  );
};

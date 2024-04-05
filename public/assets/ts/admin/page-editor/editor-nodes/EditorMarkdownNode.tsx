import React from "react";
import ReactQuill from "react-quill";
import { EditorContext } from "../EditorV2";
import { EditorNodeTemplate } from "./EditorNodeTemplate";

export const EditorMarkdownNode: React.FC<{
  name: string;
  path: string[];
}> = ({ name, path }) => {
  const { getDataValue, setDataValue } = React.useContext(EditorContext);

  return (
    <EditorNodeTemplate name={name}>
      <ReactQuill
        theme="snow"
        value={getDataValue(path)}
        onChange={(newValue) => {
          setDataValue(path, newValue);
        }}
      />
    </EditorNodeTemplate>
  );
};

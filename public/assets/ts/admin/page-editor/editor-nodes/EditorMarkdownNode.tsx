import React from "react";
import ReactQuill from "react-quill";
import { EditorContext } from "../EditorV2";
import { EditorNodeProps, EditorNodeTemplate } from "./EditorNodeTemplate";

export const EditorMarkdownNode: React.FC<EditorNodeProps> = (props) => {
  const { path } = props;
  const { getDataValue, setDataValue } = React.useContext(EditorContext);

  return (
    <EditorNodeTemplate {...props}>
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

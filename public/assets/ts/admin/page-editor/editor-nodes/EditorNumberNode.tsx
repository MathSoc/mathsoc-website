import React from "react";
import { EditorNodeProps, EditorNodeTemplate } from "./EditorNodeTemplate";
import { EditorContext } from "../EditorV2";

export const EditorNumberNode: React.FC<EditorNodeProps> = (props) => {
  const { path } = props;
  const labelId = `${path.join(".")}-label`;
  const { getDataValue, setDataValue } = React.useContext(EditorContext);

  return (
    <EditorNodeTemplate key={path.join("-")} labelId={labelId} {...props}>
      <input
        aria-labelledby={labelId}
        className="editor-input"
        value={getDataValue(path)}
        onChange={(event) => {
          const value = parseFloat(event.target.value);
          setDataValue(path, isNaN(value) ? event.target.value : value);
        }}
      />
    </EditorNodeTemplate>
  );
};

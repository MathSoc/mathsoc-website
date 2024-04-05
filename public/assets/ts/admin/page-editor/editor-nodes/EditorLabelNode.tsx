import React from "react";
import { EditorNode } from "./EditorNode";
import { EditorContext } from "../EditorV2";

export const EditorLabelNode: React.FC<{
  name: string;
  path: string[];
}> = ({ name, path }) => {
  const labelId = `${path.join(".")}-label`;
  const { getDataValue, setDataValue } = React.useContext(EditorContext);

  return (
    <EditorNode key={path.join("-")} name={name} labelId={labelId}>
      <input
        aria-labelledby={labelId}
        className="editor-input"
        defaultValue={getDataValue(path)}
        onChange={(event) => {
          setDataValue(path, event.target.value);
        }}
      />
    </EditorNode>
  );
};

import React from "react";
import ReactQuill from "react-quill";
import { EditorContext } from "./EditorV2";

export const EditorNode: React.FC<{
  name: string;
  children: React.ReactNode;
  labelId?: string;
}> = ({ name, children, labelId }) => {
  const getFormattedName = (name: string) => {
    return name
      ?.replace(/([A-Z])/g, " $1")
      .split(" ")
      .map((word) => {
        if (!word) return "";
        if (word.includes("Markdown")) return "";
        return word[0].toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  return (
    <div className="editor-node-container">
      {labelId ? (
        <label className="editor-label" id={labelId}>
          {getFormattedName(name)}
        </label>
      ) : (
        <span className="editor-label">{getFormattedName(name)}</span>
      )}
      {children}
    </div>
  );
};

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

const EditorLabelNode: React.FC<{
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

import React from "react";

export const EditorNodeTemplate: React.FC<{
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

import React from "react";

export interface EditorNodeProps {
  name: string;
  path: string[];
  theme?: EditorNodeTheme;
  headerButtons?: EditorNodeTemplateHeaderButtonProps[];
}

interface EditorNodeTemplateHeaderButtonProps {
  name: string;
  onClick: () => void;
}

export type EditorNodeTheme = "grey";

export const EditorNodeTemplate: React.FC<
  Omit<EditorNodeProps, "path"> & {
    children: React.ReactNode;
    labelId?: string;
  }
> = ({ name, children, labelId, headerButtons, theme }) => {
  const getFormattedName = (name: string) => {
    return name
      ?.replace(/([A-Z])/g, " $1")
      .split(" ")
      .map((word) => {
        if (!word || word.includes("Markdown")) return "";
        return word[0].toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  return (
    <div
      className={`editor-node-container ${theme ? `editor-node-${theme}` : ""}`}
    >
      <div className="editor-node-label-bar">
        {labelId ? (
          <label className="editor-label" id={labelId}>
            {getFormattedName(name)}
          </label>
        ) : (
          <span className="editor-label">{getFormattedName(name)}</span>
        )}
        <div className="editor-node-buttons">
          {headerButtons?.map(({ name, onClick }) => {
            return (
              <button
                key={name}
                className="editor-node-header-button"
                onClick={onClick}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="editor-node-content-container">{children}</div>
    </div>
  );
};

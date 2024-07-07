import { useQuery } from "@tanstack/react-query";
import React from "react";

type EditorStructureLayer = (EditorStructureDirectory | EditorStructurePage)[];

type EditorStructurePage = {
  name: string;
  type: "page";
  ref: string;
};
type EditorStructureDirectory = {
  name: string;
  type: "directory";
  ref: string;
  subdirectory: EditorStructureLayer;
};

export const EditorSideMenu: React.FC = () => {
  const menu: EditorStructureLayer = useQuery({
    queryKey: [`pages`],
    queryFn: async () => {
      const res = await fetch(`${window.location.origin}/api/editor/structure`);
      const result = await res.json();
      return result;
    },
  }).data;

  if (!menu) {
    return;
  }

  return (
    <div className="editor-side-menu">
      <h2>Editor select</h2>
      <button onClick={() => document.getElementById("body").scrollIntoView()}>
        Skip Sidebar
      </button>
      <EditorSideMenuLayer layer={menu} />
    </div>
  );
};

const EditorSideMenuLayer: React.FC<{ layer: EditorStructureLayer }> = ({
  layer,
}) => {
  return (
    <ul>
      {layer.map((entry) => {
        if (entry.type === "page") {
          return (
            <li key={entry.name}>
              <a href={`/admin/editor?page=${entry.ref}`}>{entry.name}</a>
            </li>
          );
        } else {
          return (
            <EditorSideMenuSubdirectoryLayer
              key={entry.name}
              name={entry.name}
              subdirectory={entry.subdirectory}
            />
          );
        }
      })}
    </ul>
  );
};

const EditorSideMenuSubdirectoryLayer: React.FC<{
  name: string;
  subdirectory: EditorStructureLayer;
}> = ({ name, subdirectory }) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  return (
    <li>
      <button onClick={() => setIsOpen(!isOpen)}>{name}</button>
      {isOpen ? <EditorSideMenuLayer layer={subdirectory} /> : null}
    </li>
  );
};

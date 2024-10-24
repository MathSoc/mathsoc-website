import React, { useContext } from "react";
import { EditorObjectNode } from "./EditorObjectNode";
import { EditorMarkdownNode } from "./EditorMarkdownNode";
import { EditorLabelNode } from "./EditorLabelNode";
import { EditorArrayNode } from "./EditorArrayNode";
import { EditorNodeProps } from "./EditorNodeTemplate";
import { EditorContext } from "../EditorV2";
import { EditorImageNode } from "./EditorImageNode";
import { EditorNumberNode } from "./EditorNumberNode";

export const EditorNode: React.FC<EditorNodeProps & { value: any }> = (
  props
) => {
  const { value } = props;
  const { couldBeArray } = useContext(EditorContext);

  // @todo recognize booleans, numbers, optional data
  if (typeof value === "object") {
    if (couldBeArray(value)) {
      return <EditorArrayNode {...props} />;
    } else {
      return <EditorObjectNode {...props} />;
    }
  } else if (props.name.toLowerCase().includes("image")) {
    return <EditorImageNode {...props} />;
  } else if (props.name.includes("Markdown")) {
    return <EditorMarkdownNode {...props} />;
  } else if (props.name === "lastMigrationId") {
    // @todo make a non-editable EditorNode child to display the time of last migration. That or display it by some other means.
    return null;
  } else if (typeof value === "number") {
    return <EditorNumberNode {...props} />;
  } else {
    return <EditorLabelNode {...props} />;
  }
};

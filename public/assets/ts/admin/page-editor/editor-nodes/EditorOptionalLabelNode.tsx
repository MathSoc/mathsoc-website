import React, { useState } from "react";
import { EditorNodeProps, EditorNodeTemplate } from "./EditorNodeTemplate";
import { EditorLabelNode } from "./EditorLabelNode";

export const EditorOptionalNode: React.FC<EditorNodeProps> = (props) => {
  const { path } = props;
  const [isIncluded, setIsIncluded] = useState<boolean>();

  return (
    <EditorNodeTemplate
      key={`${path.join("-")}-option`}
      {...props}
      headerButtons={[
        {
          name: "Include",
          onClick: () => {
            setIsIncluded(!isIncluded);
          },
        },
      ]}
    >
      {isIncluded ? <EditorLabelNode {...props} /> : null}
    </EditorNodeTemplate>
  );
};

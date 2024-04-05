import React from "react";
import { EditorV2 } from "./EditorV2";
import { EditorSideMenu } from "./EditorSideMenu";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const EditorPageV2: React.FC<{ source: string; name: string }> = ({
  source,
  name,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="editor-page-container">
        <EditorSideMenu />
        <EditorV2 source={source} name={name} />
      </div>
    </QueryClientProvider>
  );
};

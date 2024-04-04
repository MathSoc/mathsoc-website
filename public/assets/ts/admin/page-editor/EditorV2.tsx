import React, { createContext } from "react";
import { usePageSources } from "./usePageSources";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EditorObjectNode } from "./EditorNodes";
import { showToast } from "../toast";

const queryClient = new QueryClient();

interface EditorV2Props {
  source: string;
}

export const EditorContext = createContext<{
  getDataValue: (path: string[]) => any;
  setDataValue: (path: string[], value: string) => void;
}>(null);

const onAttemptedPageExit = (e: BeforeUnloadEvent) => {
  e.preventDefault();

  // this message won't display on most browsers except possibly for Edge; on other browsers
  //  any truthy value will trigger the exit message
  return (e.returnValue =
    "Are you sure you want to leave?  Your changes may not be saved.");
};

export const EditorV2: React.FC<EditorV2Props> = (props: EditorV2Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <EditorV2WithQueryClient {...props} />
    </QueryClientProvider>
  );
};

const EditorV2WithQueryClient: React.FC<EditorV2Props> = ({ source }) => {
  const data = React.useRef({});
  const setData = (newData: object) => {
    data.current = newData;
  };

  const query = usePageSources(source, setData);

  const getDataValue = (path: string[]) => {
    return getDataValueRecursive(path, data.current);
  };

  const getDataValueRecursive = (path: string[], remainingData: object) => {
    if (path.length === 0) {
      return remainingData;
    }

    const smallerValue = remainingData[path[0]];
    const remainingPath = path.slice(1);

    return getDataValueRecursive(remainingPath, smallerValue);
  };

  const setDataValue = (path: string[], value: string) => {
    window.addEventListener("beforeunload", onAttemptedPageExit);

    data.current = setDataValueRecursive(path, data.current, value);
  };

  const setDataValueRecursive = (
    path: string[],
    remainingData: object,
    value: string
  ): object => {
    if (path.length === 1) {
      remainingData[path[0]] = value;
    } else {
      remainingData[path[0]] = setDataValueRecursive(
        path.slice(1),
        remainingData[path[0]],
        value
      );
    }

    return remainingData;
  };

  const getErrorMessage = (response: Response) => {
    switch (response.status) {
      case 400: {
        return `Bad POST request to ${source}.`;
      }
      case 401: {
        return `Unauthorized POST request to ${source}.`;
      }
      case 403: {
        return `Forbidden POST request to ${source}`;
      }
      case 404: {
        return `File not found in POST request to ${source}.`;
      }
      default: {
        return `Unexpected ${response.status} error from GET request to ${source}`;
      }
    }
  };

  const saveData = () => {
    fetch(`/api/data?path=${source}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data.current),
    }).then((response) => {
      const responseCodeClass = Math.floor(response.status / 100) * 100;

      if (responseCodeClass === 200) {
        showToast(`${source} saved successfully!`, "success");

        // Disables 'are you sure you want to exit' prompt
        window.removeEventListener("beforeunload", onAttemptedPageExit);
      } else {
        const fullErrorMessage = `Failed to save ${source}. ${getErrorMessage(
          response
        )}.`;

        showToast(fullErrorMessage, "fail");
        throw new Error(fullErrorMessage);
      }
    });
  };

  if (!query.data) {
    return <span>Loading...</span>;
  }

  return (
    <EditorContext.Provider value={{ getDataValue, setDataValue }}>
      <div className="editorv2">
        <div className="editor-content">
          <EditorObjectNode name={source} path={[]} />
        </div>
        <div className="save-button-container">
          <button className="save pink-button" onClick={saveData}>
            Save
          </button>
        </div>
      </div>
    </EditorContext.Provider>
  );
};

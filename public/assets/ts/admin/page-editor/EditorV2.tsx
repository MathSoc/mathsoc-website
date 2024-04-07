import React, { createContext, useCallback, useEffect } from "react";
import { showToast } from "../toast";
import { EditorNode } from "./editor-nodes/EditorNode";
import { useEditorData } from "./useEditorData";

export const EditorContext = createContext<{
  getDataValue: (path: string[]) => any;
  setDataValue: (path: string[], value: string) => void;

  couldBeArray: (array: object) => boolean;
  removeDataArrayElement: (path: string[], index: number) => void;
}>(null);

export const EditorV2: React.FC<{ source: string; name: string }> = ({
  name,
  source,
}) => {
  const {
    data,
    isModified,

    getDataValue,
    setDataValue,
    couldBeArray,
    removeDataArrayElement,
  } = useEditorData(source);

  // const [, setIsLoaded] = useState(false); // used to trigger a necessary re-render that loads the editor with data.

  const onAttemptedPageExit = useCallback(
    (e: BeforeUnloadEvent) => {
      if (!isModified) {
        return;
      }

      e.preventDefault();

      // this message won't display on most browsers except possibly for Edge; on other browsers
      //  any truthy value will trigger the exit message
      return (e.returnValue =
        "Are you sure you want to leave?  Your changes may not be saved.");
    },
    [isModified]
  );

  const getErrorMessage = (response: Response) => {
    switch (response.status) {
      case 400: {
        return `Bad POST request to ${source}.`;
      }
      case 401: {
        return `Unauthorized POST request to ${source}`;
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
    fetch(`/api/data?path=${source.replace(".json", "")}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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

  useEffect(() => {
    window.addEventListener("beforeunload", onAttemptedPageExit);
  }, [onAttemptedPageExit]);

  if (!data) {
    return <span>Loading...</span>;
  }

  return (
    <EditorContext.Provider
      value={{
        getDataValue,
        setDataValue,
        couldBeArray,
        removeDataArrayElement,
      }}
    >
      <div className="editorv2">
        <div className="editor-content">
          <h2>Edit: {name}</h2>
          <EditorNode name={source} path={[]} value={getDataValue([])} />
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

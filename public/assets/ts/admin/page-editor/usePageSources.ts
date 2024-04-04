import { useQuery } from "@tanstack/react-query";

export const usePageSources = (source: string, onSuccess: (value) => void) => {
  return useQuery({
    queryKey: [`editor-sources/${source}`],
    queryFn: async () => {
      const res = await fetch(
        `${window.location.origin}/api/data?path=${source}`
      );
      const result = await res.json();
      onSuccess(result);
      return result;
    },
  });
};

import { useQuery } from "@tanstack/react-query";

export const usePageSources = (source: string) => {
  return useQuery({
    queryKey: [`editor-sources/${source}`],
    queryFn: async () => {
      const res = await fetch(
        `${window.location.origin}/api/data?path=${source}`
      );
      const result = await res.json();
      return result;
    },
  });
};

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getData, storeData } from "../utils/storage";

type UseStorageQueryParams<T> = {
  storageKey: string;
  queryKey: any;
  queryFn: () => Promise<T>;
};

/**
 * Cache response cause the api free tier is only 100 reqs / day.
 * Must return `data` key in the response payload.
 */
export default function useStorageQuery<T = unknown, D = undefined>({
  queryKey,
  queryFn,
  storageKey,
}: UseStorageQueryParams<T>) {
  const [enabled, setEnabled] = useState(false);
  const [localData, setLocalData] = useState<T>();
  const {
    data: response,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey,
    queryFn,
    enabled,
  });

  // @ts-ignore
  const { data = localData } = response ?? {};

  const readItemFromStorage = async () => {
    const item = await getData<{ updatedAt: number; data: T }>(storageKey);
    const sixHours = 1000 * 60 * 60 * 6;
    if (item && item.updatedAt >= Date.now() - sixHours) {
      setEnabled(false);
      setLocalData(item.data);
      return;
    }

    setEnabled(true);
  };

  useEffect(() => {
    readItemFromStorage();
  }, []);

  const writeItemToStorage = async () => {
    if (!data) return;

    await storeData(storageKey, { data, updatedAt: Date.now() });

    setEnabled(false);
  };
  useEffect(() => {
    writeItemToStorage();
  }, [response]);

  return {
    data: data as D,
    isLoading: isLoading || isRefetching,
  };
}

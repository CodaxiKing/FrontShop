import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";

export interface UseRefreshOnFocusCallback {
  (): void;
}

export function useRefreshOnFocus(callback: UseRefreshOnFocusCallback): void {
  const isFocused: boolean = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      callback();
    }
  }, [isFocused]);
}

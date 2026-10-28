"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

type FormUploadState = {
  isUploading: boolean;
  beginUpload(): () => void;
};

const FormUploadContext = createContext<FormUploadState | null>(null);

export function FormUploadProvider({ children }: { children: ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const beginUpload = useCallback(() => {
    setPendingCount((count) => count + 1);
    let finished = false;
    return () => {
      if (finished) return;
      finished = true;
      setPendingCount((count) => Math.max(0, count - 1));
    };
  }, []);
  const value = useMemo(
    () => ({ isUploading: pendingCount > 0, beginUpload }),
    [beginUpload, pendingCount],
  );

  return <FormUploadContext.Provider value={value}>{children}</FormUploadContext.Provider>;
}

export function useFormUploads() {
  const context = useContext(FormUploadContext);
  if (!context) throw new Error("useFormUploads must be used inside FormUploadProvider");
  return context;
}

export function useOptionalFormUploads() {
  return useContext(FormUploadContext);
}

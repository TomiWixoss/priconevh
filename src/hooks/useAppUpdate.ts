import { useState, useCallback } from "react";
import { updaterApi } from "@/lib/api";
import type { AppUpdateInfo } from "@/types";

export function useAppUpdate() {
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdates = useCallback(async () => {
    setError(null);
    
    try {
      const info = await updaterApi.checkUpdate();
      setUpdateInfo(info);
      return info;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể kiểm tra cập nhật");
      return null;
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    if (!updateInfo) return;
    
    setIsDownloading(true);
    setProgress(0);
    setError(null);

    try {
      // Listen for progress events
      const progressUnsub = updaterApi.onProgress((p) => {
        setProgress(p);
      });

      // Listen for completion
      const completedUnsub = updaterApi.onCompleted(() => {
        setProgress(100);
      });

      // Start download
      await updaterApi.downloadAndInstall();

      // Cleanup listeners
      progressUnsub.then((unsub) => unsub());
      completedUnsub.then((unsub) => unsub());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải cập nhật thất bại");
      setIsDownloading(false);
    }
  }, [updateInfo]);

  const dismissUpdate = useCallback(() => {
    setUpdateInfo(null);
  }, []);

  return {
    updateInfo,
    isDownloading,
    progress,
    error,
    checkForUpdates,
    downloadAndInstall,
    dismissUpdate,
  };
}
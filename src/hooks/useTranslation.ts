import { useState, useCallback } from "react";
import { translationApi } from "@/lib/api";
import type { TranslationPack, TranslationVersion, TranslationInfo } from "@/types";

interface ProgressState {
  message: string;
  progress: number;
}

export function useTranslation() {
  const [pack, setPack] = useState<TranslationPack | null>(null);
  const [currentInfo, setCurrentInfo] = useState<TranslationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({ message: "", progress: 0 });
  const [error, setError] = useState<string | null>(null);

  const loadPack = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const translationPack = await translationApi.getAvailable();
      setPack(translationPack);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông tin bản việt hóa");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCurrentInfo = useCallback(async (gamePath: string) => {
    try {
      const info = await translationApi.getInfo(gamePath);
      setCurrentInfo(info);
    } catch (err) {
      console.error("Failed to load current translation info:", err);
    }
  }, []);

  const install = useCallback(async (gamePath: string, version: TranslationVersion) => {
    setIsInstalling(true);
    setProgress({ message: "Đang chuẩn bị...", progress: 0 });
    setError(null);

    try {
      await translationApi.install(gamePath, version);
      await loadCurrentInfo(gamePath);
      await loadPack();
      setProgress({ message: "Hoàn thành!", progress: 100 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cài đặt thất bại");
      setProgress({ message: "", progress: 0 });
    } finally {
      setIsInstalling(false);
    }
  }, [loadCurrentInfo, loadPack]);

  const update = useCallback(async (gamePath: string, version: TranslationVersion) => {
    setIsInstalling(true);
    setProgress({ message: "Đang cập nhật...", progress: 0 });
    setError(null);

    try {
      await translationApi.update(gamePath, version);
      await loadCurrentInfo(gamePath);
      await loadPack();
      setProgress({ message: "Cập nhật hoàn tất!", progress: 100 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại");
      setProgress({ message: "", progress: 0 });
    } finally {
      setIsInstalling(false);
    }
  }, [loadCurrentInfo, loadPack]);

  const uninstall = useCallback(async (gamePath: string) => {
    setIsInstalling(true);
    setProgress({ message: "Đang gỡ bỏ...", progress: 0 });
    setError(null);

    try {
      await translationApi.uninstall(gamePath);
      setCurrentInfo(null);
      setProgress({ message: "Đã gỡ bỏ bản việt hóa", progress: 100 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gỡ bỏ thất bại");
      setProgress({ message: "", progress: 0 });
    } finally {
      setIsInstalling(false);
    }
  }, []);

  const setProgressState = useCallback((state: ProgressState) => {
    setProgress(state);
  }, []);

  const latestVersion = pack?.latest_version || null;

  return {
    pack,
    currentInfo,
    latestVersion,
    isLoading,
    isInstalling,
    progress,
    error,
    loadPack,
    loadCurrentInfo,
    install,
    update,
    uninstall,
    setProgress: setProgressState,
  };
}
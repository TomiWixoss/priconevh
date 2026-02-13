import { useState, useEffect } from "react";
import { gameApi, configApi } from "@/lib/api";
import type { GameInfo } from "@/types";

export function useGamePath() {
  const [gamePath, setGamePath] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load game path từ config khi mount
  useEffect(() => {
    loadGamePath();
  }, []);

  const loadGamePath = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load từ config
      const config = await configApi.load();
      
      if (config.game_path) {
        // Validate path
        try {
          const info = await gameApi.getInfo(config.game_path);
          setGamePath(config.game_path);
          setGameInfo(info);
        } catch (err) {
          // Path không hợp lệ, thử auto detect
          await autoDetectGame();
        }
      } else {
        // Không có path trong config, thử auto detect
        await autoDetectGame();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const autoDetectGame = async () => {
    try {
      const detectedPath = await gameApi.autoDetect();
      
      if (detectedPath) {
        const info = await gameApi.getInfo(detectedPath);
        setGamePath(detectedPath);
        setGameInfo(info);
        
        // Lưu vào config
        await configApi.updateGamePath(detectedPath);
      } else {
        setError("Không tìm thấy thư mục game. Vui lòng chọn thủ công.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const selectGameDirectory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const selectedPath = await gameApi.selectDirectory();
      
      if (selectedPath) {
        const info = await gameApi.getInfo(selectedPath);
        setGamePath(selectedPath);
        setGameInfo(info);
        // Config đã được lưu tự động trong command
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshGameInfo = async () => {
    if (!gamePath) return;

    setIsLoading(true);
    try {
      const info = await gameApi.getInfo(gamePath);
      setGameInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    gamePath,
    gameInfo,
    isLoading,
    error,
    autoDetectGame,
    selectGameDirectory,
    refreshGameInfo,
  };
}

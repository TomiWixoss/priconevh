import { useEffect } from "react";
import { FolderOpen, Search, CheckCircle, XCircle, Loader2, RefreshCw, HardDrive } from "lucide-react";
import { useGamePath } from "@/hooks/useGamePath";

interface GamePathProps {
  hook: ReturnType<typeof useGamePath>;
}

export function GamePath({ hook }: GamePathProps) {
  const {
    gamePath,
    gameInfo,
    isLoading,
    error,
    autoDetectGame,
    selectGameDirectory,
  } = hook;

  useEffect(() => {
    if (!gamePath) {
      autoDetectGame();
    }
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Thư mục game</h1>
          <p className="text-gray-400">Cấu hình đường dẫn cài đặt Princess Connect Re:Dive</p>
        </div>

        {isLoading && (
          <div className="glass-effect rounded-2xl p-16 border border-[hsl(var(--glass-border))] text-center">
            <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Đang tìm kiếm thư mục game...</p>
            <p className="text-gray-400 text-sm mt-2">Vui lòng đợi trong giây lát</p>
          </div>
        )}

        {!isLoading && gameInfo?.is_valid && gamePath && (
          <div className="space-y-6">
            {/* Success Card */}
            <div className="glass-effect rounded-2xl p-8 border border-green-500/30">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Đã tìm thấy game!</h3>
                  <p className="text-gray-400 mb-6">Thư mục game hợp lệ và sẵn sàng sử dụng</p>
                  
                  {/* Path Display */}
                  <div className="bg-black/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <code className="text-sm text-gray-300 break-all">{gamePath}</code>
                  </div>

                  {/* Game Info Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {gameInfo.version && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">Phiên bản</p>
                        <p className="text-white font-medium">{gameInfo.version}</p>
                      </div>
                    )}
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Trạng thái</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <p className="text-white font-medium">Hợp lệ</p>
                      </div>
                    </div>

                    {gameInfo.has_translation && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">Việt hóa</p>
                        <p className="text-white font-medium">
                          {gameInfo.translation_version || "Đã cài"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={selectGameDirectory}
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all flex items-center gap-2"
                    >
                      <FolderOpen className="w-5 h-5" />
                      Chọn thư mục khác
                    </button>
                    
                    <button
                      onClick={autoDetectGame}
                      className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium transition-all flex items-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Tìm lại
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && (!gameInfo?.is_valid || !gamePath) && (
          <div className="space-y-6">
            {/* Not Found Card */}
            <div className="glass-effect rounded-2xl p-8 border border-orange-500/30">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-8 h-8 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Chưa tìm thấy thư mục game</h3>
                  <p className="text-gray-400">
                    {error || "Vui lòng chọn thư mục cài đặt game Princess Connect Re:Dive"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <button 
                  onClick={autoDetectGame}
                  className="flex-1 h-14 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg"
                >
                  <Search className="w-5 h-5" />
                  Tự động tìm kiếm
                </button>
                
                <button 
                  onClick={selectGameDirectory}
                  className="flex-1 h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all"
                >
                  <FolderOpen className="w-5 h-5" />
                  Chọn thủ công
                </button>
              </div>

              {/* Help Section */}
              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-yellow-400" />
                  Thư mục game thường nằm ở:
                </h4>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    <code className="text-gray-300">C:\Program Files (x86)\Steam\steamapps\common\PrincessConnectReDive</code>
                  </li>
                  <li className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    <code className="text-gray-300">C:\Program Files\DMM GAMES\PrincessConnectReDive</code>
                  </li>
                  <li className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    <code className="text-gray-300">D:\Games\PrincessConnectReDive</code>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

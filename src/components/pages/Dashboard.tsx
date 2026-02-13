import { Download, Gamepad2, CheckCircle, AlertCircle, Play, Calendar } from "lucide-react";
import { useGamePath } from "@/hooks/useGamePath";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardProps {
  gamePathHook: ReturnType<typeof useGamePath>;
  translationHook: ReturnType<typeof useTranslation>;
  onNavigate: (page: "dashboard" | "game-path" | "translation" | "settings") => void;
}

export function Dashboard({ gamePathHook, translationHook, onNavigate }: DashboardProps) {
  const { gamePath, gameInfo, isLoading: isGameLoading } = gamePathHook;
  const { latestVersion, isInstalling, progress } = translationHook;

  const hasGame = gamePath && gameInfo?.is_valid;
  const hasTranslation = gameInfo?.has_translation;
  const needsUpdate = hasTranslation && latestVersion && gameInfo?.translation_version !== latestVersion;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/hero.jpg" 
          alt="Princess Connect" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback gradient if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--background))]/60 to-[hsl(var(--background))]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--background))]/80 via-transparent to-[hsl(var(--background))]/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Top Section - Hero Title */}
        <div className="flex-1 flex items-center px-16 py-12">
          <div className="max-w-2xl">
            <div className="mb-6">
              <div className="inline-block px-4 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 mb-4">
                <span className="text-yellow-400 text-sm font-medium">OFFICIAL RELEASE</span>
              </div>
              <h1 className="text-7xl font-black mb-4 text-white drop-shadow-2xl leading-tight">
                PRINCESS<br/>CONNECT
              </h1>
              <p className="text-3xl font-bold text-yellow-400 mb-6">Re:Dive</p>
              <p className="text-lg text-gray-300 mb-8">Bản việt hóa chính thức</p>
            </div>

            {/* Main Action Button */}
            {!isInstalling && (
              <>
                {hasGame && hasTranslation && (
                  <button className="h-16 px-12 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-2xl hover:shadow-yellow-500/50 glow-effect">
                    <Play className="w-6 h-6 fill-current" />
                    CHƠI NGAY
                  </button>
                )}

                {hasGame && !hasTranslation && (
                  <button 
                    onClick={() => onNavigate("translation")}
                    className="h-16 px-12 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-2xl hover:shadow-yellow-500/50 glow-effect"
                  >
                    <Download className="w-6 h-6" />
                    CÀI ĐẶT VIỆT HÓA
                  </button>
                )}

                {!hasGame && (
                  <button 
                    onClick={() => onNavigate("game-path")}
                    className="h-16 px-12 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-2xl hover:shadow-yellow-500/50 glow-effect"
                  >
                    <Gamepad2 className="w-6 h-6" />
                    CẤU HÌNH GAME
                  </button>
                )}
              </>
            )}

            {/* Progress Bar */}
            {isInstalling && (
              <div className="glass-effect rounded-xl p-6 border border-[hsl(var(--glass-border))] max-w-md">
                <div className="mb-3">
                  <p className="text-white font-medium mb-1">{progress.message}</p>
                  <p className="text-sm text-gray-400">{Math.round(progress.progress)}%</p>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Status & News */}
        <div className="px-16 pb-8">
          <div className="grid grid-cols-3 gap-4">
            {/* Status Card 1 - Game */}
            <div className="glass-effect rounded-xl p-5 border border-[hsl(var(--glass-border))]">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  hasGame ? 'bg-green-500/20' : 'bg-orange-500/20'
                }`}>
                  <Gamepad2 className={`w-5 h-5 ${hasGame ? 'text-green-400' : 'text-orange-400'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">Thư mục game</p>
                  {isGameLoading ? (
                    <p className="text-sm text-white">Đang kiểm tra...</p>
                  ) : hasGame ? (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <p className="text-sm text-white font-medium">Đã tìm thấy</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                      <p className="text-sm text-white font-medium">Chưa cấu hình</p>
                    </div>
                  )}
                </div>
              </div>
              {!hasGame && (
                <button
                  onClick={() => onNavigate("game-path")}
                  className="w-full mt-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all"
                >
                  Cấu hình ngay
                </button>
              )}
            </div>

            {/* Status Card 2 - Translation */}
            <div className="glass-effect rounded-xl p-5 border border-[hsl(var(--glass-border))]">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  hasTranslation ? 'bg-green-500/20' : 'bg-orange-500/20'
                }`}>
                  <Download className={`w-5 h-5 ${hasTranslation ? 'text-green-400' : 'text-orange-400'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">Bản việt hóa</p>
                  {isGameLoading ? (
                    <p className="text-sm text-white">Đang kiểm tra...</p>
                  ) : hasTranslation ? (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <p className="text-sm text-white font-medium">
                        {gameInfo?.translation_version ? `v${gameInfo.translation_version}` : 'Đã cài'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                      <p className="text-sm text-white font-medium">Chưa cài đặt</p>
                    </div>
                  )}
                </div>
              </div>
              {needsUpdate && (
                <button
                  onClick={() => onNavigate("translation")}
                  className="w-full mt-2 px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-xs font-medium transition-all"
                >
                  Cập nhật mới
                </button>
              )}
            </div>

            {/* News Card */}
            <div className="glass-effect rounded-xl p-5 border border-[hsl(var(--glass-border))]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">Thông báo</p>
                  <p className="text-sm text-white font-medium">Chào mừng!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

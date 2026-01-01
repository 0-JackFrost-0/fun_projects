import { useTheme } from '@/contexts/ThemeContext';

interface PlayerInfoProps {
  player: {
    name: string;
    tag: string;
    expLevel: number;
    trophies: number;
    bestTrophies: number;
    wins: number;
    losses: number;
    clan?: {
      name: string;
      tag: string;
    };
    arena?: {
      name: string;
    };
  };
}

export default function PlayerInfo({ player }: PlayerInfoProps) {
  const { isDark } = useTheme();
  const winRate = player.wins + player.losses > 0 
    ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1)
    : '0';

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className={`backdrop-blur-sm border rounded-xl p-6 transition-colors duration-500 ${
        isDark
          ? 'bg-gradient-to-r from-purple-800/30 to-blue-800/30 border-purple-500/20'
          : 'bg-gradient-to-r from-purple-100/80 to-blue-100/80 border-purple-200/50'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h2 className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {player.name}
            </h2>
            <p className={`transition-colors duration-500 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {player.tag}
            </p>
            <p className={`transition-colors duration-500 ${
              isDark ? 'text-blue-200' : 'text-blue-600'
            }`}>
              Level {player.expLevel}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className={`rounded-lg p-3 transition-colors duration-500 ${
              isDark ? 'bg-black/20' : 'bg-white/60'
            }`}>
              <p className="text-2xl font-bold text-yellow-400">{player.trophies}</p>
              <p className={`text-xs transition-colors duration-500 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Trophies
              </p>
            </div>
            <div className={`rounded-lg p-3 transition-colors duration-500 ${
              isDark ? 'bg-black/20' : 'bg-white/60'
            }`}>
              <p className="text-2xl font-bold text-orange-400">{player.bestTrophies}</p>
              <p className={`text-xs transition-colors duration-500 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Best
              </p>
            </div>
            <div className={`rounded-lg p-3 transition-colors duration-500 ${
              isDark ? 'bg-black/20' : 'bg-white/60'
            }`}>
              <p className="text-2xl font-bold text-green-400">{player.wins}</p>
              <p className={`text-xs transition-colors duration-500 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Wins
              </p>
            </div>
            <div className={`rounded-lg p-3 transition-colors duration-500 ${
              isDark ? 'bg-black/20' : 'bg-white/60'
            }`}>
              <p className="text-2xl font-bold text-red-400">{winRate}%</p>
              <p className={`text-xs transition-colors duration-500 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Win Rate
              </p>
            </div>
          </div>
        </div>
        
        {player.clan && (
          <div className={`mt-4 pt-4 border-t transition-colors duration-500 ${
            isDark ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <p className={`transition-colors duration-500 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span className={isDark ? 'text-purple-300' : 'text-purple-600'}>Clan:</span> {player.clan.name} ({player.clan.tag})
            </p>
          </div>
        )}
        
        {player.arena && (
          <div className="mt-2">
            <p className={`transition-colors duration-500 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span className={isDark ? 'text-blue-300' : 'text-blue-600'}>Arena:</span> {player.arena.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

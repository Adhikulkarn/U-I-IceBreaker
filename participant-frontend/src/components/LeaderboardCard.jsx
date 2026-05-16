export default function LeaderboardCard({ rank, team }) {
  return (
    <div className="pixel-corners flex flex-col items-start justify-between gap-4 rounded-2xl border-4 border-borderGlow bg-hud px-4 py-4 shadow-neon sm:flex-row sm:items-center">
      <div className="min-w-0 w-full sm:w-auto">
        <p className="font-pixel text-[0.55rem] uppercase tracking-[0.18em] text-zinc-400">
          Rank #{rank}
        </p>
        <h3 className="mt-2 break-words text-base font-bold text-white sm:text-lg">
          {team.team_name}
        </h3>
      </div>
      <div className="w-full text-left sm:w-auto sm:text-right">
        <p className="font-pixel text-[0.5rem] uppercase tracking-[0.18em] text-neonGreen">
          Score
        </p>
        <p className="mt-2 text-2xl font-black text-neonPink animate-flicker sm:text-3xl">
          {team.score}
        </p>
      </div>
    </div>
  );
}

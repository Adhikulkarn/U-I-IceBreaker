import RetroCard from "./RetroCard";

export default function TeamStatusCard({ team }) {
  const playerCount = team?.players?.length ?? 0;

  return (
    <RetroCard className="space-y-5" glow="green">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-pixel text-[0.6rem] uppercase tracking-[0.18em] text-neonGreen">
            Your Team
          </p>
          <h2 className="mt-4 break-words text-lg font-bold text-white sm:text-2xl lg:text-3xl">
            {team?.name ?? "Assigning Team..."}
          </h2>
        </div>
        <div className="w-fit rounded-full border-4 border-borderGlow bg-hud px-3 py-2 font-pixel text-[0.52rem] uppercase tracking-[0.14em] text-neonPink">
          {team?.score ?? 0} PTS
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="pixel-corners min-w-0 rounded-2xl border-4 border-borderGlow bg-hud px-4 py-4">
          <p className="font-pixel text-[0.55rem] uppercase tracking-[0.18em] text-zinc-400">
            Squad Size
          </p>
          <p className="mt-3 text-base font-bold text-neonGreen sm:text-lg">
            {playerCount}
          </p>
        </div>

        <div className="pixel-corners min-w-0 rounded-2xl border-4 border-borderGlow bg-hud px-4 py-4">
          <p className="font-pixel text-[0.55rem] uppercase tracking-[0.18em] text-zinc-400">
            Status
          </p>
          <p className="mt-3 text-base font-bold text-neonPink sm:text-lg">
            {team ? "READY TO PLAY" : "MATCHMAKING"}
          </p>
        </div>
      </div>

      {team?.players?.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {team.players.map((player) => (
            <div
              key={player.id}
              className="pixel-corners min-w-0 rounded-2xl border-4 border-borderGlow bg-hud px-4 py-3 text-sm font-semibold text-zinc-200"
            >
              {player.name}
            </div>
          ))}
        </div>
      ) : (
        <div className="pixel-corners rounded-2xl border-4 border-borderGlow bg-hud px-4 py-5 text-sm text-zinc-400">
          Your team card will light up as soon as assignments are available.
        </div>
      )}
    </RetroCard>
  );
}

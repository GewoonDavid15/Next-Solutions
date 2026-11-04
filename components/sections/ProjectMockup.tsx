import type { Project } from "@/lib/data";
import { cn } from "@/lib/utils";

const heights = { sm: "h-56", md: "h-72", lg: "h-96" };

/**
 * Stylised "screenshot" for a project. Swap this for <Image src=... /> once real
 * screenshots are added to /public/portfolio.
 */
export function ProjectMockup({ project }: { project: Project }) {
  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br", project.accent, heights[project.size])}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
      <div className="absolute inset-4 top-6 overflow-hidden rounded-xl border border-white/20 bg-ink/70 shadow-2xl backdrop-blur-sm transition-transform duration-700 group-hover:scale-[1.04]">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="size-2 rounded-full bg-red-400/80" />
          <span className="size-2 rounded-full bg-yellow-400/80" />
          <span className="size-2 rounded-full bg-green-400/80" />
          <span className="ml-3 h-2 w-24 rounded-full bg-white/10" />
        </div>
        {project.category === "bots" && <BotPreview />}
        {project.category === "websites" && <WebPreview />}
        {project.category === "servers" && <ServerPreview />}
      </div>
    </div>
  );
}

function BotPreview() {
  return (
    <div className="space-y-3 p-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <span className={cn("size-8 shrink-0 rounded-full", i === 1 ? "bg-brand-500" : "bg-white/20")} />
          <div className="flex-1 space-y-1.5">
            <span className="block h-2 w-20 rounded-full bg-white/30" />
            <span className="block h-2 w-full rounded-full bg-white/10" />
            {i === 1 && (
              <div className="mt-2 rounded-lg border-l-4 border-brand-500 bg-white/5 p-2">
                <span className="block h-2 w-2/3 rounded-full bg-white/20" />
                <span className="mt-1.5 block h-2 w-1/2 rounded-full bg-white/10" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function WebPreview() {
  return (
    <div className="p-4">
      <span className="block h-3 w-1/2 rounded-full bg-white/40" />
      <span className="mt-2 block h-2 w-3/4 rounded-full bg-white/15" />
      <span className="mt-4 block h-6 w-24 rounded-lg bg-brand-500/80" />
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="block h-12 rounded-lg bg-white/10" />
        ))}
      </div>
    </div>
  );
}

function ServerPreview() {
  return (
    <div className="space-y-2 p-4 font-mono text-[10px] text-emerald-300/80">
      <p>[INFO] Starting server on 0.0.0.0:25565</p>
      <p>[INFO] Loaded 42 plugins</p>
      <p className="text-brand-300">[NEXT] Optimised tick: 20.0 TPS</p>
      <div className="mt-3 grid grid-cols-4 items-end gap-1.5">
        {[60, 85, 45, 95, 70, 80, 55, 90].map((h, i) => (
          <span key={i} className="block rounded-sm bg-emerald-400/40" style={{ height: `${h * 0.4}px` }} />
        ))}
      </div>
    </div>
  );
}

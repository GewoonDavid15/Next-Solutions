import { ImageResponse } from "next/og";
import { projects } from "@/lib/data";
import { notFound } from "next/navigation";
import { SHOW_PORTFOLIO, site } from "@/lib/site";

export const alt = "Project bij Next Solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return SHOW_PORTFOLIO ? projects.map((p) => ({ slug: p.slug })) : [];
}

/** Share card per case study, so a shared link shows the project, not the site. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  if (!SHOW_PORTFOLIO) notFound();
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #09090b 0%, #0f172a 60%, #1a0b2e 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -100,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "#7C3AED",
            opacity: 0.3,
            filter: "blur(130px)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, #7C3AED, #9333EA)",
              color: "white",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div style={{ display: "flex", color: "#a1a1aa", fontSize: 24 }}>{site.name} · Portfolio</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#c4b5fd", fontSize: 28 }}>{project?.client ?? "Case study"}</div>
          <div style={{ display: "flex", color: "white", fontSize: 76, fontWeight: 700, marginTop: 8 }}>
            {project?.title ?? "Project"}
          </div>
          {project && (
            <div style={{ display: "flex", color: "#a1a1aa", fontSize: 28, marginTop: 20, maxWidth: 900 }}>
              {project.summary.length > 120 ? `${project.summary.slice(0, 120)}…` : project.summary}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {(project?.stack ?? []).slice(0, 4).map((tech) => (
            <div
              key={tech}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 16,
                border: "1px solid rgba(167,139,250,0.35)",
                background: "rgba(124,58,237,0.15)",
                color: "#ddd6fe",
                fontSize: 24,
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

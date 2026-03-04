import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default function handler(req) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get("title") ?? "My Portfolio";
  const description = searchParams.get("description") ?? "Welcome to my site";
  const author = searchParams.get("author") ?? "Dev";

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          display: "flex",
        }}
      />

      {/* Accent glow */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* Top: author badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          zIndex: 1,
        }}
      >
        {/* Avatar circle */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: "18px",
          }}
        >
          {author.slice(0, 1).toUpperCase()}
        </div>
        <span style={{ color: "#888", fontSize: "20px", fontWeight: 500 }}>
          {author}
        </span>
      </div>

      {/* Middle: title + description */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          zIndex: 1,
          maxWidth: "900px",
        }}
      >
        <div
          style={{
            fontSize: title.length > 40 ? "56px" : "72px",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#9ca3af",
            lineHeight: 1.5,
            fontWeight: 400,
          }}
        >
          {description.length > 120
            ? description.slice(0, 120) + "…"
            : description}
        </div>
      </div>

      {/* Bottom: domain */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#6366f1",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#6366f1",
              display: "flex",
            }}
          />
          devajuice-portfolio.vercel.app
        </div>
        <div
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "8px",
            padding: "8px 20px",
            color: "#818cf8",
            fontSize: "16px",
            fontWeight: 600,
            display: "flex",
          }}
        >
          Portfolio
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}

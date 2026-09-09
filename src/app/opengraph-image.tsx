import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { company } from "@/content/company";

export const alt = `${company.name} — Reliable home services from local Northeast professionals.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const markData = await readFile(join(process.cwd(), "public/brand/apex-mark-white.png"), "base64");
const markSrc = `data:image/png;base64,${markData}`;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "88px 96px",
          background: "linear-gradient(135deg, #003973 0%, #01213a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markSrc} width={112} height={112} alt="" />
        <div
          style={{
            marginTop: 44,
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            lineHeight: 1.05,
          }}
        >
          Apex Home Support
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            color: "rgba(255,255,255,0.78)",
            maxWidth: 920,
            lineHeight: 1.35,
          }}
        >
          Reliable home services from local Northeast professionals.
        </div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#5fb0ff",
            fontWeight: 700,
          }}
        >
          Heating · Cooling · Plumbing · Appliance · Indoor Air Quality
        </div>
      </div>
    ),
    { ...size },
  );
}

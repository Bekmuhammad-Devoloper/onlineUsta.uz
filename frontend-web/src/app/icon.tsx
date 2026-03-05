/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-inline-styles */
import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  const logoData = readFileSync(join(process.cwd(), "public", "logo.png"));
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          borderRadius: "14px",
        }}
      >
        <img
          src={logoBase64}
          alt="Online Usta"
          width={48}
          height={48}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size },
  );
}

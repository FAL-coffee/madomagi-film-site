/* eslint-disable @next/next/no-img-element -- ImageResponse requires native image elements. */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function OGImage() {
  const image = await readFile(
    path.join(process.cwd(), "public/film-logo.png"),
  );
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f2f2ef",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "16px solid #997d26",
      }}
    >
      <span style={{ fontSize: 22, color: "#997d26", marginBottom: 50 }}>
        UNOFFICIAL FAN GALLERY
      </span>
      <img
        src={`data:image/png;base64,${image.toString("base64")}`}
        width={850}
        height={248}
        alt=""
      />
      <span style={{ fontSize: 26, marginTop: 45, color: "#24201f" }}>
        FILM ARCHIVE / WALPURGISNACHT: RISING
      </span>
    </div>,
    size,
  );
}

import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0071e3 0%, #0051a3 100%)",
          borderRadius: 110,
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 192,
            fontWeight: 700,
            letterSpacing: -4,
            fontFamily: "sans-serif",
          }}
        >
          iC
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}

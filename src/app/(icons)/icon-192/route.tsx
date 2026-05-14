import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0071e3 0%, #0051a3 100%)",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -2,
            fontFamily: "sans-serif",
          }}
        >
          iC
        </div>
      </div>
    ),
    { width: 192, height: 192 },
  );
}

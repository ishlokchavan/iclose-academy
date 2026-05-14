import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0071e3 0%, #0051a3 100%)",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 68,
            fontWeight: 700,
            letterSpacing: -2,
            fontFamily: "sans-serif",
          }}
        >
          iC
        </div>
      </div>
    ),
    { ...size },
  );
}

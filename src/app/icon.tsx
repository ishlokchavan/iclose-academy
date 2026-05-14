import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0071e3 0%, #0051a3 100%)",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: -0.5,
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

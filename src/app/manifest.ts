import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "iClose Academy",
    short_name: "iClose",
    description: "Specialist intelligence for real estate micro-market expertise.",
    start_url: "/topics",
    display: "standalone",
    background_color: "#f5f5f7",
    theme_color: "#0071e3",
    orientation: "portrait-primary",
    categories: ["education", "business"],
    icons: [
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Browse Topics",
        url: "/topics",
        description: "Browse the topic library",
      },
    ],
  };
}

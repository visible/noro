import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "noro",
    short_name: "noro",
    description: "one-time secret sharing for env vars",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#d4b08c",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://noro.sh";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/share`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/docs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}

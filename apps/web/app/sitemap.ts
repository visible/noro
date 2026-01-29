import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://noro.sh";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/share`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/docs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/docs/cli`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/docs/web`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/docs/encryption`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/docs/desktop`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/docs/extension`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}

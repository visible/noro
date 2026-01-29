"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  categorylabel,
  severitycolor,
  type WatchtowerCategory,
  type WatchtowerItem,
  type WatchtowerReport,
  watchtower,
} from "@/lib/watchtower";
import * as store from "../vault/store";

type CategoryCardProps = {
  category: WatchtowerCategory;
  items: WatchtowerItem[];
  expanded: boolean;
  onToggle: () => void;
  onFix: (itemId: string) => void;
};

function CategoryIcon({ category }: { category: WatchtowerCategory }) {
  const paths: Record<WatchtowerCategory, string> = {
    breached:
      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    weak: "M13 10V3L4 14h7v7l9-11h-7z",
    reused:
      "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
    old: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    no2fa:
      "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  };
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[category]} />
    </svg>
  );
}

function CategoryCard({
  category,
  items,
  expanded,
  onToggle,
  onFix,
}: CategoryCardProps) {
  const severity = items[0]?.severity || "low";
  const color = severitycolor(severity);
  const count = items.length;

  return (
    <div className="bg-stone-900 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between hover:bg-stone-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <CategoryIcon category={category} />
          </div>
          <div className="text-left">
            <p className="font-medium text-white">{categorylabel(category)}</p>
            <p className="text-sm text-stone-500">
              {count} item{count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-2xl font-bold"
            style={{ color: count > 0 ? color : "#22c55e" }}
          >
            {count}
          </span>
          <svg
            className={`w-5 h-5 text-stone-500 transition-transform ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && items.length > 0 && (
        <div className="border-t border-stone-800">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`px-5 py-3 flex items-center justify-between ${i !== items.length - 1 ? "border-b border-stone-800/50" : ""}`}
            >
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="text-sm text-stone-500">{item.message}</p>
              </div>
              <button
                onClick={() => onFix(item.itemId)}
                className="px-3 py-1.5 text-sm font-medium text-amber-500 bg-amber-500/10 rounded-lg hover:bg-amber-500/20 transition-colors"
              >
                fix
              </button>
            </div>
          ))}
        </div>
      )}
      {expanded && items.length === 0 && (
        <div className="border-t border-stone-800 px-5 py-8 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-emerald-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p className="text-sm text-stone-500">no issues found</p>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 70;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const size = 180;

  function scorecolor(s: number): string {
    if (s >= 80) return "#22c55e";
    if (s >= 60) return "#eab308";
    if (s >= 40) return "#f97316";
    return "#ef4444";
  }

  function scorelabel(s: number): string {
    if (s >= 80) return "excellent";
    if (s >= 60) return "good";
    if (s >= 40) return "fair";
    return "poor";
  }

  const color = scorecolor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-30"
          style={{ backgroundColor: color }}
        />
        <svg
          className="-rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="watchtowerGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#watchtowerGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="text-sm font-medium mt-1" style={{ color }}>
            {scorelabel(score)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Watchtower() {
  const router = useRouter();
  const [report, setReport] = useState<WatchtowerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [expanded, setExpanded] = useState<WatchtowerCategory | null>(null);

  useEffect(() => {
    runanalysis();
  }, []);

  async function runanalysis() {
    setLoading(true);
    const items = await store.load();
    const result = await watchtower(items);
    setReport(result);
    setLoading(false);
  }

  async function rescan() {
    setScanning(true);
    await runanalysis();
    setScanning(false);
  }

  function handlefix(itemId: string) {
    router.push(`/vault/vault?edit=${itemId}`);
  }

  function toggle(category: WatchtowerCategory) {
    setExpanded(expanded === category ? null : category);
  }

  const categories: WatchtowerCategory[] = [
    "breached",
    "weak",
    "reused",
    "old",
    "no2fa",
  ];

  if (loading) {
    return (
      <div className="h-full overflow-y-auto scrollbar-hidden px-8 py-10">
        <header className="mb-12">
          <h1 className="text-2xl font-serif text-white">watchtower</h1>
          <p className="text-white/40 mt-1">analyzing your vault security...</p>
        </header>
        <div className="flex items-start py-24">
          <div className="w-10 h-10 border-2 border-white/10 border-t-[#d4b08c] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-full overflow-y-auto scrollbar-hidden px-8 py-10">
        <header className="mb-12">
          <h1 className="text-2xl font-serif text-white">watchtower</h1>
          <p className="text-white/40 mt-1">security monitoring dashboard</p>
        </header>
        <div className="bg-[#161616]/80 backdrop-blur-sm border border-white/5 rounded-xl p-10">
          <p className="text-white/50">failed to analyze vault</p>
        </div>
      </div>
    );
  }

  const totalissues =
    report.breached.length +
    report.weak.length +
    report.reused.length +
    report.old.length +
    report.no2fa.length;

  return (
    <div className="h-full overflow-y-auto scrollbar-hidden px-8 py-10">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-serif text-white">watchtower</h1>
          <p className="text-white/40 mt-1">security monitoring dashboard</p>
        </div>
        <button
          onClick={rescan}
          disabled={scanning}
          className="px-4 py-2 text-sm font-medium text-white bg-[#161616]/80 backdrop-blur-sm border border-white/5 rounded-lg hover:border-white/10 transition-all disabled:opacity-50"
        >
            {scanning ? "scanning..." : "rescan"}
          </button>
        </header>

        <div className="bg-stone-900 rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ScoreRing score={report.score} />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-lg font-medium text-white mb-2">
                security score
              </h2>
              <p className="text-stone-500 mb-4">
                {totalissues === 0
                  ? "your vault is secure with no issues detected"
                  : `${totalissues} issue${totalissues !== 1 ? "s" : ""} found that need attention`}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {categories.map((cat) => {
                  const count = report[cat].length;
                  if (count === 0) return null;
                  return (
                    <span
                      key={cat}
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${severitycolor(report[cat][0]?.severity || "low")}20`,
                        color: severitycolor(report[cat][0]?.severity || "low"),
                      }}
                    >
                      {count} {categorylabel(cat).split(" ")[0]}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {categories.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              items={report[category]}
              expanded={expanded === category}
              onToggle={() => toggle(category)}
              onFix={handlefix}
            />
          ))}
        </div>

        {report.recommendations.length > 0 && (
          <div className="bg-stone-900 rounded-xl p-6">
            <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-4">
              recommendations
            </h2>
            <ul className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-stone-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

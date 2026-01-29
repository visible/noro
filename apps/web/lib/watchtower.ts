import type { VaultItem } from "@/app/[locale]/vault/vault/store";
import { analyze, type HealthIssue, type HealthReport } from "./health";
import type { LoginData, OtpData } from "./types";

export type WatchtowerCategory =
  | "breached"
  | "weak"
  | "reused"
  | "old"
  | "no2fa";
export type WatchtowerSeverity = "critical" | "high" | "medium" | "low";

export type WatchtowerItem = {
  id: string;
  itemId: string;
  title: string;
  category: WatchtowerCategory;
  severity: WatchtowerSeverity;
  message: string;
};

export type WatchtowerReport = {
  score: number;
  breached: WatchtowerItem[];
  weak: WatchtowerItem[];
  reused: WatchtowerItem[];
  old: WatchtowerItem[];
  no2fa: WatchtowerItem[];
  recommendations: string[];
};

const severitymap: Record<WatchtowerCategory, WatchtowerSeverity> = {
  breached: "critical",
  weak: "high",
  reused: "high",
  old: "medium",
  no2fa: "low",
};

function issuetoitem(
  issue: HealthIssue,
  category: WatchtowerCategory,
): WatchtowerItem {
  return {
    id: issue.id,
    itemId: issue.itemId,
    title: issue.itemTitle,
    category,
    severity: severitymap[category],
    message: issue.message,
  };
}

function has2fa(item: VaultItem, allitems: VaultItem[]): boolean {
  if (item.type !== "login") return true;
  const data = item.data as LoginData;
  if (data.totp) return true;
  const otpitems = allitems.filter((i) => !i.deleted && i.type === "otp");
  const title = item.title.toLowerCase();
  for (const otp of otpitems) {
    const otpdata = otp.data as OtpData;
    const issuer = (otpdata.issuer || "").toLowerCase();
    const account = (otpdata.account || "").toLowerCase();
    if (issuer && title.includes(issuer)) return true;
    if (account && title.includes(account)) return true;
    if (otp.title.toLowerCase().includes(title)) return true;
  }
  return false;
}

function findno2fa(items: VaultItem[]): WatchtowerItem[] {
  const logins = items.filter((i) => !i.deleted && i.type === "login");
  const missing: WatchtowerItem[] = [];
  for (const login of logins) {
    if (!has2fa(login, items)) {
      missing.push({
        id: `no2fa-${login.id}`,
        itemId: login.id,
        title: login.title,
        category: "no2fa",
        severity: "low",
        message: "no two-factor authentication configured",
      });
    }
  }
  return missing;
}

function calculatescore(report: WatchtowerReport, total: number): number {
  if (total === 0) return 100;
  const weights = {
    breached: 30,
    weak: 20,
    reused: 20,
    old: 10,
    no2fa: 5,
  };
  let penalty = 0;
  penalty += report.breached.length * weights.breached;
  penalty += report.weak.length * weights.weak;
  penalty += report.reused.length * weights.reused;
  penalty += report.old.length * weights.old;
  penalty += report.no2fa.length * weights.no2fa;
  const maxpenalty = total * 40;
  const score = 100 - Math.min(100, (penalty / maxpenalty) * 100);
  return Math.round(Math.max(0, score));
}

function generaterecommendations(report: WatchtowerReport): string[] {
  const tips: string[] = [];
  if (report.breached.length > 0) {
    tips.push("change breached passwords immediately");
  }
  if (report.weak.length > 0) {
    tips.push(
      "strengthen weak passwords with longer phrases and special characters",
    );
  }
  if (report.reused.length > 0) {
    tips.push("use unique passwords for each account");
  }
  if (report.old.length > 0) {
    tips.push("rotate passwords that haven't been changed in 90+ days");
  }
  if (report.no2fa.length > 0) {
    tips.push("enable two-factor authentication where available");
  }
  if (tips.length === 0) {
    tips.push("your vault is secure - keep up the good work");
  }
  return tips;
}

export async function watchtower(
  items: VaultItem[],
): Promise<WatchtowerReport> {
  const healthreport: HealthReport = await analyze(items);
  const breached: WatchtowerItem[] = [];
  const weak: WatchtowerItem[] = [];
  const reused: WatchtowerItem[] = [];
  const old: WatchtowerItem[] = [];

  for (const issue of healthreport.issues) {
    const item = issuetoitem(issue, issue.type as WatchtowerCategory);
    switch (issue.type) {
      case "breached":
        breached.push(item);
        break;
      case "weak":
        weak.push(item);
        break;
      case "reused":
        reused.push(item);
        break;
      case "old":
        old.push(item);
        break;
    }
  }

  const no2fa = findno2fa(items);

  const report: WatchtowerReport = {
    score: 0,
    breached,
    weak,
    reused,
    old,
    no2fa,
    recommendations: [],
  };

  report.score = calculatescore(report, healthreport.totalPasswords);
  report.recommendations = generaterecommendations(report);

  return report;
}

export function categorylabel(category: WatchtowerCategory): string {
  const labels: Record<WatchtowerCategory, string> = {
    breached: "breached passwords",
    weak: "weak passwords",
    reused: "reused passwords",
    old: "outdated passwords",
    no2fa: "missing 2fa",
  };
  return labels[category];
}

export function severitycolor(severity: WatchtowerSeverity): string {
  const colors: Record<WatchtowerSeverity, string> = {
    critical: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#3b82f6",
  };
  return colors[severity];
}

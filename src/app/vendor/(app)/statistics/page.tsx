import { redirect } from "next/navigation";
import { BarChart3, PieChart, TrendingUp, Activity, Layers, Gauge, AlertTriangle } from "lucide-react";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeVendorCompletionPercent } from "@/lib/vendorCompletion";
import { computeActiveStudentCount, computeDailyActiveStudents } from "@/lib/vendorBilling";
import { computeCohortPillarAverages } from "@/lib/cohort";
import { computeTopicGaps } from "@/lib/vendorContent";
import Histogram from "@/components/charts/Histogram";
import DonutChart from "@/components/charts/DonutChart";
import TrendLine from "@/components/charts/TrendLine";
import RadarChart from "@/components/charts/RadarChart";

// Short, chart-friendly forms of the real pillar labels (src/lib/readiness.ts) —
// the full names are too long to render on a compact radar chart without clipping.
const PILLAR_SHORT_LABEL: Record<string, string> = {
  "Aptitude & communication": "Aptitude",
  "Interview performance": "Interview",
};

const COMPLETION_BANDS = [
  { label: "0–20%", min: 0, max: 20 },
  { label: "21–40%", min: 21, max: 40 },
  { label: "41–60%", min: 41, max: 60 },
  { label: "61–80%", min: 61, max: 80 },
  { label: "81–100%", min: 81, max: 100 },
];

function lastNPeriodMonths(n: number): string[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

function monthLabel(periodMonth: string): string {
  const [year, month] = periodMonth.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

function SectionHead({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="mb-3.5 mt-8 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-ink-faint first:mt-0">
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      {children}
    </div>
  );
}

function ChartCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-[0_8px_28px_-12px_var(--accent-soft)]">
      <h3 className="flex items-center gap-1.5 font-brand text-[14.5px] font-bold text-ink">
        <Icon className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
        {title}
      </h3>
      <p className="mb-4 text-xs text-ink-faint">{subtitle}</p>
      {children}
    </div>
  );
}

export default async function VendorStatisticsPage() {
  const user = await requireRole("VENDOR_ADMIN");
  if (!user || !user.vendorId) {
    redirect("/login");
  }
  const vendorId = user.vendorId;

  const [vendor, students] = await Promise.all([
    prisma.vendor.findUnique({ where: { id: vendorId } }),
    prisma.user.findMany({
      where: { vendorId, role: "STUDENT" },
      select: {
        id: true,
        createdAt: true,
        externalJudgeAccounts: { where: { platform: "LEETCODE" }, select: { trackingStatus: true } },
      },
    }),
  ]);
  if (!vendor) {
    redirect("/login");
  }

  const studentIds = students.map((s) => s.id);
  const months = lastNPeriodMonths(6);

  const [completions, dailyActive, pillarAverages, topicGaps, activeByMonth] = await Promise.all([
    Promise.all(studentIds.map((id) => computeVendorCompletionPercent(vendorId, id))),
    computeDailyActiveStudents(vendorId, 14),
    computeCohortPillarAverages(studentIds),
    computeTopicGaps(studentIds),
    Promise.all(months.map((m) => computeActiveStudentCount(vendorId, m))),
  ]);

  const completionHistogram = COMPLETION_BANDS.map((band) => ({
    label: band.label,
    count: completions.filter((v) => v >= band.min && v <= band.max).length,
  }));

  const leetcodeCounts = { ACTIVE: 0, UNVERIFIED: 0, BLOCKED_OR_PRIVATE: 0, NONE: 0 };
  for (const s of students) {
    const status = s.externalJudgeAccounts[0]?.trackingStatus;
    if (status) leetcodeCounts[status]++;
    else leetcodeCounts.NONE++;
  }

  const cumulativeGrowth: number[] = [];
  for (const m of months) {
    const [year, month] = m.split("-").map(Number);
    const monthEnd = new Date(Date.UTC(year, month, 1));
    cumulativeGrowth.push(students.filter((s) => s.createdAt < monthEnd).length);
  }

  const billedByMonth = activeByMonth.map((count) => Math.round((count * vendor.ratePaisePerStudent) / 100));

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="font-brand text-[28px] font-bold tracking-[-0.015em] text-ink">Statistics</h1>
        <p className="mt-1 text-sm text-ink-faint">
          {vendor.name} · {students.length} student{students.length === 1 ? "" : "s"}
        </p>
      </div>

      <SectionHead icon={Gauge}>Cohort health</SectionHead>
      <div className="grid gap-4 sm:grid-cols-2">
        <ChartCard icon={BarChart3} title="Completion distribution" subtitle="How far along each student is, across assigned content">
          <Histogram bars={completionHistogram} />
        </ChartCard>
        <ChartCard icon={PieChart} title="LeetCode tracking" subtitle="Whether the platform can currently track each student">
          <DonutChart
            centerLabel={String(students.length)}
            centerSubLabel="STUDENTS"
            segments={[
              { label: "Linked", value: leetcodeCounts.ACTIVE, color: "var(--success)" },
              { label: "Not linked", value: leetcodeCounts.NONE + leetcodeCounts.UNVERIFIED, color: "var(--ink-faint)" },
              { label: "Tracking lost", value: leetcodeCounts.BLOCKED_OR_PRIVATE, color: "var(--warn)" },
            ]}
          />
        </ChartCard>
      </div>

      <SectionHead icon={TrendingUp}>Growth &amp; engagement</SectionHead>
      <div className="grid gap-4 sm:grid-cols-2">
        <ChartCard icon={TrendingUp} title="Roster growth" subtitle="Cumulative students onboarded, by month">
          <TrendLine values={cumulativeGrowth} labels={months.map(monthLabel)} areaFill />
        </ChartCard>
        <ChartCard icon={Activity} title="Daily active students" subtitle="Last 14 days · dashed line is the weekly average">
          <TrendLine
            values={dailyActive.series.map((d) => d.count)}
            averageValue={dailyActive.weeklyAverage}
            color="var(--pillar-pink)"
          />
        </ChartCard>
        <ChartCard icon={Activity} title="Active students / month" subtitle="Distinct students who logged in that month">
          <Histogram
            bars={months.map((m, i) => ({ label: monthLabel(m), count: activeByMonth[i], color: "var(--success)" }))}
          />
        </ChartCard>
        <ChartCard icon={BarChart3} title="Billed amount / month" subtitle={`Active students × ₹${(vendor.ratePaisePerStudent / 100).toFixed(0)}/student`}>
          <Histogram
            bars={months.map((m, i) => ({
              label: monthLabel(m),
              count: billedByMonth[i],
              valueLabel: `₹${billedByMonth[i].toLocaleString("en-IN")}`,
            }))}
          />
        </ChartCard>
      </div>

      <SectionHead icon={Layers}>Job-readiness &amp; practice</SectionHead>
      <div className="grid gap-4 sm:grid-cols-2">
        <ChartCard icon={Gauge} title="Readiness by pillar" subtitle="Average across the roster · same 6 pillars as the student report">
          {pillarAverages.length ? (
            <RadarChart
              axes={pillarAverages.map((p) => ({
                label: PILLAR_SHORT_LABEL[p.label] ?? p.label,
                value: p.average,
              }))}
            />
          ) : (
            <p className="py-8 text-center text-sm text-ink-faint">No readiness data yet.</p>
          )}
        </ChartCard>
        <ChartCard icon={AlertTriangle} title="Topics students are stuck on" subtitle="Highest attempt-to-solve gap across submissions">
          {topicGaps.length ? (
            <div>
              {topicGaps.map((gap, i) => (
                <div key={gap.category} className="flex items-center gap-3 py-2">
                  <span className="w-36 shrink-0 truncate text-[12.5px] text-ink">{gap.category}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line-soft">
                    <div
                      className="animate-grow-bar-x h-full rounded-full bg-warn"
                      style={{ width: `${gap.gapPercent}%`, animationDelay: `${i * 0.06}s` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-[11.5px] text-ink-muted">
                    {gap.gapPercent}%
                  </span>
                </div>
              ))}
              <p className="mt-3 text-xs text-ink-faint">% = attempted at least once but never accepted</p>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-ink-faint">No submissions yet.</p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

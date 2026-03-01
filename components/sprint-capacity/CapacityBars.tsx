"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { TeamCapacitySummary } from "@/types/capacity";

const HOURS_PER_SP = 4;

function getBarColor(utilPercent: number): string {
  if (utilPercent > 100) return "#ef4444";
  if (utilPercent > 80) return "#f59e0b";
  return "#22c55e";
}

interface Props {
  data: TeamCapacitySummary;
}

export function CapacityBars({ data }: Props) {
  const chartData = data.people.map((p) => ({
    name: p.displayName.split("@")[0],
    "Assigned (h)": Math.round(p.totalStoryPoints * HOURS_PER_SP),
    "Available (h)": Math.round(p.availableHours),
    "Story Points": p.totalStoryPoints,
    utilPercent: p.utilizationPercent,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis
          yAxisId="hours"
          tick={{ fontSize: 12 }}
          label={{ value: "Hours", angle: -90, position: "insideLeft", fontSize: 12 }}
        />
        <YAxis
          yAxisId="sp"
          orientation="right"
          tick={{ fontSize: 12 }}
          label={{ value: "Story Points", angle: 90, position: "insideRight", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Bar yAxisId="hours" dataKey="Assigned (h)" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={getBarColor(entry.utilPercent)} />
          ))}
        </Bar>
        <Line
          yAxisId="hours"
          type="monotone"
          dataKey="Available (h)"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
        <Bar
          yAxisId="sp"
          dataKey="Story Points"
          fill="hsl(var(--muted))"
          radius={[4, 4, 0, 0]}
          opacity={0.5}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { TeamCapacitySummary } from "@/types/capacity";

interface Props {
  data: TeamCapacitySummary;
}

const HOURS_PER_SP = 4;

function getBarColor(utilPercent: number): string {
  if (utilPercent > 100) return "#ef4444"; // red-500
  if (utilPercent > 80) return "#f59e0b";  // amber-500
  return "#22c55e";                         // green-500
}

export function TeamWorkloadChart({ data }: Props) {
  const chartData = data.people.map((p) => ({
    name: p.displayName.split("@")[0],
    "Assigned Hours": Math.round(p.totalStoryPoints * HOURS_PER_SP),
    "Available Hours": Math.round(p.availableHours),
    utilPercent: p.utilizationPercent,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No team members with data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{ value: "Hours", angle: -90, position: "insideLeft", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number, name: string) => [`${value}h`, name]}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Bar dataKey="Assigned Hours" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={getBarColor(entry.utilPercent)} />
          ))}
        </Bar>
        <Bar dataKey="Available Hours" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
        <ReferenceLine y={40} stroke="#6366f1" strokeDasharray="4 4" label={{ value: "40h/wk", fontSize: 11 }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TeamCapacitySummary } from "@/types/capacity";

interface Props {
  data: TeamCapacitySummary;
}

export function CapacityBars({ data }: Props) {
  const chartData = data.people
    .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
    .map((p) => ({
      name: p.displayName.split("@")[0],
      "Meetings": Math.round(p.meetingHours),
      "Tasks": Math.round(p.taskHours),
      "Free": Math.round(p.freeHours),
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
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{
            value: "Hours",
            angle: -90,
            position: "insideLeft",
            fontSize: 12,
          }}
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
        <Bar dataKey="Meetings" stackId="a" fill="#3b82f6" />
        <Bar dataKey="Tasks" stackId="a" fill="#f97316" />
        <Bar dataKey="Free" stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

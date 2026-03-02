"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { FunnelStage } from "@/types/survey";

interface Props {
  stages: FunnelStage[];
}

const STAGE_COLORS: Record<string, string> = {
  cases_received: "#3b82f6", // blue-500
  surveys_assigned: "#f59e0b", // amber-500
  surveys_completed: "#22c55e", // green-500
  reports_issued: "#a855f7", // purple-500
};

export function FunnelChart({ stages }: Props) {
  const chartData = stages.map((stage) => ({
    name: stage.label,
    count: stage.count,
    id: stage.id,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No funnel data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          horizontal={false}
        />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          width={140}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`${value} cases`, "Count"]}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={32}>
          {chartData.map((entry) => (
            <Cell
              key={entry.id}
              fill={STAGE_COLORS[entry.id] ?? "#6b7280"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

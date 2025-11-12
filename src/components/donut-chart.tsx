
"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface DonutChartProps {
    value: number;
    label: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ value, label }) => {
  const chartData = [{ name: 'value', value: value }, { name: 'remaining', value: 100 - value }];
  const chartConfig = {
    value: { label: label, color: "hsl(var(--primary))" },
    remaining: { label: "Remaining", color: "hsl(var(--muted))" },
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-24"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={28}
          outerRadius={36}
          strokeWidth={2}
          startAngle={90}
          endAngle={450}
        >
            <Cell fill="var(--color-value)" />
            <Cell fill="var(--color-remaining)" stroke="var(--color-remaining)" />
        </Pie>
         <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-sm font-bold"
        >
            {label}
        </text>
      </PieChart>
    </ChartContainer>
  )
}

export default DonutChart;

    
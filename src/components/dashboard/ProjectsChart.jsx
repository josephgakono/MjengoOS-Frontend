import { useEffect, useState } from "react";
import { api } from "../../services/api";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#4F46E5",
  "#3B82F6",
  "#F59E0B",
  "#22C55E",
];

export default function ProjectsChart() {
  const [chartData, setChartData] =
    useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const projects =
        await api.get("projects/");

      const statusCounts = {
        pending: 0,
        in_progress: 0,
        completed: 0,
        paused: 0,
      };

      projects?.forEach((project) => {
        if (
          statusCounts.hasOwnProperty(
            project.status
          )
        ) {
          statusCounts[project.status]++;
        }
      });

      const data = [
        {
          name: "Pending",
          value: statusCounts.pending,
        },
        {
          name: "In Progress",
          value: statusCounts.in_progress,
        },
        {
          name: "Completed",
          value: statusCounts.completed,
        },
        {
          name: "Paused",
          value: statusCounts.paused,
        },
      ];

      setChartData(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer
        width="100%"
        height={280}
      >
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            innerRadius={55}
          >
            {chartData.map(
              (entry, index) => (
                <Cell
                  key={index}
                  fill={
                    COLORS[
                      index % COLORS.length
                    ]
                  }
                />
              )
            )}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <div className="chart-legend">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="legend-item"
          >
            <span>{item.name}</span>

            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
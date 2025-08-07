import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";

const OrderFlowChart = () => {
  const [data] = useState([
    { time: "2025-08-01", newOrders: 40, completed: 32, failed: 2, processed: 6 },
    { time: "2025-08-02", newOrders: 50, completed: 45, failed: 1, processed: 4 },
    { time: "2025-08-03", newOrders: 35, completed: 30, failed: 3, processed: 2 },
    { time: "2025-08-04", newOrders: 60, completed: 55, failed: 2, processed: 3 },
    { time: "2025-08-05", newOrders: 48, completed: 44, failed: 1, processed: 3 },
    { time: "2025-08-06", newOrders: 52, completed: 50, failed: 0, processed: 2 },
  ]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded shadow border dark:bg-gray-800 dark:border-gray-600">
          <p className="text-sm font-semibold text-black dark:text-white">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    // <div className="h-80 w-full">
    <div className="h-[28rem]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 45 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            fontSize={12}
            height={50}
            tick={{ angle: -45, textAnchor: "end" }}
          />
          <YAxis fontSize={12} domain={[0, "dataMax + 10"]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Line
            type="monotone"
            dataKey="newOrders"
            stroke="#4f46e5"
            strokeWidth={2}
            name="New Orders"
            dot={{ r: 4, fill: "#4f46e5" }}
          />
          <Line
            type="monotone"
            dataKey="processed"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Processing"
            dot={{ r: 4, fill: "#f59e0b" }}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#22c55e"
            strokeWidth={2}
            name="Completed"
            dot={{ r: 4, fill: "#22c55e" }}
          />
          <Line
            type="monotone"
            dataKey="failed"
            stroke="#ef4444"
            strokeWidth={2}
            name="Failed"
            dot={{ r: 4, fill: "#ef4444" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderFlowChart;
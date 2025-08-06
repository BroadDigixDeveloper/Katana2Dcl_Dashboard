import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: "primary" | "success" | "warning" | "destructive";
}

export const MetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradient = "primary"
}: MetricCardProps) => {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getGradientClass = () => {
    switch (gradient) {
      case "success":
        return "bg-gradient-success";
      case "warning":
        return "bg-gradient-warning";
      case "destructive":
        return "bg-gradient-destructive";
      default:
        return "bg-gradient-primary";
    }
  };

  return (
    <div className="metric-card p-6 group hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${getGradientClass()}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <span className={`text-sm font-medium ${getChangeColor()}`}>
            {change}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
};
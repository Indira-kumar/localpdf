import type { FC, ReactNode } from "react";
import { Link } from "react-router-dom";
import Card from "./ui/Card";

interface ToolCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  to: string;
}

const ToolCard: FC<ToolCardProps> = ({ title, description, icon, to }) => {
  return (
    <Link to={to} className="block">
      <Card>
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 text-4xl">{icon}</div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </Card>
    </Link>
  );
};

export default ToolCard;

import React from "react";
import { ArrowRightIcon } from "./Icons";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText?: string;
  onClick: () => void;
  id?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  actionText = "Open Feature",
  onClick,
  id,
}: FeatureCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      id={id}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="feature-card"
      aria-label={`${title} - ${description}`}
    >
      <div>
        <div className="feature-icon-box" aria-hidden="true">
          {icon}
        </div>
        <h2 className="feature-title">{title}</h2>
        <p className="feature-desc">{description}</p>
      </div>

      <div className="feature-action">
        <span>{actionText}</span>
        <ArrowRightIcon size={16} />
      </div>
    </div>
  );
}

import { ArrowLeftIcon } from "./Icons";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = "Back to Dashboard" }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="interactive-nav-btn back-dashboard-btn"
      aria-label={label}
      type="button"
      id="back-to-dashboard-btn"
    >
      <span className="btn-icon-wrapper">
        <ArrowLeftIcon size={16} />
      </span>
      <span className="btn-text">{label}</span>
    </button>
  );
}

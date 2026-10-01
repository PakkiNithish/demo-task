import type { Feature } from "../types";
import { ScalesIcon, DashboardIcon } from "./Icons";

interface HeaderProps {
  currentFeature: Feature;
  onNavigateHome: () => void;
}

export function Header({ currentFeature, onNavigateHome }: HeaderProps) {
  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        <button
          onClick={onNavigateHome}
          className="brand-wrapper"
          title="Lawsutra AI Dashboard"
          aria-label="Lawsutra AI Home"
        >
          <div className="brand-icon-box">
            <ScalesIcon size={22} />
          </div>
          <div>
            <div className="brand-title">
              <span>Lawsutra AI</span>
              <span className="brand-badge">Legal AI</span>
            </div>
          </div>
        </button>

        <div className="header-actions">
          <div className="system-status" title="FastAPI Vector & Translation Pipeline Active">
            <span className="status-dot" aria-hidden="true" />
            <span>AI Engine Ready</span>
          </div>

          {currentFeature !== "home" && (
            <button
              onClick={onNavigateHome}
              className="interactive-nav-btn header-dashboard-btn"
              aria-label="Return to Feature Dashboard"
              id="header-nav-dashboard-btn"
            >
              <DashboardIcon size={16} />
              <span>Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

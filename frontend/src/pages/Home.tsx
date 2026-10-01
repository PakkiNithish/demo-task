import type { Feature } from "../types";
import { FeatureCard } from "../components/FeatureCard";
import { DocumentSearchIcon, TranslateIcon, ScalesIcon } from "../components/Icons";

interface HomeProps {
  onSelectFeature: (feature: Feature) => void;
}

export function Home({ onSelectFeature }: HomeProps) {
  return (
    <div className="home-container">
      <section className="home-hero">
        <div className="home-badge">
          <ScalesIcon size={14} />
          <span>Legal Intelligence Suite</span>
        </div>

        <h1 className="home-title">
          Lawsutra AI
        </h1>

        <p className="home-subtitle">
          AI-powered tools for document intelligence and language translation.
        </p>
      </section>

      <div className="features-grid">
        <FeatureCard
          id="feature-retrieval-card"
          title="Retrieval & Ask Questions"
          description="Upload documents and ask questions using AI-powered semantic search."
          icon={<DocumentSearchIcon size={24} />}
          actionText="Open Feature"
          onClick={() => onSelectFeature("retrieval")}
        />

        <FeatureCard
          id="feature-translation-card"
          title="Translation"
          description="Translate Indian regional-language text into clear English."
          icon={<TranslateIcon size={24} />}
          actionText="Open Feature"
          onClick={() => onSelectFeature("translation")}
        />
      </div>

      <div className="capabilities-bar" aria-label="System Capabilities">
        <div className="capability-item">
          <span className="capability-dot" />
          <span>Semantic Vector Search (Qdrant)</span>
        </div>
        <div className="capability-item">
          <span className="capability-dot" />
          <span>Automated Context Chunking & Extraction</span>
        </div>
        <div className="capability-item">
          <span className="capability-dot" />
          <span>Cross-Lingual Semantic Validation</span>
        </div>
      </div>
    </div>
  );
}

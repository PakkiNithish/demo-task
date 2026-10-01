import { useState } from "react";
import type { Feature } from "./types";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { Retrieval } from "./pages/Retrieval";
import { Translation } from "./pages/Translation";

function App() {
  const [feature, setFeature] = useState<Feature>("home");

  return (
    <div className="app-container">
      <Header
        currentFeature={feature}
        onNavigateHome={() => setFeature("home")}
      />

      <main className="main-content" role="main">
        {feature === "home" && (
          <Home onSelectFeature={(selected) => setFeature(selected)} />
        )}

        {feature === "retrieval" && (
          <Retrieval onBack={() => setFeature("home")} />
        )}

        {feature === "translation" && (
          <Translation onBack={() => setFeature("home")} />
        )}
      </main>
    </div>
  );
}

export default App;
interface Props {
  onContinue: () => void;
  onNavigate?: (tab: string) => void;
}

const features = [
  {
    icon: "\u2699\uFE0F",
    title: "Equipment Costing",
    desc: "Estimate purchased and installed costs using built-in correlations and CEPCI escalation for hundreds of equipment types.",
  },
  {
    icon: "\uD83C\uDFED",
    title: "Plant Economics",
    desc: "Assemble CAPEX and OPEX, run discounted cash flow analysis with NPV, IRR, payback period, and break-even price.",
  },
  {
    icon: "\uD83D\uDCCA",
    title: "Sensitivity & Tornado",
    desc: "Vary parameters one at a time to identify the key drivers that impact your project's bottom line.",
  },
  {
    icon: "\uD83C\uDFB2",
    title: "Monte Carlo Simulation",
    desc: "Quantify uncertainty across thousands of scenarios with histograms, confidence intervals, and summary statistics.",
  },
  {
    icon: "\u2696\uFE0F",
    title: "Plant Comparison",
    desc: "Load multiple configurations side-by-side to evaluate design trade-offs and select the optimal process pathway.",
  },
  {
    icon: "\uD83D\uDCC1",
    title: "Import & Export",
    desc: "Save and load project files, or start from pre-built case studies to jump-start your analysis.",
  },
];

export default function WelcomePage({ onContinue, onNavigate }: Props) {
  return (
    <div className="welcome">
      <div className="welcome-hero">
        <img src="/logo.png" alt="OpenPyTEA" className="welcome-logo" />
        <h1 className="welcome-title">OpenPyTEA</h1>
        <p className="welcome-subtitle">
          Open-source toolkit for techno-economic assessment of chemical and energy systems
        </p>
        <button className="btn-primary welcome-cta" onClick={onContinue}>
          Launch Application &rarr;
        </button>
      </div>

      <div className="welcome-features-section">
        <h2 className="welcome-section-title">What You Can Do</h2>
        <div className="welcome-features-grid">
          {features.map((f) => (
            <div key={f.title} className="welcome-feature-card">
              <span className="welcome-feature-icon">{f.icon}</span>
              <h3 className="welcome-feature-title">{f.title}</h3>
              <p className="welcome-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="welcome-about">
        <h2 className="welcome-section-title">About the Project</h2>
        <p>
          OpenPyTEA is an open-source Python library for techno-economic analysis (TEA) of chemical and
          energy conversion processes. It provides industry-standard costing correlations, discounted
          cash flow analysis, uncertainty quantification, and visualization tools&mdash;all in a
          free, transparent, and extensible package.
        </p>
      </div>

      <div className="welcome-tutorials-section">
        <h2 className="welcome-section-title">Tutorials</h2>
        <p className="welcome-tutorials-sub">
          Watch step-by-step video walkthroughs and follow along with the interactive notebooks.
        </p>
        <div className="welcome-tutorials-grid">
          <button className="welcome-tutorial-card" onClick={() => onNavigate?.("Tutorials")}>
            <span className="welcome-tutorial-icon">{'\u25B6\uFE0F'}</span>
            <div>
              <strong>View Tutorials</strong>
              <span>Step-by-step video walkthroughs &amp; interactive notebooks</span>
            </div>
          </button>
        </div>
      </div>

      <footer className="welcome-footer">
        <p>
          Based on{" "}
          <a href="https://github.com/pbtamarona/openpytea" target="_blank" rel="noopener noreferrer">
            OpenPyTEA
          </a>{" "}
          &mdash; original repository by pbtamarona
        </p>
        <p>
          Web app created by{" "}
          <a href="https://qazinasir.com" target="_blank" rel="noopener noreferrer">
            qazinasir.com
          </a>
        </p>
      </footer>
    </div>
  );
}

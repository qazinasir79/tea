import { useEffect, useState, useMemo, useCallback } from "react";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

marked.use(markedHighlight({
  langPrefix: "hljs language-",
  highlight(code: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
}));

interface NotebookCell {
  cell_type: string;
  source: string[];
  outputs?: Array<{
    name: string;
    output_type: string;
    text?: string[];
  }>;
}

interface Notebook {
  cells: NotebookCell[];
}

interface TutorialMeta {
  id: string;
  title: string;
  description: string;
  notebook: string;
  video: string;
}

const TUTORIALS: TutorialMeta[] = [
  {
    id: "1",
    title: "Creating Equipment",
    description:
      "Learn how to create Equipment objects using database correlations, direct costs, and custom installation factors.",
    notebook: "/tutorials/tutorial_01_creating_equipment.ipynb",
    video: "/videos/tutorial_01_creating_equipment.mp4",
  },
  {
    id: "2",
    title: "Creating a Plant",
    description:
      "Build a complete Plant model with equipment, economic parameters, operating costs, and revenue assumptions.",
    notebook: "/tutorials/tutorial_02_creating_a_plant.ipynb",
    video: "/videos/tutorial_02_creating_a_plant.mp4",
  },
  {
    id: "3",
    title: "Performing Analysis",
    description:
      "Run cost breakdown, sensitivity, tornado, and Monte Carlo analyses on configured plant models.",
    notebook: "/tutorials/tutorial_03_performing_analysis.ipynb",
    video: "/videos/tutorial_03_performing_analysis.mp4",
  },
];

const TUTORIAL_NUM = { "1": "01", "2": "02", "3": "03" } as Record<string, string>;

function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false }) as string;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [code]);

  const highlighted = useMemo(() => hljs.highlight(code, { language: "python" }).value, [code]);

  return (
    <div className="notebook-code-wrap">
      <button className="notebook-copy-btn" onClick={handleCopy}>
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="notebook-code">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

function NotebookViewer({ notebook }: { notebook: Notebook }) {
  return (
    <div className="notebook">
      {notebook.cells.map((cell, i) => {
        const source = cell.source.join("");
        if (cell.cell_type === "markdown") {
          return (
            <div
              key={i}
              className="notebook-md"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }}
            />
          );
        }
        if (cell.cell_type === "code") {
          return (
            <div key={i} className="notebook-code-block">
              <CodeBlock code={source} />
              {cell.outputs
                ?.filter((o) => o.output_type === "stream" && o.text)
                .map((o, j) => (
                  <pre key={j} className="notebook-output"><code>{o.text?.join("")}</code></pre>
                ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function TutorialsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tutorial = useMemo(
    () => TUTORIALS.find((t) => t.id === selected) ?? null,
    [selected],
  );

  const select = (id: string) => {
    setSelected(id);
    setNotebook(null);
    setError(null);
  };

  const back = () => {
    setSelected(null);
    setNotebook(null);
    setError(null);
  };

  useEffect(() => {
    if (!tutorial) return;
    fetch(tutorial.notebook)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load notebook (${r.status})`);
        return r.json() as Promise<Notebook>;
      })
      .then((data) => {
        setNotebook(data);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load tutorial");
      });
  }, [tutorial]);

  const loading = tutorial != null && notebook == null && error == null;

  const hasPrev = selected != null && Number(selected) > 1;
  const hasNext = selected != null && Number(selected) < TUTORIALS.length;

  if (!selected) {
    return (
      <div className="tutorials">
        <h2 className="tutorials-heading">Tutorials</h2>
        <p className="tutorials-subheading">
          Step-by-step guides to help you get the most out of OpenPyTEA.
        </p>
        <div className="tutorials-grid">
          {TUTORIALS.map((t) => (
            <button key={t.id} className="tutorial-card" onClick={() => select(t.id)}>
              <span className="tutorial-card-num">Tutorial {TUTORIAL_NUM[t.id]}</span>
              <h3 className="tutorial-card-title">{t.title}</h3>
              <p className="tutorial-card-desc">{t.description}</p>
              <span className="tutorial-card-link">Start &rarr;</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tutorials">
      <div className="tutorials-viewer">
        <div className="tutorials-viewer-header">
          <button className="btn-secondary" onClick={back}>
            &larr; Back to Tutorials
          </button>
          <span className="tutorials-viewer-num">
            Tutorial {TUTORIAL_NUM[tutorial!.id]} &mdash; {tutorial!.title}
          </span>
        </div>

        {tutorial!.video && (
          <div className="tutorial-video-wrapper">
            <video
              key={tutorial!.id}
              className="tutorial-video"
              controls
              preload="metadata"
            >
              <source src={tutorial!.video} type="video/mp4" />
            </video>
          </div>
        )}

        {loading && <div className="tutorials-loading">Loading tutorial...</div>}
        {error && <div className="error-bar">{error}</div>}
        {notebook && <NotebookViewer notebook={notebook} />}

        <div className="tutorials-nav">
          {hasPrev && (
            <button className="btn-secondary" onClick={() => select(String(Number(selected) - 1))}>
              &larr; Previous
            </button>
          )}
          {hasNext && (
            <button className="btn-secondary" onClick={() => select(String(Number(selected) + 1))}>
              Next &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

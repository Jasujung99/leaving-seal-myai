import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import brandBoard from "../assets/brand-board.png";
import deviceImage from "../assets/living-seal-device.png";
import ownerKey from "../assets/owner-key.png";

const loopContent = {
  runs: {
    tab: "Runs here",
    note: "Computation stays close.",
    title: "Your room becomes the cloud.",
    description:
      "The model runs on dedicated local hardware, so private work stays physically close.",
  },
  learns: {
    tab: "Learns here",
    note: "Context remains in your vault.",
    title: "Memory stays under your key.",
    description:
      "Personal context is stored in an encrypted vault that you can inspect, edit, or erase.",
  },
  answers: {
    tab: "Answers here",
    note: "Results return without a round trip.",
    title: "Useful without the round trip.",
    description:
      "Responses return from the same local system, with no remote profile built along the way.",
  },
};

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem("living-seal-theme");
    if (saved === "light" || saved === "dark") return saved;
    return "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("living-seal-theme", theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#061714" : "#e8e8e2");
  }, [theme]);

  return [theme, setTheme];
}

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{
        duration: reduceMotion ? 0 : 0.7,
        delay: reduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

function Brand() {
  return (
    <a className="wordmark" href="#top" aria-label="Living Seal home">
      <img src="./seal-mark.svg" alt="" width="34" height="34" />
      <span>LIVING SEAL</span>
    </a>
  );
}

function Header({ theme, onToggleTheme }) {
  const nextTheme = theme === "dark" ? "Light" : "Dark";

  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Primary navigation">
        <Brand />
        <div className="nav-links">
          <a href="#product">Product</a>
          <a href="#privacy">Privacy</a>
          <a href="#ownership">Ownership</a>
        </div>
        <div className="nav-actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${nextTheme.toLowerCase()} theme`}
            onClick={onToggleTheme}
          >
            {nextTheme}
          </button>
          <a className="nav-cta" href="#product">
            Meet the Seal
          </a>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();
  const tiltX = useRef(0);
  const tiltY = useRef(0);

  const handlePointerMove = (event) => {
    if (reduceMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    tiltX.current = ((event.clientX - bounds.left) / bounds.width - 0.5) * 4;
    tiltY.current = ((event.clientY - bounds.top) / bounds.height - 0.5) * -4;
    event.currentTarget.style.setProperty("--tilt-x", `${tiltX.current.toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${tiltY.current.toFixed(2)}deg`);
  };

  const clearTilt = (event) => {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <section className="hero section-shell" id="top" aria-labelledby="hero-title">
      <motion.div
        className="hero-copy"
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: reduceMotion ? 0 : 0.09 },
          },
        }}
      >
        <motion.h1
          id="hero-title"
          variants={{
            hidden: { opacity: 0, y: 22 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hero-line">Your AI</span>
          <span className="hero-line">stays yours.</span>
        </motion.h1>
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 22 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
        >
          A private intelligence appliance that lives with you, learns locally,
          and never sends your life away.
        </motion.p>
        <motion.div
          className="hero-actions"
          variants={{
            hidden: { opacity: 0, y: 22 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
        >
          <a className="button button-primary" href="#product">
            Meet the Seal
          </a>
          <a className="text-link" href="#privacy">
            How privacy works
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-media"
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        onPointerMove={handlePointerMove}
        onPointerLeave={clearTilt}
      >
        <img
          src={deviceImage}
          width="1536"
          height="1024"
          alt="Living Seal local AI device and brushed metal console in a dark home studio"
          fetchPriority="high"
          decoding="async"
        />
      </motion.div>
    </section>
  );
}

function Assistant() {
  const reduceMotion = useReducedMotion();
  const timerRef = useRef(null);
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState("empty");
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const localAnswer = (input) => {
    const normalized = input.toLowerCase();
    if (normalized.includes("focus") || normalized.includes("today")) {
      return {
        title: "Protect one clear block of attention.",
        body: "Start with the decision that removes the most uncertainty. Keep the rest visible, but outside that block.",
      };
    }
    if (normalized.includes("note") || normalized.includes("remember")) {
      return {
        title: "I can keep that in your local context.",
        body: "The note remains in this browser demo. A Living Seal device would store it inside your encrypted local vault.",
      };
    }
    if (normalized.includes("privacy") || normalized.includes("data")) {
      return {
        title: "The boundary is the product.",
        body: "Local processing keeps the request, supporting context, and result within the space you control.",
      };
    }
    return {
      title: "Start with what only you can decide.",
      body: "Name the outcome, the constraint, and the next irreversible choice. I can help shape the rest locally.",
    };
  };

  const submit = (event) => {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (cleanQuestion.length < 2) {
      setError("Enter a short question to continue.");
      setStatus("error");
      return;
    }

    setError("");
    setStatus("loading");
    setAnswer(null);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => {
        setAnswer(localAnswer(cleanQuestion));
        setStatus("success");
      },
      reduceMotion ? 80 : 720,
    );
  };

  return (
    <div className="assistant-shell">
      <div className="assistant-topline">
        <span>Living Seal</span>
        <span className="session-label">Local session</span>
      </div>

      <div className="assistant-response" aria-live="polite" aria-atomic="true" aria-busy={status === "loading"}>
        {status === "empty" || status === "error" ? (
          <div className="response-empty">
            <strong>Your context is ready.</strong>
            <span>Ask about a plan, idea, note, or decision.</span>
          </div>
        ) : null}
        {status === "loading" ? (
          <div className="response-skeleton" aria-label="Living Seal is preparing a local answer">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {status === "success" && answer ? (
          <motion.div
            className="response-answer"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <strong>{answer.title}</strong>
            <p>{answer.body}</p>
          </motion.div>
        ) : null}
      </div>

      <form className="assistant-form" onSubmit={submit} noValidate>
        <label htmlFor="local-question">Ask Living Seal</label>
        <div className="input-row">
          <input
            id="local-question"
            name="question"
            type="text"
            minLength="2"
            autoComplete="off"
            placeholder="What should I focus on today?"
            aria-describedby="question-helper question-error"
            aria-invalid={status === "error" ? "true" : undefined}
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              if (event.target.value.trim().length >= 2) {
                setError("");
                if (status === "error") setStatus("empty");
              }
            }}
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Thinking locally" : "Ask locally"}
          </button>
        </div>
        <p id="question-helper" className="helper-text">
          This demo answers in your browser and sends nothing.
        </p>
        <p id="question-error" className="error-text" role="alert">
          {error}
        </p>
      </form>
    </div>
  );
}

function ProductSection() {
  return (
    <section className="product section-shell" id="product">
      <Reveal className="product-copy">
        <h2>Ask naturally. Keep it local.</h2>
        <p>
          The interface is quiet because the hard work happens beneath it. Try
          the local interaction model.
        </p>
        <div className="custody-line" aria-label="Local processing flow">
          <span>Your words</span>
          <span>On-device context</span>
          <span>Your answer</span>
        </div>
      </Reveal>
      <Reveal>
        <Assistant />
      </Reveal>
    </section>
  );
}

function PrivacyLoop() {
  const [active, setActive] = useState("runs");
  const tabRefs = useRef([]);
  const activeContent = loopContent[active];
  const keys = useMemo(() => Object.keys(loopContent), []);

  const handleTabKey = (event, index) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + keys.length) % keys.length;
    const nextKey = keys[nextIndex];
    setActive(nextKey);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section className="sealed-loop section-shell">
      <Reveal className="loop-heading">
        <h2>A smaller circle of trust.</h2>
        <p>Three local actions keep the relationship between you and your AI intact.</p>
      </Reveal>

      <Reveal className="loop-interface">
        <div className="loop-tabs" role="tablist" aria-label="Living Seal privacy model">
          {keys.map((key, index) => {
            const item = loopContent[key];
            const selected = active === key;
            return (
              <button
                key={key}
                id={`tab-${key}`}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                className={`loop-tab ${selected ? "is-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="loop-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(key)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >
                <span>{item.tab}</span>
                <small>{item.note}</small>
              </button>
            );
          })}
        </div>

        <div
          className={`loop-visual state-${active}`}
          id="loop-panel"
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
        >
          <div className="seal-orbit" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <div className="orbit-core" />
          </div>
          <motion.div
            key={active}
            className="loop-copy"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <strong>{activeContent.title}</strong>
            <p>{activeContent.description}</p>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}

function App() {
  const [theme, setTheme] = useTheme();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
      />

      <main id="main">
        <Hero />

        <section className="manifesto section-shell" id="privacy">
          <Reveal className="manifesto-heading">
            <h2>Your life is not a training set.</h2>
            <p>
              Living Seal keeps conversation, context, and memory inside the
              space where they were created.
            </p>
          </Reveal>
          <div className="principle-grid">
            <Reveal>
              <article>
                <h3>Private by location</h3>
                <p>Your requests are processed on the device beside you.</p>
              </article>
            </Reveal>
            <Reveal delay={0.09}>
              <article>
                <h3>Useful by memory</h3>
                <p>It remembers what matters without building a profile elsewhere.</p>
              </article>
            </Reveal>
            <Reveal delay={0.18}>
              <article>
                <h3>Yours by default</h3>
                <p>You decide what stays, what leaves, and what disappears.</p>
              </article>
            </Reveal>
          </div>
        </section>

        <ProductSection />

        <section className="ownership section-shell" id="ownership">
          <Reveal className="ownership-media">
            <img
              src={ownerKey}
              width="1450"
              height="1088"
              loading="lazy"
              decoding="async"
              alt="Blank brushed silver owner key inside a deep green felt presentation tray"
            />
          </Reveal>
          <Reveal className="ownership-copy">
            <h2>Proof you can hold.</h2>
            <p>
              The owner key is a physical root of trust. It confirms that your
              memory vault belongs to you.
            </p>
            <dl>
              <div>
                <dt>Owner key</dt>
                <dd>Unlocks custody and authorizes any export.</dd>
              </div>
              <div>
                <dt>Local vault</dt>
                <dd>Keeps personal context encrypted at rest.</dd>
              </div>
            </dl>
          </Reveal>
        </section>

        <PrivacyLoop />

        <section className="identity section-shell">
          <Reveal className="identity-copy">
            <h2>Built to feel owned, not rented.</h2>
            <p>
              Organic geometry meets industrial material, giving private AI a
              calm and tangible presence.
            </p>
          </Reveal>
          <Reveal>
            <figure className="brand-board">
              <img
                src={brandBoard}
                width="2048"
                height="1365"
                loading="lazy"
                decoding="async"
                alt="Living Seal identity board with the mark, its geometry, a local AI interface, and an owner certificate"
              />
              <figcaption>
                The Living Seal identity system pairs a protected core with an
                open, organic outer form.
              </figcaption>
            </figure>
          </Reveal>
        </section>

        <Reveal className="closing section-shell">
          <div>
            <h2>Keep intelligence close.</h2>
            <p>A calmer AI begins with a clearer boundary.</p>
          </div>
          <a className="button button-primary" href="#product">
            Meet the Seal
          </a>
        </Reveal>
      </main>

      <footer className="site-footer section-shell">
        <span className="footer-wordmark">LIVING SEAL</span>
        <span>Local by nature.</span>
        <a href="#top">Back to top</a>
      </footer>
    </>
  );
}

export default App;

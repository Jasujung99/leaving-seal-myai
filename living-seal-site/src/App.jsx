import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Cpu,
  Fingerprint,
  LockKey,
  PaperPlaneTilt,
  ShieldCheck,
  WifiSlash,
} from "@phosphor-icons/react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

const iconProps = { size: 20, weight: "light", "aria-hidden": true };

function SealMark({ className = "", label = "Living Seal mark" }) {
  return (
    <svg
      className={`seal-mark ${className}`}
      viewBox="0 0 120 120"
      role="img"
      aria-label={label}
    >
      <rect
        className="seal-diamond"
        x="24"
        y="24"
        width="72"
        height="72"
        rx="21"
        transform="rotate(45 60 60)"
      />
      <path
        className="seal-eye"
        d="M19 60C30 43 45 35 60 35s30 8 41 25C90 77 75 85 60 85S30 77 19 60Z"
      />
    </svg>
  );
}

function MagneticButton({ children, className = "", href, type = "button", ...props }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const transformedX = useTransform(x, (value) => value * 0.85);
  const transformedY = useTransform(y, (value) => value * 0.85);
  const springX = useSpring(transformedX, { stiffness: 140, damping: 18, mass: 0.35 });
  const springY = useSpring(transformedY, { stiffness: 140, damping: 18, mass: 0.35 });

  const handleMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left - bounds.width / 2) * 0.16);
    y.set((event.clientY - bounds.top - bounds.height / 2) * 0.16);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const shared = {
    className: `magnetic-button ${className}`,
    style: { x: springX, y: springY },
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    whileTap: { scale: 0.98, y: 1 },
    transition: { type: "spring", stiffness: 140, damping: 18 },
    ...props,
  };

  if (href) {
    return (
      <motion.a href={href} {...shared}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} {...shared}>
      {children}
    </motion.button>
  );
}

function BrandLockup({ compact = false }) {
  return (
    <a className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`} href="#top">
      <SealMark className="brand-mark" />
      <span>
        <strong>LIVING SEAL</strong>
        {!compact && <small>LOCAL BY NATURE</small>}
      </span>
    </a>
  );
}

const demoResponses = {
  plan: "I mapped the next three priorities from your local notes. Nothing left this device.",
  notes: "Seven related fragments found across your private archive, ordered by recency and context.",
  default: "Your private context is ready. I can reason across it without uploading the source material.",
};

function AiConsole() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("empty");
  const [response, setResponse] = useState("");
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const runPrompt = (prompt) => {
    const cleanPrompt = prompt.trim();
    setQuery(prompt);

    if (cleanPrompt.length < 4) {
      setStatus("error");
      setResponse("");
      return;
    }

    if (timerRef.current) window.clearTimeout(timerRef.current);
    setStatus("loading");
    setResponse("");

    timerRef.current = window.setTimeout(() => {
      const normalized = cleanPrompt.toLowerCase();
      const answer = normalized.includes("plan")
        ? demoResponses.plan
        : normalized.includes("note")
          ? demoResponses.notes
          : demoResponses.default;
      setResponse(answer);
      setStatus("success");
    }, 1150);
  };

  const submit = (event) => {
    event.preventDefault();
    runPrompt(query);
  };

  return (
    <section className="console-shell" aria-labelledby="console-title">
      <div className="console-topline">
        <div className="local-status">
          <span className="status-pulse" />
          PRIVATE SESSION · ON DEVICE
        </div>
        <span>LS / 04—27</span>
      </div>

      <div className="console-heading">
        <div className="console-mini-mark">
          <SealMark label="" />
        </div>
        <div>
          <p>OWNED INTELLIGENCE</p>
          <h2 id="console-title">Ask what only you know.</h2>
        </div>
      </div>

      <form className="prompt-form" onSubmit={submit}>
        <label htmlFor="private-prompt">Private prompt</label>
        <div className={`prompt-field ${status === "error" ? "prompt-field--error" : ""}`}>
          <input
            id="private-prompt"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (status === "error") setStatus("empty");
            }}
            placeholder="Ask your own AI anything..."
            autoComplete="off"
            aria-describedby="prompt-helper prompt-error"
          />
          <MagneticButton
            className="prompt-submit"
            type="submit"
            aria-label="Send private prompt"
          >
            <PaperPlaneTilt {...iconProps} />
          </MagneticButton>
        </div>
        <span id="prompt-helper" className="field-helper">
          Demo processing stays inside this browser session.
        </span>
        {status === "error" && (
          <span id="prompt-error" className="field-error" role="alert">
            Add a little more detail so the seal has something to work with.
          </span>
        )}
      </form>

      <div className="console-result" aria-live="polite">
        <AnimatePresence mode="wait">
          {status === "empty" && (
            <motion.div
              key="empty"
              className="prompt-suggestions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <span>Try a private query</span>
              <div>
                <button type="button" onClick={() => runPrompt("Plan my week from local notes")}>Plan my week</button>
                <button type="button" onClick={() => runPrompt("Find the notes tied to the field study")}>Find my notes</button>
              </div>
            </motion.div>
          )}

          {status === "loading" && (
            <motion.div
              key="loading"
              className="answer-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="status"
            >
              <span className="sr-only">Reasoning across local context</span>
              <i />
              <i />
              <i />
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              className="answer-success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <div className="answer-seal"><Check {...iconProps} /></div>
              <p>{response}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ConstructionVisual() {
  return (
    <div className="construction-visual" aria-hidden="true">
      <div className="orbit orbit--one" />
      <div className="orbit orbit--two" />
      <div className="orbit orbit--three" />
      <div className="measure-line measure-line--x" />
      <div className="measure-line measure-line--y" />
      <div className="hero-seal-wrap">
        <SealMark className="hero-seal" label="" />
      </div>
      <div className="coordinate coordinate--top">35° 41′ 22″ N</div>
      <div className="coordinate coordinate--bottom">LOCAL / VERIFIED</div>
    </div>
  );
}

const proofItems = [
  {
    icon: Cpu,
    index: "01",
    title: "Lives where you do.",
    copy: "Context is indexed on your hardware, close to the source and available without a round trip.",
    metric: "12 ms local recall",
  },
  {
    icon: WifiSlash,
    index: "02",
    title: "Useful, even offline.",
    copy: "Draft, search, and connect ideas when the network disappears. The core experience remains intact.",
    metric: "0 required cloud hops",
  },
  {
    icon: LockKey,
    index: "03",
    title: "Permission has a shape.",
    copy: "Choose exactly which sources can be read, for how long, and revoke access without negotiation.",
    metric: "7 scoped sources",
  },
];

function ProofStrip() {
  return (
    <div className="proof-strip">
      {proofItems.map(({ icon: Icon, ...item }, index) => (
        <article className="proof-item" key={item.index} style={{ "--delay": `${index * 110}ms` }}>
          <div className="proof-index">{item.index}</div>
          <Icon size={28} weight="light" aria-hidden="true" />
          <h3>{item.title}</h3>
          <p>{item.copy}</p>
          <span>{item.metric}</span>
        </article>
      ))}
    </div>
  );
}

function Certificate() {
  return (
    <div className="certificate-scene">
      <motion.div
        className="certificate"
        whileHover={{ rotateX: -2.5, rotateY: 3, y: -5 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="certificate-noise" />
        <SealMark className="certificate-mark" label="" />
        <p className="certificate-kicker">OWNER CERTIFICATE</p>
        <h3>LIVING SEAL</h3>
        <p className="certificate-tagline">YOUR AI STAYS YOURS.</p>
        <div className="certificate-rule" />
        <dl>
          <div>
            <dt>Custody</dt>
            <dd>Self-held</dd>
          </div>
          <div>
            <dt>Network</dt>
            <dd>Optional</dd>
          </div>
          <div>
            <dt>Context</dt>
            <dd>Revocable</dd>
          </div>
        </dl>
        <div className="certificate-footer">
          <span>LS—0427—C8A1</span>
          <ShieldCheck size={21} weight="light" aria-hidden="true" />
        </div>
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <div className="site-shell" id="top">
      <div className="grain" />

      <header className="site-header">
        <BrandLockup />
        <nav aria-label="Primary navigation">
          <a href="#principles">Principles</a>
          <a href="#ownership">Ownership</a>
          <a href="#access">Private access</a>
        </nav>
        <MagneticButton href="#access" className="header-cta">
          Request access <ArrowRight {...iconProps} />
        </MagneticButton>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow reveal reveal--one">LOCAL BY NATURE · PRIVATE BY DESIGN</p>
            <h1 id="hero-title" className="reveal reveal--two">
              Intelligence that<br />
              <span>belongs with you.</span>
            </h1>
            <p className="hero-description reveal reveal--three">
              Living Seal is a quiet layer of personal intelligence—rooted on your device, shaped by your context, and answerable only to you.
            </p>
            <div className="hero-actions reveal reveal--four">
              <MagneticButton href="#console" className="primary-cta">
                Enter a private session <ArrowRight {...iconProps} />
              </MagneticButton>
              <a className="text-link" href="#principles">
                Read the principles <ArrowDown {...iconProps} />
              </a>
            </div>
            <div className="trust-line reveal reveal--five">
              <Fingerprint size={23} weight="light" aria-hidden="true" />
              <span>No account graph. No ad profile. No borrowed memory.</span>
            </div>
          </div>
          <div className="hero-visual">
            <ConstructionVisual />
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div>
            <span>YOUR CONTEXT</span><i />
            <span>YOUR HARDWARE</span><i />
            <span>YOUR PERMISSION</span><i />
            <span>YOUR CONTEXT</span><i />
            <span>YOUR HARDWARE</span><i />
            <span>YOUR PERMISSION</span><i />
          </div>
        </div>

        <section className="console-section" id="console">
          <div className="section-label">
            <span>01</span>
            <p>A private interface</p>
          </div>
          <AiConsole />
        </section>

        <section className="principles-section" id="principles" aria-labelledby="principles-title">
          <div className="principles-header">
            <div className="section-label section-label--dark">
              <span>02</span>
              <p>Operating principles</p>
            </div>
            <div>
              <p className="eyebrow eyebrow--dark">PRIVACY SHOULD FEEL PHYSICAL</p>
              <h2 id="principles-title">Built around a boundary you can understand.</h2>
            </div>
          </div>
          <ProofStrip />
        </section>

        <section className="ownership-section" id="ownership" aria-labelledby="ownership-title">
          <div className="ownership-copy">
            <div className="section-label">
              <span>03</span>
              <p>Proof of ownership</p>
            </div>
            <p className="eyebrow">THE SEAL IS A PROMISE</p>
            <h2 id="ownership-title">Not another account. A relationship you control.</h2>
            <p>
              Your seal records the rules of the relationship: where memory lives, what the model may read, and when access ends.
            </p>
            <ul>
              <li><Check {...iconProps} /> Exportable context</li>
              <li><Check {...iconProps} /> Visible permissions</li>
              <li><Check {...iconProps} /> One-step revocation</li>
            </ul>
          </div>
          <Certificate />
        </section>

        <section className="access-section" id="access" aria-labelledby="access-title">
          <div className="access-emblem">
            <SealMark label="" />
          </div>
          <div className="access-copy">
            <p className="eyebrow eyebrow--dark">PRIVATE ACCESS · FOUNDING RELEASE</p>
            <h2 id="access-title">Bring your intelligence home.</h2>
            <p>Join a small release group testing local memory, offline search, and user-held context.</p>
          </div>
          <MagneticButton href="mailto:access@livingseal.local?subject=Living%20Seal%20private%20access" className="access-cta">
            Request private access <ArrowRight {...iconProps} />
          </MagneticButton>
        </section>
      </main>

      <footer>
        <BrandLockup compact />
        <p>YOUR AI STAYS YOURS.</p>
        <span>© 2026 LIVING SEAL</span>
      </footer>
    </div>
  );
}

export default App;

import React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "framer-motion";

const notes = [
  { title: "무슨 일이 일어난 건가요.", preview: "천천히 적고 나니 마음이 먼저 알고 있었다.", date: "07.17" },
  { title: "경의", preview: "오래 바라본 것에는 이유가 생긴다.", date: "07.08" },
  { title: "아주 잠깐은", preview: "아무것도 결정하지 않아도 괜찮았다.", date: "06.21" },
  { title: "기대는 없어", preview: "그래도 작은 빛 하나는 남겨두기로 했다.", date: "05.14" },
];

const steps = [
  {
    number: "01",
    title: "열기",
    body: "앱을 열면 메뉴보다 빈 노트가 먼저 기다립니다.",
  },
  {
    number: "02",
    title: "적기",
    body: "제목은 선택입니다. 지금 남기고 싶은 문장부터 쓰세요.",
  },
  {
    number: "03",
    title: "돌아보기",
    body: "저장한 기록은 날짜와 함께 조용한 목록으로 쌓입니다.",
  },
];

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.58, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Brand({ compact = false }) {
  return (
    <span className={`notes-brand${compact ? " notes-brand--compact" : ""}`}>
      <img src="/seal-mark.svg" width="28" height="28" alt="" />
      <span>
        <strong>LIVING SEAL</strong>
        <small>NOTES</small>
      </span>
    </span>
  );
}

function AppLink({ children, className = "" }) {
  return (
    <a className={`app-link ${className}`.trim()} href="/">
      <span>{children}</span>
      <ArrowRight size={16} weight="regular" aria-hidden="true" />
    </a>
  );
}

function NoteSurface() {
  return (
    <div className="note-surface" role="img" aria-label="Living Seal 기록 화면 미리보기">
      <div className="note-surface__bar">
        <span>취소</span>
        <img src="/seal-mark.svg" width="24" height="24" alt="" />
        <span className="note-surface__save">완료</span>
      </div>
      <div className="note-surface__paper">
        <p className="note-surface__title">오늘의 짧은 기록</p>
        <div className="note-surface__rule" />
        <p className="note-surface__body">
          답을 찾으려던 하루였는데,
          <br />
          막상 남기고 싶은 건
          <br />
          창가에 오래 머문 빛이었다.
        </p>
        <span className="note-surface__status">이 브라우저에 저장</span>
      </div>
    </div>
  );
}

function LibrarySurface() {
  return (
    <div className="library-surface" role="img" aria-label="Living Seal 기록 목록 미리보기">
      <div className="library-surface__bar">
        <span>어둡게</span>
        <img src="/seal-mark.svg" width="24" height="24" alt="" />
        <span>새 글</span>
      </div>
      <div className="library-surface__content">
        <div className="library-surface__heading">
          <h3>나의 기록</h3>
          <span>{notes.length}</span>
        </div>
        <div className="library-surface__list">
          {notes.map((note) => (
            <div className="library-surface__row" key={note.title}>
              <span>
                <strong>{note.title}</strong>
                <small>{note.preview}</small>
              </span>
              <time>{note.date}</time>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JournalLanding() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="notes-landing">
      <a className="notes-skip-link" href="#main-content">
        본문으로 이동
      </a>

      <header className="notes-header">
        <a href="/journal.html" aria-label="Living Seal Notes 처음으로">
          <Brand />
        </a>
        <nav aria-label="페이지 안내">
          <a href="#method">기록 방식</a>
          <a href="#storage">보관</a>
        </nav>
        <AppLink className="header-app-link">기록 열기</AppLink>
      </header>

      <main id="main-content">
        <section className="notes-hero" aria-labelledby="notes-hero-title">
          <motion.div
            className="notes-hero__copy"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="notes-kicker">LIVING SEAL NOTES</p>
            <h1 id="notes-hero-title">기록은 조용할수록 오래 남습니다.</h1>
            <p className="notes-hero__description">
              생각이 지나가기 전에 빈 화면을 열고,
              <br className="desktop-break" /> 나만의 문장으로 남겨두세요.
            </p>
            <div className="notes-hero__actions">
              <AppLink>빈 노트 열기</AppLink>
              <a className="quiet-link" href="#method">
                기록 방식 보기
              </a>
            </div>
          </motion.div>

          <motion.div
            className="notes-hero__surface"
            initial={reduceMotion ? false : { opacity: 0, y: 26 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <NoteSurface />
          </motion.div>
        </section>

        <section className="method-section" id="method" aria-labelledby="method-title">
          <Reveal className="section-intro section-intro--center">
            <p className="section-label">기록 방식</p>
            <h2 id="method-title">쓰기까지 한 번이면 충분합니다.</h2>
            <p>기록을 방해하는 선택지는 뒤로 보내고, 문장이 놓일 자리만 남겼습니다.</p>
          </Reveal>

          <div className="method-flow">
            {steps.map((step, index) => (
              <Reveal className="method-step" delay={index * 0.07} key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="library-section" aria-labelledby="library-title">
          <Reveal className="library-section__surface">
            <LibrarySurface />
          </Reveal>
          <Reveal className="library-section__copy" delay={0.08}>
            <p className="section-label">남겨진 문장</p>
            <h2 id="library-title">쌓이는 건 데이터보다 나의 시간입니다.</h2>
            <p>
              제목과 날짜, 한 줄의 기억. 다시 펼칠 때 필요한 만큼만 보여주어 기록 사이의
              여백을 지킵니다.
            </p>
            <ul>
              <li>최근에 쓴 기록부터</li>
              <li>제목이 없어도 그대로</li>
              <li>한 번 눌러 이어 쓰기</li>
            </ul>
          </Reveal>
        </section>

        <section className="storage-section" id="storage" aria-labelledby="storage-title">
          <Reveal className="storage-section__inner">
            <p className="section-label">지금의 보관 방식</p>
            <h2 id="storage-title">기록은 이 브라우저에 머뭅니다.</h2>
            <p>
              현재 버전은 로그인 없이 사용 중인 브라우저에 임시 저장합니다. 브라우저 데이터가
              지워지면 기록도 사라질 수 있으며, 암호화된 보관소는 아닙니다.
            </p>
            <div className="storage-facts" aria-label="저장 방식 요약">
              <span>계정 없음</span>
              <span>브라우저 로컬 저장</span>
              <span>서버 전송 없음</span>
            </div>
            <AppLink className="storage-app-link">기록 시작하기</AppLink>
          </Reveal>
        </section>
      </main>

      <footer className="notes-footer">
        <Brand compact />
        <p>Local by nature.</p>
        <a href="/">나의 기록</a>
      </footer>
    </div>
  );
}

export default JournalLanding;

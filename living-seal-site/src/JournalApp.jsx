import React, { useEffect, useMemo, useRef, useState } from "react";
import { recordStore } from "./recordStore";

const THEME_STORAGE_KEY = "living-seal-journal-theme:v3";
const JOURNAL_TITLE_STORAGE_KEY = "living-seal-journal-title:v1";
const DEFAULT_JOURNAL_TITLE = "이야기 1";
const PULL_TRIGGER = 68;
const PULL_MAX = 96;

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      return saved === "light" || saved === "dark" ? saved : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.journalTheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#071815" : "#f4f2eb");

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Theme persistence is optional; writing should remain available.
    }
  }, [theme]);

  return [theme, setTheme];
}

function formatListDate(value) {
  const date = new Date(value);
  const today = new Date();
  const includeYear = date.getFullYear() !== today.getFullYear();

  return new Intl.DateTimeFormat("ko-KR", {
    ...(includeYear ? { year: "numeric" } : {}),
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

function formatEditedAt(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getRecordTitle(record) {
  const title = record.title?.trim();
  if (title) return title;

  const firstLine = record.body
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  return firstLine || "제목 없는 기록";
}

function SealMark() {
  return (
    <a className="quiet-mark" href="/journal.html" aria-label="Living Seal 기록 소개">
      <img src="/seal-mark.svg" width="24" height="24" alt="" />
    </a>
  );
}

function JournalApp() {
  const titleRef = useRef(null);
  const bodyRef = useRef(null);
  const journalTitleRef = useRef(null);
  const titleEditCancelledRef = useRef(false);
  const libraryViewRef = useRef(null);
  const pullGestureRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    distance: 0,
  });
  const [theme, setTheme] = useTheme();
  const [view, setView] = useState("library");
  const [records, setRecords] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [journalTitle, setJournalTitle] = useState(() => {
    try {
      return window.localStorage.getItem(JOURNAL_TITLE_STORAGE_KEY) || DEFAULT_JOURNAL_TITLE;
    } catch {
      return DEFAULT_JOURNAL_TITLE;
    }
  });
  const [journalTitleDraft, setJournalTitleDraft] = useState("");
  const [editingJournalTitle, setEditingJournalTitle] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const activeRecord = useMemo(
    () => records.find((record) => record.id === activeId) || null,
    [activeId, records],
  );

  useEffect(() => {
    let active = true;
    recordStore
      .list()
      .then((savedRecords) => {
        if (active) setRecords(savedRecords);
      })
      .catch((storeError) => {
        if (active) setLoadError(storeError.message || "저장된 기록을 읽지 못했어요.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (view !== "editor") return;
    const focusTarget = title ? bodyRef.current : titleRef.current;
    window.requestAnimationFrame(() => focusTarget?.focus());
  }, [view, activeId]);

  useEffect(() => {
    if (!editingJournalTitle) return;
    window.requestAnimationFrame(() => {
      journalTitleRef.current?.focus();
      journalTitleRef.current?.select();
    });
  }, [editingJournalTitle]);

  useEffect(() => {
    if (view !== "library") return undefined;
    const libraryView = libraryViewRef.current;
    if (!libraryView) return undefined;

    const handleTouchMove = (event) => {
      const gesture = pullGestureRef.current;
      if (!gesture.active || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const deltaY = touch.clientY - gesture.startY;
      const deltaX = touch.clientX - gesture.startX;

      if (Math.abs(deltaX) > Math.max(deltaY, 8)) {
        gesture.active = false;
        gesture.distance = 0;
        setPullDistance(0);
        setIsPulling(false);
        return;
      }

      if (deltaY <= 6) {
        gesture.distance = 0;
        setPullDistance(0);
        return;
      }

      event.preventDefault();
      const nextDistance = Math.min(PULL_MAX, (deltaY - 6) * 0.66);
      gesture.distance = nextDistance;
      setPullDistance(nextDistance);
    };

    libraryView.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => libraryView.removeEventListener("touchmove", handleTouchMove);
  }, [view]);

  const announce = (message) => {
    setAnnouncement("");
    window.requestAnimationFrame(() => setAnnouncement(message));
  };

  const resetEditor = () => {
    setActiveId(null);
    setTitle("");
    setBody("");
    setError("");
    setDeleteOpen(false);
  };

  const openBlankNote = () => {
    resetEditor();
    setView("editor");
  };

  const openRecord = (record) => {
    setActiveId(record.id);
    setTitle(record.title || "");
    setBody(record.body);
    setError("");
    setDeleteOpen(false);
    setView("editor");
  };

  const closeEditor = () => {
    resetEditor();
    setView("library");
  };

  useEffect(() => {
    if (view !== "library") return undefined;

    const openFromKeyboard = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        openBlankNote();
        announce("새 노트를 열었어요.");
      }
    };

    window.addEventListener("keydown", openFromKeyboard);
    return () => window.removeEventListener("keydown", openFromKeyboard);
  }, [view]);

  const beginJournalTitleEdit = () => {
    titleEditCancelledRef.current = false;
    setJournalTitleDraft(journalTitle);
    setEditingJournalTitle(true);
  };

  const commitJournalTitle = (value) => {
    if (titleEditCancelledRef.current) {
      titleEditCancelledRef.current = false;
      setEditingJournalTitle(false);
      return;
    }

    const nextTitle = value.trim();
    if (!nextTitle) {
      setEditingJournalTitle(false);
      announce("기록장 제목은 비워둘 수 없어요.");
      return;
    }

    setJournalTitle(nextTitle);
    setEditingJournalTitle(false);
    try {
      window.localStorage.setItem(JOURNAL_TITLE_STORAGE_KEY, nextTitle);
      announce("기록장 제목을 바꿨어요.");
    } catch {
      announce("제목을 이 브라우저에 저장하지 못했어요.");
    }
  };

  const journalTitleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitJournalTitle(event.currentTarget.value);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      titleEditCancelledRef.current = true;
      setJournalTitleDraft(journalTitle);
      setEditingJournalTitle(false);
    }
  };

  const startPull = (event) => {
    const scrollTop = document.scrollingElement?.scrollTop || window.scrollY;
    if (
      view !== "library" ||
      editingJournalTitle ||
      !window.matchMedia("(max-width: 600px)").matches ||
      scrollTop > 1 ||
      event.touches.length !== 1
    ) {
      return;
    }

    const touch = event.touches[0];
    pullGestureRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      distance: 0,
    };
    setIsPulling(true);
    setPullDistance(0);
  };

  const finishPull = () => {
    const shouldOpenNote = pullGestureRef.current.distance >= PULL_TRIGGER;
    pullGestureRef.current.active = false;
    pullGestureRef.current.distance = 0;
    setIsPulling(false);
    setPullDistance(0);

    if (shouldOpenNote) {
      openBlankNote();
      announce("새 노트를 열었어요.");
    }
  };

  const cancelPull = () => {
    pullGestureRef.current.active = false;
    pullGestureRef.current.distance = 0;
    setIsPulling(false);
    setPullDistance(0);
  };

  const saveRecord = async () => {
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!cleanTitle && !cleanBody) {
      setError("제목이나 내용을 한 글자 이상 남겨주세요.");
      bodyRef.current?.focus();
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (activeId) {
        const updated = await recordStore.update(activeId, {
          title: cleanTitle,
          body: cleanBody,
        });
        setRecords((current) =>
          [updated, ...current.filter((record) => record.id !== activeId)].sort(
            (left, right) => new Date(right.updatedAt) - new Date(left.updatedAt),
          ),
        );
        announce("기록을 수정했어요.");
      } else {
        const created = await recordStore.create({
          title: cleanTitle,
          body: cleanBody,
        });
        setRecords((current) => [created, ...current]);
        announce("기록을 저장했어요.");
      }

      resetEditor();
      setView("library");
    } catch (storeError) {
      setError(storeError.message || "기록을 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async () => {
    if (!activeId) return;
    setSaving(true);
    setError("");
    try {
      await recordStore.remove(activeId);
      setRecords((current) => current.filter((record) => record.id !== activeId));
      announce("기록을 삭제했어요.");
      resetEditor();
      setView("library");
    } catch (storeError) {
      setError(storeError.message || "기록을 삭제하지 못했어요.");
      setDeleteOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const editorKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      saveRecord();
    }
  };

  return (
    <div className="journal-app">
      <a className="journal-skip-link" href="#journal-main">
        본문으로 이동
      </a>

      {view === "editor" ? (
        <>
          <header className="app-bar editor-bar">
            <button className="bar-action muted-action" type="button" onClick={closeEditor}>
              취소
            </button>
            <SealMark />
            <button
              className="bar-action save-action"
              type="button"
              onClick={saveRecord}
              disabled={saving}
            >
              {saving ? "저장 중" : "완료"}
            </button>
          </header>

          <main className="note-canvas" id="journal-main">
            <div className="note-fields" onKeyDown={editorKeyDown}>
              <label className="sr-only" htmlFor="note-title">
                제목
              </label>
              <input
                ref={titleRef}
                id="note-title"
                className="note-title"
                type="text"
                placeholder="제목"
                autoComplete="off"
                value={title}
                disabled={saving}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setError("");
                }}
              />
              <div className="note-rule" />
              <label className="sr-only" htmlFor="note-body">
                기록 내용
              </label>
              <textarea
                ref={bodyRef}
                id="note-body"
                className="note-body"
                placeholder="기록을 시작하세요."
                value={body}
                disabled={saving}
                aria-describedby="note-error"
                aria-invalid={Boolean(error) || undefined}
                onChange={(event) => {
                  setBody(event.target.value);
                  setError("");
                }}
              />
            </div>

            <div className="note-footer">
              <div className="note-status">
                <span>이 브라우저에 저장</span>
                {activeRecord ? <span>{formatEditedAt(activeRecord.updatedAt)} 수정</span> : null}
              </div>
              <p className="field-error" id="note-error" role="alert">
                {error}
              </p>

              {activeId ? (
                deleteOpen ? (
                  <div className="inline-delete" role="group" aria-label="기록 삭제 확인">
                    <span>이 기록을 삭제할까요?</span>
                    <div>
                      <button type="button" onClick={() => setDeleteOpen(false)} disabled={saving}>
                        취소
                      </button>
                      <button className="confirm-delete" type="button" onClick={removeRecord} disabled={saving}>
                        삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="delete-link" type="button" onClick={() => setDeleteOpen(true)}>
                    기록 삭제
                  </button>
                )
              ) : null}
            </div>
          </main>
        </>
      ) : (
        <>
          <header className="app-bar library-bar">
            <button
              className="bar-action muted-action mode-action"
              type="button"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              aria-label={`${theme === "dark" ? "낮" : "밤"} 모드로 전환`}
              title={`${theme === "dark" ? "낮" : "밤"} 모드로 전환`}
            >
              {theme === "dark" ? "낮" : "밤"}
            </button>
            <SealMark />
            <button
              className="bar-action save-action"
              type="button"
              onClick={openBlankNote}
              aria-keyshortcuts="Control+N Meta+N"
              title="새 글 (Ctrl 또는 Command + N)"
            >
              새 글
            </button>
          </header>

          <div
            ref={libraryViewRef}
            className={`library-view${isPulling ? " is-pulling" : ""}${
              pullDistance >= PULL_TRIGGER ? " is-pull-ready" : ""
            }`}
            style={{
              "--pull-distance": `${pullDistance}px`,
              "--pull-progress": Math.min(pullDistance / PULL_TRIGGER, 1),
            }}
            onTouchStart={startPull}
            onTouchEnd={finishPull}
            onTouchCancel={cancelPull}
          >
            <div className="pull-note-cue" aria-hidden="true">
              <span />
              <p>
                {pullDistance >= PULL_TRIGGER
                  ? "놓으면 새 노트가 열립니다"
                  : "아래로 당겨 새 노트 열기"}
              </p>
            </div>

            <main className="library-canvas" id="journal-main">
              <section className="library-heading" aria-label="기록장 제목">
                <h1>
                  {editingJournalTitle ? (
                    <input
                      ref={journalTitleRef}
                      className="library-title-input"
                      type="text"
                      value={journalTitleDraft}
                      maxLength={40}
                      aria-label="기록장 제목"
                      onChange={(event) => setJournalTitleDraft(event.target.value)}
                      onBlur={(event) => commitJournalTitle(event.currentTarget.value)}
                      onKeyDown={journalTitleKeyDown}
                    />
                  ) : (
                    <button
                      className="library-title-button"
                      type="button"
                      onClick={beginJournalTitleEdit}
                      aria-label={`기록장 제목 변경: ${journalTitle}`}
                    >
                      {journalTitle}
                    </button>
                  )}
                </h1>
                <p>
                  {editingJournalTitle
                    ? "Enter로 저장하고 Esc로 취소하세요"
                    : "여기를 눌러서 제목을 변경하세요"}
                </p>
                {!loading && !loadError ? (
                  <span className="sr-only">총 {records.length}개의 기록</span>
                ) : null}
              </section>

              {loadError ? (
                <div className="storage-warning" role="alert">
                  <strong>기록을 불러오지 못했어요.</strong>
                  <p>{loadError} 기존 데이터는 덮어쓰지 않았습니다.</p>
                </div>
              ) : null}

              {loading ? <p className="library-state">기록을 불러오는 중입니다.</p> : null}

              {!loading && !loadError && records.length === 0 ? (
                <div className="empty-library">
                  <p>아직 기록이 없습니다.</p>
                  <span>모바일에서는 화면을 아래로 당겨 시작할 수 있어요.</span>
                  <button type="button" onClick={openBlankNote}>
                    첫 기록 쓰기
                  </button>
                </div>
              ) : null}

              {!loading && !loadError && records.length > 0 ? (
                <div className="record-list">
                  {records.map((record) => (
                    <article className="record-row" key={record.id}>
                      <button type="button" onClick={() => openRecord(record)}>
                        <span className="record-copy">
                          <strong>{getRecordTitle(record)}</strong>
                        </span>
                        <time dateTime={record.updatedAt}>{formatListDate(record.updatedAt)}</time>
                      </button>
                    </article>
                  ))}
                </div>
              ) : null}

              <a className="library-brand-link" href="/journal.html">
                기록에 대하여
              </a>
            </main>
          </div>
        </>
      )}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
}

export default JournalApp;

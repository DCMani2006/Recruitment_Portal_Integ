"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { FrontPage } from "./FrontPage";
import { DomainPage } from "./DomainPage";
import { BackCoverPage } from "./BackCoverPage";
import { ThankYouPage } from "./ThankYouPage";
import { DOMAIN_PAGES_DATA, THANK_YOU_DATA } from "@/content/domainPagesData";
import { INTRO_PAGE_CONTENT, EDITION_META } from "@/content/content";
import { useSession } from "@/lib/session";
import { EditionStatusProvider } from "@/lib/statusContext";
import { TOTAL_PAGES, pageIndex } from "@/lib/pages";

export function Flipbook() {
  return (
    <EditionStatusProvider>
      <FlipbookInner />
    </EditionStatusProvider>
  );
}

function FlipbookInner() {
  const { user, logout } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageFlipRef = useRef<any>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(TOTAL_PAGES);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const [shiftPercent, setShiftPercent] = useState<number>(-25); // initial cover is -25% in landscape
  const [bookDimensions, setBookDimensions] = useState<{ width: number; height: number }>({
    width: 1040,
    height: 720,
  });

  // Calculate book dimensions based on available viewport
  const calculateDimensions = useCallback(() => {
    if (typeof window === "undefined") return { width: 1040, height: 720, orientation: "landscape" as const };
    const isPortrait = window.innerWidth < 768;
    // Top bar is 56px, bottom bar is 44px. Deduct 116px (100px chrome + 16px safety margin)
    const chromeH = 56 + 44 + 16;
    const availH = Math.max(380, Math.min(900, window.innerHeight - chromeH));

    if (isPortrait) {
      const maxW = Math.max(280, Math.min(640, window.innerWidth - 20));
      let w = Math.round(availH * (520 / 720));
      let h = availH;
      if (w > maxW) {
        w = maxW;
        h = Math.round(w * (720 / 520));
      }
      return { width: w, height: h, orientation: "portrait" as const };
    } else {
      const maxW = Math.max(560, Math.min(1300, window.innerWidth - 32));
      let w = Math.round(availH * (1040 / 720));
      let h = availH;
      if (w > maxW) {
        w = maxW;
        h = Math.round(w * (720 / 1040));
      }
      return { width: w, height: h, orientation: "landscape" as const };
    }
  }, []);
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Hide vertical body scroll on edition route
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  // Remember that the user has seen the newspaper edition on this browser
  // NOTE: this flag is per browser; a per-account version needs a backend field.
  useEffect(() => {
    if (user?.email && typeof window !== "undefined") {
      try {
        localStorage.setItem(`tam.seenEdition.${user.email.toLowerCase().trim()}`, "1");
      } catch {
        // ignore
      }
    }
  }, [user?.email]);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Compute transform shift:
  // -25% for front cover (page 0). For an odd total page count (9), the last spread [7, 8]
  // is a normal two-page spread, so shift is 0%. If totalPages is even, the last single page gets +25%.
  const computeShift = useCallback(
    (pageIndexVal: number, currentOrientation: "portrait" | "landscape") => {
      if (currentOrientation === "portrait") {
        return 0;
      }
      if (pageIndexVal === 0) {
        return -25;
      }
      if (totalPages % 2 === 0 && pageIndexVal >= totalPages - 1) {
        return 25;
      }
      return 0;
    },
    [totalPages]
  );

  const flipTo = useCallback(
    (targetIndex: number) => {
      if (!pageFlipRef.current) return;
      try {
        if (prefersReducedMotion) {
          pageFlipRef.current.turnToPage(targetIndex);
        } else {
          pageFlipRef.current.flip(targetIndex);
        }
      } catch {
        // ignore
      }
    },
    [prefersReducedMotion]
  );

  const flipPrev = useCallback(() => {
    if (!pageFlipRef.current) return;
    try {
      if (prefersReducedMotion) {
        pageFlipRef.current.turnToPrevPage();
      } else {
        pageFlipRef.current.flipPrev();
      }
    } catch {
      // ignore
    }
  }, [prefersReducedMotion]);

  const flipNext = useCallback(() => {
    if (!pageFlipRef.current) return;
    try {
      if (prefersReducedMotion) {
        pageFlipRef.current.turnToNextPage();
      } else {
        pageFlipRef.current.flipNext();
      }
    } catch {
      // ignore
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    let instance: any = null;
    let isCancelled = false;

    async function initPageFlip() {
      if (!containerRef.current) return;

      try {
        const { PageFlip } = await import("page-flip");
        if (isCancelled || !containerRef.current) return;

        const dims = calculateDimensions();
        setBookDimensions({ width: dims.width, height: dims.height });

        const chromeH = 56 + 44 + 16;
        const calculatedMaxHeight = Math.max(380, Math.min(900, window.innerHeight - chromeH));

        instance = new PageFlip(containerRef.current, {
          width: 520,
          height: 720,
          size: "stretch",
          minWidth: 280,
          maxWidth: 650,
          minHeight: 380,
          maxHeight: calculatedMaxHeight,
          usePortrait: true,
          showCover: true,
          drawShadow: true,
          maxShadowOpacity: 0.5,
          mobileScrollSupport: false,
          clickEventForward: true,
        });

        const pages = containerRef.current.querySelectorAll<HTMLElement>(".flip-page-item");
        if (pages.length > 0) {
          instance.loadFromHTML(pages);
          pageFlipRef.current = instance;
          const actualCount = instance.getPageCount() || TOTAL_PAGES;
          setTotalPages(actualCount);
          setMounted(true);

          const initialOrient = (instance.getOrientation && instance.getOrientation()) || dims.orientation;
          setOrientation(initialOrient);
          const initialPage = instance.getCurrentPageIndex() || 0;
          setCurrentPage(initialPage);
          setShiftPercent(computeShift(initialPage, initialOrient));

          instance.on("flip", (e: { data: number }) => {
            const newPage = e.data;
            setCurrentPage(newPage);
            const orient = instance.getOrientation() || dims.orientation;
            setOrientation(orient);
            setShiftPercent(computeShift(newPage, orient));
          });

          instance.on("changeState", () => {
            const cur = instance.getCurrentPageIndex();
            const orient = instance.getOrientation() || dims.orientation;
            setShiftPercent(computeShift(cur, orient));
          });

          instance.on("changeOrientation", (e: { data: "portrait" | "landscape" }) => {
            const orient = e.data;
            setOrientation(orient);
            const cur = instance.getCurrentPageIndex();
            setShiftPercent(computeShift(cur, orient));
          });
        }
      } catch (err) {
        console.error("Failed to load page-flip:", err);
      }
    }

    initPageFlip();

    const handleResize = () => {
      const dims = calculateDimensions();
      setBookDimensions({ width: dims.width, height: dims.height });
      if (instance) {
        const orient = instance.getOrientation() || dims.orientation;
        setOrientation(orient);
        const cur = instance.getCurrentPageIndex();
        setShiftPercent(computeShift(cur, orient));
        instance.update();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isCancelled = true;
      window.removeEventListener("resize", handleResize);
      if (instance) {
        try {
          instance.destroy();
        } catch {
          // ignore
        }
      }
      pageFlipRef.current = null;
    };
  }, [calculateDimensions, computeShift]);

  // Keyboard arrow listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        flipPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        flipNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipPrev, flipNext]);

  // Visibility calculator for any page index
  const isPageVisible = (pageIdx: number) => {
    if (!mounted) return pageIdx === 0;
    if (orientation === "portrait") return currentPage === pageIdx;
    if (currentPage === 0) return pageIdx === 0;
    if (totalPages % 2 === 0 && currentPage >= totalPages - 1) return pageIdx >= totalPages - 1;
    const left = currentPage % 2 === 1 ? currentPage : currentPage - 1;
    return pageIdx === left || pageIdx === left + 1;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        maxHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "radial-gradient(ellipse at center, #241A14 0%, #120D0A 100%)",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* 1. SLIM TOP BAR */}
      <header
        style={{
          height: "56px",
          minHeight: "56px",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
          boxSizing: "border-box",
          borderBottom: "1px solid rgba(217, 202, 166, 0.2)",
          backgroundColor: "rgba(20, 16, 14, 0.85)",
          zIndex: 40,
        }}
      >
        <div>
          <span
            className="font-masthead"
            style={{
              fontSize: "1.6rem",
              color: "var(--paper)",
              lineHeight: 1,
              letterSpacing: "0.02em",
            }}
          >
            The TAM Times
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {user?.name && (
            <span
              className="font-label"
              style={{
                color: "var(--paper)",
                fontSize: "0.74rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              {user.name.trim().split(" ")[0]}
            </span>
          )}
          <Link
            href="/desk/form"
            className="btn-outline"
            style={{
              color: "var(--paper)",
              borderColor: "var(--paper)",
              fontSize: "0.72rem",
              padding: "4px 12px",
              textDecoration: "none",
            }}
          >
            GO TO MY FORMS →
          </Link>
          <button
            type="button"
            onClick={logout}
            className="btn-outline"
            style={{
              color: "var(--paper-dark)",
              borderColor: "rgba(217, 202, 166, 0.4)",
              fontSize: "0.68rem",
              padding: "4px 10px",
              cursor: "pointer",
              background: "transparent",
            }}
          >
            SIGN OUT
          </button>
        </div>
      </header>

      {/* 2. MAIN CENTER: Flipbook with smooth translateX centering */}
      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          minHeight: 0,
          padding: "8px 0",
        }}
      >
        <div
          className="flipbook-centering-wrapper"
          style={{
            width: `${bookDimensions.width}px`,
            height: `${bookDimensions.height}px`,
            maxHeight: "100%",
            maxWidth: "100%",
            transform: `translateX(${shiftPercent}%)`,
            transition: prefersReducedMotion ? "none" : "transform 600ms ease",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            ref={containerRef}
            className="flip-book-container"
            style={{
              width: "100%",
              height: "100%",
              margin: "0 auto",
              boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.8)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            {/* Page 1: Cover (hard) */}
            <div className="flip-page-item" data-density="hard">
              <FrontPage onSelectPage={flipTo} />
            </div>

            {/* Pages 2 to 6: Division Pages (Design, Marketing, Research, Management, Tech) */}
            {DOMAIN_PAGES_DATA.map((dom) => {
              const pageIdx = dom.pageNumber - 1;
              return (
                <div key={`${dom.domainCode}-${dom.pageNumber}`} className="flip-page-item" data-density="soft">
                  <DomainPage data={dom} isVisible={isPageVisible(pageIdx)} />
                </div>
              );
            })}

            {/* Page 7: Clip & Subscribe (soft inner page) */}
            <div className="flip-page-item" data-density="soft">
              <BackCoverPage isVisible={isPageVisible(pageIndex("coupon"))} />
            </div>

            {/* Page 8: Thank You (soft inner page) */}
            <div className="flip-page-item" data-density="soft">
              <ThankYouPage
                onFlipToStart={() => flipTo(0)}
                isVisible={isPageVisible(pageIndex("thankyou"))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SLIM BOTTOM BAR: prev/next and "PAGE X OF 8", height ~44px */}
      <footer
        style={{
          height: "44px",
          minHeight: "44px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(20, 16, 14, 0.9)",
          borderTop: "1px solid rgba(217, 202, 166, 0.15)",
          zIndex: 40,
        }}
      >
        <nav
          aria-label="Edition navigation"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            color: "var(--paper)",
          }}
        >
          <button
            type="button"
            onClick={flipPrev}
            aria-label="Previous Page"
            className="btn-outline flip-nav-prev"
            disabled={!mounted || currentPage === 0}
            style={{
              color: "var(--paper)",
              borderColor: "var(--paper-dark)",
              padding: "3px 12px",
              fontSize: "0.72rem",
            }}
          >
            ◂ Previous
          </button>

          <span
            className="font-label page-number-indicator"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.14em",
              minWidth: "120px",
              textAlign: "center",
            }}
          >
            PAGE {currentPage + 1} OF {totalPages}
          </span>

          <button
            type="button"
            onClick={flipNext}
            aria-label="Next Page"
            className="btn-outline flip-nav-next"
            disabled={!mounted || (orientation === "landscape" ? currentPage >= totalPages - 2 : currentPage >= totalPages - 1)}
            style={{
              color: "var(--paper)",
              borderColor: "var(--paper-dark)",
              padding: "3px 12px",
              fontSize: "0.72rem",
            }}
          >
            Next ▸
          </button>
        </nav>
      </footer>

      {/* Screen reader full text representation */}
      <section className="sr-only" aria-label="Complete text of The TAM Times">
        <h1>{EDITION_META.subTitle}</h1>
        {DOMAIN_PAGES_DATA.map((dom) => (
          <article key={`${dom.domainCode}-${dom.pageNumber}`}>
            <h3>{dom.headline}</h3>
            <h4>{dom.deck}</h4>
            <p>{dom.dropcap}{dom.p1}</p>
            <p>{dom.p2}</p>
            <ul>
              {dom.skills.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </article>
        ))}
        <h2>Clip &amp; Subscribe</h2>
        <p>Cut along the perforation, enter the Subscriber&apos;s Desk, and lodge your dispatch with TAM.</p>
        <h2>Thank You For Reading</h2>
        <p>{THANK_YOU_DATA.p1}</p>
        <p>{THANK_YOU_DATA.p2}</p>
        <p>{THANK_YOU_DATA.signOff}</p>
      </section>
    </div>
  );
}

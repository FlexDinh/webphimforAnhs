"use client";

import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Direction = "ArrowUp" | "ArrowRight" | "ArrowDown" | "ArrowLeft";

function isVisibleFocusable(element: HTMLElement) {
  if (
    element.tabIndex < 0 ||
    element.hidden ||
    element.closest('[inert], [aria-hidden="true"]') ||
    element.getAttribute("aria-disabled") === "true"
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== "none" &&
    style.visibility !== "hidden"
  );
}

function getNextElement(
  current: HTMLElement,
  candidates: HTMLElement[],
  direction: Direction
) {
  const currentRect = current.getBoundingClientRect();
  const currentX = currentRect.left + currentRect.width / 2;
  const currentY = currentRect.top + currentRect.height / 2;
  const horizontal = direction === "ArrowLeft" || direction === "ArrowRight";
  const sign = direction === "ArrowRight" || direction === "ArrowDown" ? 1 : -1;
  let nearest: HTMLElement | null = null;
  let nearestScore = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    if (candidate === current || !candidate.isConnected) continue;

    const rect = candidate.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const primaryDistance = horizontal ? (x - currentX) * sign : (y - currentY) * sign;
    // Ignore small shifts caused by focus-ring transforms on controls in the same row/column.
    if (primaryDistance <= 12) continue;

    const crossDistance = horizontal ? Math.abs(y - currentY) : Math.abs(x - currentX);
    const crossLimit = horizontal
      ? Math.max(60, currentRect.height * 0.4, rect.height * 0.4)
      : Math.max(80, currentRect.width * 1.5, rect.width * 1.5);
    if (crossDistance > crossLimit) continue;

    const score = primaryDistance + crossDistance * 2;
    if (score < nearestScore) {
      nearest = candidate;
      nearestScore = score;
    }
  }

  return nearest;
}

function focusElement(element: HTMLElement) {
  element.focus();
  element.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
}

export default function TVRemoteNavigation() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".tv-root");
    if (!root) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = event.key as Direction;
      if (
        direction !== "ArrowUp" &&
        direction !== "ArrowRight" &&
        direction !== "ArrowDown" &&
        direction !== "ArrowLeft"
      ) {
        return;
      }

      // Let the embedded player handle its own remote controls.
      if (document.activeElement instanceof HTMLIFrameElement) return;

      // Left and right arrows edit text in an input; up and down still move focus.
      const target = event.target;
      if (target instanceof HTMLElement && target.matches("select")) return;
      if (
        (direction === "ArrowLeft" || direction === "ArrowRight") &&
        target instanceof HTMLElement &&
        target.matches("input, textarea, [contenteditable='true']")
      ) {
        return;
      }

      const candidates = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(isVisibleFocusable);
      if (candidates.length === 0) return;

      const current = document.activeElement;
      if (!(current instanceof HTMLElement) || !root.contains(current)) {
        event.preventDefault();
        focusElement(candidates[0]);
        return;
      }

      const next = getNextElement(current, candidates, direction);
      if (!next) {
        if (direction === "ArrowUp" || direction === "ArrowDown") {
          event.preventDefault();
          const sign = direction === "ArrowDown" ? 1 : -1;
          window.scrollBy({
            top: sign * Math.max(160, window.innerHeight * 0.65),
            behavior: "smooth",
          });
        }
        return;
      }

      event.preventDefault();
      focusElement(next);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}

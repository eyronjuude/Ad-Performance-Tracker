"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const clickType =
  typeof document !== "undefined" && "ontouchstart" in document
    ? "touchstart"
    : "click";

interface UseSettingsNavigationGuardOptions {
  /** Whether the Settings page has unsaved changes */
  isDirty: boolean;
  /** Callback when user confirms leaving (revert changes, then caller navigates) */
  onConfirmLeave: () => void;
  /** Callback to show the confirmation dialog; returns a Promise that resolves true if user confirmed, false otherwise */
  showConfirmDialog: () => Promise<boolean>;
}

/**
 * Guards navigation when on Settings page with unsaved changes.
 * Intercepts: link clicks, beforeunload (close/refresh), popstate (back button).
 * Only active when pathname === '/settings' and isDirty.
 */
export function useSettingsNavigationGuard({
  isDirty,
  onConfirmLeave,
  showConfirmDialog,
}: UseSettingsNavigationGuardOptions): void {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === "/settings" && isDirty;

  const onConfirmLeaveRef = useRef(onConfirmLeave);
  const showConfirmDialogRef = useRef(showConfirmDialog);

  useEffect(() => {
    onConfirmLeaveRef.current = onConfirmLeave;
    showConfirmDialogRef.current = showConfirmDialog;
  }, [onConfirmLeave, showConfirmDialog]);

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (isActive) {
        event.preventDefault();
        event.returnValue = "";
      }
    },
    [isActive]
  );

  const handleClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isActive) return;
      const mouseEvent = event as MouseEvent;
      // Ignore non-left-click (e.g. right-click, middle)
      if ("button" in event && mouseEvent.button !== 0) return;
      // Ignore modifier keys (e.g. Ctrl+click for new tab)
      if (
        mouseEvent.metaKey ||
        mouseEvent.ctrlKey ||
        mouseEvent.shiftKey ||
        mouseEvent.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement;
      const link = target.closest("a");
      if (!link || link.tagName !== "A") return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      // Same path (excluding hash/query) - no navigation
      const currentPath = pathname;
      const newPath = href.split("?")[0].split("#")[0];
      if (newPath === currentPath) return;

      // External links - let beforeunload handle
      if (href.startsWith("http") || href.startsWith("//")) return;

      event.preventDefault();
      event.stopPropagation();

      showConfirmDialogRef.current().then((confirmed) => {
        if (confirmed) {
          onConfirmLeaveRef.current();
          router.push(href);
        }
      });
    },
    [isActive, pathname, router]
  );

  const handlePopState = useCallback(
    (event: PopStateEvent) => {
      if (!isActive) return;
      // When we pushed state, popstate fires with state we pushed
      if (event.state !== null) return;

      showConfirmDialogRef.current().then((confirmed) => {
        if (confirmed) {
          onConfirmLeaveRef.current();
          history.back();
        } else {
          history.go(1); // Revert the back navigation
        }
      });
    },
    [isActive]
  );

  useEffect(() => {
    if (!isActive) return;

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener(clickType, handleClick, { capture: true });

    // Push state so we can intercept back button
    history.pushState({ fromSettingsGuard: true }, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener(clickType, handleClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isActive, handleBeforeUnload, handleClick, handlePopState]);
}

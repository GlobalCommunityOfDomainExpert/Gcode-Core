"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Icon } from "@/components/atoms";
import { useMounted } from "@/hooks/use-mounted";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** "md" (default) keeps the current max-w-md sizing; "lg" widens to max-w-3xl for denser content. */
  size?: "md" | "lg";
  /** Overrides the default "px-6 py-4 max-h-[70vh] overflow-y-auto" body classes — pass e.g. "p-0" for content that manages its own spacing/height (the 70vh scroll cap goes away too, so only do this when the content's height is already bounded). */
  bodyClassName?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  bodyClassName = "px-6 py-4 max-h-[70vh] overflow-y-auto",
}: ModalProps) {
  const mounted = useMounted();

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Server always renders nothing (no document to portal into); matching that on the
  // client's first paint too — gated behind a mount effect — avoids a hydration mismatch
  // now that Modal can be a page's initial content, not just a post-interaction popup.
  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="bg-primary/40 fixed inset-0 z-50 overflow-y-auto"
      onClick={onClose}
    >
      {/* Centering lives on this inner wrapper (not the scrollable element itself) so
          overflowing content can still be scrolled to on both ends — combining overflow-y-auto
          with flex centering on the SAME element clips the start of overflowing content in most
          browsers. */}
      <div className="flex min-h-full items-center justify-center px-4 py-8">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          onClick={(event) => event.stopPropagation()}
          className={`bg-surface-light relative w-full rounded-md shadow-lg ${
            size === "lg" ? "max-w-3xl" : "max-w-md"
          }`}
        >
          {title ? (
            <div className="border-border-light flex items-center justify-between border-b px-6 py-4">
              <h3
                id="modal-title"
                className="text-large text-text-primary font-semibold"
              >
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-text-secondary hover:text-text-primary focus-visible:ring-primary rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Icon icon={X} size="sm" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-text-secondary hover:text-text-primary focus-visible:ring-primary absolute top-3 right-3 z-10 rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Icon icon={X} size="sm" />
            </button>
          )}
          <div className={`text-body text-text-primary ${bodyClassName}`}>
            {children}
          </div>
          {footer && (
            <div className="border-border-light flex justify-end gap-2 border-t px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

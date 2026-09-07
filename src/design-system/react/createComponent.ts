import { forwardRef, createElement, useImperativeHandle, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";

/** Maps a React callback-prop name (e.g. "onValueChange") to the CustomEvent name it should bind to. */
export type EventPropMap = Record<string, string>;

export interface CreateComponentOptions {
  tagName: string;
  /** React props in this map are bound as addEventListener(domEvent, ...) instead of set as DOM properties. */
  events?: EventPropMap;
}

type WithChildren<P> = P & { children?: ReactNode; className?: string };

/**
 * Generic React wrapper for a registered FASTElement custom element — there's no official
 * React binding for FASTElement (unlike Lit's @lit/react), so every design-system element
 * reuses this one helper: it sets non-event props as DOM properties via a ref (so complex
 * values like arrays/objects survive, not just string attributes) and binds CustomEvent
 * listeners to React callback props.
 */
export function createComponent<E extends HTMLElement, P extends object = Record<string, never>>({
  tagName,
  events = {},
}: CreateComponentOptions) {
  return forwardRef<E, WithChildren<P>>(function WrappedElement(props, forwardedRef) {
    const elementRef = useRef<E | null>(null);
    useImperativeHandle(forwardedRef, () => elementRef.current as E);

    const { children, className, ...rest } = props as WithChildren<P> & Record<string, unknown>;

    useLayoutEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      for (const [key, value] of Object.entries(rest)) {
        if (key in events) continue;
        // aria-*/data-*/role are real reflected HTML attributes, not necessarily camelCase JS
        // properties on the underlying FAST class — set them via setAttribute so they always
        // reach the DOM (and the accessibility tree) regardless of the element's own property names.
        if (/^(aria-|data-)/.test(key) || key === "role") {
          if (value === undefined || value === null || value === false) {
            el.removeAttribute(key);
          } else {
            el.setAttribute(key, String(value));
          }
          continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (el as any)[key] = value;
      }
    });

    useLayoutEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      const cleanups: Array<() => void> = [];
      for (const [propName, domEvent] of Object.entries(events)) {
        const handler = rest[propName];
        if (typeof handler !== "function") continue;
        const listener = (e: Event) => (handler as (e: Event) => void)(e);
        el.addEventListener(domEvent, listener);
        cleanups.push(() => el.removeEventListener(domEvent, listener));
      }
      return () => cleanups.forEach((fn) => fn());
    });

    return createElement(tagName, { ref: elementRef, className }, children);
  });
}


// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppAiComposer } from "./AppAiComposer";

describe("AppAiComposer", () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  const setTextAreaValue = (textarea: HTMLTextAreaElement, value: string) => {
    act(() => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set?.call(textarea, value);
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };

  const renderComposer = (
    props: Partial<React.ComponentProps<typeof AppAiComposer>> = {},
  ) => {
    act(() =>
      root.render(<AppAiComposer onSubmit={() => undefined} {...props} />),
    );
    return document.body.querySelector<HTMLTextAreaElement>(
      ".app-ai-composer textarea",
    )!;
  };

  it("submits a trimmed prompt and clears an uncontrolled draft", () => {
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();
    const textarea = renderComposer({ onSubmit, onValueChange });

    setTextAreaValue(textarea, "  Explain portals  ");
    onValueChange.mockClear();
    act(() =>
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: "Enter",
        }),
      ),
    );

    expect(onSubmit).toHaveBeenCalledWith("Explain portals");
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(textarea.value).toBe("");
  });

  it("keeps Shift+Enter and IME composition available for text entry", () => {
    const onSubmit = vi.fn();
    const textarea = renderComposer({ defaultValue: "Draft", onSubmit });

    act(() =>
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: "Enter",
          shiftKey: true,
        }),
      ),
    );
    act(() =>
      textarea.dispatchEvent(
        new CompositionEvent("compositionstart", { bubbles: true }),
      ),
    );
    act(() =>
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: "Enter",
        }),
      ),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("exposes a stop action while streaming", () => {
    const onCancel = vi.fn();
    renderComposer({ onCancel, status: "streaming" });
    const stop = document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="Stop generating"]',
    )!;

    act(() => stop.click());

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("disables submission while waiting for approval", () => {
    const onSubmit = vi.fn();
    const textarea = renderComposer({
      defaultValue: "Another prompt",
      onSubmit,
      status: "awaiting-approval",
    });
    const send = document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="Send"]',
    )!;

    expect(send.disabled).toBe(true);
    act(() =>
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: "Enter",
        }),
      ),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

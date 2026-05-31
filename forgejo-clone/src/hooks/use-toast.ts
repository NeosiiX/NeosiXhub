"use client";

import * as React from "react";

type ToastVariant = "default" | "destructive";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  open?: boolean;
}

interface ToastState {
  toasts: Toast[];
}

type Action =
  | { type: "ADD"; toast: Toast }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE"; toast: Partial<Toast> & { id: string } };

let count = 0;
function genId() { return String(++count); }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

function reducer(state: ToastState, action: Action): ToastState {
  switch (action.type) {
    case "ADD":
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, 5) };
    case "REMOVE":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "UPDATE":
      return { ...state, toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t) };
    default:
      return state;
  }
}

export function toast({ title, description, variant = "default" }: Omit<Toast, "id">) {
  const id = genId();
  dispatch({ type: "ADD", toast: { id, title, description, variant, open: true } });
  const timeout = setTimeout(() => dispatch({ type: "REMOVE", id }), 4000);
  toastTimeouts.set(id, timeout);
  return id;
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return { ...state, toast };
}

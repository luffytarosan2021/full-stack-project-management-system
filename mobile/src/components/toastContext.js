import { createContext, useContext } from "react";

export const ToastContext = createContext(() => {});

// showToast(message, { tone: "success" | "error" })
export const useToast = () => useContext(ToastContext);

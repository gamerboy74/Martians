// src/main.tsx
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const removeLoader = () => {
  const loader = document.querySelector(".initial-loader") as HTMLElement | null;
  if (loader) {
    loader.addEventListener("transitionend", () => loader.remove());
    loader.style.opacity = "0";
  }
};

function Root() {
  useEffect(() => {
    removeLoader();
  }, []);

  return (

      <App />

  );
}

createRoot(document.getElementById("root")!).render(<Root />);
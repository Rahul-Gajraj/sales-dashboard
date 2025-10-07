"use client";
import { useEffect, useState } from "react";

export default function Splash() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    // Hide when app is ready; tweak the timeout/logic as you like
    const done = () => setHide(true);
    if (document.readyState === "complete") done();
    else window.addEventListener("load", done);
    return () => window.removeEventListener("load", done);
  }, []);

  if (hide) return null;
  return (
    <div
      id="web-splash"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff", // match manifest background_color
      }}
    >
      <img
        src="/splash-512x512.png"
        alt="Launching…"
        width={160}
        height={160}
      />
    </div>
  );
}

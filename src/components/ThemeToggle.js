import React from "react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="ml-4 px-4 py-2 rounded bg-gray-200">
      Switch to {dark ? "Light" : "Dark"} Mode
    </button>
  );
}

export default ThemeToggle;
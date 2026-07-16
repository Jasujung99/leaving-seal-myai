import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/outfit/300.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import JournalApp from "./JournalApp";
import "./journal.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <JournalApp />
  </React.StrictMode>,
);

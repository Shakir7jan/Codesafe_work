import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  // You could send this to an error reporting service
});

// Global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // You could send this to an error reporting service
});

createRoot(document.getElementById("root")!).render(<App />);

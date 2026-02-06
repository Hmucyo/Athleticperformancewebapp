import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "sonner";

// Error boundary for rendering
console.log("Starting app initialization...");

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Root element not found. Make sure index.html has <div id='root'></div>");
  }

  console.log("Root element found, creating React root...");
  const root = createRoot(rootElement);
  
  console.log("Rendering App component...");
  
  root.render(
    <>
      <App />
      <Toaster position="top-right" richColors />
    </>
  );
  
  console.log("App rendered successfully!");
} catch (error) {
  console.error("Failed to render app:", error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : '';
  
  // Show error on page
  if (document.body) {
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; background: #000; color: #fff; min-height: 100vh;">
        <h1 style="color: red; font-size: 24px; margin-bottom: 20px;">Error Loading App</h1>
        <p style="color: #fff; font-size: 16px; margin-bottom: 10px;"><strong>Error:</strong> ${errorMessage}</p>
        ${stack ? `<pre style="color: #888; font-size: 12px; overflow-x: auto; background: #111; padding: 10px; border-radius: 4px; white-space: pre-wrap; max-width: 100%;">${stack}</pre>` : ''}
        <p style="color: #888; margin-top: 20px;">Check the browser console (F12) for more details.</p>
      </div>
    `;
  }
}
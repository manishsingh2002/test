import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Error boundary to catch any React errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
          <h1 style={{ color: "red" }}>Something went wrong</h1>
          <p>The application failed to load. Please check the browser console for details.</p>
          <details style={{ marginTop: "20px" }}>
            <summary style={{ cursor: "pointer", fontWeight: "bold" }}>Error Details</summary>
            <pre style={{ 
              background: "#f5f5f5", 
              padding: "10px", 
              marginTop: "10px",
              overflow: "auto",
              fontSize: "12px"
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#4F46E5",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

console.log("🚀 Starting SSC CGL Exam Platform...");
console.log("📦 Environment:", import.meta.env.MODE);
console.log("🔗 Supabase URL:", import.meta.env.VITE_SUPABASE_URL || "Not configured");

try {
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log("✅ App mounted successfully");
} catch (error) {
  console.error("❌ Failed to mount app:", error);
  document.getElementById("root")!.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="color: red;">Failed to Load Application</h1>
      <p>Please check the browser console for details.</p>
      <pre style="background: #f5f5f5; padding: 10px; margin-top: 10px; overflow: auto; font-size: 12px;">
        ${error instanceof Error ? error.toString() : String(error)}
      </pre>
    </div>
  `;
}

import { createRoot } from "react-dom/client";
import App from "./App";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles.css";

const isAdminRoute = window.location.pathname === "/admin/dashboard";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    {isAdminRoute ? <AdminDashboard /> : <App />}
  </ErrorBoundary>
);

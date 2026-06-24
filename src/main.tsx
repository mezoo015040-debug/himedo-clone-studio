import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initOwnerToken } from "./lib/ownerToken";

initOwnerToken();
createRoot(document.getElementById("root")!).render(<App />);

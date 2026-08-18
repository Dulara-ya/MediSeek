import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { AuthProvider } from "./contexts/AuthContext";
import { ProviderProvider } from "@/contexts/ProviderContext";
import { UserDataProvider } from "./contexts/UserDataContext";
import { MapsProvider } from "./contexts/MapsContext"; // <-- add

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Could not find root element to mount to");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <MapsProvider>
        <ProviderProvider>
          <UserDataProvider>
            <App />
          </UserDataProvider>
        </ProviderProvider>
      </MapsProvider>
    </AuthProvider>
  </React.StrictMode>
);

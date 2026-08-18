import React, { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

type Ctx = { isLoaded: boolean; loadError: Error | undefined };
const MapsCtx = createContext<Ctx>({ isLoaded: false, loadError: undefined });

// Add libraries you use (e.g., "places")
const libraries: ("places" | "geometry")[] = ["places"];

export const MapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiKey = (import.meta as any).env?.VITE_MAPS_API_KEY as string | undefined;

  // Early message if key is missing
  if (!apiKey) {
    return (
      <div className="p-3 text-red-600">
        Missing <code>VITE_MAPS_API_KEY</code> in your <code>.env.local</code>. Add it and restart dev server.
      </div>
    );
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-maps-script",       // ensures single load
    googleMapsApiKey: apiKey,
    libraries,
    preventGoogleFontsLoading: true,
  });

  return <MapsCtx.Provider value={{ isLoaded, loadError }}>{children}</MapsCtx.Provider>;
};

export const useMaps = () => useContext(MapsCtx);

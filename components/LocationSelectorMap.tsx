import React, { useCallback, useMemo, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useMaps } from "@/contexts/MapsContext";

type LatLng = { lat: number; lng: number };
type Props = {
  value?: LatLng | null;
  onChange?: (val: LatLng) => void;
  defaultCenter?: LatLng;
  height?: number | string;
  draggable?: boolean;
};

const containerStyle = (h: number | string) => ({
  width: "100%",
  height: typeof h === "number" ? `${h}px` : h,
});

export default function LocationSelectorMap({
  value = null,
  onChange,
  defaultCenter = { lat: 6.9271, lng: 79.8612 },
  height = 280,
  draggable = true,
}: Props) {
  const { isLoaded, loadError } = useMaps();
  const [cursor, setCursor] = useState<LatLng | null>(value);

  const center = useMemo(() => cursor ?? value ?? defaultCenter, [cursor, value, defaultCenter]);

  const handleClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const next = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setCursor(next);
      onChange?.(next);
    },
    [onChange]
  );

  if (loadError) return <div className="p-3 text-red-600">Map failed to load. Check API key.</div>;
  if (!isLoaded) return <div className="p-3">Loading map…</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle(height)}
      center={center}
      zoom={14}
      onClick={handleClick}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {center && (
        <Marker
          position={center}
          draggable={draggable}
          onDragEnd={(e) => {
            if (!e.latLng) return;
            const next = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setCursor(next);
            onChange?.(next);
          }}
        />
      )}
    </GoogleMap>
  );
}

import React, { useMemo, useState } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useMaps } from "@/contexts/MapsContext";
import { MedicalService, ServiceType } from "@/types";

type LatLng = { lat: number; lng: number };

type Props = {
  center?: LatLng;
  zoom?: number;
  userLocation?: LatLng | null;
  services?: MedicalService[];
  onMarkerClick?: (svc: MedicalService) => void;
  height?: number | string;
};

const containerStyle = (h: number | string) => ({
  width: "100%",
  height: typeof h === "number" ? `${h}px` : h,
});

function isFiniteLatLng(p?: LatLng | null): p is LatLng {
  return !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng);
}

export default function MapDisplay({
  center = { lat: 6.9271, lng: 79.8612 }, // Colombo default
  zoom = 12,
  userLocation,
  services = [],
  onMarkerClick,
  height = 360,
}: Props) {
  const { isLoaded, loadError } = useMaps();
  const [activeId, setActiveId] = useState<string | null>(null);

  const mapCenter = useMemo(() => (isFiniteLatLng(userLocation) ? userLocation : center), [userLocation, center]);
  const validServices = useMemo(
    () =>
      services.filter(
        (s) => isFiniteLatLng(s?.location as any) && Math.abs(s.location!.lat) <= 90 && Math.abs(s.location!.lng) <= 180
      ),
    [services]
  );

  if (loadError) return <div className="p-3 text-red-600">Map failed to load. Check API key & referrer restrictions.</div>;
  if (!isLoaded) return <div className="p-3">Loading map…</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle(height)}
      center={mapCenter}
      zoom={zoom}
      options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}
    >
      {isFiniteLatLng(userLocation) && <Marker position={userLocation} title="You are here" />}

      {validServices.map((s) => {
        const pos = { lat: s.location!.lat, lng: s.location!.lng };
        const iconUrl =
          s.type === ServiceType.Doctor
            ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            : "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
        return (
          <Marker
            key={s.id}
            position={pos}
            title={s.name}
            icon={{ url: iconUrl }}
            onClick={() => {
              setActiveId(s.id);
              onMarkerClick?.(s);
            }}
          />
        );
      })}

      {validServices.map((s) => {
        if (s.id !== activeId) return null;
        const pos = { lat: s.location!.lat, lng: s.location!.lng };
        return (
          <InfoWindow key={`iw-${s.id}`} position={pos} onCloseClick={() => setActiveId(null)}>
            <div className="text-sm">
              <div className="font-semibold">{s.name}</div>
              {s.specialization && <div>{s.specialization}</div>}
              {s.location?.address && <div className="opacity-80">{s.location.address}</div>}
              {s.contact && (
                <a className="text-blue-700 underline" href={`tel:${s.contact}`}>
                  Call
                </a>
              )}
            </div>
          </InfoWindow>
        );
      })}
    </GoogleMap>
  );
}

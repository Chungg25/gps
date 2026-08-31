"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GpsPoint } from "@/types";

// Fix missing marker icons in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface MapProps {
  rawRoute: GpsPoint[];
  matchedRoute: [number, number][]; // Decoded Polyline6 coordinates
}

// Component to recenter map when new points arrive
function RecenterMap({ rawRoute }: { rawRoute: GpsPoint[] }) {
  const map = useMap();
  
  useEffect(() => {
    // Kích hoạt cập nhật kích thước bản đồ để sửa lỗi màn hình xám
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [map]);

  useEffect(() => {
    if (rawRoute.length > 0) {
      const lastPoint = rawRoute[rawRoute.length - 1];
      map.setView([lastPoint.lat, lastPoint.lon], map.getZoom());
    }
  }, [rawRoute, map]);

  return null;
}

export default function Map({ rawRoute, matchedRoute }: MapProps) {
  // Default to center of Vietnam
  const defaultCenter: [number, number] = [14.0583, 108.2772];
  const center: [number, number] = rawRoute.length > 0 
    ? [rawRoute[rawRoute.length - 1].lat, rawRoute[rawRoute.length - 1].lon] 
    : defaultCenter;

  const rawCoordinates = rawRoute.map((pt) => [pt.lat, pt.lon] as [number, number]);

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Raw GPS Route (Red, dashed) */}
      {rawCoordinates.length > 1 && (
        <Polyline positions={rawCoordinates} color="red" dashArray="5, 10" weight={3} />
      )}

      {/* Matched Route (Green, solid) */}
      {matchedRoute.length > 1 && (
        <Polyline positions={matchedRoute} color="green" weight={5} />
      )}

      {/* Current Position Marker */}
      {rawCoordinates.length > 0 && (
        <Marker position={rawCoordinates[rawCoordinates.length - 1]}>
          <Popup>Vị trí hiện tại (GPS Thô)</Popup>
        </Marker>
      )}

      <RecenterMap rawRoute={rawRoute} />
    </MapContainer>
  );
}

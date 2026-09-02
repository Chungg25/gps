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
    // Sửa lỗi màn hình xám bằng cách theo dõi kích thước container liên tục
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    
    observer.observe(map.getContainer());
    
    // Kích hoạt ngay lập tức 1 lần
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => observer.disconnect();
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
  // Mặc định hiển thị trung tâm TP.HCM (Quận 1) thay vì tọa độ cũ (nằm giữa rừng)
  const defaultCenter: [number, number] = [10.7769, 106.7009];
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
        attribution='&copy; Google Maps'
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
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

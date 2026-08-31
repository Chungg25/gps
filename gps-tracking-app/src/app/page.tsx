"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ProfileType } from "@/types";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useMapMatching } from "@/hooks/useMapMatching";
import ControlPanel from "@/components/ControlPanel";

// Dynamically import Map component to prevent SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-500 font-medium">Đang tải bản đồ...</p>
    </div>
  ),
});

export default function Home() {
  const [profile, setProfile] = useState<ProfileType>("truck");
  
  const { rawRoute, isTracking, setIsTracking, error, clearRoute } = useGeolocation();
  const { matchedRoute, clearMatchedRoute } = useMapMatching(rawRoute, profile, isTracking);

  const handleClear = () => {
    clearRoute();
    clearMatchedRoute();
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gray-50">
      <ControlPanel
        isTracking={isTracking}
        onToggleTracking={() => setIsTracking(!isTracking)}
        profile={profile}
        onProfileChange={setProfile}
        onClear={handleClear}
      />
      
      {error && (
        <div className="absolute top-4 right-4 z-[1000] bg-red-100 text-red-600 px-4 py-2 rounded-lg shadow border border-red-200">
          {error}
        </div>
      )}

      <div className="absolute inset-0 z-0">
        <MapView rawRoute={rawRoute} matchedRoute={matchedRoute} />
      </div>
    </main>
  );
}

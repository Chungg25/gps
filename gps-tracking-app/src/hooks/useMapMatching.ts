import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { GpsPoint, ProfileType } from "@/types";
import { decodePolyline6 } from "@/utils/mapHelpers";

export function useMapMatching(rawRoute: GpsPoint[], profile: ProfileType, isTracking: boolean) {
  const [matchedRoute, setMatchedRoute] = useState<[number, number][]>([]);
  const lastMatchedIndexRef = useRef(0);

  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(async () => {
      // We need at least 2 new points to match a meaningful segment, 
      // or we just send the whole route if it's small enough.
      // For simplicity in this demo, we send the entire accumulated route
      // so Valhalla has full context to snap to the road.
      if (rawRoute.length < 2) return;

      try {
        const response = await axios.post("/api/trace", {
          route: rawRoute,
          profile,
        });

        if (response.data?.trip?.legs) {
          let fullMatchedRoute: [number, number][] = [];
          
          response.data.trip.legs.forEach((leg: any) => {
            if (leg.shape) {
              const decoded = decodePolyline6(leg.shape);
              fullMatchedRoute = [...fullMatchedRoute, ...decoded];
            }
          });

          setMatchedRoute(fullMatchedRoute);
        }
      } catch (error) {
        console.error("Map matching failed", error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [rawRoute, profile, isTracking]);

  const clearMatchedRoute = () => {
    setMatchedRoute([]);
    lastMatchedIndexRef.current = 0;
  };

  return { matchedRoute, clearMatchedRoute };
}

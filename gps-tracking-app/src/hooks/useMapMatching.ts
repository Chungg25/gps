import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { GpsPoint, ProfileType } from "@/types";
import { decodePolyline6 } from "@/utils/mapHelpers";

export function useMapMatching(rawRoute: GpsPoint[], profile: ProfileType, isTracking: boolean) {
  const [matchedRoute, setMatchedRoute] = useState<[number, number][]>([]);
  const lastMatchedIndexRef = useRef(0);

  const rawRouteRef = useRef(rawRoute);

  // Luôn cập nhật ref bằng giá trị mới nhất của rawRoute để interval không bị reset
  useEffect(() => {
    rawRouteRef.current = rawRoute;
  }, [rawRoute]);

  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(async () => {
      const startIndex = lastMatchedIndexRef.current;
      const currentRoute = rawRouteRef.current;
      const MAX_POINTS_PER_REQUEST = 60; // Gửi tối đa khoảng 60 điểm (tương đương 3-5 phút chạy xe) mỗi lần
      let segment = currentRoute.slice(startIndex);
      
      // Nếu tích tụ quá nhiều (do mất mạng 3G lâu), ta băm nhỏ ra, chỉ giải quyết 60 điểm một lần.
      // Các điểm dư sẽ được vòng lặp 30s tiếp theo giải quyết tiếp.
      if (segment.length > MAX_POINTS_PER_REQUEST) {
        segment = segment.slice(0, MAX_POINTS_PER_REQUEST);
      }
      
      if (segment.length < 2) return;

      try {
        const response = await axios.post("/api/trace", {
          route: segment,
          profile,
        });

        if (response.data?.trip?.legs) {
          let segmentMatchedRoute: [number, number][] = [];
          
          response.data.trip.legs.forEach((leg: any) => {
            if (leg.shape) {
              const decoded = decodePolyline6(leg.shape);
              segmentMatchedRoute = [...segmentMatchedRoute, ...decoded];
            }
          });

          setMatchedRoute((prev) => [...prev, ...segmentMatchedRoute]);
          
          // Đẩy chốt chặn tới cuối của cái chunk vừa được xử lý (trừ 1 để giữ điểm nối)
          lastMatchedIndexRef.current = startIndex + segment.length - 1;
        }
      } catch (error: any) {
        console.error("Map matching failed", error);
        
        if (error.response && error.response.status === 400) {
          // Chỉ đẩy chốt chặn qua phần chunk bị lỗi 400, không đẩy hết
          lastMatchedIndexRef.current = startIndex + segment.length - 1;
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [profile, isTracking]); // Đã bỏ rawRoute ra khỏi mảng dependency để interval không bị reset liên tục


  const clearMatchedRoute = () => {
    setMatchedRoute([]);
    lastMatchedIndexRef.current = 0;
  };

  return { matchedRoute, clearMatchedRoute };
}

import { ProfileType } from "@/types";
import { Play, Square, Settings, Navigation2 } from "lucide-react";
import { clsx } from "clsx";

interface ControlPanelProps {
  isTracking: boolean;
  onToggleTracking: () => void;
  profile: ProfileType;
  onProfileChange: (profile: ProfileType) => void;
  onClear: () => void;
}

export default function ControlPanel({
  isTracking,
  onToggleTracking,
  profile,
  onProfileChange,
  onClear,
}: ControlPanelProps) {
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-xl shadow-lg w-80 border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <Navigation2 className="text-blue-500" />
        <h1 className="font-bold text-lg text-gray-800">GPS Tracker</h1>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <Settings size={16} /> Loại xe
        </label>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => onProfileChange("motorcycle")}
            className={clsx(
              "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
              profile === "motorcycle" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Xe Máy
          </button>
          <button
            onClick={() => onProfileChange("truck")}
            className={clsx(
              "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
              profile === "truck" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Xe Tải
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onToggleTracking}
          className={clsx(
            "flex-1 py-2 px-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all",
            isTracking ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          )}
        >
          {isTracking ? (
            <>
              <Square fill="currentColor" size={16} /> Dừng
            </>
          ) : (
            <>
              <Play fill="currentColor" size={16} /> Bắt đầu
            </>
          )}
        </button>
        <button
          onClick={onClear}
          className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-lg transition-all"
        >
          Xóa
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 border-t-2 border-red-500 border-dashed"></div>
          <span>GPS Thô (Điện thoại)</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-1 bg-green-500"></div>
          <span>GPS Đã nắn (Valhalla)</span>
        </div>
      </div>
    </div>
  );
}

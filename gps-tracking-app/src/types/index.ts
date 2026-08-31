export type GpsPoint = {
  lat: number;
  lon: number;
  time?: number; // In seconds relative to the start
  radius?: number; // Accuracy in meters
};

export type ProfileType = "auto" | "motorcycle" | "truck";

export type ValhallaResponse = {
  trip: {
    legs: {
      shape: string; // Polyline6 encoded
    }[];
  };
};

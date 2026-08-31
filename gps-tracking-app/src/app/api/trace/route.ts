import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { GpsPoint, ProfileType } from "@/types";

const VALHALLA_URL = process.env.VALHALLA_URL || "http://localhost:8002/trace_route";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { route, profile }: { route: GpsPoint[]; profile: ProfileType } = body;

    if (!route || route.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 points for map matching." },
        { status: 400 }
      );
    }

    const valhallaPayload = {
      shape: route,
      shape_match: "map_snap",
      costing: profile,
      // Default costing options for truck if selected
      ...(profile === "truck" && {
        costing_options: {
          truck: {
            weight: 15.0,
            height: 4.0,
            width: 2.5,
            length: 10.0,
          },
        },
      }),
    };

    const response = await axios.post(VALHALLA_URL, valhallaPayload);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Valhalla API error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to map match the route." },
      { status: 500 }
    );
  }
}

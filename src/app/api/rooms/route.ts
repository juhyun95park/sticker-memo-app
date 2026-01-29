import { NextResponse } from "next/server";

/**
 * POST /api/rooms
 * 새 방을 만들고 roomId를 반환합니다.
 */
export async function POST() {
  const roomId = crypto.randomUUID();
  return NextResponse.json({ roomId });
}

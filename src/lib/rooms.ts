/**
 * 방 생성 API를 호출하고 roomId를 받습니다.
 */
export async function createRoom(): Promise<{ roomId: string }> {
  const res = await fetch("/api/rooms", { method: "POST" });
  if (!res.ok) {
    throw new Error("방 만들기에 실패했어요.");
  }
  const data = await res.json();
  return { roomId: data.roomId };
}

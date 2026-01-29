export type MemoColor =
  | "yellow"
  | "pink"
  | "mint"
  | "lavender"
  | "peach"
  | "sky";

export type MemoCategory = "todo" | "idea" | "other";

export const MEMO_CATEGORIES: { value: MemoCategory; label: string }[] = [
  { value: "todo", label: "할 일" },
  { value: "idea", label: "아이디어" },
  { value: "other", label: "기타" },
];

export function getCategoryLabel(category: MemoCategory): string {
  return MEMO_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export interface Memo {
  id: string;
  title: string;
  content: string;
  color: MemoColor;
  category: MemoCategory;
  createdAt: number;
  updatedAt: number;
}

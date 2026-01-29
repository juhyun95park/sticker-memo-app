"use client";

import { useState, useEffect, useCallback } from "react";
import type { Memo, MemoColor, MemoCategory } from "@/types/memo";

const STORAGE_KEY = "sticker-memo-app-memos";

const VALID_CATEGORIES: MemoCategory[] = ["todo", "idea", "other"];

function hasRequiredMemoFields(memo: unknown): memo is Record<string, unknown> {
  return (
    memo !== null &&
    typeof memo === "object" &&
    "id" in memo &&
    typeof (memo as Record<string, unknown>).id === "string" &&
    (memo as Record<string, unknown>).id !== "" &&
    "title" in memo &&
    typeof (memo as Record<string, unknown>).title === "string" &&
    "content" in memo &&
    typeof (memo as Record<string, unknown>).content === "string" &&
    "color" in memo &&
    typeof (memo as Record<string, unknown>).color === "string" &&
    "createdAt" in memo &&
    typeof (memo as Record<string, unknown>).createdAt === "number" &&
    "updatedAt" in memo &&
    typeof (memo as Record<string, unknown>).updatedAt === "number"
  );
}

function normalizeMemo(raw: Record<string, unknown>): Memo {
  const category =
    raw.category && VALID_CATEGORIES.includes(raw.category as MemoCategory)
      ? (raw.category as MemoCategory)
      : "other";
  return {
    id: raw.id as string,
    title: raw.title as string,
    content: raw.content as string,
    color: raw.color as MemoColor,
    category,
    createdAt: raw.createdAt as number,
    updatedAt: raw.updatedAt as number,
  };
}

function isValidMemo(memo: unknown): memo is Memo {
  return hasRequiredMemoFields(memo);
}

function loadMemos(): Memo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    
    // 배열인지 확인
    if (!Array.isArray(parsed)) {
      console.warn("로컬 스토리지 데이터가 배열 형식이 아닙니다. 초기화합니다.");
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    
    // 각 메모의 유효성 검증 및 category 보정 (기존 데이터 호환)
    const validMemos = parsed
      .filter(hasRequiredMemoFields)
      .map(normalizeMemo);

    if (validMemos.length !== parsed.length) {
      console.warn(`${parsed.length - validMemos.length}개의 유효하지 않은 메모가 제거되었습니다.`);
      saveMemos(validMemos);
    }

    return validMemos;
  } catch (error) {
    console.error("로컬 스토리지에서 메모를 불러오는 중 오류가 발생했습니다:", error);
    // 오류 발생 시 로컬 스토리지 초기화
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 무시
    }
    return [];
  }
}

function saveMemos(memos: Memo[]) {
  if (typeof window === "undefined") return;
  
  try {
    // 메모 배열의 유효성 검증
    const validMemos = memos.filter(isValidMemo);
    
    if (validMemos.length !== memos.length) {
      console.warn("저장하려는 메모 중 일부가 유효하지 않습니다.");
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validMemos));
  } catch (error) {
    console.error("로컬 스토리지에 메모를 저장하는 중 오류가 발생했습니다:", error);
    
    // QuotaExceededError 처리 (스토리지 용량 초과)
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("로컬 스토리지 용량이 부족합니다. 일부 메모를 삭제해주세요.");
    }
  }
}

function generateId() {
  return crypto.randomUUID?.() ?? `memo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const DEFAULT_COLOR: MemoColor = "yellow";
const DEFAULT_CATEGORY: MemoCategory = "other";

export function useMemos() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setMemos(loadMemos());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveMemos(memos);
  }, [memos, isLoaded]);

  const addMemo = useCallback(
    (
      title: string,
      content: string,
      color: MemoColor = DEFAULT_COLOR,
      category: MemoCategory = DEFAULT_CATEGORY
    ) => {
      const now = Date.now();
      const memo: Memo = {
        id: generateId(),
        title: title.trim() || "제목 없음",
        content: content.trim(),
        color,
        category,
        createdAt: now,
        updatedAt: now,
      };
      setMemos((prev) => [memo, ...prev]);
      return memo.id;
    },
    []
  );

  const updateMemo = useCallback(
    (id: string, updates: Partial<Pick<Memo, "title" | "content" | "color" | "category">>) => {
      setMemos((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, ...updates, updatedAt: Date.now() }
            : m
        )
      );
    },
    []
  );

  const deleteMemo = useCallback((id: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const reorderMemos = useCallback((startIndex: number, endIndex: number) => {
    setMemos((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  return { memos, isLoaded, addMemo, updateMemo, deleteMemo, reorderMemos };
}

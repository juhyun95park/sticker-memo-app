"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useMemos } from "@/hooks/use-memos";
import { MemoCard } from "@/components/memo-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MEMO_CATEGORIES, getCategoryLabel, type MemoCategory } from "@/types/memo";
import { ChevronDown, ListFilter } from "lucide-react";

type CategoryFilter = MemoCategory | "all";

export default function Home() {
  const { memos, isLoaded, addMemo, updateMemo, deleteMemo, reorderMemos } = useMemos();
  const [inputText, setInputText] = useState("");
  const [newMemoIds, setNewMemoIds] = useState<Set<string>>(new Set());
  const [deletingMemoIds, setDeletingMemoIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const filteredMemos =
    categoryFilter === "all"
      ? memos
      : memos.filter((m) => m.category === categoryFilter);

  const handleAdd = () => {
    if (!inputText.trim()) return;
    // 노란색, 분홍색, 초록색 중 무작위 선택
    const colors: Array<"yellow" | "pink" | "mint"> = ["yellow", "pink", "mint"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const memoId = addMemo("", inputText, randomColor, categoryFilter === "all" ? "other" : categoryFilter);
    setNewMemoIds((prev) => new Set(prev).add(memoId));
    setInputText("");
    
    // 애니메이션 후 newMemoIds에서 제거
    setTimeout(() => {
      setNewMemoIds((prev) => {
        const next = new Set(prev);
        next.delete(memoId);
        return next;
      });
    }, 400);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  const handleDelete = (id: string) => {
    // 페이드아웃 애니메이션 시작
    setDeletingMemoIds((prev) => new Set(prev).add(id));
    
    // 애니메이션 완료 후 실제 삭제
    setTimeout(() => {
      deleteMemo(id);
      setDeletingMemoIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300); // 애니메이션 duration과 동일하게
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    // 필터된 목록 기준 인덱스를 전체 memos 기준 인덱스로 변환
    const sourceId = filteredMemos[result.source.index].id;
    const destId = filteredMemos[result.destination.index].id;
    const sourceIndexInFull = memos.findIndex((m) => m.id === sourceId);
    const destIndexInFull = memos.findIndex((m) => m.id === destId);
    if (sourceIndexInFull === -1 || destIndexInFull === -1) return;
    reorderMemos(sourceIndexInFull, destIndexInFull);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen p-3 md:p-4 lg:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메모를 입력하세요..."
            className="flex-1"
          />
          <Button 
            onClick={handleAdd} 
            className="sm:w-auto bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-500/50"
          >
            추가
          </Button>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-[120px] justify-between gap-1"
              >
                <ListFilter className="size-4 shrink-0" />
                <span className="truncate">
                  {categoryFilter === "all" ? "전체" : getCategoryLabel(categoryFilter)}
                </span>
                <ChevronDown className="size-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[8rem]">
              <DropdownMenuItem onClick={() => setCategoryFilter("all")}>
                전부 보기
              </DropdownMenuItem>
              {MEMO_CATEGORIES.map((c) => (
                <DropdownMenuItem
                  key={c.value}
                  onClick={() => setCategoryFilter(c.value)}
                >
                  {c.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>

      {filteredMemos.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">
            {memos.length === 0
              ? "메모가 없습니다. 위에서 메모를 추가해보세요!"
              : "선택한 카테고리에 메모가 없습니다."}
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="memos" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
              >
                {filteredMemos.map((memo, index) => (
                  <Draggable key={memo.id} draggableId={memo.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? "opacity-50 z-50" : ""}
                        style={{
                          ...provided.draggableProps.style,
                          ...(snapshot.isDragging && {
                            transform: provided.draggableProps.style?.transform,
                          }),
                        }}
                      >
                        <MemoCard
                          memo={memo}
                          index={index}
                          isNew={newMemoIds.has(memo.id)}
                          isDeleting={deletingMemoIds.has(memo.id)}
                          isDragging={snapshot.isDragging}
                          onUpdate={updateMemo}
                          onDelete={handleDelete}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}

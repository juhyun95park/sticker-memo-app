"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MemoColor } from "@/types/memo";

const COLORS: MemoColor[] = ["yellow", "pink", "mint", "lavender", "peach", "sky"];

function getRandomColor(): MemoColor {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

interface NewMemoFormProps {
  onAdd: (title: string, content: string, color: MemoColor) => void;
}

export function NewMemoForm({ onAdd }: NewMemoFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    onAdd(title, content, getRandomColor());
    setTitle("");
    setContent("");
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setTitle("");
    setContent("");
  };

  if (!isOpen) {
    return (
      <Card className="flex min-h-[180px] w-full cursor-pointer items-center justify-center border-2 border-dashed border-muted-foreground/25 bg-muted/20 transition-colors hover:border-primary/40 hover:bg-muted/40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-full min-h-[180px] w-full flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Plus className="size-6 text-primary" />
          </div>
          <span className="text-sm font-medium">새 메모</span>
          <span className="text-xs text-muted-foreground">클릭하여 추가</span>
        </button>
      </Card>
    );
  }

  return (
    <Card className="w-full border shadow-md">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-0 border-b pb-4 pt-5">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="text-base font-semibold"
            autoFocus
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요..."
            rows={5}
            className="min-h-[120px] resize-none"
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              메모 추가
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              취소
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}

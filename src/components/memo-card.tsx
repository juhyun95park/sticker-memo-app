"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Memo, MemoColor, MemoCategory } from "@/types/memo";
import { MEMO_CATEGORIES, getCategoryLabel } from "@/types/memo";

const COLOR_STYLES: Record<
  MemoColor,
  {
    bg: string;
    bgDark: string;
    border: string;
    borderDark: string;
    shadow: string;
    shadowHover: string;
    text: string;
    textDark: string;
    textMuted: string;
    textMutedDark: string;
    inputBorder: string;
    inputBg: string;
    inputBgDark: string;
    foldColor: string;
  }
> = {
  yellow: {
    bg: "bg-[#fef9c3]",
    bgDark: "dark:bg-[#fef08a]",
    border: "border-amber-700/20",
    borderDark: "dark:border-amber-700/30",
    shadow: "shadow-[3px_3px_10px_rgba(0,0,0,0.15),5px_5px_0_rgba(0,0,0,0.05)]",
    shadowHover: "hover:shadow-[0_10px_35px_rgba(180,160,70,0.4)]",
    text: "text-amber-950",
    textDark: "dark:text-amber-100",
    textMuted: "text-amber-900/90",
    textMutedDark: "dark:text-amber-100/90",
    inputBorder: "border-amber-300/50",
    inputBg: "bg-white/80",
    inputBgDark: "dark:bg-amber-950/20",
    foldColor: "from-amber-200/70",
  },
  pink: {
    bg: "bg-[#fce7f3]",
    bgDark: "dark:bg-[#f9a8d4]",
    border: "border-rose-700/15",
    borderDark: "dark:border-rose-700/25",
    shadow: "shadow-[2px_2px_8px_rgba(0,0,0,0.12),4px_4px_0_rgba(0,0,0,0.04)]",
    shadowHover: "hover:shadow-[0_8px_30px_rgba(225,100,150,0.35)]",
    text: "text-rose-950",
    textDark: "dark:text-rose-100",
    textMuted: "text-rose-900/90",
    textMutedDark: "dark:text-rose-100/90",
    inputBorder: "border-rose-300/50",
    inputBg: "bg-white/80",
    inputBgDark: "dark:bg-rose-950/20",
    foldColor: "from-rose-200/60",
  },
  mint: {
    bg: "bg-[#d1fae5]",
    bgDark: "dark:bg-[#6ee7b7]",
    border: "border-emerald-700/15",
    borderDark: "dark:border-emerald-700/25",
    shadow: "shadow-[2px_2px_8px_rgba(0,0,0,0.12),4px_4px_0_rgba(0,0,0,0.04)]",
    shadowHover: "hover:shadow-[0_8px_30px_rgba(50,200,150,0.35)]",
    text: "text-emerald-950",
    textDark: "dark:text-emerald-100",
    textMuted: "text-emerald-900/90",
    textMutedDark: "dark:text-emerald-100/90",
    inputBorder: "border-emerald-300/50",
    inputBg: "bg-white/80",
    inputBgDark: "dark:bg-emerald-950/20",
    foldColor: "from-emerald-200/60",
  },
  lavender: {
    bg: "bg-[#ede9fe]",
    bgDark: "dark:bg-[#c4b5fd]",
    border: "border-violet-700/15",
    borderDark: "dark:border-violet-700/25",
    shadow: "shadow-[2px_2px_8px_rgba(0,0,0,0.12),4px_4px_0_rgba(0,0,0,0.04)]",
    shadowHover: "hover:shadow-[0_8px_30px_rgba(140,100,200,0.35)]",
    text: "text-violet-950",
    textDark: "dark:text-violet-100",
    textMuted: "text-violet-900/90",
    textMutedDark: "dark:text-violet-100/90",
    inputBorder: "border-violet-300/50",
    inputBg: "bg-white/80",
    inputBgDark: "dark:bg-violet-950/20",
    foldColor: "from-violet-200/60",
  },
  peach: {
    bg: "bg-[#fed7aa]",
    bgDark: "dark:bg-[#fdba74]",
    border: "border-orange-700/15",
    borderDark: "dark:border-orange-700/25",
    shadow: "shadow-[2px_2px_8px_rgba(0,0,0,0.12),4px_4px_0_rgba(0,0,0,0.04)]",
    shadowHover: "hover:shadow-[0_8px_30px_rgba(250,150,100,0.35)]",
    text: "text-orange-950",
    textDark: "dark:text-orange-100",
    textMuted: "text-orange-900/90",
    textMutedDark: "dark:text-orange-100/90",
    inputBorder: "border-orange-300/50",
    inputBg: "bg-white/80",
    inputBgDark: "dark:bg-orange-950/20",
    foldColor: "from-orange-200/60",
  },
  sky: {
    bg: "bg-[#e0f2fe]",
    bgDark: "dark:bg-[#7dd3fc]",
    border: "border-sky-700/15",
    borderDark: "dark:border-sky-700/25",
    shadow: "shadow-[2px_2px_8px_rgba(0,0,0,0.12),4px_4px_0_rgba(0,0,0,0.04)]",
    shadowHover: "hover:shadow-[0_8px_30px_rgba(50,150,250,0.35)]",
    text: "text-sky-950",
    textDark: "dark:text-sky-100",
    textMuted: "text-sky-900/90",
    textMutedDark: "dark:text-sky-100/90",
    inputBorder: "border-sky-300/50",
    inputBg: "bg-white/80",
    inputBgDark: "dark:bg-sky-950/20",
    foldColor: "from-sky-200/60",
  },
};

interface MemoCardProps {
  memo: Memo;
  index?: number;
  isNew?: boolean;
  isDeleting?: boolean;
  isDragging?: boolean;
  onUpdate: (id: string, updates: Partial<Pick<Memo, "title" | "content" | "color" | "category">>) => void;
  onDelete: (id: string) => void;
}

export function MemoCard({ memo, index = 0, isNew = false, isDeleting = false, isDragging = false, onUpdate, onDelete }: MemoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(memo.title);
  const [editContent, setEditContent] = useState(memo.content);
  const [editCategory, setEditCategory] = useState<MemoCategory>(memo.category);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const rotation = [-1.5, 0.5, -0.8, 1.2, -1, 0.3][index % 6];
  const colorStyle = COLOR_STYLES[memo.color];

  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      contentRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing, editContent.length]);

  const handleSave = () => {
    onUpdate(memo.id, {
      title: editTitle.trim() || "제목 없음",
      content: editContent.trim(),
      category: editCategory,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(memo.title);
    setEditContent(memo.content);
    setEditCategory(memo.category);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm("이 메모를 삭제할까요?")) {
      onDelete(memo.id);
    }
  };

  return (
    <Card
      className={cn(
        "group relative min-h-[160px] w-full overflow-visible border p-0 gap-0 rounded-lg",
        colorStyle.bg,
        colorStyle.bgDark,
        colorStyle.border,
        colorStyle.borderDark,
        colorStyle.shadow,
        colorStyle.shadowHover,
        "transition-all duration-300 ease-out",
        "hover:-translate-y-2 hover:scale-[1.02]",
        "before:absolute before:top-0 before:right-0 before:h-6 before:w-6 before:bg-gradient-to-br before:to-transparent before:rounded-bl-[20px] before:content-['']",
        `before:${colorStyle.foldColor}`,
        isNew && "animate-stick",
        isDeleting && "animate-fade-out pointer-events-none"
      )}
      style={
        ({ 
          "--rotation": isDragging ? "0deg" : `${rotation}deg`,
          "--hover-rotation": "0deg",
          transform: `rotate(var(--rotation, 0deg))`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease-out"
        } as React.CSSProperties & { "--hover-rotation"?: string })
      }
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.setProperty("--rotation", "0deg");
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.setProperty("--rotation", `${rotation}deg`);
        }
      }}
    >
      <CardHeader
        className={cn(
          "relative flex flex-row items-start justify-between gap-2 space-y-0 border-b px-4 pb-3 pt-5",
          colorStyle.border,
          colorStyle.borderDark
        )}
      >
        <div className="min-w-0 flex-1 pr-16 space-y-1">
          {isEditing ? (
            <>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="제목"
                className={cn(
                  "h-8 text-sm font-semibold placeholder:text-foreground/50 focus-visible:ring-primary/30",
                  colorStyle.inputBorder,
                  colorStyle.inputBg,
                  colorStyle.inputBgDark,
                  colorStyle.text,
                  colorStyle.textDark
                )}
              />
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as MemoCategory)}
                className={cn(
                  "h-7 w-full rounded border text-xs focus:outline-none focus:ring-2 focus:ring-offset-0",
                  colorStyle.inputBorder,
                  colorStyle.inputBg,
                  colorStyle.inputBgDark,
                  colorStyle.text,
                  colorStyle.textDark
                )}
                aria-label="카테고리"
              >
                {MEMO_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <h3 className={cn("truncate text-sm font-semibold", colorStyle.text, colorStyle.textDark)}>
                {memo.title}
              </h3>
              <span
                className={cn(
                  "inline-block rounded px-1.5 py-0.5 text-xs font-medium opacity-80",
                  colorStyle.textMuted,
                  colorStyle.textMutedDark
                )}
              >
                {getCategoryLabel(memo.category)}
              </span>
            </>
          )}
        </div>
        <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {!isEditing ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsEditing(true)}
                className={cn(
                  "size-7",
                  colorStyle.text,
                  colorStyle.textDark,
                  "opacity-70 hover:opacity-100",
                  memo.color === "yellow" && "hover:bg-amber-700/20 dark:hover:bg-amber-500/20",
                  memo.color === "pink" && "hover:bg-rose-700/20 dark:hover:bg-rose-500/20",
                  memo.color === "mint" && "hover:bg-emerald-700/20 dark:hover:bg-emerald-500/20",
                  memo.color === "lavender" && "hover:bg-violet-700/20 dark:hover:bg-violet-500/20",
                  memo.color === "peach" && "hover:bg-orange-700/20 dark:hover:bg-orange-500/20",
                  memo.color === "sky" && "hover:bg-sky-700/20 dark:hover:bg-sky-500/20"
                )}
                aria-label="수정"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                className="size-7 text-red-600/70 hover:bg-red-500/20 hover:text-red-600 dark:text-red-400/80 dark:hover:bg-red-400/30 dark:hover:text-red-400"
                aria-label="삭제"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleSave}
                className="size-7 text-emerald-700 hover:bg-emerald-500/25 hover:text-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-500/30"
                aria-label="저장"
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleCancel}
                className={cn(
                  "size-7",
                  colorStyle.text,
                  colorStyle.textDark,
                  "opacity-70 hover:opacity-100",
                  memo.color === "yellow" && "hover:bg-amber-700/20 dark:hover:bg-amber-500/20",
                  memo.color === "pink" && "hover:bg-rose-700/20 dark:hover:bg-rose-500/20",
                  memo.color === "mint" && "hover:bg-emerald-700/20 dark:hover:bg-emerald-500/20",
                  memo.color === "lavender" && "hover:bg-violet-700/20 dark:hover:bg-violet-500/20",
                  memo.color === "peach" && "hover:bg-orange-700/20 dark:hover:bg-orange-500/20",
                  memo.color === "sky" && "hover:bg-sky-700/20 dark:hover:bg-sky-500/20"
                )}
                aria-label="취소"
              >
                <X className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 px-4 pt-3 pb-4">
        {isEditing ? (
          <Textarea
            ref={contentRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            placeholder="내용"
            className={cn(
              "min-h-[80px] resize-none text-sm placeholder:text-foreground/50 focus-visible:ring-primary/30",
              colorStyle.inputBorder,
              colorStyle.inputBg,
              colorStyle.inputBgDark,
              colorStyle.text,
              colorStyle.textDark
            )}
          />
        ) : (
          <>
            <p
              className={cn(
                "flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed",
                colorStyle.textMuted,
                colorStyle.textMutedDark
              )}
            >
              {memo.content || "내용 없음"}
            </p>
            <time
              className={cn(
                "mt-auto block text-xs",
                colorStyle.textMuted,
                colorStyle.textMutedDark,
                "opacity-60"
              )}
              dateTime={new Date(memo.updatedAt).toISOString()}
            >
              {new Date(memo.updatedAt).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </>
        )}
      </CardContent>
    </Card>
  );
}

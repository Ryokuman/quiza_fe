"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postOnboardingChat, createGoal, getMe } from "@/lib/api";
import type { IOnboardingChatResult } from "@/api/structures/IOnboardingChatResult";
import type { IOnboardingDomainSuggestion } from "@/api/structures/IOnboardingDomainSuggestion";
import type { IOnboardingTagSuggestion } from "@/api/structures/IOnboardingTagSuggestion";
import type { IOnboardingConfirmed } from "@/api/structures/IOnboardingConfirmed";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  domains?: IOnboardingDomainSuggestion[];
  tags?: IOnboardingTagSuggestion[];
  confirmed?: IOnboardingConfirmed;
  type?: IOnboardingChatResult["type"];
};

type ChatContext = {
  suggestedDomains?: { id: string; name: string; similarity: number }[];
  selectedDomainId?: string;
  selectedDomainName?: string;
  suggestedTags?: { id: string; name: string }[];
  selectedTagIds?: string[];
};

export default function OnboardingPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "안녕하세요! 어떤 분야를 공부하고 싶으신가요? 자유롭게 말씀해주세요.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [turn, setTurn] = useState(1);
  const [context, setContext] = useState<ChatContext | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auth check
  useEffect(() => {
    getMe().catch(() => router.replace("/login"));
  }, [router]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setSending(true);

    try {
      const body = {
        message: text,
        turn,
        context,
      };
      const result = await postOnboardingChat(body);

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: result.message,
        domains: result.domains,
        tags: result.tags,
        confirmed: result.confirmed,
        type: result.type,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setTurn((t) => Math.min(t + 1, 3));
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "오류가 발생했습니다. 다시 시도해주세요." },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sending, turn, context]);

  const handleSelectDomain = useCallback(
    (domain: IOnboardingDomainSuggestion) => {
      setContext((prev) => ({
        ...prev,
        suggestedDomains: prev?.suggestedDomains,
        selectedDomainId: domain.id,
        selectedDomainName: domain.name,
      }));
      setMessages((prev) => [
        ...prev,
        { role: "user", content: `${domain.name}을(를) 선택했습니다.` },
      ]);
      // Auto-advance by sending the selection
      const msg = `${domain.name}을(를) 선택합니다`;
      setSending(true);
      postOnboardingChat({
        message: msg,
        turn: Math.min(turn + 1, 3),
        context: {
          ...context,
          selectedDomainId: domain.id,
          selectedDomainName: domain.name,
        },
      })
        .then((result) => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: result.message,
              domains: result.domains,
              tags: result.tags,
              confirmed: result.confirmed,
              type: result.type,
            },
          ]);
          setTurn((t) => Math.min(t + 1, 3));
          if (result.domains) {
            setContext((prev) => ({
              ...prev,
              suggestedDomains: result.domains?.map((d) => ({
                id: d.id ?? "",
                name: d.name,
                similarity: d.similarity ?? 0,
              })),
            }));
          }
          if (result.tags) {
            setContext((prev) => ({
              ...prev,
              suggestedTags: result.tags?.map((t) => ({
                id: t.id,
                name: t.name,
              })),
            }));
          }
        })
        .catch(() => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "오류가 발생했습니다." },
          ]);
        })
        .finally(() => setSending(false));
    },
    [turn, context]
  );

  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  const handleToggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  }, []);

  const handleConfirmTags = useCallback(
    (tags: IOnboardingTagSuggestion[]) => {
      const ids = Array.from(selectedTagIds);
      const selectedNames = tags
        .filter((t) => ids.includes(t.id))
        .map((t) => t.name);
      setContext((prev) => ({ ...prev, selectedTagIds: ids }));
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: `선택한 태그: ${selectedNames.join(", ")}`,
        },
      ]);

      setSending(true);
      postOnboardingChat({
        message: `태그를 선택했습니다: ${selectedNames.join(", ")}`,
        turn: Math.min(turn + 1, 3),
        context: { ...context, selectedTagIds: ids },
      })
        .then((result) => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: result.message,
              confirmed: result.confirmed,
              type: result.type,
            },
          ]);
          setTurn((t) => Math.min(t + 1, 3));
        })
        .catch(() => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "오류가 발생했습니다." },
          ]);
        })
        .finally(() => setSending(false));
    },
    [selectedTagIds, turn, context]
  );

  const handleCreateGoal = useCallback(
    async (confirmed: IOnboardingConfirmed) => {
      setCreating(true);
      try {
        const result = await createGoal({
          domain: confirmed.domainId,
          target: confirmed.target,
          level: "beginner",
          tagIds: confirmed.tagIds,
        });
        router.push(`/roadmap/${result.goal.id}`);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "목표 생성에 실패했습니다. 다시 시도해주세요.",
          },
        ]);
        setCreating(false);
      }
    },
    [router]
  );

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Header */}
      <header className="flex h-14 items-center gap-3 border-b border-border px-4">
        <button onClick={() => router.back()} className="text-muted-foreground">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-base font-semibold">학습 목표 설정</h1>
      </header>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i}>
            <div
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>

            {/* Domain suggestions */}
            {msg.domains && msg.domains.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 pl-2">
                {msg.domains.map((d, di) => (
                  <button
                    key={di}
                    onClick={() => handleSelectDomain(d)}
                    disabled={sending}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-secondary disabled:opacity-50"
                  >
                    {d.name}
                    {d.similarity != null && d.similarity > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        {Math.round(d.similarity * 100)}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Tag suggestions */}
            {msg.tags && msg.tags.length > 0 && (
              <div className="mt-2 space-y-2 pl-2">
                <div className="flex flex-wrap gap-2">
                  {msg.tags.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleToggleTag(t.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        selectedTagIds.has(t.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground hover:bg-secondary"
                      }`}
                    >
                      {selectedTagIds.has(t.id) && (
                        <Check className="mr-1 inline size-3" />
                      )}
                      {t.name}
                    </button>
                  ))}
                </div>
                {selectedTagIds.size > 0 && (
                  <Button
                    size="sm"
                    onClick={() => handleConfirmTags(msg.tags!)}
                    disabled={sending}
                  >
                    태그 확정 ({selectedTagIds.size}개)
                  </Button>
                )}
              </div>
            )}

            {/* Confirmed goal - create button */}
            {msg.confirmed && (
              <div className="mt-3 ml-2 space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm font-medium">목표 확인</p>
                <p className="text-sm text-muted-foreground">
                  도메인: {msg.confirmed.domainName}
                </p>
                <p className="text-sm text-muted-foreground">
                  목표: {msg.confirmed.target}
                </p>
                <Button
                  className="w-full"
                  onClick={() => handleCreateGoal(msg.confirmed!)}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    "학습 시작하기"
                  )}
                </Button>
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl bg-secondary px-4 py-2.5">
              <div className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
              <div className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
              <div className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSend();
            }}
            placeholder="메시지를 입력하세요..."
            disabled={sending || creating}
            className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || creating}
            className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

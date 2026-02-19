"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    profileImageUrl: string | null;
  };
}

interface CommentSectionProps {
  imageId: string;
  currentUserId?: string;
}

export function CommentSection({
  imageId,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [imageId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/images/${imageId}/comments`);
      if (res.ok) {
        const data = (await res.json()) as { comments: Comment[] };
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Kommentare:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/images/${imageId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        const data = (await res.json()) as { comment: Comment };
        setComments([...comments, data.comment]);
        setContent("");
        setShowComments(true);
      } else {
        const error = (await res.json()) as {
          error?: string;
          details?: string;
        };
        const errorMsg = error.details
          ? `${error.error}: ${error.details}`
          : error.error || "Fehler beim Erstellen des Kommentars";
        console.error("[COMMENT_ERROR]", errorMsg, res.status);
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Fehler:", error);
      alert("Unerwarteter Fehler");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>
          {comments.length} {comments.length === 1 ? "Kommentar" : "Kommentare"}
        </span>
      </button>

      {showComments && (
        <div className="space-y-2">
          {initialLoading ? (
            <div className="text-xs text-neutral-500">Lädt...</div>
          ) : comments.length === 0 ? (
            <div className="text-xs text-neutral-500">
              Noch keine Kommentare
            </div>
          ) : (
            <div className="max-h-32 space-y-2 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-2 rounded bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                >
                  <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-700">
                    {comment.user.profileImageUrl ? (
                      <Image
                        src={comment.user.profileImageUrl}
                        alt={comment.user.name || comment.user.email}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                        {comment.user.name?.[0]?.toUpperCase() ||
                          comment.user.email[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {comment.user.name || comment.user.email}
                    </div>
                    <div className="mt-0.5 text-neutral-600 dark:text-neutral-400">
                      {comment.content}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {new Date(comment.createdAt).toLocaleString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentUserId && (
            <form onSubmit={handleSubmit} className="space-y-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Kommentar schreiben..."
                maxLength={500}
                rows={2}
                className="w-full rounded border border-neutral-300 px-2 py-1 text-xs outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-100"
                disabled={submitting}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  {content.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!content.trim() || submitting}
                  className="rounded bg-neutral-900 px-2 py-1 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200"
                >
                  {submitting ? "Wird gesendet..." : "Kommentieren"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

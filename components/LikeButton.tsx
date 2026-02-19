"use client";

import { useState, useEffect } from "react";

interface LikeButtonProps {
  imageId: string;
  currentUserId?: string;
}

interface LikeData {
  likes: number;
  dislikes: number;
  userLike: "like" | "dislike" | null;
}

export function LikeButton({ imageId, currentUserId }: LikeButtonProps) {
  const [data, setData] = useState<LikeData>({
    likes: 0,
    dislikes: 0,
    userLike: null,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchLikes();
  }, [imageId]);

  const fetchLikes = async () => {
    try {
      const res = await fetch(`/api/images/${imageId}/like`);
      if (res.ok) {
        const json = (await res.json()) as LikeData;
        setData(json);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Likes:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleLike = async (type: "like" | "dislike") => {
    if (!currentUserId || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/images/${imageId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        await fetchLikes();
      } else {
        const error = (await res.json()) as {
          error?: string;
          details?: string;
        };
        const errorMsg = error.details
          ? `${error.error}: ${error.details}`
          : error.error || "Fehler beim Liken/Disliken";
        console.error("[LIKE_ERROR]", errorMsg, res.status);
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Fehler:", error);
      alert("Unerwarteter Fehler");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <div className="h-4 w-4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => handleLike("like")}
        disabled={!currentUserId || loading}
        className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition ${
          data.userLike === "like"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <svg
          className="h-3.5 w-3.5"
          fill={data.userLike === "like" ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
        <span>{data.likes}</span>
      </button>

      <button
        type="button"
        onClick={() => handleLike("dislike")}
        disabled={!currentUserId || loading}
        className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition ${
          data.userLike === "dislike"
            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <svg
          className="h-3.5 w-3.5"
          fill={data.userLike === "dislike" ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
          />
        </svg>
        <span>{data.dislikes}</span>
      </button>
    </div>
  );
}

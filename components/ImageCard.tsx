"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";

interface ImageCardProps {
  image: {
    id: string;
    filename: string;
    originalName: string;
    createdAt: Date;
    expiresAt: Date;
    owner: {
      id: string;
      email: string;
      name: string | null;
    };
  };
  currentUserId?: string;
}

export function ImageCard({ image, currentUserId }: ImageCardProps) {
  const now = new Date();
  const expiresIn = Math.max(
    0,
    Math.floor((image.expiresAt.getTime() - now.getTime()) / 1000 / 60),
  );
  const hours = Math.floor(expiresIn / 60);
  const minutes = expiresIn % 60;

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
      <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        <Image
          src={`/uploads/${image.filename}`}
          alt={image.originalName}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-3 space-y-2">
        <div>
          <p className="truncate text-xs font-medium text-neutral-900 dark:text-neutral-100">
            {image.originalName}
          </p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            von {image.owner.name || image.owner.email}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
            Läuft ab in: {hours > 0 ? `${hours}h ` : ""}
            {minutes}m
          </p>
        </div>

        <LikeButton imageId={image.id} currentUserId={currentUserId} />

        <CommentSection imageId={image.id} currentUserId={currentUserId} />
      </div>
    </div>
  );
}

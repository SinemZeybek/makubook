"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import CommentHelpfulButton from "./comment-helpful-button";
import DeleteCommentButton from "./delete-comment-button";

type Comment = {
  id: string;
  body: string;
  rating: number | null;
  user_id: string;
  helpful_count: number;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
};

const PAGE_SIZE = 5;

export default function CommentList({
  comments,
  currentUserId,
  isEditor,
  votedCommentIds,
}: {
  comments: Comment[];
  currentUserId: string | null;
  isEditor: boolean;
  votedCommentIds: string[];
}) {
  const t = useTranslations("Comment");
  const tCommon = useTranslations("Common");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const votedSet = new Set(votedCommentIds);

  if (comments.length === 0) {
    return <p className="mt-6 text-sm text-berry/70">{t("noComments")}</p>;
  }

  const visibleComments = comments.slice(0, visibleCount);

  return (
    <div className="mt-6">
      <ul className="space-y-4">
        {visibleComments.map((comment) => (
          <li
            key={comment.id}
            className="rounded-lg border border-berry/15 bg-white p-3"
          >
            <div className="flex items-center gap-2 text-sm">
              <div className="h-6 w-6 overflow-hidden rounded-full">
                <Image
                  src={comment.profiles?.avatar_url || "/default-avatar.png"}
                  alt=""
                  width={24}
                  height={24}
                  className="h-full w-full object-cover"
                  style={
                    comment.profiles?.avatar_url
                      ? undefined
                      : { transform: "scale(1.2)" }
                  }
                />
              </div>
              <span className="font-medium text-berry">
                {comment.profiles?.display_name ?? tCommon("anonymous")}
              </span>
              <span className="text-gold-dark">
                {"★".repeat(comment.rating ?? 0)}
                {"☆".repeat(5 - (comment.rating ?? 0))}
              </span>
              {currentUserId &&
                (currentUserId === comment.user_id || isEditor) && (
                  <DeleteCommentButton commentId={comment.id} />
                )}
            </div>
            <p className="mt-1 whitespace-pre-line text-berry/80">
              {comment.body}
            </p>
            <div className="mt-2">
              {currentUserId ? (
                <CommentHelpfulButton
                  commentId={comment.id}
                  userId={currentUserId}
                  initialVoted={votedSet.has(comment.id)}
                  initialHelpfulCount={comment.helpful_count}
                />
              ) : (
                comment.helpful_count > 0 && (
                  <span className="text-xs text-berry/50">
                    {t("helpfulCount", { count: comment.helpful_count })}
                  </span>
                )
              )}
            </div>
          </li>
        ))}
      </ul>

      {visibleCount < comments.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-4 text-sm text-berry underline"
        >
          {t("showMoreComments")}
        </button>
      )}
    </div>
  );
}

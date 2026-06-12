"use client";

import {
  useGetPostLikersQuery,
  useGetCommentLikersQuery,
  useGetReplyLikersQuery,
} from "@/lib/api";
import type { User } from "@/lib/types";
import { useEffect } from "react";

interface LikersModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "post" | "comment" | "reply";
}

export function LikersModal({
  isOpen,
  onClose,
  targetId,
  targetType,
}: LikersModalProps) {
  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Execute query conditionally based on the target type (always call hooks unconditionally at the top level)
  const postResult = useGetPostLikersQuery(targetId, {
    skip: targetType !== "post" || !targetId || !isOpen,
  });
  const commentResult = useGetCommentLikersQuery(targetId, {
    skip: targetType !== "comment" || !targetId || !isOpen,
  });
  const replyResult = useGetReplyLikersQuery(targetId, {
    skip: targetType !== "reply" || !targetId || !isOpen,
  });

  if (!isOpen) return null;


  // Extract variables depending on selection
  let likers: User[] | undefined;
  let isLoading = false;
  let isError = false;

  if (targetType === "post") {
    likers = postResult.data;
    isLoading = postResult.isLoading;
    isError = postResult.isError;
  } else if (targetType === "comment") {
    likers = commentResult.data;
    isLoading = commentResult.isLoading;
    isError = commentResult.isError;
  } else if (targetType === "reply") {
    likers = replyResult.data;
    isLoading = replyResult.isLoading;
    isError = replyResult.isError;
  }

  const getInitials = (user: User) => {
    const first = user.firstName?.charAt(0) || "";
    const last = user.lastName?.charAt(0) || "";
    return `${first}${last}`.toUpperCase();
  };

  const getTargetLabel = () => {
    if (targetType === "post") return "Post";
    if (targetType === "comment") return "Comment";
    return "Reply";
  };

  return (
    <div className="_bs_modal_overlay" onClick={onClose}>
      <div className="_bs_modal_content" onClick={(e) => e.stopPropagation()}>
        <div className="_bs_modal_header">
          <h3 className="_bs_modal_title">People who liked this {getTargetLabel()}</h3>
          <button type="button" className="_bs_modal_close_btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="_bs_modal_body">
          {isLoading ? (
            <div className="_bs_loading_spinner_container">
              <div className="_bs_loading_spinner"></div>
            </div>
          ) : isError ? (
            <div className="_bs_empty_likers" style={{ color: "#ff4d4f" }}>
              Failed to load likes. Please try again.
            </div>
          ) : !likers || likers.length === 0 ? (
            <div className="_bs_empty_likers">No likes yet.</div>
          ) : (
            <ul className="_bs_likers_list">
              {likers.map((user) => (
                <li key={user.id} className="_bs_liker_item">
                  <div className="_bs_liker_avatar">{getInitials(user)}</div>
                  <div className="_bs_liker_info">
                    <p className="_bs_liker_name">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="_bs_liker_subtext">Member of Buddy Script</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

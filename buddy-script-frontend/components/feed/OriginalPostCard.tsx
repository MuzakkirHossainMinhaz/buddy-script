"use client";

import {
  assetUrl,
  useCreateCommentMutation,
  useCreateReplyMutation,
  useGetCommentsQuery,
  useGetMeQuery,
  useGetRepliesQuery,
  useLikeCommentMutation,
  useLikePostMutation,
  useLikeReplyMutation,
  useUpdatePostMutation,
} from "@/lib/api";
import type { Comment, Post, User, Reply } from "@/lib/types";
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";

const nameOf = (user: Pick<User, "firstName" | "lastName">) =>
  `${user.firstName} ${user.lastName}`.trim();

const timeAgo = (date: string) => {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  return `${Math.floor(hours / 24)} ${Math.floor(hours / 24) === 1 ? "day" : "days"} ago`;
};

const reactImages = [
  "/assets/images/react_img1.png",
  "/assets/images/react_img2.png",
  "/assets/images/react_img3.png",
  "/assets/images/react_img4.png",
  "/assets/images/react_img5.png",
];

const shortCount = (count: number) => (count > 9 ? "9+" : count.toString());

function ReplyItem({
  reply,
  commentId,
  depth,
  onAddPendingReply,
}: {
  reply: Reply;
  commentId: string;
  depth: number;
  onAddPendingReply?: (parentReplyId: string, content: string) => void;
}) {
  const [optimisticLiked, setOptimisticLiked] = useState(reply.isLikedByMe);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(reply.likeCount);
  const [likeReply] = useLikeReplyMutation();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [createReply] = useCreateReplyMutation();

  const handleReplyLike = () => {
    const currentLiked = optimisticLiked;
    const nextLiked = !currentLiked;
    setOptimisticLiked(nextLiked);
    setOptimisticLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));

    likeReply({ replyId: reply.id, liked: currentLiked, commentId })
      .unwrap()
      .catch(() => {
        setOptimisticLiked(currentLiked);
        setOptimisticLikeCount((c) => Math.max(0, c + (currentLiked ? 1 : -1)));
      });
  };

  const handleReplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const content = replyText.trim();
    setReplyText("");
    setShowReplyInput(false);

    if (onAddPendingReply) {
      onAddPendingReply(reply.id, content);
    }
  };

  return (
    <div className="_comment_main" style={{ marginTop: "16px", borderLeft: "1px solid #EAEAEA", paddingLeft: "20px", width: "100%" }}>
      <div className="_comment_image">
        {reply.id.startsWith("temp-") ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#f0f2f5", borderRadius: "100%" }}>
            <svg
              className="_comment_spinner"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="#1890FF"
                strokeWidth="3"
                strokeDasharray="30 10"
                strokeLinecap="round"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        ) : (
          <a href="profile.html" className="_comment_image_link">
            <img src="/assets/images/txt_img.png" alt="" className="_comment_img1" />
          </a>
        )}
      </div>
      <div className="_comment_area" style={{ flex: "1 1", width: "calc(100% - 40px)" }}>
        <div className="_comment_details" style={{ marginBottom: "48px", width: "100%", maxWidth: "100%" }}>
          <div className="_comment_details_top">
            <div className="_comment_name">
              <a href="profile.html">
                <h4 className="_comment_name_title">{nameOf(reply.author)}</h4>
              </a>
            </div>
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text">{reply.content}</p>
          </div>
          <div className="_total_reactions">
            <div className="_total_react">
              <span className="_reaction_like">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-thumbs-up"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              </span>
            </div>
            <span className="_total">{optimisticLikeCount}</span>
          </div>
          <div className="_comment_reply">
            <div className="_comment_reply_num">
              <ul className="_comment_reply_list">
                <li>
                  <button
                    type="button"
                    className={`_previous_comment_txt ${optimisticLiked ? "_bs_comment_react_active" : ""}`}
                    onClick={handleReplyLike}
                  >
                    Like
                  </button>.
                </li>
                {depth < 3 && (
                  <li>
                    <button
                      type="button"
                      className="_previous_comment_txt"
                      onClick={() => setShowReplyInput(!showReplyInput)}
                    >
                      Reply
                    </button>.
                  </li>
                )}
                <li><span>Share</span>.</li>
                <li><span className="_time_link">{timeAgo(reply.createdAt)}</span></li>
              </ul>
            </div>
          </div>
        </div>

        {showReplyInput && (
          <div className="_feed_inner_timeline_cooment_area" style={{ marginTop: "12px", marginLeft: "-15px", marginBottom: "16px", width: "calc(100% + 35px)" }}>
            <div className="_feed_inner_comment_box">
              <form className="_feed_inner_comment_box_form" onSubmit={handleReplySubmit}>
                <div className="_feed_inner_comment_box_content">
                  <div className="_feed_inner_comment_box_content_image">
                    <img src="/assets/images/comment_img.png" alt="" className="_comment_img" />
                  </div>
                  <div className="_feed_inner_comment_box_content_txt">
                    <textarea
                      className="form-control _comment_textarea"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
                        if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey) {
                          event.preventDefault();
                          handleReplySubmit(event);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="_feed_inner_comment_box_icon">
                  <button className="_feed_inner_comment_box_icon_btn" type="submit" aria-label="Post comment">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
                      <path stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
                      <path stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                    </svg>
                  </button>
                  <button className="_feed_inner_comment_box_icon_btn" type="button" aria-label="Attach image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <rect width="18" height="18" x="3" y="3" stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 15-5-5L5 21" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const [optimisticLiked, setOptimisticLiked] = useState(comment.isLikedByMe);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(comment.likeCount);
  const [likeComment] = useLikeCommentMutation();

  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [createReply] = useCreateReplyMutation();
  const { data: repliesData, isFetching } = useGetRepliesQuery({ commentId: comment.id }, { skip: !showReplies });

  const [pendingReplies, setPendingReplies] = useState<Reply[]>([]);
  const { data: currentUser } = useGetMeQuery();

  useEffect(() => {
    if (repliesData?.data) {
      setPendingReplies((prev) =>
        prev.filter((pending) => !repliesData.data.some((r) => r.id === pending.id))
      );
    }
  }, [repliesData?.data]);

  const handleCommentLike = () => {
    const currentLiked = optimisticLiked;
    const nextLiked = !currentLiked;

    setOptimisticLiked(nextLiked);
    setOptimisticLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));

    likeComment({ commentId: comment.id, liked: currentLiked })
      .unwrap()
      .catch(() => {
        setOptimisticLiked(currentLiked);
        setOptimisticLikeCount((count) => Math.max(0, count + (currentLiked ? 1 : -1)));
      });
  };

  const handleReplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const content = replyText.trim();

    const tempId = "temp-" + Date.now();
    const tempReply: Reply = {
      id: tempId,
      content,
      parentReplyId: null,
      likeCount: 0,
      isLikedByMe: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: currentUser || { id: "temp-author", firstName: "User", lastName: "" },
    };

    setPendingReplies((prev) => [...prev, tempReply]);
    setReplyText("");
    setShowReplyInput(false);
    setShowReplies(true);

    try {
      const response = await createReply({
        commentId: comment.id,
        content,
      }).unwrap();
      setPendingReplies((prev) =>
        prev.map((r) => (r.id === tempId ? response : r))
      );
    } catch {
      setPendingReplies((prev) => prev.filter((r) => r.id !== tempId));
      setReplyText(content);
    }
  };

  const addPendingReply = async (parentReplyId: string, content: string) => {
    const tempId = "temp-" + Date.now();
    const tempReply: Reply = {
      id: tempId,
      content,
      parentReplyId,
      likeCount: 0,
      isLikedByMe: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: currentUser || { id: "temp-author", firstName: "User", lastName: "" },
    };

    setPendingReplies((prev) => [...prev, tempReply]);
    setShowReplies(true);

    try {
      const response = await createReply({
        commentId: comment.id,
        content,
        parentReplyId,
      }).unwrap();
      setPendingReplies((prev) =>
        prev.map((r) => (r.id === tempId ? response : r))
      );
    } catch {
      setPendingReplies((prev) => prev.filter((r) => r.id !== tempId));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", marginBottom: "16px" }}>
      <div className="_comment_main" style={{ width: "100%" }}>
        <div className="_comment_image">
          {comment.id.startsWith("temp-") ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#f0f2f5" }}>
              <svg
                className="_comment_spinner"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="#1890FF"
                  strokeWidth="3"
                  strokeDasharray="30 10"
                  strokeLinecap="round"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
          ) : (
            <a href="profile.html" className="_comment_image_link">
              <img src="/assets/images/txt_img.png" alt="" className="_comment_img1" />
            </a>
          )}
        </div>
        <div className="_comment_area" style={{ flex: "1 1", width: "calc(100% - 60px)" }}>
          <div className="_comment_details" style={{ marginBottom: "48px", width: "100%", maxWidth: "100%" }}>
            <div className="_comment_details_top">
              <div className="_comment_name">
                <a href="profile.html ">
                  <h4 className="_comment_name_title">{nameOf(comment.author)}</h4>
                </a>
              </div>
            </div>
            <div className="_comment_status">
              <p className="_comment_status_text">{comment.content}</p>
            </div>
            <div className="_total_reactions">
              <div className="_total_react">
                <span className="_reaction_like">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-thumbs-up"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                </span>
              </div>
              <span className="_total">{optimisticLikeCount}</span>
            </div>
            <div className="_comment_reply">
              <div className="_comment_reply_num">
                <ul className="_comment_reply_list">
                  <li>
                    <button
                      type="button"
                      className={`_previous_comment_txt ${optimisticLiked ? "_bs_comment_react_active" : ""}`}
                      onClick={handleCommentLike}
                    >
                      Like
                    </button>.
                  </li>
                  <li>
                    <button
                      type="button"
                      className="_previous_comment_txt"
                      onClick={() => {
                        setShowReplyInput(!showReplyInput);
                        setShowReplies(true);
                      }}
                    >
                      Reply
                    </button>.
                  </li>
                  <li><span>Share</span>.</li>
                  <li><span className="_time_link">{timeAgo(comment.createdAt)}</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginLeft: "20px", width: "calc(100%)", display: "flex", flexDirection: "column" }}>
        {showReplyInput && (
          <div className="_feed_inner_timeline_cooment_area" style={{ marginTop: "0px", marginBottom: "20px", width: "100%" }}>
            <div className="_feed_inner_comment_box" style={{ marginLeft: "20px" }}>
              <form className="_feed_inner_comment_box_form" onSubmit={handleReplySubmit}>
                <div className="_feed_inner_comment_box_content">
                  <div className="_feed_inner_comment_box_content_image">
                    <img src="/assets/images/comment_img.png" alt="" className="_comment_img" />
                  </div>
                  <div className="_feed_inner_comment_box_content_txt">
                    <textarea
                      className="form-control _comment_textarea"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                        if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
                          e.preventDefault();
                          handleReplySubmit(e);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="_feed_inner_comment_box_icon">
                  <button className="_feed_inner_comment_box_icon_btn" type="submit" aria-label="Post comment">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
                      <path stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
                      <path stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                    </svg>
                  </button>
                  <button className="_feed_inner_comment_box_icon_btn" type="button" aria-label="Attach image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <rect width="18" height="18" x="3" y="3" stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 15-5-5L5 21" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {comment.replyCount > 0 && (!showReplies || isFetching) && (
          <div style={{ marginLeft: "40px", marginBottom: "10px", display: "flex", alignItems: "center" }}>
            {isFetching ? (
              <svg
                className="_comment_spinner"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                style={{ marginRight: "8px" }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="#377DFF"
                  strokeWidth="3"
                  strokeDasharray="30 10"
                  strokeLinecap="round"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            ) : (
              <button
                type="button"
                className="_previous_comment_txt"
                style={{ display: "block", color: "#377DFF", fontWeight: "bold", textAlign: "left", padding: 0 }}
                onClick={() => setShowReplies(true)}
              >
                View {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        )}

        {showReplies && (
          <div style={{ width: "calc(100% - 24px)" }}>
            {[...(repliesData?.data || []), ...pendingReplies]
              .filter((reply, index, self) => self.findIndex((r) => r.id === reply.id) === index)
              .filter(r => !r.parentReplyId).map((reply) => {
                const childReplies = [...(repliesData?.data || []), ...pendingReplies]
                  .filter((reply, index, self) => self.findIndex((r) => r.id === reply.id) === index)
                  .filter(r => r.parentReplyId === reply.id);

                return (
                  <div key={reply.id} style={{ width: "100%", marginBottom: "16px" }}>
                    <ReplyItem
                      reply={reply}
                      commentId={comment.id}
                      depth={2}
                      onAddPendingReply={addPendingReply}
                    />
                    {childReplies.length > 0 && (
                      <div style={{ marginLeft: "30px", marginTop: "8px", width: "calc(100% - 30px)" }}>
                        {childReplies.map(child => (
                          <ReplyItem
                            key={child.id}
                            reply={child}
                            commentId={comment.id}
                            depth={3}
                            onAddPendingReply={addPendingReply}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export function OriginalPostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [optimisticLiked, setOptimisticLiked] = useState(post.isLikedByMe);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(post.likeCount);
  const [optimisticCommentCount, setOptimisticCommentCount] = useState(post.commentCount);
  const [likePost] = useLikePostMutation();
  const [createComment] = useCreateCommentMutation();
  const [updatePost] = useUpdatePostMutation();
  const { data: comments } = useGetCommentsQuery({ postId: post.id }, { skip: !showComments });
  const { data: currentUser } = useGetMeQuery();
  const isOwnPost = !!(currentUser && post.author && currentUser.id === post.author.id);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (comments?.data) {
      setPendingComments((prev) =>
        prev.filter((pending) => !comments.data.some((c) => c.id === pending.id))
      );
    }
  }, [comments?.data]);
  const imageUrl = assetUrl(post.imageUrl);
  const commentLabel = optimisticCommentCount > 1 ? "Comments" : "Comment";
  const visibleReactImages = reactImages.slice(0, Math.min(optimisticLikeCount, 5));

  const handlePostReact = () => {
    const currentLiked = optimisticLiked;
    const nextLiked = !currentLiked;

    setOptimisticLiked(nextLiked);
    setOptimisticLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));

    likePost({ postId: post.id, liked: currentLiked })
      .unwrap()
      .catch(() => {
        setOptimisticLiked(currentLiked);
        setOptimisticLikeCount((count) => Math.max(0, count + (currentLiked ? 1 : -1)));
      });
  };

  const performSubmitComment = async () => {
    if (!commentText.trim()) return;
    const content = commentText.trim();

    const tempId = "temp-" + Date.now();
    const tempComment: Comment = {
      id: tempId,
      content: content,
      likeCount: 0,
      replyCount: 0,
      isLikedByMe: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: currentUser || { id: "temp-author", firstName: "User", lastName: "" }
    };

    setPendingComments((prev) => [...prev, tempComment]);
    setCommentText("");
    setShowComments(true);
    setShowAllComments(true);
    setOptimisticCommentCount((count) => count + 1);

    try {
      const response = await createComment({ postId: post.id, content }).unwrap();
      setPendingComments((prev) =>
        prev.map((c) => (c.id === tempId ? response : c))
      );
    } catch {
      setPendingComments((prev) => prev.filter((c) => c.id !== tempId));
      setCommentText(content);
      setOptimisticCommentCount((count) => Math.max(0, count - 1));
    }
  };

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    performSubmitComment();
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src="/assets/images/post_img.png" alt="" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{nameOf(post.author)}</h4>
              <p className="_feed_inner_timeline_post_box_para">{timeAgo(post.createdAt)} . &nbsp;
                <a href="#0">{post.privacyType === 'public' ? "Public" : "Private"}</a>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <div className="_feed_timeline_post_dropdown">
              <a
                href="#0"
                className="_feed_timeline_post_dropdown_link"
                onClick={(event) => {
                  event.preventDefault();
                  setDropdownOpen((value) => !value);
                }}
                aria-expanded={dropdownOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
              </a>
            </div>
            <div id="_timeline_drop" className={`_feed_timeline_dropdown _timeline_dropdown ${dropdownOpen ? "show" : ""}`}>
              <ul className="_feed_timeline_dropdown_list">
                {isOwnPost && (
                  <li className="_feed_timeline_dropdown_item">
                    <a
                      href="#0"
                      className="_feed_timeline_dropdown_link"
                      onClick={async (event) => {
                        event.preventDefault();
                        setDropdownOpen(false);
                        try {
                          await updatePost({
                            postId: post.id,
                            privacyType: post.privacyType === "public" ? "private" : "public",
                          }).unwrap();
                        } catch (error) {
                          console.error("Failed to update post privacy:", error);
                        }
                      }}
                    >
                      <span>
                        {post.privacyType === "public" ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1890FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1890FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        )}
                      </span>
                      {post.privacyType === "public" ? "Make Private" : "Make Public"}
                    </a>
                  </li>
                )}
                <li className="_feed_timeline_dropdown_item">
                  <a href="#0" className="_feed_timeline_dropdown_link">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                        <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M14.25 15.75L9 12l-5.25 3.75v-12a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v12z" />
                      </svg>
                    </span>
                    Save Post
                  </a>
                </li>
                <li className="_feed_timeline_dropdown_item">
                  <a href="#0" className="_feed_timeline_dropdown_link">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" fill="none" viewBox="0 0 20 22">
                        <path fill="#377DFF" fillRule="evenodd" d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Turn On Notification
                  </a>
                </li>
                <li className="_feed_timeline_dropdown_item">
                  <a href="#0" className="_feed_timeline_dropdown_link">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                        <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M14.25 2.25H3.75a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V3.75a1.5 1.5 0 00-1.5-1.5zM6.75 6.75l4.5 4.5M11.25 6.75l-4.5 4.5" />
                      </svg>
                    </span>
                    Hide
                  </a>
                </li>
                <li className="_feed_timeline_dropdown_item">
                  <a href="#0" className="_feed_timeline_dropdown_link">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                        <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M8.25 3H3a1.5 1.5 0 00-1.5 1.5V15A1.5 1.5 0 003 16.5h10.5A1.5 1.5 0 0015 15V9.75" />
                        <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M13.875 1.875a1.591 1.591 0 112.25 2.25L9 11.25 6 12l.75-3 7.125-7.125z" />
                      </svg>
                    </span>
                    Edit Post
                  </a>
                </li>
                <li className="_feed_timeline_dropdown_item">
                  <a href="#0" className="_feed_timeline_dropdown_link">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                        <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5zM7.5 8.25v4.5M10.5 8.25v4.5" />
                      </svg>
                    </span>
                    Delete Post
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>
        {imageUrl ? (
          <div className="_feed_inner_timeline_image">
            <img src={imageUrl} alt="" className="_time_img" />
          </div>
        ) : null}
      </div>
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image">
          {visibleReactImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt="Image"
              className={index === 0 ? "_react_img1" : "_react_img"}
            />
          ))}
          <p className={`_feed_inner_timeline_total_reacts_para ${visibleReactImages.length === 0 ? "_bs_react_count_solo" : ""}`}>
            {shortCount(optimisticLikeCount)}
          </p>
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para2">
            <span>{optimisticCommentCount}</span> {commentLabel}
          </p>
          &nbsp; &nbsp;
          <p className="_feed_inner_timeline_total_reacts_para2">
            <span>0</span> Share
          </p>
        </div>
      </div>
      <div className="_feed_inner_timeline_reaction">
        <button
          type="button"
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${optimisticLiked ? "_feed_reaction_active" : ""}`}
          onClick={handlePostReact}
        >
          <span className="_feed_inner_timeline_reaction_link"><span>
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
              <path fill="#FFCC4D" d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z" />
              <path fill="#664500" d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z" />
              <path fill="#fff" d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z" />
              <path fill="#664500" d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z" />
            </svg>
            &nbsp;
            Haha
          </span></span>
        </button>
        <button
          type="button"
          className={`_feed_inner_timeline_reaction_comment _feed_reaction ${showComments ? "_feed_reaction_active" : ""}`}
          onClick={() => {
            setShowComments((value) => {
              const next = !value;
              if (!next) {
                setShowAllComments(false);
              }
              return next;
            });
          }}
        >
          <span className="_feed_inner_timeline_reaction_link"><span>
            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
              <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
              <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
            </svg> &nbsp;
            Comment
          </span></span>
        </button>
        <button type="button" className="_feed_inner_timeline_reaction_share _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link"><span>
            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
              <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
            </svg>  &nbsp;
            Share
          </span></span>
        </button>
      </div>
      <div className="_feed_inner_timeline_cooment_area">
        <div className="_feed_inner_comment_box">
          <form className="_feed_inner_comment_box_form" onSubmit={submitComment}>
            <div className="_feed_inner_comment_box_content">
              <div className="_feed_inner_comment_box_content_image">
                <img src="/assets/images/comment_img.png" alt="" className="_comment_img" />
              </div>
              <div className="_feed_inner_comment_box_content_txt">
                <textarea
                  className="form-control _comment_textarea"
                  placeholder="Write a comment"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
                    if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey) {
                      event.preventDefault();
                      performSubmitComment();
                    }
                  }}
                />
              </div>
            </div>
            <div className="_feed_inner_comment_box_icon">
              <button className="_feed_inner_comment_box_icon_btn" type="submit" aria-label="Post comment">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
                  <path stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
                  <path stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                </svg>
              </button>
              <button className="_feed_inner_comment_box_icon_btn" type="button" aria-label="Attach image">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <rect width="18" height="18" x="3" y="3" stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path stroke="#8B8B8B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 15-5-5L5 21" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
      {showComments ? (
        <div className="_timline_comment_main">
          {(() => {
            const allComments = [...(comments?.data || []), ...pendingComments]
              .filter((comment, index, self) => self.findIndex(c => c.id === comment.id) === index);
            
            const totalCount = allComments.length;
            const hasMoreThanTwo = totalCount > 2;
            const visibleComments = !showAllComments && hasMoreThanTwo
              ? allComments.slice(totalCount - 2)
              : allComments;
            const previousCommentsCount = totalCount - 2;

            return (
              <>
                {hasMoreThanTwo && !showAllComments && (
                  <div className="_previous_comment">
                    <button
                      type="button"
                      className="_previous_comment_txt"
                      onClick={() => setShowAllComments(true)}
                    >
                      View {previousCommentsCount} previous {previousCommentsCount === 1 ? "comment" : "comments"}
                    </button>
                  </div>
                )}
                {visibleComments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}

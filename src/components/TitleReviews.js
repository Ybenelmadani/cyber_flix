import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CornerDownRight, Star, Trash2 } from "lucide-react";
import { moviesAPI } from "../services/api";

const DEFAULT_SUMMARY = {
  averageRating: 0,
  ratingsCount: 0,
  commentsCount: 0,
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeRating = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 5;
  return Math.min(5, Math.max(1, Math.round(numeric)));
};

const normalizeReplies = (replies = []) =>
  replies.map((reply) => ({
    ...reply,
    children: normalizeReplies(Array.isArray(reply.children) ? reply.children : []),
  }));

export default function TitleReviews({
  mediaType = "movie",
  itemId,
  labels = {},
  currentUser = null,
  onRequireAuth = () => {},
}) {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [replyDraft, setReplyDraft] = useState({
    reviewId: "",
    parentReplyId: null,
    parentUserName: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const text = useMemo(
    () => ({
      title: labels.reviewsTitle || "Community reviews",
      subtitle:
        labels.reviewsSubtitle ||
        "Share your opinion and rating with other viewers.",
      average: labels.reviewsAverage || "Average",
      ratingsCount: labels.reviewsRatingsCount || "Ratings",
      commentsCount: labels.reviewsCommentsCount || "Comments",
      myRating: labels.reviewsMyRating || "Your rating",
      myComment: labels.reviewsMyComment || "Your comment",
      myCommentPlaceholder:
        labels.reviewsMyCommentPlaceholder ||
        "Write your opinion about this title...",
      save: labels.reviewsSave || "Publish review",
      update: labels.reviewsUpdate || "Update review",
      remove: labels.reviewsDelete || "Delete my review",
      empty:
        labels.reviewsEmpty ||
        "No reviews yet. Be the first to share your opinion.",
      loginHint:
        labels.reviewsLoginHint || "Sign in to post your review and rating.",
      postedOn: labels.reviewsPostedOn || "Posted",
      edited: labels.reviewsEdited || "edited",
      replyAction: labels.reviewsReply || "Reply",
      replyPlaceholder:
        labels.reviewsReplyPlaceholder || "Write your reply...",
      postReply: labels.reviewsPostReply || "Post reply",
      cancelReply: labels.reviewsCancelReply || "Cancel",
      deleteReply: labels.reviewsDeleteReply || "Delete reply",
      replyingTo: labels.reviewsReplyingTo || "Replying to",
    }),
    [labels]
  );

  const applyServerData = useCallback((payload) => {
    const nextSummary = payload?.summary || DEFAULT_SUMMARY;
    const nextReviewsRaw = Array.isArray(payload?.reviews) ? payload.reviews : [];
    const nextReviews = nextReviewsRaw.map((review) => ({
      ...review,
      replies: normalizeReplies(Array.isArray(review.replies) ? review.replies : []),
    }));
    const nextMyReview = payload?.myReview || null;

    setSummary({
      averageRating: Number(nextSummary.averageRating || 0),
      ratingsCount: Number(nextSummary.ratingsCount || 0),
      commentsCount: Number(nextSummary.commentsCount || 0),
    });
    setReviews(nextReviews);
    setMyReview(nextMyReview);
    setForm({
      rating: normalizeRating(nextMyReview?.rating || 5),
      comment: nextMyReview?.comment || "",
    });
  }, []);

  const loadReviews = useCallback(async () => {
    if (!itemId) return;
    setIsLoading(true);
    setError("");

    try {
      const data = await moviesAPI.getReviews(mediaType, itemId);
      applyServerData(data);
    } catch (err) {
      setError(err.message || "Unable to load reviews.");
    } finally {
      setIsLoading(false);
    }
  }, [applyServerData, itemId, mediaType]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const data = await moviesAPI.upsertReview(mediaType, itemId, {
        rating: normalizeRating(form.rating),
        comment: String(form.comment || "").trim(),
      });
      applyServerData(data);
    } catch (err) {
      setError(err.message || "Unable to save review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser || !myReview) return;
    setIsSubmitting(true);
    setError("");

    try {
      const data = await moviesAPI.deleteReview(mediaType, itemId);
      applyServerData(data);
      setReplyDraft({
        reviewId: "",
        parentReplyId: null,
        parentUserName: "",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Unable to delete review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startReply = (reviewId, parentReplyId = null, parentUserName = "") => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    setReplyDraft({
      reviewId: String(reviewId),
      parentReplyId,
      parentUserName,
      message: "",
    });
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    const reviewId = String(replyDraft.reviewId || "");
    const message = String(replyDraft.message || "").trim();
    if (!reviewId || !message) return;

    setIsSubmitting(true);
    setError("");

    try {
      const data = await moviesAPI.createReviewReply(mediaType, itemId, reviewId, {
        message,
        parentReplyId: replyDraft.parentReplyId || null,
      });
      applyServerData(data);
      setReplyDraft({
        reviewId: "",
        parentReplyId: null,
        parentUserName: "",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Unable to post reply.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const data = await moviesAPI.deleteReviewReply(
        mediaType,
        itemId,
        reviewId,
        replyId
      );
      applyServerData(data);
    } catch (err) {
      setError(err.message || "Unable to delete reply.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReplies = (reviewId, replies = [], depth = 0) =>
    replies.map((reply) => (
      <div
        key={reply.id}
        className="mt-3 rounded-xl border border-cyber-cyan/12 bg-cyber-dark/35 px-3 py-2.5"
        style={{ marginInlineStart: `${Math.min(depth, 3) * 14}px` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-cyan-50 sm:text-sm">
            {reply.user?.name || "User"}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => startReply(reviewId, reply.id, reply.user?.name || "User")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-cyber-cyan transition hover:text-cyber-fuchsia"
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              {text.replyAction}
            </button>

            {reply.isOwner ? (
              <button
                type="button"
                onClick={() => handleDeleteReply(reviewId, reply.id)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-200 transition hover:text-rose-100 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {text.deleteReply}
              </button>
            ) : null}
          </div>
        </div>

        <p className="mt-1 text-xs leading-6 text-cyber-cyan/85 sm:text-sm">
          {reply.message}
        </p>

        <p className="mt-1 text-[11px] text-cyber-cyan/55">
          {text.postedOn}: {formatDate(reply.createdAt)}
          {reply.editedAt ? ` (${text.edited})` : ""}
        </p>

        {Array.isArray(reply.children) && reply.children.length > 0
          ? renderReplies(reviewId, reply.children, depth + 1)
          : null}
      </div>
    ));

  return (
    <section className="card-neon p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-2">
        <h3 className="text-xl font-bold text-cyber-cyan">{text.title}</h3>
        <p className="text-sm text-cyber-cyan/70">{text.subtitle}</p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyber-cyan/15 bg-cyber-dark/45 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-cyber-cyan/60">
            {text.average}
          </p>
          <p className="mt-1 text-lg font-bold text-cyan-50">
            {summary.averageRating ? `${summary.averageRating}/5` : "0/5"}
          </p>
        </div>
        <div className="rounded-2xl border border-cyber-cyan/15 bg-cyber-dark/45 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-cyber-cyan/60">
            {text.ratingsCount}
          </p>
          <p className="mt-1 text-lg font-bold text-cyan-50">{summary.ratingsCount}</p>
        </div>
        <div className="rounded-2xl border border-cyber-cyan/15 bg-cyber-dark/45 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-cyber-cyan/60">
            {text.commentsCount}
          </p>
          <p className="mt-1 text-lg font-bold text-cyan-50">{summary.commentsCount}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-5 space-y-3 rounded-2xl border border-cyber-cyan/15 bg-cyber-dark/40 p-4"
      >
        <div className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)]">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-cyan-50">{text.myRating}</span>
            <select
              value={form.rating}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, rating: normalizeRating(event.target.value) }))
              }
              className="rounded-xl border border-cyber-cyan/25 bg-cyber-darker/70 px-3 py-2 text-sm text-cyber-cyan outline-none focus:border-cyber-fuchsia"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-cyan-50">{text.myComment}</span>
            <textarea
              value={form.comment}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, comment: event.target.value.slice(0, 800) }))
              }
              rows={3}
              maxLength={800}
              placeholder={text.myCommentPlaceholder}
              className="resize-y rounded-xl border border-cyber-cyan/25 bg-cyber-darker/70 px-3 py-2 text-sm text-cyber-cyan placeholder-cyber-cyan/45 outline-none focus:border-cyber-fuchsia"
            />
          </label>
        </div>

        {!currentUser ? (
          <button
            type="button"
            onClick={onRequireAuth}
            className="inline-flex rounded-xl border border-cyber-fuchsia/35 px-4 py-2 text-sm font-semibold text-cyber-fuchsia transition hover:bg-cyber-fuchsia/10"
          >
            {text.loginHint}
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex rounded-xl border border-cyber-cyan/25 bg-cyber-darker/70 px-4 py-2 text-sm font-semibold text-cyber-cyan transition hover:border-cyber-fuchsia hover:text-cyber-fuchsia disabled:opacity-60"
            >
              {myReview ? text.update : text.save}
            </button>

            {myReview ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="inline-flex rounded-xl border border-rose-300/35 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10 disabled:opacity-60"
              >
                {text.remove}
              </button>
            ) : null}
          </div>
        )}
      </form>

      {error ? (
        <p className="mb-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-cyber-cyan/70">Loading reviews...</p>
      ) : reviews.length ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-cyber-cyan/12 bg-cyber-dark/35 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-cyan-50">
                  {review.user?.name || "User"}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border border-cyber-cyan/25 bg-cyber-cyan/10 px-2.5 py-1 text-xs font-semibold text-cyber-cyan">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {review.rating}/5
                </span>
              </div>

              {review.comment ? (
                <p className="mt-2 text-sm leading-6 text-cyber-cyan/80">{review.comment}</p>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-cyber-cyan/55">
                  {text.postedOn}: {formatDate(review.createdAt)}
                  {review.editedAt ? ` (${text.edited})` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => startReply(review.id, null, review.user?.name || "User")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyber-cyan transition hover:text-cyber-fuchsia"
                >
                  <CornerDownRight className="h-3.5 w-3.5" />
                  {text.replyAction}
                </button>
              </div>

              {Array.isArray(review.replies) && review.replies.length > 0
                ? renderReplies(review.id, review.replies, 0)
                : null}

              {replyDraft.reviewId === review.id ? (
                <form
                  onSubmit={handleReplySubmit}
                  className="mt-3 space-y-2 rounded-xl border border-cyber-cyan/12 bg-cyber-dark/45 p-3"
                >
                  {replyDraft.parentUserName ? (
                    <p className="text-xs text-cyber-cyan/65">
                      {text.replyingTo}: {replyDraft.parentUserName}
                    </p>
                  ) : null}

                  <textarea
                    value={replyDraft.message}
                    onChange={(event) =>
                      setReplyDraft((prev) => ({
                        ...prev,
                        message: event.target.value.slice(0, 800),
                      }))
                    }
                    rows={2}
                    maxLength={800}
                    placeholder={text.replyPlaceholder}
                    className="w-full resize-y rounded-xl border border-cyber-cyan/25 bg-cyber-darker/70 px-3 py-2 text-sm text-cyber-cyan placeholder-cyber-cyan/45 outline-none focus:border-cyber-fuchsia"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !replyDraft.message.trim()}
                      className="inline-flex rounded-xl border border-cyber-cyan/25 bg-cyber-darker/70 px-3 py-1.5 text-xs font-semibold text-cyber-cyan transition hover:border-cyber-fuchsia hover:text-cyber-fuchsia disabled:opacity-60"
                    >
                      {text.postReply}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReplyDraft({
                          reviewId: "",
                          parentReplyId: null,
                          parentUserName: "",
                          message: "",
                        })
                      }
                      className="inline-flex rounded-xl border border-cyber-cyan/25 px-3 py-1.5 text-xs font-semibold text-cyber-cyan/80 transition hover:text-cyber-cyan"
                    >
                      {text.cancelReply}
                    </button>
                  </div>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-cyber-cyan/70">{text.empty}</p>
      )}
    </section>
  );
}

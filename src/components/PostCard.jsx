import { useState } from "react";
import { reactToPost, getComments, addComment, deletePost, deleteComment, getCurrentUserId } from "../services/api";
import { IconTrash } from "./Icons";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

function PostCard({ post, onUpdated }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const userId = getCurrentUserId();
  const isOwner = post.user_id === userId;

  async function handleReact(emoji) {
    try {
      await reactToPost(post.id, userId, emoji);
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleComments() {
    if (!showComments) {
      try {
        const res = await getComments(post.id);
        setComments(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    setShowComments(!showComments);
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addComment(post.id, userId, newComment);
      setNewComment("");
      const res = await getComments(post.id);
      setComments(res.data);
      onUpdated();
    } catch (err) {
      alert("Erreur");
    }
  }

  async function handleDeletePost() {
    if (!confirm("Supprimer cette photo ?")) return;
    try {
      await deletePost(post.id);
      onUpdated();
    } catch (err) {
      alert("Erreur");
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await deleteComment(commentId);
      const res = await getComments(post.id);
      setComments(res.data);
      onUpdated();
    } catch (err) {
      alert("Erreur");
    }
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar">{post.user_avatar || "🙂"}</div>
        <div className="post-header-text">
          <p className="post-author">{post.user_name}</p>
          <p className="post-meta">
            {post.habit_title && `${post.habit_title}${post.habit_streak ? ` · 🔥${post.habit_streak}j` : ""} · `}
            {timeAgo(post.created_at)}
          </p>
        </div>
        {isOwner && (
          <span className="post-delete-btn" onClick={handleDeletePost}>
            <IconTrash size={15} />
          </span>
        )}
      </div>

      <img src={`http://127.0.0.1:8000${post.photo_url}`} alt="preuve" className="post-image" />

      {post.caption && <p className="post-caption">{post.caption}</p>}

      <div className="post-actions-row">
        {post.ai_verified ? (
          <span className="ai-badge verified">✓ Vérifié par IA</span>
        ) : (
          <span className="ai-badge unverified">Non vérifié</span>
        )}
        <div className="reaction-buttons">
          {post.reactions.map((r) => (
            <button
              key={r.emoji}
              className={`reaction-btn ${r.count > 0 ? "active" : ""}`}
              onClick={() => handleReact(r.emoji)}
            >
              <span>{r.emoji}</span>
              {r.count > 0 && <span className="reaction-count">{r.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="comments-section">
        <span className="comments-toggle" onClick={toggleComments}>
          {post.comment_count > 0
            ? `${post.comment_count} commentaire${post.comment_count > 1 ? "s" : ""}`
            : "Ajouter un commentaire"}
        </span>

        {showComments && (
          <>
            {comments.map((c) => (
              <div key={c.id} className="comment-row">
                <div className="comment-avatar">{c.user_avatar || "🙂"}</div>
                <p className="comment-text">
                  <span className="comment-author">{c.user_name}</span> {c.text}
                </p>
                {c.user_id === userId && (
                  <span className="comment-delete" onClick={() => handleDeleteComment(c.id)}>✕</span>
                )}
              </div>
            ))}
            <form onSubmit={handleAddComment} className="comment-form">
              <input
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit">Envoyer</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default PostCard;

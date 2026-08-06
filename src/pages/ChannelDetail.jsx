import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getChannels, searchUsers, inviteUser, getPendingMembers,
  approveMember, rejectMember, getHabits, uploadPost, getChannelPostsFull,
  getChannelRanking, getUser, getChannelMembers, deleteChannel, getCurrentUserId,
} from "../services/api";
import { IconMessages, IconUser, IconTrash } from "../components/Icons";
import PostCard from "../components/PostCard";

function ChannelDetail() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const userId = getCurrentUserId();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [channel, setChannel] = useState(null);
  const [me, setMe] = useState(null);
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [posts, setPosts] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [myHabits, setMyHabits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [caption, setCaption] = useState("");
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const allRes = await getChannels();
      const found = allRes.data.find((c) => c.id === channelId);
      setChannel(found);

      const postsRes = await getChannelPostsFull(channelId);
      setPosts(postsRes.data);

      const rankingRes = await getChannelRanking(channelId);
      setRanking(rankingRes.data.filter((r) => r.verified_count > 0).slice(0, 5));

      const meRes = await getUser(userId);
      setMe(meRes.data);

      const membersRes = await getChannelMembers(channelId);
      setMembers(membersRes.data);

      const habitsRes = await getHabits(userId);
      setMyHabits(habitsRes.data.filter((h) => h.title !== "string"));

      if (found && found.owner_id === userId) {
        const pendingRes = await getPendingMembers(channelId);
        setPending(pendingRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchUsers(q);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleInvite(invitedUserId) {
    try {
      await inviteUser(channelId, invitedUserId);
      setSearchQuery("");
      setSearchResults([]);
      alert("Invitation envoyée !");
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur");
    }
  }

  function handleCopyLink() {
    const link = `https://flockup-frontend.vercel.app/channels/${channelId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleApprove(pendingUserId) {
    try {
      await approveMember(channelId, pendingUserId);
      loadData();
    } catch (err) {
      alert("Erreur");
    }
  }

  async function handleReject(pendingUserId) {
    try {
      await rejectMember(channelId, pendingUserId);
      loadData();
    } catch (err) {
      alert("Erreur");
    }
  }

  async function handleDeleteChannel() {
    if (!confirm("Supprimer définitivement ce channel ?")) return;
    try {
      await deleteChannel(channelId, userId);
      navigate("/channels");
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur");
    }
  }

  async function handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("channel_id", channelId);
    if (selectedHabitId) formData.append("habit_id", selectedHabitId);
    if (caption) formData.append("caption", caption);
    formData.append("photo", file);

    try {
      await uploadPost(userId, formData);
      setCaption("");
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de l'envoi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (loading) return <div className="page"><p>Chargement...</p></div>;
  if (!channel) return <div className="page"><p className="empty-state">Channel introuvable.</p></div>;

  const isOwner = channel.owner_id === userId;

  return (
    <div className="page">
      <span className="back-link" onClick={() => navigate("/channels")}>‹ Retour</span>

      <div className="channel-hero">
        <p className="channel-hero-title">{channel.name}</p>
        <p className="channel-hero-meta">
          {channel.member_count} {channel.member_count === 1 ? "membre" : "membres"}
          {channel.goal_topic && ` · ${channel.goal_topic}`}
          {channel.is_private && " · Privé"}
        </p>

        <div className="hero-avatars-row">
          <div className="hero-share-circle" onClick={handleCopyLink}>
            {copied ? "✓" : "🔗"}
          </div>
          <div className="hero-add-circle" onClick={() => setShowAddMenu(!showAddMenu)}>+</div>
          {members.slice(0, 5).map((m) => (
            <div key={m.user_id} className="hero-avatar-circle" title={m.name}>
              {m.avatar_url || "🙂"}
            </div>
          ))}
          {members.length > 5 && (
            <div className="hero-avatar-circle hero-avatar-more">+{members.length - 5}</div>
          )}
        </div>

        {showAddMenu && (
          <>
            <div className="hero-menu-overlay" onClick={() => setShowAddMenu(false)} />
            <div className="hero-add-menu">
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={handleSearch}
                className="hero-invite-search"
                autoFocus
              />
              {searchResults.map((u) => (
                <div key={u.id} className="hero-invite-result">
                  <div className="invite-avatar">{u.avatar_url || <IconUser size={16} />}</div>
                  <div className="invite-result-text">
                    <p className="invite-result-name">{u.name}</p>
                    <p className="invite-result-email">{u.email}</p>
                  </div>
                  <button className="btn-join-pro" onClick={() => handleInvite(u.id)}>Inviter</button>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {channel.description && <p className="channel-detail-desc">{channel.description}</p>}

      {ranking.length > 0 && (
        <>
          <p className="section-label" style={{ marginTop: 20 }}>Classement de la semaine</p>
          <div className="ranking-card">
            {ranking.map((r, i) => (
              <div key={r.user_id} className="ranking-row">
                <span className="ranking-position">{i + 1}</span>
                <div className="ranking-avatar">{r.avatar_url || "🙂"}</div>
                <span className="ranking-name">{r.name}</span>
                <span className="ranking-count">{r.verified_count} preuve{r.verified_count > 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="section-label" style={{ marginTop: 20 }}>Ajouter une preuve</p>
      <div className="add-proof-card">
        <div className="add-proof-buttons">
          <div className="add-proof-btn" onClick={() => !uploading && cameraInputRef.current?.click()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>Caméra</span>
          </div>
          <div className="add-proof-btn" onClick={() => !uploading && fileInputRef.current?.click()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 19" />
            </svg>
            <span>Galerie</span>
          </div>
        </div>

        {myHabits.length > 0 && (
          <select
            className="habit-select-inline"
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
          >
            <option value="">Aucune habitude liée</option>
            {myHabits.map((h) => (
              <option key={h.id} value={h.id}>{h.title}</option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder="Écris une légende..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="caption-input-inline"
        />

        {uploading && <p className="uploading-text">Analyse IA en cours...</p>}
      </div>

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden-date-input" onChange={handleFileSelected} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden-date-input" onChange={handleFileSelected} />

      <p className="section-label" style={{ marginTop: 20 }}>Preuves partagées</p>
      {posts.length === 0 && <p className="empty-state">Aucune photo pour le moment.</p>}
      {posts.map((p) => (
        <PostCard key={p.id} post={p} onUpdated={loadData} />
      ))}

      {isOwner && pending.length > 0 && (
        <>
          <p className="section-label" style={{ marginTop: 20 }}>Demandes en attente ({pending.length})</p>
          {pending.map((p) => (
            <div key={p.user_id} className="pending-row">
              <div className="invite-avatar">{p.avatar_url || <IconUser size={16} />}</div>
              <div className="invite-result-text">
                <p className="invite-result-name">{p.name}</p>
                <p className="invite-result-email">{p.email}</p>
              </div>
              <div className="pending-actions">
                <button className="btn-approve" onClick={() => handleApprove(p.user_id)}>✓</button>
                <button className="btn-reject" onClick={() => handleReject(p.user_id)}>✕</button>
              </div>
            </div>
          ))}
        </>
      )}

      {isOwner && (
        <div className="danger-zone">
          <p className="danger-zone-title">Zone dangereuse</p>
          <button className="btn-delete-account" onClick={handleDeleteChannel}>
            Supprimer ce channel
          </button>
        </div>
      )}
    </div>
  );
}

export default ChannelDetail;
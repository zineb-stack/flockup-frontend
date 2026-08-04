import { useState, useEffect } from "react";
import { useSearchParams , useNavigate } from "react-router-dom";
import { getChannels, getMyChannels, joinChannel, getRecommendedChannels, getCurrentUserId } from "../services/api";
import api from "../services/api";
import { IconMessages, IconChevronRight, IconPlus } from "../components/Icons";

const CATEGORY_ICONS = {
  lecture: "success",
  sport: "danger",
  meditation: "pro",
  productivite: "warning",
  sante: "success",
  finance: "warning",
  default: "neutral",
};

function getIconClass(topic) {
  return CATEGORY_ICONS[(topic || "").toLowerCase()] || CATEGORY_ICONS.default;
}

function ChannelRow({ channel, actionType, onAction, onClick  }) {
  return (
    <div className="channel-row" onClick={actionType === "view" ? onClick : undefined} style={{ cursor: actionType === "view" ? "pointer" : "default" }}>
      <div className={`channel-icon-box ${getIconClass(channel.goal_topic)}`}>
        <IconMessages size={19} />
      </div>
      <div className="channel-row-main">
        <p className="channel-row-title">{channel.name}</p>
        <p className="channel-row-meta">
          {channel.goal_topic ? `${channel.goal_topic} · ` : ""}
          {channel.member_count} {channel.member_count === 1 ? "membre" : "membres"}
        </p>
      </div>
      {actionType === "join" ? (
        <button className="btn-join-pro" onClick={() => onAction(channel.id)}>
          Rejoindre
        </button>
      ) : (
        <IconChevronRight size={16} />
      )}
    </div>
  );
}

function Channels() {
  const [myChannels, setMyChannels] = useState([]);
  const [allChannels, setAllChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreate, setShowCreate] = useState(searchParams.get("create") === "1");
  const [form, setForm] = useState({ name: "", description: "", goal_topic: "", is_private: false });
  const userId = getCurrentUserId();
  const navigate = useNavigate();

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setShowCreate(true);
    }
  }, [searchParams]);

  async function loadAll() {
    setLoading(true);
    try {
      const [mineRes, allRes] = await Promise.all([
        getMyChannels(userId),
        getChannels(),
      ]);
      setMyChannels(mineRes.data);
      const myIds = mineRes.data.map((c) => c.id);
      setAllChannels(allRes.data.filter((c) => !myIds.includes(c.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(channelId) {
    try {
      await joinChannel(channelId, userId);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur");
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await api.post(`/channels/${userId}`, form);
      setForm({ name: "", description: "", goal_topic: "" , is_private: false });
      setShowCreate(false);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la création");
    }
  }

  if (loading) return <div className="page"><p>Chargement...</p></div>;

  return (
    <div className="page">
      <div className="channels-header-row">
        <div className="section-header">
          <div className="section-title-row">
            <span className="section-title-icon"><IconMessages size={18} /></span>
            <span className="section-title">Channels</span>
          </div>
          <div className="section-underline" />
        </div>
        <button className="btn-create-channel" onClick={() => setShowCreate(true)}>
          <IconPlus size={14} /> Créer
        </button>
      </div>

      <p className="section-label" style={{ marginTop: 10 }}>Mes channels</p>
      {myChannels.length === 0 && <p className="empty-state">Tu n'as rejoint aucun channel.</p>}
      {myChannels.map((c) => (
        <ChannelRow key={c.id} channel={c} actionType="view" onClick={() => navigate(`/channels/${c.id}`)} />
      ))}

      <p className="section-label" style={{ marginTop: 24 }}>Recommandés pour toi</p>
      {allChannels.length === 0 && <p className="empty-state">Aucune recommandation pour le moment.</p>}
      {allChannels.map((c) => (
        <ChannelRow key={c.id} channel={c} actionType="join" onAction={handleJoin} />
      ))}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Nouveau channel</h3>
            <form onSubmit={handleCreate}>
              <input
                placeholder="Nom du channel"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoFocus
                required
              />
              <input
                placeholder="Thème (ex: sport, lecture...)"
                value={form.goal_topic}
                onChange={(e) => setForm({ ...form, goal_topic: e.target.value })}
                style={{ marginTop: 10 }}
              />
              <textarea
                placeholder="Description (optionnel)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                style={{ marginTop: 10, width: "100%", padding: 11, borderRadius: 10, border: "1px solid var(--border-color)" }}
              />
              <div className="privacy-toggle">
                <span
                  className={!form.is_private ? "active" : ""}
                  onClick={() => setForm({ ...form, is_private: false })}
                >
                  Public
                </span>
                <span
                  className={form.is_private ? "active" : ""}
                  onClick={() => setForm({ ...form, is_private: true })}
                >
                  Privé
                </span>
              </div>
              <div className="modal-actions" style={{ marginTop: 14 }}>

                <button type="button" className="btn-cancel" onClick={() => setShowCreate(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-confirm">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Channels;
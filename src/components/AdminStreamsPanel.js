import React, { useCallback, useEffect, useMemo, useState } from "react";
import { streamsAPI } from "../services/api";

const emptyForm = {
  id: "",
  tmdbId: "",
  mediaType: "movie",
  seasonNumber: "",
  episodeNumber: "",
  title: "",
  poster: "",
  sourceName: "",
  sourceUrl: "",
  sourceType: "hls",
  sourceQuality: "720p",
  sourceLanguage: "VO",
  isPremium: false,
};

const toFormState = (stream) => {
  const source = stream?.sources?.[0] || {};
  return {
    id: stream?._id || "",
    tmdbId: stream?.tmdbId || "",
    mediaType: stream?.mediaType || "movie",
    seasonNumber:
      stream?.seasonNumber === null || stream?.seasonNumber === undefined
        ? ""
        : String(stream.seasonNumber),
    episodeNumber:
      stream?.episodeNumber === null || stream?.episodeNumber === undefined
        ? ""
        : String(stream.episodeNumber),
    title: stream?.title || "",
    poster: stream?.poster || "",
    sourceName: source?.name || "",
    sourceUrl: source?.url || "",
    sourceType: source?.type || "hls",
    sourceQuality: source?.quality || "720p",
    sourceLanguage: source?.language || "VO",
    isPremium: Boolean(source?.isPremium),
  };
};

const buildPayload = (form) => ({
  tmdbId: String(form.tmdbId).trim(),
  mediaType: form.mediaType,
  seasonNumber: form.mediaType === "tv" ? Number(form.seasonNumber) : null,
  episodeNumber: form.mediaType === "tv" ? Number(form.episodeNumber) : null,
  title: String(form.title).trim(),
  poster: String(form.poster || "").trim(),
  sources: [
    {
      name: String(form.sourceName || "").trim(),
      url: String(form.sourceUrl).trim(),
      type: form.sourceType || "hls",
      quality: String(form.sourceQuality || "").trim(),
      language: String(form.sourceLanguage || "").trim(),
      isPremium: Boolean(form.isPremium),
    },
  ],
});

export default function AdminStreamsPanel({ user, onBack }) {
  const [filters, setFilters] = useState({ mediaType: "", tmdbId: "" });
  const [streams, setStreams] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";
  const isEditing = Boolean(form.id);

  const filteredSummary = useMemo(() => {
    const parts = [];
    if (filters.mediaType) parts.push(filters.mediaType);
    if (filters.tmdbId) parts.push(`tmdbId ${filters.tmdbId}`);
    return parts.join(" - ");
  }, [filters.mediaType, filters.tmdbId]);

  const loadStreams = useCallback(async (nextFilters = filters) => {
    if (!isAdmin) return;

    setLoading(true);
    setError("");
    setFeedback("");

    try {
      const response = await streamsAPI.list(nextFilters);
      setStreams(response.streams || []);
    } catch (err) {
      setError(err.message || "Unable to load streams.");
    } finally {
      setLoading(false);
    }
  }, [filters, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadStreams();
    }
  }, [isAdmin, loadStreams]);

  const resetForm = () => {
    setForm(emptyForm);
    setFeedback("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const payload = buildPayload(form);
      if (!payload.tmdbId || !payload.title || !payload.sources[0].url) {
        throw new Error("tmdbId, title and source URL are required.");
      }

      if (payload.mediaType === "tv" && (!form.seasonNumber || !form.episodeNumber)) {
        throw new Error("Season and episode numbers are required for series.");
      }

      if (isEditing) {
        await streamsAPI.update(form.id, payload);
        setFeedback("Stream updated successfully.");
      } else {
        await streamsAPI.create(payload);
        setFeedback("Stream created successfully.");
      }

      resetForm();
      await loadStreams();
    } catch (err) {
      setError(err.message || "Unable to save stream.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    setFeedback("");

    try {
      await streamsAPI.remove(id);
      if (form.id === id) {
        resetForm();
      }
      setFeedback("Stream deleted successfully.");
      await loadStreams();
    } catch (err) {
      setError(err.message || "Unable to delete stream.");
    }
  };

  if (!user) {
    return (
      <section className="card-neon p-6">
        <h2 className="text-2xl font-bold text-cyber-cyan">Admin Streams</h2>
        <p className="mt-3 text-cyber-cyan/75">
          Sign in with an admin account to manage streams.
        </p>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="card-neon p-6">
        <h2 className="text-2xl font-bold text-cyber-cyan">Admin Streams</h2>
        <p className="mt-3 text-rose-200">
          Your account does not have admin access.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="card-neon p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cyber-cyan">Admin Streams</h2>
            <p className="mt-2 max-w-3xl text-sm text-cyber-cyan/70">
              Create and maintain local movie and episode streams tied to TMDB ids.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-cyber-cyan/25 bg-cyber-darker/70 px-4 py-2 text-sm font-semibold text-cyber-cyan transition hover:border-cyber-fuchsia hover:text-cyber-fuchsia"
          >
            Back to catalog
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="card-neon p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-cyber-cyan">
              {isEditing ? "Edit Stream" : "Create Stream"}
            </h3>
            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-cyber-cyan/70 hover:text-cyber-fuchsia"
              >
                New entry
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={form.tmdbId}
                onChange={(e) => setForm((prev) => ({ ...prev, tmdbId: e.target.value }))}
                placeholder="TMDB id"
                className="input-cyber w-full"
              />
              <select
                value={form.mediaType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    mediaType: e.target.value,
                    seasonNumber: e.target.value === "movie" ? "" : prev.seasonNumber,
                    episodeNumber: e.target.value === "movie" ? "" : prev.episodeNumber,
                  }))
                }
                className="input-cyber w-full"
              >
                <option value="movie">movie</option>
                <option value="tv">tv</option>
              </select>
            </div>

            {form.mediaType === "tv" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  min="1"
                  value={form.seasonNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, seasonNumber: e.target.value }))}
                  placeholder="Season number"
                  className="input-cyber w-full"
                />
                <input
                  type="number"
                  min="1"
                  value={form.episodeNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, episodeNumber: e.target.value }))}
                  placeholder="Episode number"
                  className="input-cyber w-full"
                />
              </div>
            ) : null}

            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Title"
              className="input-cyber w-full"
            />

            <input
              type="text"
              value={form.poster}
              onChange={(e) => setForm((prev) => ({ ...prev, poster: e.target.value }))}
              placeholder="Poster path or URL (optional)"
              className="input-cyber w-full"
            />

            <input
              type="text"
              value={form.sourceName}
              onChange={(e) => setForm((prev) => ({ ...prev, sourceName: e.target.value }))}
              placeholder="Source name"
              className="input-cyber w-full"
            />

            <input
              type="text"
              value={form.sourceUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, sourceUrl: e.target.value }))}
              placeholder="Source URL"
              className="input-cyber w-full"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={form.sourceType}
                onChange={(e) => setForm((prev) => ({ ...prev, sourceType: e.target.value }))}
                className="input-cyber w-full"
              >
                <option value="hls">hls</option>
                <option value="mp4">mp4</option>
              </select>

              <input
                type="text"
                value={form.sourceQuality}
                onChange={(e) => setForm((prev) => ({ ...prev, sourceQuality: e.target.value }))}
                placeholder="720p"
                className="input-cyber w-full"
              />

              <input
                type="text"
                value={form.sourceLanguage}
                onChange={(e) => setForm((prev) => ({ ...prev, sourceLanguage: e.target.value }))}
                placeholder="VO"
                className="input-cyber w-full"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-cyber-cyan/80">
              <input
                type="checkbox"
                checked={form.isPremium}
                onChange={(e) => setForm((prev) => ({ ...prev, isPremium: e.target.checked }))}
              />
              Premium only
            </label>

            {error ? <p className="text-sm text-rose-200">{error}</p> : null}
            {feedback ? <p className="text-sm text-emerald-200">{feedback}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="btn-cyber w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : isEditing ? "Update stream" : "Create stream"}
            </button>
          </form>
        </div>

        <div className="card-neon p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-xl font-bold text-cyber-cyan">Existing Streams</h3>
              <p className="mt-2 text-sm text-cyber-cyan/70">
                {filteredSummary
                  ? `Filtered by ${filteredSummary}`
                  : "Browse all seeded and custom streams."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[140px_1fr_auto]">
              <select
                value={filters.mediaType}
                onChange={(e) => setFilters((prev) => ({ ...prev, mediaType: e.target.value }))}
                className="input-cyber w-full"
              >
                <option value="">all</option>
                <option value="movie">movie</option>
                <option value="tv">tv</option>
              </select>

              <input
                type="text"
                value={filters.tmdbId}
                onChange={(e) => setFilters((prev) => ({ ...prev, tmdbId: e.target.value }))}
                placeholder="Filter by TMDB id"
                className="input-cyber w-full"
              />

              <button
                type="button"
                onClick={() => loadStreams(filters)}
                className="rounded-xl border border-cyber-cyan/25 bg-cyber-darker/70 px-4 py-2 text-sm font-semibold text-cyber-cyan transition hover:border-cyber-fuchsia hover:text-cyber-fuchsia"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="text-cyber-cyan/70">Loading streams...</p>
            ) : streams.length === 0 ? (
              <p className="text-cyber-cyan/70">No streams found.</p>
            ) : (
              streams.map((stream) => {
                const source = stream.sources?.[0] || {};
                return (
                  <article
                    key={stream._id}
                    className="rounded-[1.5rem] border border-cyber-cyan/15 bg-cyber-dark/45 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1">
                        <h4 className="text-base font-semibold text-cyan-50">
                          {stream.title}
                        </h4>
                        <p className="text-sm text-cyber-cyan/70">
                          {stream.mediaType === "tv"
                            ? `tv / TMDB ${stream.tmdbId} / S${stream.seasonNumber}E${stream.episodeNumber}`
                            : `movie / TMDB ${stream.tmdbId}`}
                        </p>
                        <p className="text-sm text-cyber-cyan/70 break-all">
                          {source.url || "No source URL"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setForm(toFormState(stream))}
                          className="rounded-xl border border-cyber-cyan/25 px-4 py-2 text-sm font-semibold text-cyber-cyan transition hover:border-cyber-fuchsia hover:text-cyber-fuchsia"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(stream._id)}
                          className="rounded-xl border border-rose-400/30 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

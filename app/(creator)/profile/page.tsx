"use client";

import { FormEvent, useEffect, useState } from "react";
import { Camera, MapPin, Star } from "lucide-react";

type CreatorProfile = {
  full_name: string;
  professional_name: string;
  creator_type: string;
  bio: string;
  location: string;
  availability: string;
  avatar_url: string;
  skills: string;
  genres: string;
};

const emptyProfile: CreatorProfile = {
  full_name: "",
  professional_name: "",
  creator_type: "",
  bio: "",
  location: "",
  availability: "",
  avatar_url: "",
  skills: "",
  genres: "",
};

export default function CreatorProfilePage() {
  const [profile, setProfile] = useState<CreatorProfile>(emptyProfile);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load profile.");
        const data = result.profile;
        setEmail(data.email ?? "");
        setProfile({
          full_name: data.full_name ?? "",
          professional_name: data.professional_name ?? "",
          creator_type: data.creator_type ?? "",
          bio: data.bio ?? "",
          location: data.location ?? "",
          availability: data.availability ?? "",
          avatar_url: data.avatar_url ?? "",
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
          genres: Array.isArray(data.genres) ? data.genres.join(", ") : "",
        });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load profile.");
      } finally {
        setLoading(false);
      }
    }
    void loadProfile();
  }, []);

  function updateField(
    field: keyof CreatorProfile,
    value: string
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const skills = profile.skills.split(",").map((item) => item.trim()).filter(Boolean);
    const genres = profile.genres.split(",").map((item) => item.trim()).filter(Boolean);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, skills, genres }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save profile.");
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  const initials =
    profile.full_name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CR";

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="creator-page">
      <div className="creator-page-heading">
        <span>Creator identity</span>
        <h1>Profile</h1>
        <p>
          Build the professional profile Plekxa uses for opportunities,
          credits, ratings and project selection.
        </p>
      </div>

      <div className="creator-profile-layout">
        <aside className="creator-profile-summary">
          <div className="creator-profile-cover" />

          <div className="creator-profile-avatar-large">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "Creator"}
              />
            ) : (
              <span>{initials}</span>
            )}

            <div className="creator-avatar-camera">
              <Camera size={16} />
            </div>
          </div>

          <h2>
            {profile.professional_name ||
              profile.full_name ||
              "Your creator name"}
          </h2>

          <p>{profile.creator_type || "Plekxa creator"}</p>

          <div className="creator-profile-rating">
            <Star size={17} fill="currentColor" />
            <strong>Not rated yet</strong>
          </div>

          {profile.location ? (
            <div className="creator-profile-location">
              <MapPin size={16} />
              <span>{profile.location}</span>
            </div>
          ) : null}

          <div className="creator-profile-meta">
            <div>
              <span>Completed projects</span>
              <strong>0</strong>
            </div>

            <div>
              <span>Portfolio credits</span>
              <strong>0</strong>
            </div>

            <div>
              <span>Profile completion</span>
              <strong>60%</strong>
            </div>
          </div>
        </aside>

        <form
          className="creator-profile-form"
          onSubmit={handleSubmit}
        >
          <section className="creator-profile-card">
            <div className="creator-profile-card-heading">
              <div>
                <span>Public profile</span>
                <h2>Professional details</h2>
              </div>
            </div>

            <div className="creator-profile-form-grid">
              <label>
                <span>Full name</span>
                <input
                  value={profile.full_name}
                  onChange={(event) =>
                    updateField("full_name", event.target.value)
                  }
                  required
                />
              </label>

              <label>
                <span>Professional name</span>
                <input
                  value={profile.professional_name}
                  onChange={(event) =>
                    updateField(
                      "professional_name",
                      event.target.value
                    )
                  }
                  placeholder="Stage name or professional identity"
                />
              </label>

              <label>
                <span>Email address</span>
                <input value={email} disabled />
              </label>

              <label>
                <span>Primary creator type</span>
                <select
                  value={profile.creator_type}
                  onChange={(event) =>
                    updateField(
                      "creator_type",
                      event.target.value
                    )
                  }
                >
                  <option value="">Choose one</option>
                  <option value="Composer">Composer</option>
                  <option value="Producer">Producer</option>
                  <option value="Songwriter">Songwriter</option>
                  <option value="Vocalist">Vocalist</option>
                  <option value="Musician">Musician</option>
                  <option value="Sound designer">
                    Sound designer
                  </option>
                  <option value="Writer">Writer</option>
                  <option value="Illustrator">Illustrator</option>
                  <option value="Filmmaker">Filmmaker</option>
                  <option value="Photographer">
                    Photographer
                  </option>
                  <option value="Multidisciplinary creator">
                    Multidisciplinary creator
                  </option>
                </select>
              </label>

              <label>
                <span>Location</span>
                <input
                  value={profile.location}
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
                  placeholder="City, country"
                />
              </label>

              <label>
                <span>Availability</span>
                <select
                  value={profile.availability}
                  onChange={(event) =>
                    updateField(
                      "availability",
                      event.target.value
                    )
                  }
                >
                  <option value="">Choose one</option>
                  <option value="Available">Available</option>
                  <option value="Limited availability">
                    Limited availability
                  </option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </label>

              <label className="creator-profile-full-width">
                <span>Profile photo URL</span>
                <input
                  type="url"
                  value={profile.avatar_url}
                  onChange={(event) =>
                    updateField(
                      "avatar_url",
                      event.target.value
                    )
                  }
                  placeholder="https://..."
                />
              </label>

              <label className="creator-profile-full-width">
                <span>Biography</span>
                <textarea
                  value={profile.bio}
                  onChange={(event) =>
                    updateField("bio", event.target.value)
                  }
                  rows={6}
                  maxLength={1000}
                  placeholder="Tell Plekxa teams and collaborators about your work."
                />
              </label>

              <label className="creator-profile-full-width">
                <span>Skills</span>
                <input
                  value={profile.skills}
                  onChange={(event) =>
                    updateField("skills", event.target.value)
                  }
                  placeholder="Composition, mixing, storytelling"
                />
                <small>Separate skills with commas.</small>
              </label>

              <label className="creator-profile-full-width">
                <span>Genres and creative interests</span>
                <input
                  value={profile.genres}
                  onChange={(event) =>
                    updateField("genres", event.target.value)
                  }
                  placeholder="Afrobeats, documentary, ambient"
                />
                <small>Separate items with commas.</small>
              </label>
            </div>
          </section>

          <section className="creator-profile-card">
            <div className="creator-profile-card-heading">
              <div>
                <span>Reputation</span>
                <h2>Ratings and verified activity</h2>
              </div>
            </div>

            <div className="creator-profile-reputation-grid">
              <article>
                <span>Overall rating</span>
                <strong>—</strong>
                <small>No completed project ratings yet</small>
              </article>

              <article>
                <span>Completion rate</span>
                <strong>—</strong>
                <small>Calculated from project history</small>
              </article>

              <article>
                <span>On-time delivery</span>
                <strong>—</strong>
                <small>Calculated from milestones</small>
              </article>

              <article>
                <span>Verified credits</span>
                <strong>0</strong>
                <small>Published Plekxa contributions</small>
              </article>
            </div>
          </section>

          <div className="creator-profile-save-row">
            {message ? <p>{message}</p> : <span />}

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
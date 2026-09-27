"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileFormProps = {
  profile: {
    id: string;
    full_name: string | null;
    creator_type: string | null;
    bio: string | null;
    location: string | null;
    portfolio_url: string | null;
    availability: string | null;
  };
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const supabase = createClient();

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [creatorType, setCreatorType] = useState(profile.creator_type ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(
    profile.portfolio_url ?? ""
  );
  const [availability, setAvailability] = useState(
    profile.availability ?? ""
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        creator_type: creatorType,
        bio,
        location,
        portfolio_url: portfolioUrl,
        availability,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Profile saved.");
    setSaving(false);
  }

  return (
    <form className="creator-profile-form" onSubmit={handleSubmit}>
      <label>
        Full name
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />
      </label>

      <label>
        Creator type
        <input
          value={creatorType}
          onChange={(event) => setCreatorType(event.target.value)}
          required
        />
      </label>

      <label>
        Location
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="City, country"
        />
      </label>

      <label>
        Availability
        <input
          value={availability}
          onChange={(event) => setAvailability(event.target.value)}
          placeholder="For example: Available from September"
        />
      </label>

      <label className="creator-profile-form-wide">
        Portfolio URL
        <input
          type="url"
          value={portfolioUrl}
          onChange={(event) => setPortfolioUrl(event.target.value)}
          placeholder="https://..."
        />
      </label>

      <label className="creator-profile-form-wide">
        Bio
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={6}
          placeholder="Tell the Plekxa team about your creative work."
        />
      </label>

      <div className="creator-profile-form-wide creator-profile-actions">
        <button className="button" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </button>

        {message ? <p>{message}</p> : null}
      </div>
    </form>
  );
}
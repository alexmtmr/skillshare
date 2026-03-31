"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, X, Check, Camera } from "lucide-react";
import { SkillSelection } from "@/app/(auth)/register/skill-selection";
import type { Profile, PostCategory, UserRole } from "@/lib/types";

export function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [bio, setBio] = useState(profile.bio || "");
  const [role, setRole] = useState<UserRole>(profile.role);
  const [skills, setSkills] = useState<PostCategory[]>(
    (profile.skills || []) as PostCategory[]
  );
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [uploading, setUploading] = useState(false);

  async function handleSave() {
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        bio: bio.trim() || null,
        role,
        skills,
        avatar_url: avatarUrl || null,
      })
      .eq("id", profile.id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  function handleCancel() {
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    setBio(profile.bio || "");
    setRole(profile.role);
    setSkills((profile.skills || []) as PostCategory[]);
    setAvatarUrl(profile.avatar_url || "");
    setEditing(false);
    setError("");
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Anonymous";

  if (!editing) {
    return (
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-primary">
                  {profile.first_name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">
                {fullName}
              </h2>
              {profile.bio && (
                <p className="text-sm text-text-secondary mt-0.5">
                  {profile.bio}
                </p>
              )}
              <p className="text-xs text-text-secondary mt-1 capitalize">
                Role: {profile.role}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="p-2 rounded-lg text-text-secondary hover:bg-background transition-colors"
            title="Edit profile"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Skills display */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-divider">
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-secondary/10 text-secondary text-sm font-medium rounded-full capitalize"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Edit mode
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-primary">Edit Profile</h3>
        <button
          onClick={handleCancel}
          className="p-2 rounded-lg text-text-secondary hover:bg-background transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Avatar upload */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-primary">
                  {firstName?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-secondary text-white rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  const supabase = createClient();
                  const ext = file.name.split(".").pop();
                  const path = `avatars/${profile.id}-${Date.now()}.${ext}`;
                  const { error: uploadErr } = await supabase.storage
                    .from("images")
                    .upload(path, file, { upsert: true });
                  if (uploadErr) {
                    setError("Upload failed: " + uploadErr.message);
                    setUploading(false);
                    return;
                  }
                  const { data: urlData } = supabase.storage
                    .from("images")
                    .getPublicUrl(path);
                  setAvatarUrl(urlData.publicUrl);
                  setUploading(false);
                }}
              />
            </label>
          </div>
          <div className="text-xs text-text-secondary">
            {uploading ? "Uploading..." : "Click to upload a photo"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 200))}
            placeholder="Tell others a bit about yourself..."
            rows={3}
            className="w-full px-4 py-3 border border-divider rounded-DEFAULT text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
          />
          <p className="text-xs text-text-secondary mt-1 text-right">
            {bio.length}/200
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Role
          </label>
          <div className="flex gap-2">
            {(["seeker", "giver", "both"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                  role === r
                    ? "border-secondary bg-secondary/5 text-secondary"
                    : "border-divider text-text-secondary hover:border-text-secondary"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {(role === "giver" || role === "both") && (
          <SkillSelection value={skills} onChange={setSkills} />
        )}

        {error && (
          <p className="text-sm text-accent text-center">{error}</p>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={!firstName.trim()}
            className="flex-1"
          >
            <Check className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Globe,
  Lock,
  LogOut,
  Trash2,
  Check,
} from "lucide-react";

interface SettingsClientProps {
  userId: string;
  currentLocale: string;
}

export function SettingsClient({ userId, currentLocale }: SettingsClientProps) {
  const router = useRouter();
  const t = useTranslations("settings");
  const tc = useTranslations("common");

  // Language
  const [locale, setLocale] = useState(currentLocale);

  // Password
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleLocaleChange(newLocale: string) {
    setLocale(newLocale);
    document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
    setPasswordLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
      setPasswordLoading(false);
      return;
    }

    setPasswordSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordLoading(false);
    setShowPassword(false);
    setTimeout(() => setPasswordSuccess(false), 3000);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    const supabase = createClient();

    // Delete profile (cascades to posts, sessions, etc.)
    await supabase.from("profiles").delete().eq("id", userId);

    // Sign out
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto w-full space-y-6">
      {/* Language */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-secondary" />
          <div>
            <h3 className="text-sm font-bold text-primary">{t("language")}</h3>
            <p className="text-xs text-text-secondary">{t("languageDesc")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleLocaleChange("en")}
            className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              locale === "en"
                ? "border-secondary bg-secondary/5 text-secondary"
                : "border-divider text-text-secondary hover:border-text-secondary"
            }`}
          >
            {locale === "en" && <Check className="w-4 h-4 inline mr-2" />}
            {t("english")}
          </button>
          <button
            onClick={() => handleLocaleChange("de")}
            className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              locale === "de"
                ? "border-secondary bg-secondary/5 text-secondary"
                : "border-divider text-text-secondary hover:border-text-secondary"
            }`}
          >
            {locale === "de" && <Check className="w-4 h-4 inline mr-2" />}
            {t("german")}
          </button>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-bold text-primary">
              {t("changePassword")}
            </h3>
          </div>
          {!showPassword && (
            <button
              onClick={() => setShowPassword(true)}
              className="text-xs text-secondary font-medium hover:underline"
            >
              {t("changePassword")}
            </button>
          )}
        </div>

        {showPassword && (
          <div className="space-y-3">
            <Input
              label={t("newPassword")}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
            />
            <Input
              label={t("confirmPassword")}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
            />
            {passwordError && (
              <p className="text-sm text-accent">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-secondary">{t("passwordChanged")}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPassword(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
                className="flex-1"
              >
                {tc("cancel")}
              </Button>
              <Button
                onClick={handleChangePassword}
                loading={passwordLoading}
                disabled={!newPassword || !confirmPassword}
                className="flex-1"
              >
                {tc("save")}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Log Out */}
      <Card>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-left py-1"
        >
          <LogOut className="w-5 h-5 text-text-secondary" />
          <span className="text-sm font-semibold text-primary">
            {t("logOut")}
          </span>
        </button>
      </Card>

      {/* Danger Zone */}
      <Card className="!border-accent/30 space-y-4">
        <h3 className="text-sm font-bold text-accent">{t("dangerZone")}</h3>
        <div className="flex items-start gap-3">
          <Trash2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">
              {t("deleteAccount")}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {t("deleteAccountDesc")}
            </p>
          </div>
        </div>
        {!deleteConfirm ? (
          <Button
            variant="secondary"
            onClick={() => setDeleteConfirm(true)}
            className="w-full !text-accent !border-accent/30 hover:!bg-accent/5"
          >
            <Trash2 className="w-4 h-4" />
            {t("deleteAccount")}
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-accent font-medium text-center">
              {t("deleteConfirm")}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirm(false)}
                className="flex-1"
              >
                {tc("cancel")}
              </Button>
              <Button
                onClick={handleDeleteAccount}
                loading={deleteLoading}
                className="flex-1 !bg-accent hover:!bg-accent/90"
              >
                {t("deleteAccount")}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

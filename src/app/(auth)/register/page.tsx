"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StepIndicator } from "./step-indicator";
import { RoleSelection } from "./role-selection";
import { SkillSelection } from "./skill-selection";
import { WelcomeStep } from "./welcome-step";
import type { UserRole, PostCategory } from "@/lib/types";

const TOTAL_STEPS = 5;

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Profile
  const [name, setName] = useState("");

  // Step 3: Role
  const [role, setRole] = useState<UserRole>("both");

  // Step 4: Skills
  const [skills, setSkills] = useState<PostCategory[]>([]);

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep(2);
  }

  async function handleSaveProfile() {
    setError("");
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired. Please try again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        role,
        skills: role === "seeker" ? [] : skills,
      })
      .eq("id", user.id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep(5);
  }

  function handleNext() {
    if (step === 3 && role === "seeker") {
      // Skip skill selection for seekers
      handleSaveProfile();
      return;
    }
    if (step === 4) {
      handleSaveProfile();
      return;
    }
    setStep(step + 1);
  }

  function handleBack() {
    setError("");
    if (step > 1) setStep(step - 1);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            Skillshare
          </h1>
        </div>

        <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

        <Card>
          {/* Step 1: Email + Password */}
          {step === 1 && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <h2 className="text-xl font-semibold text-primary">
                {t("registration.step1Title")}
              </h2>
              <Input
                label={t("auth.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
              <Input
                label={t("auth.password")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
              />
              {error && (
                <p className="text-sm text-accent text-center">{error}</p>
              )}
              <Button type="submit" loading={loading} className="w-full">
                {t("common.next")}
              </Button>
            </form>
          )}

          {/* Step 2: Name */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-primary">
                {t("registration.step2Title")}
              </h2>
              <Input
                label={t("registration.nameLabel")}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("registration.namePlaceholder")}
                required
              />
              {error && (
                <p className="text-sm text-accent text-center">{error}</p>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleBack} className="flex-1">
                  {t("common.back")}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!name.trim()}
                  className="flex-1"
                >
                  {t("common.next")}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Role Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-primary">
                {t("registration.step3Title")}
              </h2>
              <RoleSelection value={role} onChange={setRole} />
              {error && (
                <p className="text-sm text-accent text-center">{error}</p>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleBack} className="flex-1">
                  {t("common.back")}
                </Button>
                <Button onClick={handleNext} loading={loading} className="flex-1">
                  {role === "seeker" ? t("common.submit") : t("common.next")}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Skill Selection (Givers & Both) */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-primary">
                {t("registration.step4Title")}
              </h2>
              <SkillSelection value={skills} onChange={setSkills} />
              {error && (
                <p className="text-sm text-accent text-center">{error}</p>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleBack} className="flex-1">
                  {t("common.back")}
                </Button>
                <Button
                  onClick={handleNext}
                  loading={loading}
                  disabled={skills.length === 0}
                  className="flex-1"
                >
                  {t("common.submit")}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Welcome */}
          {step === 5 && (
            <WelcomeStep
              onGetStarted={() => {
                router.push("/");
                router.refresh();
              }}
            />
          )}
        </Card>

        {step === 1 && (
          <p className="text-center text-sm text-text-secondary">
            {t("auth.hasAccount")}{" "}
            <Link
              href="/login"
              className="text-secondary font-semibold hover:underline"
            >
              {t("auth.login")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

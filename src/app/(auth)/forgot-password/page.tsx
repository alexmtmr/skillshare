"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSent(true);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            Skillshare
          </h1>
          <p className="mt-2 text-text-secondary">Reset your password</p>
        </div>

        <Card>
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Mail className="w-8 h-8 text-secondary" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Check your email</p>
                <p className="text-sm text-text-secondary mt-1">
                  We sent a password reset link to <strong>{email}</strong>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-sm text-text-secondary">
                Enter your email and we&apos;ll send you a link to reset your
                password.
              </p>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
              {error && (
                <p className="text-sm text-accent text-center">{error}</p>
              )}
              <Button type="submit" loading={loading} className="w-full">
                Send Reset Link
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-text-secondary">
          <Link href="/login" className="text-secondary font-semibold hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

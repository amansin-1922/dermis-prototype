"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("demo@velyquo.app");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);

    window.setTimeout(() => {
      localStorage.setItem("dermisDemoLoggedIn", "true");

      if (rememberMe) {
        localStorage.setItem("dermisRememberLogin", "true");
      } else {
        localStorage.removeItem("dermisRememberLogin");
      }

      router.push("/dashboard");
    }, 450);
  };

  const useDemoAccount = () => {
    setEmail("demo@velyquo.app");
    setPassword("demo123");
    setError("");
  };

  const handleForgotPassword = () => {
    setError(
      "Password recovery is disabled in this demo prototype."
    );
  };

  return (
    <main className="min-h-screen bg-[#F3F6F3] text-[#182019]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left panel */}
        <section className="relative hidden overflow-hidden bg-[#14271B] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/[0.07]"
          />

          <div
            aria-hidden="true"
            className="absolute -right-12 -top-12 h-64 w-64 rounded-full border border-white/[0.07]"
          />

          <div className="relative z-10 flex items-center gap-2">
            <div className="text-xl font-semibold tracking-[-0.04em]">
              velyquo<span className="text-[#718276]">.</span>
            </div>

            <span className="rounded-full border border-white/[0.09] bg-white/[0.045] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#B9C6BC]">
              Clinic intelligence
            </span>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/[0.10] bg-white/[0.055] text-[#DCE8DE] shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <Sparkles size={18} />
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#A9BAAE]">
              Intelligence for modern aesthetic clinics
            </p>

            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[1.015] tracking-[-0.06em] xl:text-[60px]">
              Better consultations.
              <br />
              Smarter treatments.
              <br />
              Clearer progress.
            </h1>

            <p className="mt-7 max-w-md text-[13px] leading-6 text-[#AAB9AE]">
              Manage patients, analyse skin, personalise treatment plans and
              track clinical progress from one intelligent workspace.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                ["AI", "Skin analysis"],
                ["360°", "Patient view"],
                ["Live", "Progress tracking"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-4 shadow-[0_12px_34px_rgba(0,0,0,0.05)]"
                >
                  <p className="text-lg font-medium tracking-[-0.03em]">
                    {value}
                  </p>

                  <p className="mt-1 text-[10px] text-[#8FA096]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-[#718276]">
            <span>© 2026 Velyquo</span>
            <span>Built for aesthetic clinics</span>
          </div>
        </section>

        {/* Login panel */}
        <section className="flex min-h-screen items-center justify-center bg-[#F5F7F4] px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-[440px]">
            {/* Mobile branding */}
            <div className="mb-12 flex items-center justify-between lg:hidden">
              <div className="text-xl font-semibold tracking-[-0.04em]">
                velyquo<span className="text-[#8A8A84]">.</span>
              </div>

              <span className="rounded-full border border-[#DCE5DC] bg-[#FFFFFE] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#607066]">
                Clinic intelligence
              </span>
            </div>

            {/* Heading */}
            <div className="mb-9">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6E8375]">
                Welcome back
              </p>

              <h2 className="mt-3 text-[40px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#19231B] sm:text-[44px]">
                Sign in to your clinic
              </h2>

              <p className="mt-4 max-w-sm text-[12px] leading-6 text-[#748078]">
                Access your patients, skin analyses, treatment plans and clinic
                dashboard.
              </p>
            </div>

            {/* Demo access card */}
            <div className="mb-6 rounded-[20px] border border-[#D7E3D7] bg-[#EDF4ED] p-4 shadow-[0_12px_34px_rgba(35,62,44,0.04)]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#D8E4D8] bg-[#FFFFFE] text-[#45634D]">
                  <Sparkles size={14} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#39473E]">
                    Demo clinic access
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[#657269]">
                    The demo credentials are already filled in. Sign in to
                    explore the complete Velyquo clinic workflow.
                  </p>

                  <button
                    type="button"
                    onClick={useDemoAccount}
                    className="mt-2 text-[10px] font-semibold text-[#42694D] underline decoration-[#A8B9AB] underline-offset-4 transition hover:text-[#173725]"
                  >
                    Restore demo credentials
                  </button>
                </div>
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[11px] font-semibold text-[#39473E]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@clinic.com"
                  className="w-full rounded-[14px] border border-[#DCE5DC] bg-[#FFFFFE] px-4 py-3.5 text-[12px] outline-none transition placeholder:text-[#A0AAA2] focus:border-[#6E8A75] focus:shadow-[0_0_0_3px_rgba(53,91,63,0.08)]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-semibold text-[#39473E]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-medium text-[#6D7A71] transition hover:text-[#173725]"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8B978F]"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-[14px] border border-[#DCE5DC] bg-[#FFFFFE] py-3.5 pl-11 pr-12 text-[12px] outline-none transition placeholder:text-[#A0AAA2] focus:border-[#6E8A75] focus:shadow-[0_0_0_3px_rgba(53,91,63,0.08)]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#758179] transition hover:text-[#173725]"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2.5 text-[11px] font-medium text-[#5E6B62]">
                  <button
                    type="button"
                    onClick={() =>
                      setRememberMe((current) => !current)
                    }
                    className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                      rememberMe
                        ? "border-[#173725] bg-[#173725] text-white"
                        : "border-[#C9D4CB] bg-[#FFFFFE]"
                    }`}
                    aria-pressed={rememberMe}
                  >
                    {rememberMe && (
                      <Check size={11} strokeWidth={3} />
                    )}
                  </button>

                  Remember me
                </label>

                <span className="text-xs text-[#8B978F]">
                  Secure demo access
                </span>
              </div>

              {/* Error / information message */}
              {error && (
                <div className="rounded-[13px] border border-[#E4D7D1] bg-[#FAF3F0] px-4 py-3 text-[11px] leading-5 text-[#7A5144]">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#173725] py-4 text-[12px] font-semibold text-white shadow-[0_14px_34px_rgba(23,55,37,0.20)] transition hover:-translate-y-px hover:bg-[#102D1C] disabled:cursor-wait disabled:translate-y-0 disabled:opacity-70"
              >
                {loading ? (
                  "Opening clinic..."
                ) : (
                  <>
                    Sign in

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-[#DEE5DE] pt-6">
              <p className="text-center text-xs leading-5 text-[#8B978F]">
                Velyquo demo environment · No real patient information is
                stored
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
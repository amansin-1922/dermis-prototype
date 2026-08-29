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
    <main className="min-h-screen bg-[#F8F7F4] text-[#171717]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left panel */}
        <section className="relative hidden overflow-hidden bg-[#171717] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -right-12 -top-12 h-64 w-64 rounded-full border border-white/10"
          />

          <div className="relative z-10 flex items-center gap-2">
            <div className="text-xl font-semibold tracking-[-0.04em]">
              velyquo<span className="text-[#777770]">.</span>
            </div>

            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#B8B8B0]">
              Clinic intelligence
            </span>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <Sparkles size={18} />
            </div>

            <p className="text-sm font-medium text-[#A8A8A0]">
              Intelligence for modern aesthetic clinics
            </p>

            <h1 className="mt-5 max-w-lg text-5xl font-medium leading-[1.04] tracking-[-0.055em] xl:text-[58px]">
              Better consultations.
              <br />
              Smarter treatments.
              <br />
              Clearer progress.
            </h1>

            <p className="mt-7 max-w-md text-sm leading-6 text-[#A8A8A0]">
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
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <p className="text-lg font-medium tracking-[-0.03em]">
                    {value}
                  </p>

                  <p className="mt-1 text-xs text-[#888881]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-[#777770]">
            <span>© 2026 Velyquo</span>
            <span>Built for aesthetic clinics</span>
          </div>
        </section>

        {/* Login panel */}
        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-[430px]">
            {/* Mobile branding */}
            <div className="mb-12 flex items-center justify-between lg:hidden">
              <div className="text-xl font-semibold tracking-[-0.04em]">
                velyquo<span className="text-[#8A8A84]">.</span>
              </div>

              <span className="rounded-full border border-[#DDDCD6] bg-white px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#77766F]">
                Clinic intelligence
              </span>
            </div>

            {/* Heading */}
            <div className="mb-9">
              <p className="text-sm font-medium text-[#77766F]">
                Welcome back
              </p>

              <h2 className="mt-2 text-[38px] font-medium leading-tight tracking-[-0.05em] sm:text-[42px]">
                Sign in to your clinic
              </h2>

              <p className="mt-4 max-w-sm text-sm leading-6 text-[#77766F]">
                Access your patients, skin analyses, treatment plans and clinic
                dashboard.
              </p>
            </div>

            {/* Demo access card */}
            <div className="mb-6 rounded-2xl border border-[#DCDCD5] bg-[#F1F1EC] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">
                  <Sparkles size={14} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Demo clinic access
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#77766F]">
                    The demo credentials are already filled in. Sign in to
                    explore the complete Velyquo clinic workflow.
                  </p>

                  <button
                    type="button"
                    onClick={useDemoAccount}
                    className="mt-2 text-xs font-medium underline underline-offset-4 transition hover:text-[#555]"
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
                  className="mb-2 block text-sm font-medium"
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
                  className="w-full rounded-xl border border-[#D9D8D2] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#AAA9A2] focus:border-[#77766F] focus:ring-2 focus:ring-black/[0.04]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-[#77766F] transition hover:text-black"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999890]"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#D9D8D2] bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-[#AAA9A2] focus:border-[#77766F] focus:ring-2 focus:ring-black/[0.04]"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77766F] transition hover:text-black"
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
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#66665F]">
                  <button
                    type="button"
                    onClick={() =>
                      setRememberMe((current) => !current)
                    }
                    className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                      rememberMe
                        ? "border-[#171717] bg-[#171717] text-white"
                        : "border-[#C8C7C0] bg-white"
                    }`}
                    aria-pressed={rememberMe}
                  >
                    {rememberMe && (
                      <Check size={11} strokeWidth={3} />
                    )}
                  </button>

                  Remember me
                </label>

                <span className="text-xs text-[#999890]">
                  Secure demo access
                </span>
              </div>

              {/* Error / information message */}
              {error && (
                <div className="rounded-xl border border-[#E4D8D3] bg-[#F8F1EE] px-4 py-3 text-xs leading-5 text-[#7A5144]">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] py-4 text-sm font-medium text-white transition hover:bg-[#30302E] disabled:cursor-wait disabled:opacity-70"
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

            <div className="mt-8 border-t border-[#DDDCD6] pt-6">
              <p className="text-center text-xs leading-5 text-[#999890]">
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
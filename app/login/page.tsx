export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F8F7F4] text-[#171717]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left side */}
        <div className="hidden bg-[#171717] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="text-xl font-semibold tracking-[-0.04em]">
            dermis<span className="text-[#777770]">.</span>
          </div>

          <div className="max-w-lg">
            <p className="text-sm text-[#A8A8A0]">
              Skin intelligence for modern clinics.
            </p>

            <h1 className="mt-5 text-5xl font-medium leading-[1.05] tracking-[-0.05em]">
              Everything your clinic needs to deliver better skin care.
            </h1>

            <p className="mt-6 max-w-md text-sm leading-6 text-[#A8A8A0]">
              Manage patients, analyse skin, personalise treatments and
              understand your clinic from one intelligent platform.
            </p>
          </div>

          <p className="text-xs text-[#777770]">
            © 2026 Dermis-style prototype
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            <div className="mb-10 lg:hidden">
              <div className="text-xl font-semibold tracking-[-0.04em]">
                dermis<span className="text-[#8A8A84]">.</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-[#77766F]">
                Welcome back
              </p>

              <h2 className="mt-2 text-4xl font-medium tracking-[-0.045em]">
                Sign in to your clinic
              </h2>

              <p className="mt-4 text-sm leading-6 text-[#77766F]">
                Access your patients, analyses and clinic dashboard.
              </p>
            </div>

            <form className="mt-10 space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="you@clinic.com"
                  className="w-full rounded-xl border border-[#D9D8D2] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#77766F]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs text-[#77766F] hover:text-black"
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#D9D8D2] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#77766F]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#171717] py-4 text-sm font-medium text-white transition hover:bg-[#333]"
              >
                Sign in
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#DDDCD6]" />
              <span className="text-xs text-[#999890]">OR</span>
              <div className="h-px flex-1 bg-[#DDDCD6]" />
            </div>

            <button className="flex w-full items-center justify-center rounded-xl border border-[#D9D8D2] bg-white py-3.5 text-sm font-medium transition hover:bg-[#F1F0EC]">
              Continue with Google
            </button>

            <p className="mt-8 text-center text-sm text-[#77766F]">
              Don't have an account?{" "}
              <a
                href="#"
                className="font-medium text-[#171717] underline underline-offset-4"
              >
                Create one
              </a>
            </p>

          </div>
        </div>
      </div>
    </main>
  );
}
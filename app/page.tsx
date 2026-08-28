export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F7F4] text-[#171717]">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="text-xl font-semibold tracking-[-0.04em]">
          dermis<span className="text-[#8A8A84]">.</span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-[#555550] md:flex">
          <a href="#product" className="hover:text-black">
            Product
          </a>
          <a href="#features" className="hover:text-black">
            Features
          </a>
          <a href="#solutions" className="hover:text-black">
            Solutions
          </a>
          <a href="#pricing" className="hover:text-black">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden rounded-full px-4 py-2 text-sm md:block">
            Sign in
          </button>

          <button className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#333]">
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-10 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          
          {/* Left */}
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#DDDCD6] bg-white px-4 py-2 text-xs text-[#66665F]">
              <span className="h-2 w-2 rounded-full bg-[#6C8068]" />
              AI-powered skin intelligence
            </div>

            <h1 className="max-w-2xl text-5xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
              Smarter skin.
              <br />
              Better care.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#66665F]">
              A modern skin intelligence platform that helps clinics
              understand their patients, personalise treatments and deliver
              better outcomes.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-full bg-[#171717] px-7 py-4 text-sm font-medium text-white transition hover:bg-[#333]">
                Start for free →
              </button>

              <button className="rounded-full border border-[#D7D6D0] bg-white px-7 py-4 text-sm font-medium transition hover:bg-[#F1F0EC]">
                Book a demo
              </button>
            </div>

            <p className="mt-5 text-xs text-[#8A8982]">
              No credit card required · Set up in minutes
            </p>
          </div>

          {/* Product Preview */}
          <div id="product" className="relative">
            <div className="rounded-[28px] border border-[#DDDCD6] bg-white p-3 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
              
              {/* Browser top */}
              <div className="flex items-center gap-2 border-b border-[#ECEBE6] px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#DDDCD6]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#DDDCD6]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#DDDCD6]" />
              </div>

              {/* Dashboard */}
              <div className="grid min-h-[440px] grid-cols-[150px_1fr]">
                
                {/* Sidebar */}
                <aside className="border-r border-[#ECEBE6] p-5">
                  <div className="mb-9 text-sm font-semibold">
                    dermis.
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="rounded-xl bg-[#F3F2EE] px-3 py-2.5 font-medium">
                      Overview
                    </div>
                    <div className="px-3 py-2.5 text-[#77766F]">
                      Patients
                    </div>
                    <div className="px-3 py-2.5 text-[#77766F]">
                      Skin analysis
                    </div>
                    <div className="px-3 py-2.5 text-[#77766F]">
                      Treatments
                    </div>
                    <div className="px-3 py-2.5 text-[#77766F]">
                      Appointments
                    </div>
                  </div>
                </aside>

                {/* Main dashboard */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#88877F]">
                        Monday, August 25
                      </p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight">
                        Good morning, Sarah
                      </h2>
                    </div>

                    <div className="h-9 w-9 rounded-full bg-[#E9E6DE]" />
                  </div>

                  {/* Stats */}
                  <div className="mt-7 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-[#ECEBE6] p-4">
                      <p className="text-[10px] text-[#88877F]">
                        Patients
                      </p>
                      <p className="mt-2 text-xl font-semibold">1,248</p>
                      <p className="mt-1 text-[10px] text-[#71806C]">
                        +12.4%
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#ECEBE6] p-4">
                      <p className="text-[10px] text-[#88877F]">
                        Analyses
                      </p>
                      <p className="mt-2 text-xl font-semibold">386</p>
                      <p className="mt-1 text-[10px] text-[#71806C]">
                        +18.2%
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#ECEBE6] p-4">
                      <p className="text-[10px] text-[#88877F]">
                        Revenue
                      </p>
                      <p className="mt-2 text-xl font-semibold">
                        £42.8k
                      </p>
                      <p className="mt-1 text-[10px] text-[#71806C]">
                        +9.6%
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="mt-4 rounded-2xl border border-[#ECEBE6] p-5">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-[#88877F]">
                          Patient activity
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          2,842
                        </p>
                      </div>

                      <span className="text-[10px] text-[#71806C]">
                        +16.8%
                      </span>
                    </div>

                    <div className="mt-6 flex h-28 items-end gap-2">
                      {[35, 48, 42, 65, 55, 72, 60, 83, 70, 91, 78, 96].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t-md bg-[#D8D6CE]"
                            style={{ height: `${height}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Recent patients */}
                  <div className="mt-4 rounded-2xl border border-[#ECEBE6] p-5">
                    <p className="text-xs font-medium">
                      Recent patients
                    </p>

                    <div className="mt-4 space-y-3">
                      {[
                        ["Emily Johnson", "Skin analysis", "Today"],
                        ["Olivia Smith", "Follow-up", "Today"],
                        ["Amelia Brown", "Treatment", "Yesterday"],
                      ].map(([name, type, date]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-[#E8E5DD]" />
                            <div>
                              <p className="font-medium">{name}</p>
                              <p className="text-[#96958E]">{type}</p>
                            </div>
                          </div>

                          <span className="text-[#96958E]">{date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-[#E2E1DB] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <p className="text-center text-xs uppercase tracking-[0.18em] text-[#999890]">
            Built for modern aesthetic & dermatology clinics
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-x-12 gap-y-5 text-sm font-medium text-[#77766F]">
            <span>DERMA LAB</span>
            <span>SKINHOUSE</span>
            <span>CLINIQUE</span>
            <span>ESTHETICA</span>
            <span>SKIN + CO</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#71806C]">
            Everything in one place
          </p>

          <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
            The operating system for modern skin care.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "AI skin analysis",
              text: "Turn patient images into structured skin insights and personalised recommendations.",
            },
            {
              title: "Patient intelligence",
              text: "Understand every patient journey from their first consultation to their next treatment.",
            },
            {
              title: "Clinic growth",
              text: "Track appointments, treatments, retention and revenue from one beautiful workspace.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-[24px] border border-[#DDDCD6] bg-white p-7"
            >
              <div className="mb-14 h-10 w-10 rounded-xl bg-[#F0EFEA]" />

              <h3 className="text-xl font-medium tracking-tight">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#77766F]">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="pricing"
        className="mx-6 mb-6 rounded-[32px] bg-[#171717] px-6 py-20 text-white lg:mx-10"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-[#BDBDB6]">
            Ready to transform your clinic?
          </p>

          <h2 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-6xl">
            Better technology.
            <br />
            Better skin care.
          </h2>

          <button className="mt-9 rounded-full bg-white px-7 py-4 text-sm font-medium text-[#171717] transition hover:bg-[#EDEDE8]">
            Get started →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-[#898880] sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <span>© 2026 Dermis-style prototype</span>

        <div className="flex gap-6">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </footer>
    </main>
  );
}
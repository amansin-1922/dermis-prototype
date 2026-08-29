"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";

const plans = [
  {
    name: "Essential",
    price: "£149",
    suffix: "/month",
    description:
      "For independent practitioners and smaller aesthetic clinics that want a more connected patient workflow.",
    cta: "Book an Essential demo",
    featured: false,
    features: [
      "Patient workspace",
      "Consultation records",
      "AI-assisted skin analysis workflow",
      "Treatment planning",
      "Appointments",
      "Basic progress tracking",
    ],
  },
  {
    name: "Pro",
    price: "£249",
    suffix: "/month",
    description:
      "For established aesthetic clinics that want the complete Velyquo patient and treatment journey.",
    cta: "Book a Pro demo",
    featured: true,
    features: [
      "Everything in Essential",
      "Before & After progress",
      "Professional progress reports",
      "Multi-practitioner workflows",
      "Follow-up management",
      "Advanced treatment planning",
    ],
  },
  {
    name: "Multi-Clinic",
    price: "£499+",
    suffix: "/month",
    description:
      "For growing aesthetic businesses operating across multiple clinic locations.",
    cta: "Talk to us",
    featured: false,
    features: [
      "Everything in Pro",
      "Multiple clinic locations",
      "Expanded team access",
      "Cross-location workflows",
      "Priority onboarding",
      "Commercial package tailored to scale",
    ],
  },
];

const comparisonRows = [
  ["Patient management", true, true, true],
  ["Consultation records", true, true, true],
  ["Skin analysis workflow", true, true, true],
  ["Treatment planning", true, true, true],
  ["Appointments", true, true, true],
  ["Basic progress tracking", true, true, true],
  ["Before & After comparison", false, true, true],
  ["Progress reports", false, true, true],
  ["Multi-practitioner workflows", false, true, true],
  ["Follow-up management", false, true, true],
  ["Multiple clinic locations", false, false, true],
  ["Priority onboarding", false, false, true],
];

const faqs = [
  {
    q: "Is there a long-term contract?",
    a: "Commercial terms can be agreed with each clinic during onboarding. For the Founding Clinic Programme, we recommend a straightforward initial agreement focused on onboarding, product feedback and early-stage use.",
  },
  {
    q: "What does the onboarding fee cover?",
    a: "The onboarding fee is intended to cover initial clinic setup, configuration, practitioner setup, guided walkthroughs and assistance preparing the workspace for the clinic's chosen workflow.",
  },
  {
    q: "Can I start on Essential and upgrade later?",
    a: "Yes. The pricing structure is designed so clinics can move to a more advanced plan as their team, workflow or reporting needs grow.",
  },
  {
    q: "Is the current prototype ready for live patient data?",
    a: "No. The current Velyquo experience is a demonstration prototype and should not be used for real patient information. Production security, privacy, data handling and operational controls must be completed before live clinic deployment.",
  },
  {
    q: "What is included in the Founding Clinic Programme?",
    a: "The proposed Founding Clinic Programme includes the full Pro experience, assisted onboarding, priority feedback access and founding-clinic pricing locked for 12 months.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-[#F5F6F2] text-[#172019]">
      <header className="sticky top-0 z-50 border-b border-[#E1E6DE] bg-[#F9FAF7]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D7E0D5] bg-[#EAF0E8]">
              <Sparkles className="h-4 w-4 text-[#355340]" />
            </div>
            <span className="text-[23px] font-semibold tracking-[-0.045em]">
              velyquo.
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#5F6C62] lg:flex">
            <Link href="/#product">Product</Link>
            <Link href="/#progress">Before & After</Link>
            <Link href="/pricing" className="text-[#173725]">
              Pricing
            </Link>
            <Link href="/#faq">FAQ</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden px-4 py-2 text-sm font-semibold text-[#405047] sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl bg-[#173725] px-5 py-3 text-sm font-semibold text-white"
            >
              Book a demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-[#E1E6DF]">
        <div className="mx-auto max-w-[1180px] px-6 py-20 text-center lg:px-10 lg:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D7E1D5] bg-[#EDF2EB] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55705D]">
            <Sparkles className="h-3.5 w-3.5" />
            Velyquo pricing
          </div>

          <h1 className="mx-auto mt-7 max-w-[900px] text-[48px] font-semibold leading-[1] tracking-[-0.055em] sm:text-[64px]">
            Simple pricing for modern aesthetic clinics.
          </h1>

          <p className="mx-auto mt-6 max-w-[700px] text-[17px] leading-8 text-[#6B766E]">
            Start with the workflow your clinic needs today and move into a more
            advanced Velyquo plan as your team and patient journey evolve.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1240px] px-6 py-20 lg:px-10 lg:py-24">
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`relative rounded-[28px] border p-8 ${
                  plan.featured
                    ? "border-[#31523B] bg-[#173725] text-white shadow-[0_24px_60px_rgba(23,55,37,0.14)]"
                    : "border-[#DDE4DB] bg-[#FFFFFE]"
                }`}
              >
                {plan.featured && (
                  <span className="absolute right-6 top-6 rounded-full bg-[#E4EDE2] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#36543F]">
                    Most popular
                  </span>
                )}

                <p
                  className={`text-sm font-semibold ${
                    plan.featured ? "text-[#BDD0C1]" : "text-[#5F6D63]"
                  }`}
                >
                  {plan.name}
                </p>

                <div className="mt-7 flex items-end gap-2">
                  <span className="text-[50px] font-semibold tracking-[-0.055em]">
                    {plan.price}
                  </span>
                  <span
                    className={`pb-2 text-sm ${
                      plan.featured ? "text-[#AFC1B3]" : "text-[#8A938C]"
                    }`}
                  >
                    {plan.suffix}
                  </span>
                </div>

                <p
                  className={`mt-4 min-h-[72px] text-sm leading-6 ${
                    plan.featured ? "text-[#B8C8BC]" : "text-[#778179]"
                  }`}
                >
                  {plan.description}
                </p>

                <div
                  className={`my-7 h-px ${
                    plan.featured ? "bg-white/10" : "bg-[#E5E9E3]"
                  }`}
                />

                <div className="space-y-3.5">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.featured ? "bg-white/10" : "bg-[#E6EFE4]"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span
                        className={
                          plan.featured ? "text-[#E3EAE4]" : "text-[#59665D]"
                        }
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/demo"
                  className={`mt-10 flex w-full items-center justify-center rounded-[14px] px-5 py-4 text-sm font-semibold ${
                    plan.featured
                      ? "bg-white text-[#173725]"
                      : "border border-[#D8E0D6] bg-[#F9FAF7] text-[#304338]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#DCE4DA] bg-[#EDF3EB]">
        <div className="mx-auto max-w-[1180px] px-6 py-16 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#58705E]">
                Founding Clinic Programme
              </p>
              <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.045em] sm:text-[42px]">
                Full Pro access for £199/month.
              </h2>
              <p className="mt-2 text-lg font-semibold text-[#405448]">
                + £299 one-time onboarding
              </p>
              <p className="mt-5 max-w-[760px] text-sm leading-7 text-[#68766B]">
                Designed for the first UK clinics helping shape Velyquo before the
                wider commercial rollout. Founding clinics receive assisted
                onboarding and founding-clinic pricing locked for 12 months.
              </p>
              <p className="mt-3 text-sm font-semibold text-[#45604D]">
                Limited to the first 10 participating UK clinics.
              </p>
            </div>

            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#173725] px-7 py-4 text-sm font-semibold text-white"
            >
              Apply for founding access
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#FBFCF9]">
        <div className="mx-auto max-w-[1240px] px-6 py-24 lg:px-10">
          <div className="max-w-[700px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#607765]">
              Compare plans
            </p>
            <h2 className="mt-5 text-[40px] font-semibold tracking-[-0.05em]">
              Choose the level that fits your clinic.
            </h2>
          </div>

          <div className="mt-12 overflow-x-auto rounded-[24px] border border-[#DEE5DC] bg-white">
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#E4E8E2] bg-[#F7F9F6]">
                  <th className="px-6 py-5 text-sm font-semibold text-[#4B5B50]">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      className="px-6 py-5 text-sm font-semibold text-[#2F4035]"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([label, essential, pro, multi]) => (
                  <tr key={label as string} className="border-b border-[#EDF0EB] last:border-0">
                    <td className="px-6 py-4 text-sm text-[#68746B]">
                      {label as string}
                    </td>
                    {[essential, pro, multi].map((value, index) => (
                      <td key={index} className="px-6 py-4">
                        {value ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E5EEE4]">
                            <Check className="h-3.5 w-3.5 text-[#3F5C47]" />
                          </div>
                        ) : (
                          <span className="text-[#B5BDB7]">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-y border-[#E1E6DF]">
        <div className="mx-auto max-w-[1180px] px-6 py-24 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#607765]">
                Onboarding
              </p>
              <h2 className="mt-5 text-[40px] font-semibold tracking-[-0.05em]">
                A guided start, not another tool dropped into your clinic.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["01", "Clinic setup", "Configure core clinic details and the starting workspace."],
                ["02", "Practitioner setup", "Add practitioners, working days and core availability."],
                ["03", "Workflow walkthrough", "Review the patient, analysis, treatment and reporting journey."],
                ["04", "Launch support", "Get guided support while the clinic begins using its agreed production workflow."],
              ].map(([number, title, text]) => (
                <div
                  key={title}
                  className="rounded-[22px] border border-[#DEE5DC] bg-[#FFFFFE] p-6"
                >
                  <span className="text-[11px] font-bold tracking-[0.16em] text-[#94A097]">
                    {number}
                  </span>
                  <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#748077]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1080px] px-6 py-24 lg:px-10">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#607765]">
              Pricing FAQ
            </p>
            <h2 className="mt-5 text-[40px] font-semibold tracking-[-0.05em]">
              Before you choose a plan.
            </h2>
          </div>

          <div className="mx-auto mt-12 max-w-[820px] divide-y divide-[#E0E5DE] border-y border-[#E0E5DE]">
            {faqs.map((faq, index) => (
              <div key={faq.q}>
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-[15px] font-semibold text-[#29372E]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#6E7B71] transition ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p className="pb-6 pr-10 text-sm leading-7 text-[#727D74]">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-[1180px] rounded-[30px] bg-[#173725] px-7 py-14 text-white sm:px-12 lg:px-16 lg:py-18">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A7BDAA]">
                See Velyquo in context
              </p>
              <h2 className="mt-5 max-w-[760px] text-[40px] font-semibold leading-[1.04] tracking-[-0.05em] sm:text-[52px]">
                Choose a plan after seeing the workflow.
              </h2>
              <p className="mt-5 max-w-[700px] text-sm leading-7 text-[#BBCABD]">
                Book a focused product demonstration and walk through the parts of
                Velyquo that matter most to your clinic.
              </p>
            </div>

            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-white px-7 py-4 text-sm font-bold text-[#173725]"
            >
              Book a free demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E0E5DE] bg-[#F9FAF7]">
        <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-10">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div>
              <span className="text-[22px] font-semibold tracking-[-0.045em]">
                velyquo.
              </span>
              <p className="mt-3 text-sm text-[#758078]">
                Intelligence for modern aesthetic clinics.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-[#69756C]">
              <Link href="/#product">Product</Link>
              <Link href="/#progress">Progress</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/demo">Demo</Link>
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-3 border-t border-[#E1E6DF] pt-6 text-[11px] text-[#929B94] sm:flex-row">
            <span>© 2026 Velyquo. Demonstration product experience.</span>
            <span>Prototype only · Not for storage of real patient information</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

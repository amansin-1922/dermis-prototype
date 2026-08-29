"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";

const demoPoints = [
  "Patient and consultation workflow",
  "AI-assisted skin analysis experience",
  "Personalised treatment planning",
  "Appointments and follow-up management",
  "Before & After progress tracking",
  "Professional progress reporting",
];

const faqs = [
  {
    q: "How long is the demonstration?",
    a: "We recommend allowing around 20 minutes for a focused Velyquo walkthrough, with additional time if you want to discuss your clinic's current workflow.",
  },
  {
    q: "Do I need to prepare anything?",
    a: "No. A brief understanding of how your clinic currently handles consultations, treatment planning and progress tracking is enough to make the demonstration more relevant.",
  },
  {
    q: "Is the demo a commitment to buy?",
    a: "No. The demonstration is intended to help you understand the Velyquo product direction and decide whether the platform could be relevant to your clinic.",
  },
  {
    q: "Can I ask about the Founding Clinic Programme?",
    a: "Yes. If your clinic appears suitable for the programme, we can discuss the proposed £199/month founding price, £299 onboarding fee and the 12-month founding-price period.",
  },
];

export default function DemoPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#F5F6F2] text-[#172019]">
      <header className="border-b border-[#E1E6DE] bg-[#F9FAF7]/95">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D7E0D5] bg-[#EAF0E8]">
              <Sparkles className="h-4 w-4 text-[#355340]" />
            </div>
            <span className="text-[23px] font-semibold tracking-[-0.045em]">
              velyquo.
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="hidden px-4 py-2 text-sm font-semibold text-[#526057] sm:inline-flex"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-[#D8E0D6] bg-white px-5 py-3 text-sm font-semibold text-[#304338]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-[1240px] gap-14 px-6 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:px-10 lg:py-24">
          <div className="lg:sticky lg:top-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D7E1D5] bg-[#EDF2EB] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55705D]">
              <WandSparkles className="h-3.5 w-3.5" />
              Private product demonstration
            </div>

            <h1 className="mt-7 max-w-[650px] text-[48px] font-semibold leading-[1] tracking-[-0.055em] sm:text-[62px]">
              See Velyquo through your clinic&apos;s workflow.
            </h1>

            <p className="mt-6 max-w-[600px] text-[17px] leading-8 text-[#69756C]">
              Explore how Velyquo brings consultation, skin assessment,
              treatment planning, appointments and progress reporting into one
              connected aesthetic-clinic workspace.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DDE4DB] bg-[#FFFFFE] px-4 py-2.5 text-xs font-semibold text-[#536158]">
                <Clock3 className="h-4 w-4 text-[#4D6955]" />
                Around 20 minutes
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DDE4DB] bg-[#FFFFFE] px-4 py-2.5 text-xs font-semibold text-[#536158]">
                <Users className="h-4 w-4 text-[#4D6955]" />
                Built for aesthetic clinics
              </div>
            </div>

            <div className="mt-10 rounded-[24px] border border-[#DCE4DA] bg-[#FFFFFE] p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6A7C6D]">
                What we&apos;ll show you
              </p>
              <div className="mt-6 space-y-4">
                {demoPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E5EEE4]">
                      <Check className="h-3 w-3 text-[#3F5C47]" />
                    </div>
                    <span className="text-sm font-medium text-[#59665D]">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-5 text-xs leading-5 text-[#909A92]">
              Velyquo is currently a demonstration product experience. Do not
              provide real patient information in the prototype.
            </p>
          </div>

          <div className="rounded-[30px] border border-[#DCE4DA] bg-[#FFFFFE] p-6 shadow-[0_24px_70px_rgba(31,51,38,0.08)] sm:p-9 lg:p-10">
            {!submitted ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#607765]">
                  Request your demo
                </p>
                <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.045em]">
                  Tell us a little about your clinic.
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#778179]">
                  This helps make the conversation more relevant to the way your
                  clinic currently works.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="First name" required>
                      <input
                        required
                        name="firstName"
                        placeholder="Sarah"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Last name" required>
                      <input
                        required
                        name="lastName"
                        placeholder="Williams"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="Work email" required>
                    <input
                      required
                      type="email"
                      name="email"
                      placeholder="sarah@yourclinic.co.uk"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Clinic name" required>
                    <input
                      required
                      name="clinicName"
                      placeholder="Your clinic"
                      className={inputClass}
                    />
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Clinic size">
                      <select name="clinicSize" className={inputClass} defaultValue="">
                        <option value="" disabled>
                          Select
                        </option>
                        <option>Solo practitioner</option>
                        <option>2–5 practitioners</option>
                        <option>6–10 practitioners</option>
                        <option>11+ practitioners</option>
                        <option>Multiple locations</option>
                      </select>
                    </Field>

                    <Field label="Number of locations">
                      <select name="locations" className={inputClass} defaultValue="1">
                        <option>1</option>
                        <option>2</option>
                        <option>3–5</option>
                        <option>6+</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="What would you most like to improve?">
                    <select name="priority" className={inputClass} defaultValue="">
                      <option value="" disabled>
                        Select your priority
                      </option>
                      <option>Patient consultations</option>
                      <option>Skin analysis</option>
                      <option>Treatment planning</option>
                      <option>Before & After tracking</option>
                      <option>Patient retention and follow-ups</option>
                      <option>Clinic workflow overall</option>
                    </select>
                  </Field>

                  <Field label="Anything else we should know?">
                    <textarea
                      name="notes"
                      rows={4}
                      placeholder="Tell us briefly about your current workflow or what you would like to see."
                      className={`${inputClass} resize-none`}
                    />
                  </Field>

                  <label className="flex items-start gap-3 rounded-[16px] bg-[#F6F8F4] p-4">
                    <input
                      required
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-[#173725]"
                    />
                    <span className="text-xs leading-5 text-[#707B72]">
                      I&apos;m happy to be contacted about my Velyquo demo
                      request. Please do not include patient information in this
                      form.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#173725] px-6 py-4 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(23,55,37,0.12)] transition hover:bg-[#102D1C]"
                  >
                    Request my Velyquo demo
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-center text-[11px] leading-5 text-[#969F98]">
                    Prototype form: submission is currently demonstrated in the
                    browser and is not yet connected to a production CRM or
                    booking system.
                  </p>
                </form>
              </>
            ) : (
              <div className="flex min-h-[600px] flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#E6EFE4]">
                  <Check className="h-6 w-6 text-[#3E5D47]" />
                </div>
                <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.18em] text-[#607765]">
                  Demo request captured
                </p>
                <h2 className="mt-3 max-w-[440px] text-[36px] font-semibold leading-[1.08] tracking-[-0.045em]">
                  Your Velyquo demo request looks good.
                </h2>
                <p className="mt-5 max-w-[470px] text-sm leading-7 text-[#748077]">
                  This prototype demonstrates the completed request experience.
                  It is not yet connected to a live CRM, email workflow or
                  calendar booking system.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="rounded-[13px] border border-[#D8E0D6] bg-[#F8FAF7] px-6 py-3.5 text-sm font-semibold text-[#304338]"
                  >
                    Submit another
                  </button>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-[13px] bg-[#173725] px-6 py-3.5 text-sm font-semibold text-white"
                  >
                    Explore Velyquo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-[#E1E6DF] bg-[#FBFCF9]">
        <div className="mx-auto max-w-[1180px] px-6 py-20 lg:px-10 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#607765]">
                Founding clinics
              </p>
              <h2 className="mt-5 text-[38px] font-semibold leading-[1.06] tracking-[-0.05em]">
                Interested in helping shape Velyquo?
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#748077]">
                We&apos;re proposing a limited Founding Clinic Programme for
                early UK clinics that want to explore the complete Pro
                experience and provide structured product feedback.
              </p>
            </div>

            <div className="rounded-[26px] bg-[#173725] p-8 text-white sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A7BDAA]">
                Founding Clinic Programme
              </p>
              <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-[44px] font-semibold tracking-[-0.055em]">
                  £199
                </span>
                <span className="pb-2 text-sm text-[#B5C7B9]">/month</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#DCE6DE]">
                + £299 one-time onboarding
              </p>
              <p className="mt-5 text-sm leading-7 text-[#B9C9BC]">
                Full Pro experience, assisted onboarding and founding-clinic
                pricing locked for 12 months. Proposed for the first 10
                participating UK clinics.
              </p>
              <Link
                href="/pricing"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white"
              >
                View full pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[960px] px-6 py-24 lg:px-10">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#607765]">
              Demo FAQ
            </p>
            <h2 className="mt-5 text-[40px] font-semibold tracking-[-0.05em]">
              Before your walkthrough.
            </h2>
          </div>

          <div className="mt-12 divide-y divide-[#E0E5DE] border-y border-[#E0E5DE]">
            {faqs.map((faq, index) => (
              <div key={faq.q}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
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
                  <p className="max-w-[760px] pb-6 pr-10 text-sm leading-7 text-[#727D74]">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
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
              <Link href="/">Home</Link>
              <Link href="/#product">Product</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/login">Sign in</Link>
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

const inputClass =
  "w-full rounded-[14px] border border-[#DCE3DA] bg-[#FCFDFB] px-4 py-3.5 text-sm text-[#26352B] outline-none transition placeholder:text-[#A6AEA8] focus:border-[#78907D] focus:ring-4 focus:ring-[#EAF0E8]";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-[#536158]">
        {label}
        {required && <span className="ml-1 text-[#718275]">*</span>}
      </span>
      {children}
    </label>
  );
}

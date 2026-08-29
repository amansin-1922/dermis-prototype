"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, BarChart3, CalendarDays, Check, ChevronDown,
  FileText, Menu, ScanFace, Sparkles, Stethoscope, Users, X,
} from "lucide-react";

const features = [
  ["01", "Patient intelligence", "Bring concerns, consultations, analyses, appointments and treatment history into one structured patient journey.", Users],
  ["02", "AI-assisted skin analysis", "Support consultations with structured skin assessments and keep analysis history available for progress review.", ScanFace],
  ["03", "Treatment planning", "Turn consultation context into personalised treatment recommendations, programmes and appointment handoffs.", Stethoscope],
  ["04", "Progress tracking", "Compare baseline and follow-up assessments alongside completed treatments and progress metrics.", BarChart3],
] as const;

const faqs = [
  ["Who is Velyquo designed for?", "Velyquo is being designed for aesthetic clinics and independent aesthetic practitioners who want a more connected way to manage consultations, skin assessments, treatment planning, appointments and patient progress."],
  ["Does Velyquo replace existing booking software?", "Velyquo includes appointment and follow-up workflows, but whether it replaces an existing booking platform will depend on a clinic's requirements and the integrations available in the production product."],
  ["How does the skin analysis work?", "The current Velyquo experience demonstrates an AI-assisted skin analysis workflow for consultations and progress tracking. Production analysis capabilities and their intended use will be defined and validated before commercial deployment."],
  ["Can Velyquo support multiple practitioners?", "Yes. The Velyquo product experience includes practitioner profiles, working days, hours and appointment scheduling across a clinic team."],
  ["Can patient progress be tracked over time?", "Yes. Velyquo is designed around longitudinal patient journeys, including analysis history, completed treatments, progress comparisons and Before & After reporting."],
  ["How is patient information protected?", "The current public experience is a demonstration prototype and should not be used for real patient information. Security, privacy, data processing and regulatory controls will form part of the production architecture before live clinic use."],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-[#F5F6F2] text-[#172019]">
      <header className="sticky top-0 z-50 border-b border-[#E1E6DE] bg-[#F9FAF7]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D7E0D5] bg-[#EAF0E8]"><Sparkles className="h-4 w-4 text-[#355340]" /></div>
            <span className="text-[23px] font-semibold tracking-[-0.045em]">velyquo.</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#5F6C62] lg:flex">
            <a href="#product">Product</a><a href="#progress">Before & After</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-[#405047]">Sign in</Link>
            <a href="/demo" className="inline-flex items-center gap-2 rounded-xl bg-[#173725] px-5 py-3 text-sm font-semibold text-white">Book a demo <ArrowRight className="h-4 w-4" /></a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE4DB] bg-white lg:hidden" aria-label="Toggle navigation">
            {menuOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
          </button>
        </div>
        {menuOpen && <div className="border-t border-[#E3E7E1] bg-[#FAFBF8] px-6 py-5 lg:hidden"><div className="flex flex-col gap-4 text-sm font-medium">
          <a href="#product" onClick={()=>setMenuOpen(false)}>Product</a><a href="#progress" onClick={()=>setMenuOpen(false)}>Before & After</a><a href="#pricing" onClick={()=>setMenuOpen(false)}>Pricing</a><a href="#faq" onClick={()=>setMenuOpen(false)}>FAQ</a>
          <div className="flex gap-3"><Link href="/login" className="flex-1 rounded-xl border bg-white px-4 py-3 text-center">Sign in</Link><a href="/demo" className="flex-1 rounded-xl bg-[#173725] px-4 py-3 text-center text-white">Book a demo</a></div>
        </div></div>}
      </header>

      <section className="overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-20 lg:px-10 lg:pb-28 lg:pt-28">
          <div className="mx-auto max-w-[1000px] text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#D7E1D5] bg-[#EDF2EB] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55705D]"><Sparkles className="h-3.5 w-3.5"/> Intelligent clinic workspace</div>
            <h1 className="text-[48px] font-semibold leading-[.99] tracking-[-0.055em] sm:text-[64px] lg:text-[82px]">The intelligent operating platform for <span className="text-[#45634E]">aesthetic clinics.</span></h1>
            <p className="mx-auto mt-8 max-w-[760px] text-[17px] leading-8 text-[#667168] sm:text-[19px]">Bring patient management, AI-assisted skin analysis, consultations, treatment planning and progress tracking into one considered workspace.</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="/demo" className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#173725] px-7 py-4 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(23,55,37,.14)]">Book a free demo <ArrowRight className="h-4 w-4"/></a>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-[14px] border border-[#D7DED5] bg-[#FCFDFB] px-7 py-4 text-sm font-semibold text-[#304338]">Explore the prototype</Link>
            </div>
            <p className="mt-5 text-xs text-[#89928B]">Demonstration environment · Do not enter real patient information</p>
          </div>

          <div className="mx-auto mt-16 max-w-[1240px] overflow-hidden rounded-[28px] border border-[#D8E0D6] bg-[#FEFFFD] p-3 shadow-[0_30px_80px_rgba(31,51,38,.10)] sm:p-5">
            <div className="overflow-hidden rounded-[20px] border border-[#E2E7E0] bg-[#F5F7F3]">
              <div className="flex items-center justify-between border-b border-[#E2E7E0] bg-[#FBFCFA] px-5 py-4"><div className="flex gap-2">{[1,2,3].map(i=><span key={i} className="h-2.5 w-2.5 rounded-full bg-[#D9DED7]"/>)}</div><span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#8A958C]">Velyquo workspace</span><span className="w-10"/></div>
              <div className="grid min-h-[500px] lg:grid-cols-[210px_1fr]">
                <aside className="hidden border-r border-[#E1E6DF] bg-[#FAFBF8] p-5 lg:block"><div className="mb-8 text-lg font-semibold">velyquo.</div>{["Overview","Patients","Skin analysis","Treatments","Appointments"].map((x,i)=><div key={x} className={`mb-2 rounded-xl px-3 py-3 text-xs font-semibold ${i===0?"bg-[#E9F0E7] text-[#2E5138]":"text-[#778179]"}`}>{x}</div>)}</aside>
                <div className="p-6 sm:p-9">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#718275]">Clinic overview</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.045em]">Good morning, Sarah.</h2><p className="mt-2 text-sm text-[#7B867D]">Here is what is happening across your clinic today.</p></div><span className="rounded-xl bg-[#173725] px-4 py-3 text-xs font-semibold text-white">+ New analysis</span></div>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["128","Active patients"],["12","Appointments today"],["8","Analyses this week"],["6","Follow-ups due"]].map(([v,l])=><div key={l} className="rounded-[18px] border border-[#DFE5DD] bg-white p-5"><div className="text-2xl font-semibold">{v}</div><div className="mt-2 text-xs text-[#7B867D]">{l}</div></div>)}</div>
                  <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
                    <div className="rounded-[20px] border border-[#DFE5DD] bg-white p-5"><p className="text-sm font-semibold">Patient activity</p><p className="mt-1 text-xs text-[#8A938C]">Recent clinical journeys</p><div className="mt-5 space-y-3">{[["Emily Johnson","Skin analysis completed","81"],["Olivia Smith","Treatment plan updated","76"],["Amelia Brown","Follow-up scheduled","73"]].map(([n,e,s])=><div key={n} className="flex items-center gap-3 rounded-xl bg-[#F7F9F6] p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5EEE4] text-xs font-bold text-[#45604D]">{n.split(" ").map(z=>z[0]).join("")}</div><div className="flex-1"><p className="text-xs font-semibold">{n}</p><p className="mt-1 text-[11px] text-[#8A938C]">{e}</p></div><span className="font-semibold text-[#35533F]">{s}</span></div>)}</div></div>
                    <div className="rounded-[20px] bg-[#193526] p-6 text-white"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#A9C0AE]">Velyquo intelligence</p><h3 className="mt-4 text-xl font-semibold">Clinical context, connected.</h3><p className="mt-3 text-xs leading-6 text-[#C8D6CB]">Bring analysis, consultation and treatment information together around the patient.</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="border-y border-[#E1E6DF] bg-[#FBFCF9]">
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
            <div><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#607765]">One connected journey</p><h2 className="mt-5 text-[40px] font-semibold leading-[1.05] tracking-[-.05em] sm:text-[52px]">Your patient journey should not live across five different systems.</h2><p className="mt-6 text-base leading-7 text-[#707A72]">Velyquo is designed to connect the information surrounding a patient, from first consultation through treatment and progress review.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">{features.map(([num,title,text,Icon])=><article key={title} className="rounded-[24px] border border-[#DEE5DC] bg-white p-7"><div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#EAF0E8] text-[#355340]"><Icon className="h-5 w-5"/></div><span className="text-[11px] font-bold text-[#A0AAA2]">{num}</span></div><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#768078]">{text}</p></article>)}</div>
          </div>
        </div>
      </section>

      <section id="progress">
        <div className="mx-auto max-w-[1240px] px-6 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[760px] text-center"><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#607765]">Progress intelligence</p><h2 className="mt-5 text-[42px] font-semibold leading-[1.04] tracking-[-.05em] sm:text-[56px]">Don't just describe progress. Make it visible.</h2><p className="mt-6 text-base leading-7 text-[#707A72]">Bring baseline assessments, follow-up analysis, completed treatments and progress metrics together in one considered patient experience.</p></div>
          <div className="mt-16 grid overflow-hidden rounded-[28px] border border-[#DCE4DA] bg-white shadow-[0_24px_65px_rgba(31,51,38,.07)] lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-7 sm:p-10"><div className="flex justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#718275]">Before & After</p><h3 className="mt-2 text-2xl font-semibold">Emily Johnson</h3></div><span className="h-fit rounded-full bg-[#EAF1E8] px-3 py-2 text-[11px] font-bold text-[#46604E]">+13 progress</span></div>
              <div className="mt-8 grid grid-cols-2 gap-3">{[["Baseline","10 Aug 2026 · Score 68","#E9ECE6"],["Current","27 Aug 2026 · Score 81","#DFE8DE"]].map(([a,b,c])=><div key={a} style={{backgroundColor:c}} className="relative min-h-[330px] overflow-hidden rounded-[20px]"><div className="absolute inset-0 flex items-center justify-center"><ScanFace className="h-24 w-24 stroke-[1] text-[#9EAD9F]"/></div><span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase">{a}</span><span className="absolute bottom-4 left-4 text-xs font-semibold">{b}</span></div>)}</div>
            </div>
            <div className="border-t border-[#E2E7E0] bg-[#F7F9F6] p-8 lg:border-l lg:border-t-0 lg:p-12"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#718275]">Treatment journey</p><h3 className="mt-4 text-3xl font-semibold">A clearer conversation about outcomes.</h3><p className="mt-5 text-sm leading-7 text-[#6F7A71]">Velyquo connects the comparison with the treatment programme behind it, helping practitioners review the journey with more context.</p><div className="mt-8 space-y-4">{["Visual baseline and follow-up comparison","Progress score and metric changes","Completed treatment timeline","Professional progress reporting"].map(x=><div key={x} className="flex gap-3 text-sm font-medium text-[#526057]"><Check className="h-4 w-4 text-[#36543F]"/>{x}</div>)}</div></div>
          </div>
        </div>
      </section>

      <section className="bg-[#17291D] text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#9DB4A2]">Clinic operations</p><h2 className="mt-5 max-w-[760px] text-[40px] font-semibold leading-[1.05] tracking-[-.05em] sm:text-[52px]">Clinical intelligence meets everyday clinic management.</h2>
          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[[CalendarDays,"Appointments"],[Users,"Practitioners"],[FileText,"Patient records"],[BarChart3,"Progress reports"]].map(([Icon,title])=>{const C=Icon as typeof CalendarDays; return <div key={title as string} className="rounded-[22px] border border-white/10 bg-white/[.035] p-6"><C className="h-5 w-5 text-[#A9C1AE]"/><h3 className="mt-8 text-lg font-semibold">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#AEBEB2]">Keep this part of the clinic journey connected to the wider Velyquo workspace.</p></div>})}</div>
        </div>
      </section>

      <section id="pricing">
        <div className="mx-auto max-w-[1240px] px-6 py-24 lg:px-10 lg:py-32">
          <div className="text-center"><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#607765]">Pricing</p><h2 className="mt-5 text-[42px] font-semibold tracking-[-.05em] sm:text-[54px]">Designed to grow with your clinic.</h2></div>
          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {[
              ["Essential","£149","Independent practitioners and smaller clinics.",["Patient workspace","Skin analysis workflow","Treatment planning","Appointments"]],
              ["Pro","£249","Established clinics wanting the complete Velyquo experience.",["Everything in Essential","Before & After progress","Progress reports","Multi-practitioner workflows"]],
              ["Multi-Clinic","£499+","Growing businesses operating across multiple clinic locations.",["Multiple locations","Expanded team access","Consolidated workflows","Priority onboarding"]],
            ].map(([name,price,desc,items],idx)=><article key={name as string} className={`rounded-[26px] border p-8 ${idx===1?"border-[#31523B] bg-[#173725] text-white":"border-[#DDE4DB] bg-white"}`}><p className="text-sm font-semibold">{name as string}</p><div className="mt-7"><span className="text-[48px] font-semibold tracking-[-.055em]">{price as string}</span><span className="ml-2 text-sm opacity-60">/month</span></div><p className="mt-4 min-h-[50px] text-sm leading-6 opacity-70">{desc as string}</p><div className="my-7 h-px bg-current opacity-10"/><div className="space-y-3">{(items as string[]).map(x=><div key={x} className="flex gap-3 text-sm"><Check className="h-4 w-4"/>{x}</div>)}</div><a href="/demo" className={`mt-9 flex justify-center rounded-[13px] px-5 py-3.5 text-sm font-semibold ${idx===1?"bg-white text-[#173725]":"bg-[#F4F6F2] text-[#304338]"}`}>Book a demo</a></article>)}
          </div>
          <div className="mt-5 rounded-[24px] border border-[#D6E0D4] bg-[#EDF3EB] p-7 sm:flex sm:items-center sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.17em] text-[#58705E]">Founding Clinic Programme</p><h3 className="mt-3 text-2xl font-semibold">£199/month + £299 onboarding</h3><p className="mt-2 text-sm text-[#68766B]">Full Pro experience, assisted onboarding and founding-clinic pricing locked for 12 months. Limited to the first 10 participating UK clinics.</p></div><a href="/demo" className="mt-6 shrink-0 rounded-[13px] bg-[#173725] px-6 py-3.5 text-sm font-semibold text-white sm:ml-8 sm:mt-0">Apply for founding access</a></div>
        </div>
      </section>

      <section id="faq" className="border-y border-[#E1E6DF] bg-[#FBFCF9]">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-6 py-24 lg:grid-cols-[.7fr_1.3fr] lg:px-10">
          <div><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#607765]">Questions</p><h2 className="mt-5 text-[40px] font-semibold tracking-[-.05em]">A clearer look at Velyquo.</h2><p className="mt-5 text-sm leading-7 text-[#758078]">Velyquo is currently being demonstrated as a product prototype while the production platform is developed.</p></div>
          <div className="divide-y divide-[#E0E5DE] border-y border-[#E0E5DE]">{faqs.map(([q,a],i)=><div key={q}><button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="flex w-full items-center justify-between gap-6 py-6 text-left"><span className="text-[15px] font-semibold">{q}</span><ChevronDown className={`h-4 w-4 transition ${openFaq===i?"rotate-180":""}`}/></button>{openFaq===i&&<p className="pb-6 pr-10 text-sm leading-7 text-[#727D74]">{a}</p>}</div>)}</div>
        </div>
      </section>

      <section id="demo" className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1240px] rounded-[30px] bg-[#173725] px-7 py-14 text-white sm:px-12 lg:px-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#A7BDAA]">Private product demonstration</p><h2 className="mt-5 text-[42px] font-semibold leading-[1.03] tracking-[-.05em] sm:text-[58px]">See how Velyquo could fit your clinic.</h2><p className="mt-6 max-w-[680px] text-[15px] leading-7 text-[#BBCABD]">Explore the journey from consultation and skin assessment through treatment planning, appointments and progress reporting.</p></div><div className="flex flex-col gap-3"><a href="mailto:contactus@technorichaisolutions.com?subject=Velyquo%20Demo%20Request" className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-white px-7 py-4 text-sm font-bold text-[#173725]">Request a demo <ArrowRight className="h-4 w-4"/></a><Link href="/dashboard" className="rounded-[14px] border border-white/15 px-7 py-4 text-center text-sm font-semibold">Explore prototype</Link></div></div>
        </div>
      </section>

      <footer className="border-t border-[#E0E5DE] bg-[#F9FAF7]"><div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-10"><div className="flex flex-col justify-between gap-8 sm:flex-row"><div><span className="text-[22px] font-semibold tracking-[-.045em]">velyquo.</span><p className="mt-3 text-sm text-[#758078]">Intelligence for modern aesthetic clinics.</p></div><div className="flex flex-wrap gap-6 text-sm text-[#69756C]"><a href="#product">Product</a><a href="#progress">Progress</a><a href="#pricing">Pricing</a><a href="/demo">Demo</a></div></div><div className="mt-10 flex flex-col justify-between gap-3 border-t border-[#E1E6DF] pt-6 text-[11px] text-[#929B94] sm:flex-row"><span>© 2026 Velyquo. Demonstration product experience.</span><span>Prototype only · Not for storage of real patient information</span></div></div></footer>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import Sidebar from "@/app/components/sidebar";

type Patient = {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  lastVisit: string;
  status: "Active" | "Inactive";
  concern: string;
  analyses: number;
};

type SkinMetric = {
  label: string;
  value: number;
  status: string;
};

type AnalysisRecord = {
  id: number;
  date: string;
  score: number;
  image: string;
  metrics: SkinMetric[];
};

type ProgressMetric = {
  label: string;
  before: number;
  after: number;
  change: number;
};

type ClinicalProfile = {
  score: number;
  change: string;
  skinType: string;
  metrics: SkinMetric[];
  timeline: {
    date: string;
    title: string;
    description: string;
    type: string;
  }[];
  treatments: {
    name: string;
    reason: string;
    price: string;
  }[];
};

type SavedTreatmentPlan = {
  id: number;
  patient: string;
  patientId: number;
  treatment: string;
  duration: string;
  price: string;
  status: "Active" | "Completed";
  notes: string;
  createdAt: string;
};

type TreatmentHistoryRecord = {
  id: number;
  appointmentId?: number;
  patientId: number;
  patient: string;
  treatment: string;
  date: string;
  time: string;
  duration: string;
  practitioner?: string;
  notes?: string;
  completedAt?: string;
};

type ProgressReport = {
  id: number;
  patientId: number;
  patient: string;
  baselineDate: string;
  comparisonDate: string;
  baselineScore: number;
  comparisonScore: number;
  scoreChange: number;
  metrics: ProgressMetric[];
  treatmentProgramme: string;
  completedTreatments?: TreatmentHistoryRecord[];
  summary: string;
  createdAt: string;
};

type ClinicSettings = {
  clinicName?: string;
  practitionerName?: string;
  initials?: string;
};

const fallbackPatient: Patient = {
  id: 1,
  name: "Emily Johnson",
  email: "emily.johnson@email.com",
  phone: "+44 7700 900123",
  age: 29,
  lastVisit: "25 Aug 2026",
  status: "Active",
  concern: "Acne & pigmentation",
  analyses: 4,
};

function parseClinicalDate(value?: string | number | null) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const trimmed = String(value).trim();

  if (!trimmed) return null;

  // ISO / browser-readable dates.
  const direct = new Date(trimmed);

  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  // UK-style numeric dates: DD/MM/YYYY or DD-MM-YYYY.
  const numericMatch = trimmed.match(
    /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/
  );

  if (numericMatch) {
    const [, day, month, year] = numericMatch;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return Number.isNaN(parsed.getTime())
      ? null
      : parsed;
  }

  // Display dates used in the prototype, e.g. "25 Aug 2026".
  const monthNames: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  const textMatch = trimmed.match(
    /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/
  );

  if (textMatch) {
    const [, day, monthText, year] = textMatch;
    const month =
      monthNames[
        monthText.slice(0, 3).toLowerCase()
      ];

    if (month !== undefined) {
      const parsed = new Date(
        Number(year),
        month,
        Number(day)
      );

      return Number.isNaN(parsed.getTime())
        ? null
        : parsed;
    }
  }

  return null;
}

function getAnalysisDate(analysis: AnalysisRecord | null) {
  if (!analysis) return null;

  const fromDate = parseClinicalDate(analysis.date);

  if (fromDate) return fromDate;

  // Older saved analyses sometimes used Date.now() as the id.
  if (
    typeof analysis.id === "number" &&
    analysis.id > 1000000000000
  ) {
    return parseClinicalDate(analysis.id);
  }

  return null;
}

function getTreatmentDate(record: TreatmentHistoryRecord) {
  // Prefer the actual appointment/treatment date.
  const fromRecordDate = parseClinicalDate(record.date);

  if (fromRecordDate) return fromRecordDate;

  // completedAt is only a fallback because a practitioner may mark an
  // older appointment completed on a later day.
  return parseClinicalDate(record.completedAt);
}

export default function BeforeAfterPage() {
  const [patient, setPatient] =
    useState<Patient>(fallbackPatient);

  const [analysisHistory, setAnalysisHistory] =
    useState<AnalysisRecord[]>([]);

  const [clinicalProfile, setClinicalProfile] =
    useState<ClinicalProfile | null>(null);

  const [savedTreatmentPlans, setSavedTreatmentPlans] =
    useState<SavedTreatmentPlan[]>([]);

  const [treatmentHistory, setTreatmentHistory] =
    useState<TreatmentHistoryRecord[]>([]);

  const [slider, setSlider] = useState(50);

  const [comparisonIndex, setComparisonIndex] =
    useState(0);

  const [reportGenerated, setReportGenerated] =
    useState(false);

  const [reportAlreadyExists, setReportAlreadyExists] =
    useState(false);

  const [clinicSettings, setClinicSettings] =
    useState<ClinicSettings>({
      clinicName: "Velyquo Clinic",
      practitionerName: "Sarah Williams",
      initials: "SW",
    });

  /*
   * LOAD PATIENT DATA
   */
  useEffect(() => {
    let currentPatient = fallbackPatient;

    /*
     * CLINIC SETTINGS
     */
    const storedClinicSettings =
      localStorage.getItem(
        "dermisClinicSettings"
      );

    if (storedClinicSettings) {
      try {
        const parsedSettings: ClinicSettings =
          JSON.parse(storedClinicSettings);

        setClinicSettings((current) => ({
          ...current,
          ...parsedSettings,
        }));
      } catch (error) {
        console.error(
          "Could not load clinic settings:",
          error
        );
      }
    }

    /*
     * SELECTED PATIENT
     */
    const savedPatient =
      localStorage.getItem(
        "dermisSelectedPatient"
      );

    if (savedPatient) {
      try {
        currentPatient =
          JSON.parse(savedPatient);

        setPatient(currentPatient);
      } catch (error) {
        console.error(
          "Could not load selected patient:",
          error
        );
      }
    }

    /*
     * ANALYSIS HISTORY
     */
    const storedHistory =
      localStorage.getItem(
        "dermisAnalysisHistory"
      );

    if (storedHistory) {
      try {
        const parsedHistory: Record<
          number,
          AnalysisRecord[]
        > = JSON.parse(storedHistory);

        const patientHistory =
          parsedHistory[currentPatient.id] ||
          [];

        /*
         * Keep analyses that contain
         * a saved patient photograph.
         */
        const validHistory =
          patientHistory
            .filter(
              (analysis) =>
                analysis.image &&
                analysis.image.length > 0
            )
            .sort(
              (a, b) =>
                Number(a.id) -
                Number(b.id)
            );

        setAnalysisHistory(
          validHistory
        );

        /*
         * Start on latest comparison.
         *
         * Baseline remains analysis #1.
         * Latest saved analysis becomes "after".
         */
        if (
          validHistory.length >= 2
        ) {
          setComparisonIndex(
            validHistory.length - 2
          );
        }
      } catch (error) {
        console.error(
          "Could not load analysis history:",
          error
        );
      }
    }

    /*
     * CLINICAL PROFILE
     */
    const storedClinicalProfiles =
      localStorage.getItem(
        "dermisClinicalProfiles"
      );

    if (storedClinicalProfiles) {
      try {
        const profiles: Record<
          number,
          ClinicalProfile
        > = JSON.parse(
          storedClinicalProfiles
        );

        setClinicalProfile(
          profiles[currentPatient.id] ||
            null
        );
      } catch (error) {
        console.error(
          "Could not load clinical profile:",
          error
        );
      }
    }

    /*
     * ACTUAL SAVED TREATMENT PLANS
     */
    const storedTreatmentPlans =
      localStorage.getItem(
        "dermisTreatmentPlans"
      );

    if (storedTreatmentPlans) {
      try {
        const plansByPatient: Record<
          number,
          SavedTreatmentPlan[]
        > = JSON.parse(
          storedTreatmentPlans
        );

        setSavedTreatmentPlans(
          plansByPatient[
            currentPatient.id
          ] || []
        );
      } catch (error) {
        console.error(
          "Could not load treatment plans:",
          error
        );
      }
    }


    /*
     * COMPLETED TREATMENT HISTORY
     */
    const storedTreatmentHistory =
      localStorage.getItem("dermisTreatmentHistory");

    if (storedTreatmentHistory) {
      try {
        const parsed = JSON.parse(storedTreatmentHistory);
        const records: TreatmentHistoryRecord[] = Array.isArray(parsed)
          ? parsed
          : parsed[currentPatient.id] || [];

        setTreatmentHistory(
          records.filter((record) =>
            record.patientId === currentPatient.id ||
            (!record.patientId && record.patient === currentPatient.name)
          )
        );
      } catch (error) {
        console.error("Could not load treatment history:", error);
      }
    }
  }, []);

  /*
   * BASELINE
   */
  const beforeAnalysis =
    analysisHistory.length > 0
      ? analysisHistory[0]
      : null;

  /*
   * SELECTED COMPARISON
   */
  const afterAnalysis =
    analysisHistory.length >= 2
      ? analysisHistory[
          comparisonIndex + 1
        ]
      : null;

  const totalComparisons =
    Math.max(
      analysisHistory.length - 1,
      0
    );

  /*
   * MERGE METRIC LABELS FROM BOTH ANALYSES
   *
   * This means if a newer analysis contains
   * a metric the first analysis did not,
   * the comparison still handles it safely.
   */
  const progressMetrics =
    useMemo<ProgressMetric[]>(() => {
      if (
        !beforeAnalysis ||
        !afterAnalysis
      ) {
        return [];
      }

      const labels = Array.from(
        new Set([
          ...beforeAnalysis.metrics.map(
            (metric) =>
              metric.label
          ),
          ...afterAnalysis.metrics.map(
            (metric) =>
              metric.label
          ),
        ])
      );

      return labels.map(
        (label) => {
          const beforeMetric =
            beforeAnalysis.metrics.find(
              (metric) =>
                metric.label.toLowerCase() ===
                label.toLowerCase()
            );

          const afterMetric =
            afterAnalysis.metrics.find(
              (metric) =>
                metric.label.toLowerCase() ===
                label.toLowerCase()
            );

          const before =
            beforeMetric?.value ?? 0;

          const after =
            afterMetric?.value ?? before;

          return {
            label,
            before,
            after,
            change:
              after - before,
          };
        }
      );
    }, [
      beforeAnalysis,
      afterAnalysis,
    ]);

  /*
   * SCORE CHANGE
   */
  const scoreImprovement =
    beforeAnalysis &&
    afterAnalysis
      ? afterAnalysis.score -
        beforeAnalysis.score
      : 0;

  /*
   * SCORE CHANGE %
   */
  const scoreImprovementPercent =
    beforeAnalysis &&
    afterAnalysis &&
    beforeAnalysis.score > 0
      ? Math.round(
          (scoreImprovement /
            beforeAnalysis.score) *
            100
        )
      : 0;

  /*
   * STRONGEST METRIC IMPROVEMENT
   */
  const strongestImprovement =
    useMemo(() => {
      if (
        progressMetrics.length === 0
      ) {
        return null;
      }

      return [...progressMetrics].sort(
        (a, b) =>
          b.change - a.change
      )[0];
    }, [progressMetrics]);

  /*
   * BIGGEST DECLINE
   */
  const biggestDecline =
    useMemo(() => {
      const declining =
        progressMetrics.filter(
          (metric) =>
            metric.change < 0
        );

      if (
        declining.length === 0
      ) {
        return null;
      }

      return [...declining].sort(
        (a, b) =>
          a.change - b.change
      )[0];
    }, [progressMetrics]);

  /*
   * PATIENT INITIALS
   */
  const initials = patient.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const practitionerInitials =
    clinicSettings.initials?.trim() ||
    clinicSettings.practitionerName
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "SW";

  /*
   * ACTIVE PLANS
   */
  const activeTreatmentPlans =
    savedTreatmentPlans.filter(
      (plan) =>
        plan.status === "Active"
    );

  const completedTreatments = useMemo(() => {
    if (!beforeAnalysis || !afterAnalysis) {
      return [];
    }

    const beforeDate =
      getAnalysisDate(beforeAnalysis);
    const afterDate =
      getAnalysisDate(afterAnalysis);

    /*
     * Only show treatments that happened inside the selected
     * baseline → comparison analysis window.
     *
     * The treatment's appointment date is preferred over completedAt,
     * because an older appointment may be marked "Completed" later.
     */
    if (!beforeDate || !afterDate) {
      return [];
    }

    const startDate = new Date(beforeDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(afterDate);
    endDate.setHours(23, 59, 59, 999);

    const start = Math.min(
      startDate.getTime(),
      endDate.getTime()
    );

    const end = Math.max(
      startDate.getTime(),
      endDate.getTime()
    );

    return treatmentHistory
      .filter((record) => {
        const treatmentDate =
          getTreatmentDate(record);

        if (!treatmentDate) {
          return false;
        }

        const treatmentTime =
          treatmentDate.getTime();

        return (
          treatmentTime >= start &&
          treatmentTime <= end
        );
      })
      .sort((a, b) => {
        const aDate =
          getTreatmentDate(a)?.getTime() ?? 0;
        const bDate =
          getTreatmentDate(b)?.getTime() ?? 0;

        return aDate - bDate;
      });
  }, [afterAnalysis, beforeAnalysis, treatmentHistory]);

  /*
   * TREATMENT PROGRAMME
   *
   * Prefer actual practitioner-created plans.
   * Fall back to AI recommendations.
   */
  const treatmentProgramme =
    completedTreatments.length > 0
      ? Array.from(new Set(completedTreatments.map((item) => item.treatment))).join(" + ")
      : activeTreatmentPlans.length > 0
      ? activeTreatmentPlans
          .map(
            (plan) =>
              plan.treatment
          )
          .join(" + ")
      : clinicalProfile?.treatments &&
        clinicalProfile.treatments
          .length > 0
      ? clinicalProfile.treatments
          .map(
            (treatment) =>
              treatment.name
          )
          .join(" + ")
      : "No saved treatment plan";

  /*
   * DYNAMIC PROGRESS SUMMARY
   */
  const progressSummary =
    useMemo(() => {
      if (
        !beforeAnalysis ||
        !afterAnalysis
      ) {
        return "";
      }

      let summary = "";

      if (scoreImprovement > 0) {
        summary =
          `${patient.name}'s overall skin score improved by ${scoreImprovement} points, from ${beforeAnalysis.score}/100 to ${afterAnalysis.score}/100.`;
      } else if (
        scoreImprovement === 0
      ) {
        summary =
          `${patient.name}'s overall skin score remained stable at ${afterAnalysis.score}/100 between the selected assessments.`;
      } else {
        summary =
          `${patient.name}'s overall skin score decreased by ${Math.abs(
            scoreImprovement
          )} points between the selected assessments.`;
      }

      if (
        strongestImprovement &&
        strongestImprovement.change > 0
      ) {
        summary +=
          ` The strongest recorded improvement is ${strongestImprovement.label.toLowerCase()}, increasing by ${strongestImprovement.change} points.`;
      }

      if (biggestDecline) {
        summary +=
          ` ${biggestDecline.label} decreased by ${Math.abs(
            biggestDecline.change
          )} points and may warrant continued monitoring.`;
      }

      summary +=
        ` The primary recorded concern remains ${patient.concern.toLowerCase()}.`;

      return summary;
    }, [
      afterAnalysis,
      beforeAnalysis,
      biggestDecline,
      patient.concern,
      patient.name,
      scoreImprovement,
      strongestImprovement,
    ]);

  /*
   * COMPARISON NAVIGATION
   */
  const previousComparison =
    () => {
      setComparisonIndex(
        (current) =>
          Math.max(
            current - 1,
            0
          )
      );

      setSlider(50);
    };

  const nextComparison = () => {
    setComparisonIndex(
      (current) =>
        Math.min(
          current + 1,
          totalComparisons - 1
        )
    );

    setSlider(50);
  };

  /*
   * STATE HELPERS
   */
  const hasOneAnalysis =
    analysisHistory.length === 1;

  const hasComparison =
    Boolean(
      beforeAnalysis &&
        afterAnalysis
    );

  /*
   * KEEP REPORT STATE IN SYNC WITH SAVED REPORT HISTORY
   */
  useEffect(() => {
    if (!beforeAnalysis || !afterAnalysis) {
      setReportGenerated(false);
      setReportAlreadyExists(false);
      return;
    }

    try {
      const storedReports = localStorage.getItem(
        "dermisProgressReports"
      );

      if (!storedReports) {
        setReportGenerated(false);
        setReportAlreadyExists(false);
        return;
      }

      const reportsByPatient: Record<
        number,
        ProgressReport[]
      > = JSON.parse(storedReports);

      const currentReports =
        reportsByPatient[patient.id] || [];

      const duplicateExists =
        currentReports.some(
          (savedReport) =>
            savedReport.patientId === patient.id &&
            savedReport.baselineDate === beforeAnalysis.date &&
            savedReport.comparisonDate === afterAnalysis.date
        );

      setReportGenerated(duplicateExists);
      setReportAlreadyExists(duplicateExists);
    } catch (error) {
      console.error(
        "Could not check progress report history:",
        error
      );
      setReportGenerated(false);
      setReportAlreadyExists(false);
    }
  }, [
    afterAnalysis,
    beforeAnalysis,
    patient.id,
  ]);

  /*
   * GENERATE + SAVE PROGRESS REPORT
   */
  const generateProgressReport = () => {
    if (!beforeAnalysis || !afterAnalysis) {
      return;
    }

    let reportsByPatient: Record<
      number,
      ProgressReport[]
    > = {};

    const storedReports =
      localStorage.getItem(
        "dermisProgressReports"
      );

    if (storedReports) {
      try {
        reportsByPatient =
          JSON.parse(storedReports);
      } catch (error) {
        console.error(
          "Could not load progress reports:",
          error
        );
      }
    }

    const currentReports =
      reportsByPatient[patient.id] || [];

    const duplicateExists =
      currentReports.some(
        (savedReport) =>
          savedReport.patientId === patient.id &&
          savedReport.baselineDate === beforeAnalysis.date &&
          savedReport.comparisonDate === afterAnalysis.date
      );

    if (duplicateExists) {
      setReportGenerated(true);
      setReportAlreadyExists(true);
      return;
    }

    const report: ProgressReport = {
      id: Date.now(),
      patientId: patient.id,
      patient: patient.name,
      baselineDate: beforeAnalysis.date,
      comparisonDate: afterAnalysis.date,
      baselineScore: beforeAnalysis.score,
      comparisonScore: afterAnalysis.score,
      scoreChange: scoreImprovement,
      metrics: progressMetrics,
      treatmentProgramme,
      completedTreatments,
      summary: progressSummary,
      createdAt: new Date().toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),
    };

    reportsByPatient[patient.id] = [
      report,
      ...currentReports,
    ];

    localStorage.setItem(
      "dermisProgressReports",
      JSON.stringify(reportsByPatient)
    );

    setReportGenerated(true);
    setReportAlreadyExists(false);
  };

  /*
   * NAVIGATION HELPERS
   */
  const runNewAnalysis =
    () => {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(patient)
      );

      window.location.href =
        "/analysis";
    };

  const updateTreatmentPlan =
    () => {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(patient)
      );

      window.location.href =
        "/treatments";
    };

  const backToPatient =
    () => {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(patient)
      );

      window.location.href =
        "/patient";
    };

  return (
    <main className="min-h-screen bg-[#F5F4F0] text-[#171717]">

      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <Sidebar activePage="Patients" />

        {/* MAIN */}
        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="flex items-center justify-between border-b border-[#DDDCD6] bg-white px-6 py-5 lg:px-10">

            <div className="flex items-center gap-3">

              <a
                href="/patients"
                className="text-sm text-[#999890] hover:text-black"
              >
                Patients
              </a>

              <span className="text-[#C1C0B9]">
                /
              </span>

              <button
                type="button"
                onClick={backToPatient}
                className="text-sm text-[#999890] hover:text-black"
              >
                {patient.name}
              </button>

              <span className="text-[#C1C0B9]">
                /
              </span>

              <span className="text-sm font-medium">
                Before & After
              </span>

            </div>

            <a
              href="/settings"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E2D9] text-xs font-medium transition hover:bg-[#DCD8CE]"
              title={
                clinicSettings.practitionerName ||
                clinicSettings.clinicName ||
                "Clinic practitioner"
              }
              aria-label="Open clinic settings"
            >
              {practitionerInitials}
            </a>

          </header>

          {/* CONTENT */}
          <div className="p-6 lg:p-10">

            {/* TITLE */}
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

              <div>

                <p className="text-sm text-[#71806C]">
                  Progress tracking
                </p>

                <h1 className="mt-1 text-3xl font-medium tracking-[-0.04em]">
                  Before & After
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#77766F]">
                  Compare saved patient photography, skin scores and treatment activity
                  across assessments to review visible progress over time.
                </p>

              </div>

              <button
                type="button"
                onClick={backToPatient}
                className="w-fit rounded-xl border border-[#DDDCD6] bg-white px-5 py-3 text-sm font-medium hover:bg-[#F7F6F2]"
              >
                ← Back to patient
              </button>

            </div>

            {/* PATIENT CARD */}
            <div className="mt-8 flex flex-col justify-between gap-5 rounded-2xl border border-[#DDDCD6] bg-white p-5 sm:flex-row sm:items-center">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E5E2D9] text-sm font-medium">
                  {initials}
                </div>

                <div>

                  <p className="text-xs text-[#999890]">
                    Current patient
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {patient.name}
                  </p>

                  <p className="mt-1 text-xs text-[#77766F]">
                    {patient.concern}
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap items-center gap-3">

                <span className="rounded-full bg-[#F1F0EB] px-3 py-1 text-[10px] text-[#77766F]">
                  {analysisHistory.length} saved{" "}
                  {analysisHistory.length === 1
                    ? "analysis"
                    : "analyses"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-medium ${
                    patient.status === "Active"
                      ? "bg-[#E8EEE5] text-[#62715D]"
                      : "bg-[#F1F0EB] text-[#77766F]"
                  }`}
                >
                  {patient.status}
                </span>

              </div>

            </div>

            {/* NO ANALYSES */}
            {analysisHistory.length === 0 && (

              <div className="mt-6 flex min-h-[480px] items-center justify-center rounded-2xl border border-[#DDDCD6] bg-white p-8">

                <div className="max-w-md text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0EFEA]">
                    <CameraPlaceholder />
                  </div>

                  <h2 className="mt-5 text-xl font-semibold">
                    No saved analysis photos yet
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[#77766F]">
                    Run and save a skin analysis
                    for {patient.name} before
                    creating a progress comparison.
                  </p>

                  <button
                    type="button"
                    onClick={runNewAnalysis}
                    className="mt-6 rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white hover:bg-[#333]"
                  >
                    Run first analysis →
                  </button>

                </div>

              </div>

            )}

            {/* ONE ANALYSIS */}
            {hasOneAnalysis &&
              beforeAnalysis && (

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">

                {/* BASELINE IMAGE */}
                <div className="rounded-2xl border border-[#DDDCD6] bg-white p-6">

                  <p className="text-sm text-[#77766F]">
                    Baseline photography
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    First saved analysis
                  </h2>

                  <div className="mt-6 overflow-hidden rounded-2xl bg-[#E8E5DD]">

                    <img
                      src={beforeAnalysis.image}
                      alt={`${patient.name} baseline`}
                      className="h-[500px] w-full object-cover"
                    />

                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-[#77766F]">

                    <CalendarDays
                      size={14}
                      strokeWidth={1.7}
                    />

                    {beforeAnalysis.date}

                  </div>

                </div>

                {/* SECOND ANALYSIS CTA */}
                <div className="rounded-2xl border border-[#D7DDD4] bg-[#F0F3EE] p-6">

                  <Sparkles
                    size={22}
                    strokeWidth={1.7}
                    className="text-[#62715D]"
                  />

                  <p className="mt-5 text-xs font-medium text-[#62715D]">
                    Progress tracking
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    One more analysis needed
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[#5F685A]">
                    {patient.name} currently has one
                    saved analysis. Complete another
                    assessment using a new photograph
                    to unlock the interactive
                    comparison.
                  </p>

                  <div className="mt-6 rounded-xl bg-white/70 p-5">

                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#71806C]">
                      Baseline score
                    </p>

                    <p className="mt-2 text-3xl font-semibold">
                      {beforeAnalysis.score}

                      <span className="ml-1 text-sm font-normal text-[#77766F]">
                        / 100
                      </span>

                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={runNewAnalysis}
                    className="mt-6 w-full rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white hover:bg-[#333]"
                  >
                    Run second analysis →
                  </button>

                </div>

              </div>

            )}

            {/* FULL COMPARISON */}
            {hasComparison &&
              beforeAnalysis &&
              afterAnalysis && (

              <>

                {/* SCORE CARDS */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  <div className="rounded-2xl border border-[#DDDCD6] bg-white p-5">

                    <p className="text-xs text-[#77766F]">
                      Baseline score
                    </p>

                    <p className="mt-3 text-2xl font-semibold">
                      {beforeAnalysis.score}
                    </p>

                    <p className="mt-2 text-xs text-[#999890]">
                      {beforeAnalysis.date}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-[#DDDCD6] bg-white p-5">

                    <p className="text-xs text-[#77766F]">
                      Comparison score
                    </p>

                    <p className="mt-3 text-2xl font-semibold">
                      {afterAnalysis.score}
                    </p>

                    <p className="mt-2 text-xs text-[#999890]">
                      {afterAnalysis.date}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-[#D7DDD4] bg-[#F0F3EE] p-5">

                    <p className="text-xs text-[#62715D]">
                      Score change
                    </p>

                    <div className="mt-3 flex items-center gap-2">

                      {scoreImprovement >= 0 ? (
                        <TrendingUp
                          size={18}
                          strokeWidth={1.8}
                          className="text-[#62715D]"
                        />
                      ) : (
                        <TrendingDown
                          size={18}
                          strokeWidth={1.8}
                          className="text-[#8A6666]"
                        />
                      )}

                      <p className="text-2xl font-semibold">
                        {scoreImprovement > 0
                          ? `+${scoreImprovement}`
                          : scoreImprovement}
                      </p>

                    </div>

                    <p className="mt-2 text-xs text-[#62715D]">
                      Points from baseline
                    </p>

                  </div>

                  <div className="rounded-2xl border border-[#DDDCD6] bg-white p-5">

                    <p className="text-xs text-[#77766F]">
                      Relative change
                    </p>

                    <p className="mt-3 text-2xl font-semibold">
                      {scoreImprovementPercent > 0
                        ? `+${scoreImprovementPercent}%`
                        : `${scoreImprovementPercent}%`}
                    </p>

                    <p className="mt-2 text-xs text-[#999890]">
                      From baseline
                    </p>

                  </div>

                </div>

                {/* IMAGE COMPARISON */}
                <div className="mt-6 rounded-2xl border border-[#DDDCD6] bg-white p-6">

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>

                      <p className="text-sm text-[#77766F]">
                        Photo comparison
                      </p>

                      <h2 className="mt-1 text-xl font-semibold">
                        Treatment progress
                      </h2>

                    </div>

                    {totalComparisons > 1 && (

                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={previousComparison}
                          disabled={
                            comparisonIndex === 0
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDDCD6] transition hover:bg-[#F7F6F2] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft
                            size={16}
                            strokeWidth={1.8}
                          />
                        </button>

                        <span className="min-w-[125px] text-center text-xs text-[#999890]">
                          Comparison{" "}
                          {comparisonIndex + 1} of{" "}
                          {totalComparisons}
                        </span>

                        <button
                          type="button"
                          onClick={nextComparison}
                          disabled={
                            comparisonIndex ===
                            totalComparisons - 1
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDDCD6] transition hover:bg-[#F7F6F2] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronRight
                            size={16}
                            strokeWidth={1.8}
                          />
                        </button>

                      </div>

                    )}

                  </div>

                  <div className="mt-6">

                    {/*
                      IMPORTANT:
                      Both images now occupy EXACTLY
                      the same container dimensions.

                      The before image is clipped using
                      clipPath instead of physically
                      resizing the image.

                      This fixes the stretching /
                      sliding mismatch issue.
                    */}
                    <div className="relative h-[520px] overflow-hidden rounded-2xl bg-[#E8E5DD]">

                      {/* AFTER */}
                      <img
                        src={afterAnalysis.image}
                        alt={`${patient.name} after`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />

                      {/* BEFORE */}
                      <img
                        src={beforeAnalysis.image}
                        alt={`${patient.name} before`}
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{
                          clipPath: `inset(0 ${100 - slider}% 0 0)`,
                        }}
                      />

                      {/* BEFORE LABEL */}
                      <div className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium shadow-sm">
                        BEFORE
                      </div>

                      {/* AFTER LABEL */}
                      <div className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium shadow-sm">
                        AFTER
                      </div>

                      {/* DIVIDER */}
                      <div
                        className="pointer-events-none absolute inset-y-0 z-10 w-[2px] bg-white"
                        style={{
                          left: `${slider}%`,
                        }}
                      >

                        <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#DDDCD6] bg-white shadow-lg">

                          <ArrowLeftRight
                            size={17}
                            strokeWidth={1.8}
                          />

                        </div>

                      </div>

                      {/* INTERACTIVE RANGE */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={slider}
                        onChange={(e) =>
                          setSlider(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        aria-label="Before and after comparison"
                        className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
                      />

                    </div>

                    {/* DATES */}
                    <div className="mt-4 flex items-center justify-between gap-4 text-xs text-[#77766F]">

                      <div className="flex items-center gap-2">

                        <CalendarDays
                          size={14}
                          strokeWidth={1.7}
                        />

                        Baseline ·{" "}
                        {beforeAnalysis.date}

                      </div>

                      <div className="flex items-center gap-2">

                        <CalendarDays
                          size={14}
                          strokeWidth={1.7}
                        />

                        Comparison ·{" "}
                        {afterAnalysis.date}

                      </div>

                    </div>

                  </div>

                </div>

                {/* PRIORITY SUMMARY */}
                <div className="mt-6 grid gap-4 md:grid-cols-3">

                  <div className="rounded-2xl border border-[#DDDCD6] bg-white p-5">

                    <p className="text-xs text-[#77766F]">
                      Strongest improvement
                    </p>

                    {strongestImprovement &&
                    strongestImprovement.change >
                      0 ? (

                      <>

                        <p className="mt-3 text-lg font-semibold">
                          {
                            strongestImprovement.label
                          }
                        </p>

                        <p className="mt-2 text-xs font-medium text-[#62715D]">
                          +
                          {
                            strongestImprovement.change
                          }{" "}
                          points
                        </p>

                      </>

                    ) : (

                      <p className="mt-3 text-sm font-medium">
                        No positive metric change
                      </p>

                    )}

                  </div>

                  <div className="rounded-2xl border border-[#DDDCD6] bg-white p-5">

                    <p className="text-xs text-[#77766F]">
                      Requires monitoring
                    </p>

                    {biggestDecline ? (

                      <>

                        <p className="mt-3 text-lg font-semibold">
                          {
                            biggestDecline.label
                          }
                        </p>

                        <p className="mt-2 text-xs font-medium text-[#8A6666]">
                          {
                            biggestDecline.change
                          }{" "}
                          points
                        </p>

                      </>

                    ) : (

                      <>

                        <p className="mt-3 text-lg font-semibold">
                          Stable progress
                        </p>

                        <p className="mt-2 text-xs text-[#62715D]">
                          No declining recorded metrics
                        </p>

                      </>

                    )}

                  </div>

                  <div className="rounded-2xl border border-[#DDDCD6] bg-white p-5">

                    <p className="text-xs text-[#77766F]">
                      Primary concern
                    </p>

                    <p className="mt-3 text-lg font-semibold">
                      {patient.concern}
                    </p>

                    <p className="mt-2 text-xs text-[#999890]">
                      Current clinic record
                    </p>

                  </div>

                </div>

                {/* INSIGHT + METRICS */}
                <div className="mt-6 grid gap-6 xl:grid-cols-2">

                  {/* AI PROGRESS SUMMARY */}
                  <div className="rounded-2xl border border-[#D7DDD4] bg-[#F0F3EE] p-6">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">

                        <Sparkles
                          size={18}
                          strokeWidth={1.7}
                          className="text-[#62715D]"
                        />

                      </div>

                      <div>

                        <p className="text-xs font-medium text-[#62715D]">
                          Progress insight
                        </p>

                        <h3 className="mt-1 text-lg font-semibold">
                          Assessment summary
                        </h3>

                      </div>

                    </div>

                    <p className="mt-5 text-sm leading-6 text-[#5F685A]">
                      {progressSummary}
                    </p>

                    <div className="mt-5 rounded-xl bg-white/70 p-4">

                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#71806C]">
                        Treatment programme
                      </p>

                      <p className="mt-2 text-sm font-medium">
                        {treatmentProgramme}
                      </p>

                    </div>

                    <div className="mt-4 rounded-xl border border-[#D7DDD4] bg-white/50 p-4">

                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#71806C]">
                        Demo note
                      </p>

                      <p className="mt-2 text-xs leading-5 text-[#71806C]">
                        Assessment insights and skin scores shown in this demo are simulated
                        and should not be treated as a medical diagnosis.
                      </p>

                    </div>

                  </div>

                  {/* METRICS */}
                  <div className="rounded-2xl border border-[#DDDCD6] bg-white p-6">

                    <p className="text-sm text-[#77766F]">
                      Clinical progress
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      Metric comparison
                    </h3>

                    {progressMetrics.length >
                    0 ? (

                      <div className="mt-6 space-y-5">

                        {progressMetrics.map(
                          (metric) => (

                            <div
                              key={metric.label}
                              className="rounded-xl border border-[#ECEBE6] p-4"
                            >

                              <div className="flex items-center justify-between">

                                <p className="text-sm font-medium">
                                  {metric.label}
                                </p>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                                    metric.change > 0
                                      ? "bg-[#E8EEE5] text-[#62715D]"
                                      : metric.change < 0
                                      ? "bg-[#F3EAEA] text-[#8A6666]"
                                      : "bg-[#F1F0EB] text-[#77766F]"
                                  }`}
                                >
                                  {metric.change > 0
                                    ? `+${metric.change}`
                                    : metric.change}
                                </span>

                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-4">

                                {/* BEFORE */}
                                <div>

                                  <div className="flex items-center justify-between">

                                    <p className="text-[10px] text-[#999890]">
                                      Before
                                    </p>

                                    <p className="text-xs font-medium">
                                      {metric.before}
                                    </p>

                                  </div>

                                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ECEBE6]">

                                    <div
                                      className="h-full rounded-full bg-[#B8B6AD]"
                                      style={{
                                        width: `${Math.max(
                                          0,
                                          Math.min(
                                            metric.before,
                                            100
                                          )
                                        )}%`,
                                      }}
                                    />

                                  </div>

                                </div>

                                {/* AFTER */}
                                <div>

                                  <div className="flex items-center justify-between">

                                    <p className="text-[10px] text-[#999890]">
                                      After
                                    </p>

                                    <p className="text-xs font-medium">
                                      {metric.after}
                                    </p>

                                  </div>

                                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ECEBE6]">

                                    <div
                                      className="h-full rounded-full bg-[#7D8977]"
                                      style={{
                                        width: `${Math.max(
                                          0,
                                          Math.min(
                                            metric.after,
                                            100
                                          )
                                        )}%`,
                                      }}
                                    />

                                  </div>

                                </div>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    ) : (

                      <div className="mt-6 rounded-xl bg-[#F7F6F2] p-5">

                        <p className="text-sm font-medium">
                          No metric comparison available
                        </p>

                        <p className="mt-2 text-xs text-[#999890]">
                          The selected analyses do not
                          contain comparable saved
                          metrics.
                        </p>

                      </div>

                    )}

                  </div>

                </div>

                {/* COMPLETED TREATMENTS DURING PROGRESS */}
                <div className="mt-6 rounded-2xl border border-[#DDDCD6] bg-white">
                  <div className="border-b border-[#ECEBE6] px-6 py-5">
                    <p className="text-sm text-[#77766F]">Treatment progress</p>
                    <h3 className="mt-1 text-lg font-semibold">Completed treatments</h3>
                    <p className="mt-2 text-xs text-[#999890]">Treatments completed between the selected baseline and comparison assessments.</p>
                  </div>

                  {completedTreatments.length > 0 ? (
                    <div className="divide-y divide-[#F0EFEA]">
                      {completedTreatments.map((item) => (
                        <div key={item.id} className="grid gap-4 px-6 py-5 md:grid-cols-[minmax(220px,1.4fr)_repeat(4,minmax(110px,0.7fr))] md:items-center">
                          <div>
                            <p className="text-sm font-semibold">{item.treatment}</p>
                            <p className="mt-1 text-xs text-[#62715D]">Completed treatment</p>
                            {item.notes && <p className="mt-2 text-xs leading-5 text-[#77766F]">{item.notes}</p>}
                          </div>
                          <ProgressDetail label="Date" value={item.date || "—"} />
                          <ProgressDetail label="Time" value={item.time || "—"} />
                          <ProgressDetail label="Duration" value={item.duration || "—"} />
                          <ProgressDetail label="Practitioner" value={item.practitioner || "—"} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-10 text-center">
                      <p className="text-sm font-medium">No completed treatments recorded</p>
                      <p className="mt-2 text-xs text-[#999890]">Complete an appointment to connect treatment activity with progress tracking.</p>
                    </div>
                  )}
                </div>

                {/* TREATMENT ACTIVITY */}
                <div className="mt-6 rounded-2xl border border-[#DDDCD6] bg-white">

                  <div className="flex items-center gap-3 border-b border-[#ECEBE6] px-6 py-5">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EFEA]">

                      <ClipboardList
                        size={18}
                        strokeWidth={1.7}
                      />

                    </div>

                    <div>

                      <p className="text-sm text-[#77766F]">
                        Treatment activity
                      </p>

                      <h3 className="mt-1 text-lg font-semibold">
                        Saved treatment plans
                      </h3>

                    </div>

                  </div>

                  {savedTreatmentPlans.length >
                  0 ? (

                    <div className="divide-y divide-[#F0EFEA]">

                      {savedTreatmentPlans.map(
                        (plan) => (

                          <div
                            key={plan.id}
                            className="flex flex-col justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center"
                          >

                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <p className="text-sm font-medium">
                                  {plan.treatment}
                                </p>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${
                                    plan.status ===
                                    "Active"
                                      ? "bg-[#E8EEE5] text-[#62715D]"
                                      : "bg-[#F1F0EB] text-[#77766F]"
                                  }`}
                                >
                                  {plan.status}
                                </span>

                              </div>

                              <p className="mt-1 text-xs text-[#999890]">
                                {plan.duration} ·{" "}
                                {plan.createdAt}
                              </p>

                              {plan.notes && (

                                <p className="mt-2 max-w-2xl text-xs leading-5 text-[#77766F]">
                                  {plan.notes}
                                </p>

                              )}

                            </div>

                            <span className="text-sm font-semibold">
                              {plan.price}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="px-6 py-10 text-center">

                      <p className="text-sm font-medium">
                        No saved treatment plans
                      </p>

                      <p className="mt-2 text-xs text-[#999890]">
                        Treatment recommendations can
                        be created from the patient&apos;s
                        analysis results.
                      </p>

                    </div>

                  )}

                </div>

                {/* TIMELINE */}
                <div className="mt-6 rounded-2xl border border-[#DDDCD6] bg-white p-6">

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>

                      <p className="text-sm text-[#77766F]">
                        Progress timeline
                      </p>

                      <h3 className="mt-1 text-lg font-semibold">
                        Treatment journey
                      </h3>

                    </div>

                    <span className="w-fit rounded-full bg-[#F1F0EB] px-3 py-1 text-[10px] text-[#77766F]">
                      {beforeAnalysis.date} →{" "}
                      {afterAnalysis.date}
                    </span>

                  </div>

                  <div className="mt-7 grid gap-4 md:grid-cols-3">

                    <TimelineCard
                      number="01"
                      label="Baseline"
                      title="Initial assessment"
                      description={`Baseline skin score recorded at ${beforeAnalysis.score}/100 on ${beforeAnalysis.date}.`}
                    />

                    <TimelineCard
                      number="02"
                      label="Treatment"
                      title={treatmentProgramme}
                      description={
                        activeTreatmentPlans.length >
                        0
                          ? "Practitioner-created treatment planning was recorded for this patient."
                          : "Clinical recommendations and patient care continued between assessments."
                      }
                    />

                    <TimelineCard
                      number="03"
                      label="Progress"
                      title="Comparison assessment"
                      description={`Skin score recorded at ${afterAnalysis.score}/100 on ${afterAnalysis.date}.`}
                      completed
                    />

                  </div>

                </div>

                {/* REPORT */}
                <div className="mt-6 rounded-2xl border border-[#DDDCD6] bg-white p-6">

                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EFEA]">

                        <FileText
                          size={18}
                          strokeWidth={1.7}
                        />

                      </div>

                      <div>

                        <p className="text-sm text-[#77766F]">
                          Progress reporting
                        </p>

                        <h3 className="mt-1 text-lg font-semibold">
                          Generate progress report
                        </h3>

                        <p className="mt-2 max-w-xl text-xs leading-5 text-[#999890]">
                          Save this comparison, metric changes, treatment programme and
                          progress summary to the patient&apos;s report history.
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={generateProgressReport}
                      disabled={reportGenerated}
                      className={`flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
                        reportGenerated
                          ? "border border-[#D7DDD4] bg-[#F0F3EE] text-[#62715D]"
                          : "bg-[#171717] text-white hover:bg-[#333]"
                      }`}
                    >

                      {reportGenerated && (

                        <Check
                          size={16}
                          strokeWidth={2}
                        />

                      )}

                      {reportGenerated
                        ? reportAlreadyExists
                          ? "Report already exists"
                          : "Report saved"
                        : "Generate progress report"}

                    </button>

                  </div>

                  {reportGenerated && (

                    <div className="mt-5 rounded-xl border border-[#D7DDD4] bg-[#F0F3EE] p-4">

                      <p className="text-xs font-medium text-[#62715D]">
                        {reportAlreadyExists
                          ? "Progress report already exists"
                          : "Progress report generated successfully"}
                      </p>

                      <p className="mt-1 text-xs text-[#71806C]">
                        {reportAlreadyExists
                          ? "A report for this baseline and comparison is already stored in the patient&apos;s progress-report history."
                          : "This comparison is now stored in the patient&apos;s progress-report history."}
                      </p>

                    </div>

                  )}

                </div>

              </>

            )}

            {/* ACTIONS */}
            {analysisHistory.length >
              0 && (

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={runNewAnalysis}
                  className="rounded-xl border border-[#DDDCD6] bg-white px-5 py-3 text-sm font-medium hover:bg-[#F7F6F2]"
                >
                  Run new analysis
                </button>

                <button
                  type="button"
                  onClick={updateTreatmentPlan}
                  className="rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white hover:bg-[#333]"
                >
                  Update treatment plan →
                </button>

              </div>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}

function ProgressDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-[72px] rounded-xl bg-[#F7F6F2] p-4">
      <p className="text-[10px] uppercase tracking-[0.1em] text-[#999890]">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function TimelineCard({
  number,
  label,
  title,
  description,
  completed = false,
}: {
  number: string;
  label: string;
  title: string;
  description: string;
  completed?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#ECEBE6] bg-[#FAF9F6] p-5">

      <div className="flex items-center justify-between">

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[10px] font-semibold">
          {number}
        </div>

        {completed && (

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8EEE5] text-[#62715D]">

            <Check
              size={13}
              strokeWidth={2}
            />

          </div>

        )}

      </div>

      <p className="mt-5 text-[10px] uppercase tracking-[0.12em] text-[#999890]">
        {label}
      </p>

      <h4 className="mt-1 text-sm font-semibold">
        {title}
      </h4>

      <p className="mt-2 text-xs leading-5 text-[#77766F]">
        {description}
      </p>

    </div>
  );
}

function CameraPlaceholder() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#77766F]"
    >
      <path d="M14.5 4h-5L8 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3l-1.5-2Z" />
      <circle
        cx="12"
        cy="13"
        r="3"
      />
    </svg>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BriefcaseMedical,
  CalendarDays,
  CheckCircle2,
  FileText,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
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

type ProgressMetric = {
  label: string;
  before: number;
  after: number;
  change: number;
};

type CompletedTreatmentSnapshot = {
  id?: number;
  appointmentId?: number;
  patientId?: number;
  patient?: string;
  treatment?: string;
  date?: string;
  rawDate?: string;
  time?: string;
  duration?: string;
  practitioner?: string;
  practitionerId?: number;
  notes?: string;
  completedAt?: string;
};

type ProgressReport = {
  id?: number | string;
  patient?: string;
  patientId?: number;
  generatedAt?: string;
  date?: string;
  beforeDate?: string;
  afterDate?: string;
  beforeScore?: number;
  afterScore?: number;
  createdAt?: string;
  baselineDate?: string;
  comparisonDate?: string;
  baselineScore?: number;
  comparisonScore?: number;
  scoreChange?: number;
  metrics?: ProgressMetric[];
  treatmentProgramme?: string;
  treatment?: string;
  concern?: string;
  summary?: string;
  completedTreatments?: CompletedTreatmentSnapshot[];
};

type TreatmentHistoryEntry = {
  id: number;
  appointmentId: number;
  patientId?: number;
  patient: string;
  treatment: string;
  date: string;
  rawDate?: string;
  time: string;
  duration: string;
  practitioner: string;
  practitionerId?: number;
  notes: string;
  completedAt: string;
};

type Appointment = {
  id: number;
  patient: string;
  patientId?: number;
  initials?: string;
  treatment: string;
  date: string;
  rawDate?: string;
  time: string;
  duration: string;
  practitioner?: string;
  practitionerId?: number;
  status: string;
};

type SavedAnalysisMetric = {
  name?: string;
  label?: string;
  score?: number;
  value?: number;
  status?: string;
};

type SavedAnalysis = {
  id?: number | string;
  patient?: string;
  patientId?: number;
  date?: string;
  createdAt?: string;
  generatedAt?: string;
  score?: number;
  overallScore?: number;
  skinScore?: number;
  concern?: string;
  summary?: string;
  metrics?: SavedAnalysisMetric[];
  [key: string]: unknown;
};

type NormalizedReport = {
  id: string;
  patient: string;
  patientId?: number;
  generatedAt: string;
  beforeDate: string;
  afterDate: string;
  beforeScore: number;
  afterScore: number;
  scoreChange: number;
  treatmentProgramme: string;
  concern: string;
  summary: string;
  metrics: ProgressMetric[];
  completedTreatments: TreatmentHistoryEntry[];
  raw: ProgressReport;
};

type ClinicSettings = {
  clinicName: string;
  practitionerName: string;
  email?: string;
  phone?: string;
  initials: string;
  location?: string;
};

const defaultClinicSettings: ClinicSettings = {
  clinicName: "Skinhouse Clinic",
  practitionerName: "Sarah Williams",
  initials: "SW",
};

const defaultPatients: Patient[] = [
  {
    id: 1,
    name: "Emily Johnson",
    email: "emily.johnson@email.com",
    phone: "+44 7700 900123",
    age: 29,
    lastVisit: "25 Aug 2026",
    status: "Active",
    concern: "Acne & pigmentation",
    analyses: 4,
  },
  {
    id: 2,
    name: "Olivia Smith",
    email: "olivia.smith@email.com",
    phone: "+44 7700 900124",
    age: 34,
    lastVisit: "24 Aug 2026",
    status: "Active",
    concern: "Fine lines",
    analyses: 3,
  },
  {
    id: 3,
    name: "Amelia Brown",
    email: "amelia.brown@email.com",
    phone: "+44 7700 900125",
    age: 27,
    lastVisit: "23 Aug 2026",
    status: "Active",
    concern: "Hyperpigmentation",
    analyses: 6,
  },
  {
    id: 4,
    name: "Sophia Williams",
    email: "sophia.williams@email.com",
    phone: "+44 7700 900126",
    age: 41,
    lastVisit: "21 Aug 2026",
    status: "Inactive",
    concern: "Skin ageing",
    analyses: 2,
  },
  {
    id: 5,
    name: "Isabella Taylor",
    email: "isabella.taylor@email.com",
    phone: "+44 7700 900127",
    age: 31,
    lastVisit: "19 Aug 2026",
    status: "Active",
    concern: "Rosacea",
    analyses: 5,
  },
  {
    id: 6,
    name: "Mia Anderson",
    email: "mia.anderson@email.com",
    phone: "+44 7700 900128",
    age: 26,
    lastVisit: "18 Aug 2026",
    status: "Active",
    concern: "Acne",
    analyses: 3,
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAnalysisTimestamp(analysis: SavedAnalysis) {
  if (typeof analysis.id === "number" && analysis.id > 1000000000000) {
    return analysis.id;
  }

  if (typeof analysis.id === "string" && /^\d{13}$/.test(analysis.id)) {
    return Number(analysis.id);
  }

  const raw =
    analysis.createdAt ||
    analysis.generatedAt ||
    analysis.date ||
    "";

  const parsed = new Date(raw).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
}

function getAnalysisDate(analysis: SavedAnalysis) {
  const raw =
    analysis.date ||
    analysis.createdAt ||
    analysis.generatedAt;

  if (raw) {
    const parsed = new Date(raw);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    return raw;
  }

  const timestamp = getAnalysisTimestamp(analysis);

  return timestamp
    ? new Date(timestamp).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Saved analysis";
}

function getAnalysisScore(analysis: SavedAnalysis) {
  const score =
    analysis.score ??
    analysis.overallScore ??
    analysis.skinScore ??
    0;

  return typeof score === "number"
    ? score
    : Number(score) || 0;
}

function normalizeTreatmentHistoryEntry(
  entry: CompletedTreatmentSnapshot,
  index: number
): TreatmentHistoryEntry {
  return {
    id:
      typeof entry.id === "number"
        ? entry.id
        : Date.now() + index,
    appointmentId:
      typeof entry.appointmentId === "number"
        ? entry.appointmentId
        : 0,
    patientId: entry.patientId,
    patient: entry.patient || "Unknown patient",
    treatment: entry.treatment || "Treatment",
    date: entry.date || "Completed",
    rawDate: entry.rawDate,
    time: entry.time || "—",
    duration: entry.duration || "—",
    practitioner: entry.practitioner || "Practitioner",
    practitionerId: entry.practitionerId,
    notes: entry.notes || "",
    completedAt: entry.completedAt || "",
  };
}

function normalizeReport(
  report: ProgressReport,
  index: number,
  patients: Patient[],
  treatmentHistory: TreatmentHistoryEntry[]
): NormalizedReport {
  const beforeScore =
    report.beforeScore ??
    report.baselineScore ??
    0;

  const afterScore =
    report.afterScore ??
    report.comparisonScore ??
    0;

  const scoreChange =
    report.scoreChange ??
    afterScore - beforeScore;

  const patient =
    report.patient ||
    "Unknown patient";

  const patientRecord =
    patients.find((item) => item.id === report.patientId) ||
    patients.find(
      (item) =>
        item.name.toLowerCase() === patient.toLowerCase()
    );

  let completedTreatments: TreatmentHistoryEntry[] = [];

  if (
    Array.isArray(report.completedTreatments) &&
    report.completedTreatments.length > 0
  ) {
    completedTreatments = report.completedTreatments.map(
      (entry, treatmentIndex) =>
        normalizeTreatmentHistoryEntry(
          entry,
          treatmentIndex
        )
    );
  } else {
    completedTreatments = treatmentHistory.filter(
      (entry) =>
        (report.patientId !== undefined &&
          entry.patientId === report.patientId) ||
        entry.patient.toLowerCase() === patient.toLowerCase()
    );
  }

  completedTreatments = [...completedTreatments].sort(
    (a, b) =>
      (b.completedAt || "").localeCompare(
        a.completedAt || ""
      )
  );

  return {
    id: String(
      report.id ??
        `${patient}-${index}`
    ),
    patient,
    patientId:
      report.patientId ??
      patientRecord?.id,
    generatedAt:
      report.generatedAt ||
      report.createdAt ||
      report.date ||
      "Saved report",
    beforeDate:
      report.beforeDate ||
      report.baselineDate ||
      "Baseline",
    afterDate:
      report.afterDate ||
      report.comparisonDate ||
      "Latest",
    beforeScore,
    afterScore,
    scoreChange,
    treatmentProgramme:
      report.treatmentProgramme ||
      report.treatment ||
      completedTreatments
        .map((entry) => entry.treatment)
        .filter(
          (value, currentIndex, array) =>
            array.indexOf(value) === currentIndex
        )
        .join(" + ") ||
      "No treatment programme recorded",
    concern:
      report.concern ||
      patientRecord?.concern ||
      "Clinical skin progress",
    summary:
      report.summary ||
      "Progress report generated from saved skin analyses.",
    metrics:
      Array.isArray(report.metrics)
        ? report.metrics
        : [],
    completedTreatments,
    raw: report,
  };
}


function isUsableProgressReport(
  report: ProgressReport,
  patients: Patient[]
) {
  if (!report || typeof report !== "object") {
    return false;
  }

  const patientName =
    typeof report.patient === "string"
      ? report.patient.trim()
      : "";

  const hasKnownPatient =
    (typeof report.patientId === "number" &&
      patients.some(
        (patient) => patient.id === report.patientId
      )) ||
    Boolean(
      patientName &&
        patients.some(
          (patient) =>
            patient.name.toLowerCase() ===
            patientName.toLowerCase()
        )
    );

  const beforeDate = String(
    report.beforeDate ||
      report.baselineDate ||
      ""
  ).trim();

  const afterDate = String(
    report.afterDate ||
      report.comparisonDate ||
      ""
  ).trim();

  const beforeScore =
    report.beforeScore ??
    report.baselineScore;

  const afterScore =
    report.afterScore ??
    report.comparisonScore;

  const hasBeforeScore =
    beforeScore !== undefined &&
    beforeScore !== null &&
    Number.isFinite(Number(beforeScore));

  const hasAfterScore =
    afterScore !== undefined &&
    afterScore !== null &&
    Number.isFinite(Number(afterScore));

  return (
    hasKnownPatient &&
    Boolean(beforeDate) &&
    Boolean(afterDate) &&
    hasBeforeScore &&
    hasAfterScore
  );
}

function deduplicateReports(
  reports: NormalizedReport[]
) {
  const seen = new Set<string>();

  return [...reports]
    .sort(
      (a, b) =>
        getReportTimestamp(b) -
        getReportTimestamp(a)
    )
    .filter((report) => {
      const patientKey =
        report.patientId !== undefined
          ? `id:${report.patientId}`
          : `name:${report.patient.toLowerCase()}`;

      const key = [
        patientKey,
        report.beforeDate.trim().toLowerCase(),
        report.afterDate.trim().toLowerCase(),
      ].join("|");

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function getReportTimestamp(report: NormalizedReport) {
  const generated = report.generatedAt
    ? new Date(report.generatedAt).getTime()
    : NaN;

  if (!Number.isNaN(generated)) {
    return generated;
  }

  const after = report.afterDate
    ? new Date(report.afterDate).getTime()
    : NaN;

  if (!Number.isNaN(after)) {
    return after;
  }

  const before = report.beforeDate
    ? new Date(report.beforeDate).getTime()
    : NaN;

  if (!Number.isNaN(before)) {
    return before;
  }

  const numericId = Number(report.id);

  return !Number.isNaN(numericId) &&
    numericId > 1000000000000
    ? numericId
    : 0;
}

function getNewestReport(
  reports: NormalizedReport[]
) {
  return [...reports].sort(
    (a, b) =>
      getReportTimestamp(b) -
      getReportTimestamp(a)
  )[0] || null;
}

function getNewestAnalysis(
  analyses: SavedAnalysis[]
) {
  return [...analyses].sort(
    (a, b) =>
      getAnalysisTimestamp(b) -
      getAnalysisTimestamp(a)
  )[0] || null;
}

export default function ReportsPage() {
  const [reports, setReports] =
    useState<NormalizedReport[]>([]);

  const [treatmentHistory, setTreatmentHistory] =
    useState<TreatmentHistoryEntry[]>([]);

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [analysisHistory, setAnalysisHistory] =
    useState<SavedAnalysis[]>([]);

  const [patients, setPatients] =
    useState<Patient[]>(defaultPatients);

  const [search, setSearch] =
    useState("");

  const [clinicSettings, setClinicSettings] =
    useState<ClinicSettings>(
      defaultClinicSettings
    );

  useEffect(() => {
    const loadClinicSettings = () => {
      const storedSettings =
        localStorage.getItem("dermisClinicSettings");

      if (!storedSettings) {
        setClinicSettings(defaultClinicSettings);
        return;
      }

      try {
        const parsedSettings = JSON.parse(storedSettings);

        setClinicSettings({
          ...defaultClinicSettings,
          ...parsedSettings,
        });
      } catch (error) {
        console.error(
          "Could not load clinic settings:",
          error
        );

        setClinicSettings(defaultClinicSettings);
      }
    };

    loadClinicSettings();

    window.addEventListener(
      "dermisClinicSettingsUpdated",
      loadClinicSettings
    );

    window.addEventListener(
      "storage",
      loadClinicSettings
    );

    let loadedPatients = defaultPatients;

    const storedPatients =
      localStorage.getItem("dermisPatients");

    if (storedPatients) {
      try {
        const parsedPatients =
          JSON.parse(storedPatients);

        if (Array.isArray(parsedPatients)) {
          loadedPatients = parsedPatients;
          setPatients(parsedPatients);
        }
      } catch (error) {
        console.error(
          "Could not load patients:",
          error
        );
      }
    }

    let loadedTreatmentHistory: TreatmentHistoryEntry[] = [];

    const storedTreatmentHistory =
      localStorage.getItem("dermisTreatmentHistory");

    if (storedTreatmentHistory) {
      try {
        const parsedHistory =
          JSON.parse(storedTreatmentHistory);

        if (Array.isArray(parsedHistory)) {
          loadedTreatmentHistory = parsedHistory;
          setTreatmentHistory(parsedHistory);
        }
      } catch (error) {
        console.error(
          "Could not load treatment history:",
          error
        );

        setTreatmentHistory([]);
      }
    }

    const storedAppointments =
      localStorage.getItem("dermisAppointments");

    if (storedAppointments) {
      try {
        const parsedAppointments =
          JSON.parse(storedAppointments);

        setAppointments(
          Array.isArray(parsedAppointments)
            ? parsedAppointments
            : []
        );
      } catch (error) {
        console.error(
          "Could not load appointments:",
          error
        );
      }
    }

    const storedAnalysisHistory =
      localStorage.getItem("dermisAnalysisHistory");

    if (storedAnalysisHistory) {
      try {
        const parsed =
          JSON.parse(storedAnalysisHistory);

        let analyses: SavedAnalysis[] = [];

        if (Array.isArray(parsed)) {
          analyses = parsed;
        } else if (
          parsed &&
          typeof parsed === "object"
        ) {
          analyses = Object.entries(parsed).flatMap(
            ([patientKey, value]) => {
              const patientId = Number(patientKey);

              const records = Array.isArray(value)
                ? value
                : [value];

              return records.map((analysis) => {
                const record =
                  analysis as SavedAnalysis;

                const patientRecord =
                  loadedPatients.find(
                    (patient) =>
                      patient.id === patientId
                  );

                return {
                  ...record,
                  patientId:
                    record.patientId ??
                    (!Number.isNaN(patientId)
                      ? patientId
                      : undefined),
                  patient:
                    record.patient ||
                    patientRecord?.name,
                };
              });
            }
          );
        }

        setAnalysisHistory(
          [...analyses].sort(
            (a, b) =>
              getAnalysisTimestamp(b) -
              getAnalysisTimestamp(a)
          )
        );
      } catch (error) {
        console.error(
          "Could not load analysis history:",
          error
        );

        setAnalysisHistory([]);
      }
    }

    const storedReports =
      localStorage.getItem("dermisProgressReports");

    if (!storedReports) {
      setReports([]);

      return () => {
        window.removeEventListener(
          "dermisClinicSettingsUpdated",
          loadClinicSettings
        );
        window.removeEventListener(
          "storage",
          loadClinicSettings
        );
      };
    }

    try {
      const parsed = JSON.parse(storedReports);

      let reportArray: ProgressReport[] = [];

      if (Array.isArray(parsed)) {
        reportArray = parsed;
      } else if (
        parsed &&
        typeof parsed === "object"
      ) {
        reportArray = Object.values(parsed).flatMap(
          (value) =>
            Array.isArray(value)
              ? value
              : [value]
        ) as ProgressReport[];
      }

      const validReports = reportArray.filter(
        (report) =>
          isUsableProgressReport(
            report,
            loadedPatients
          )
      );

      const normalizedReports = validReports.map(
        (report, index) =>
          normalizeReport(
            report,
            index,
            loadedPatients,
            loadedTreatmentHistory
          )
      );

      setReports(
        deduplicateReports(normalizedReports)
      );
    } catch (error) {
      console.error(
        "Could not load progress reports:",
        error
      );

      setReports([]);
    }

    return () => {
      window.removeEventListener(
        "dermisClinicSettingsUpdated",
        loadClinicSettings
      );
      window.removeEventListener(
        "storage",
        loadClinicSettings
      );
    };
  }, []);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    const sortedReports = [...reports].sort(
      (a, b) => getReportTimestamp(b) - getReportTimestamp(a)
    );

    if (!query) {
      return sortedReports;
    }

    return sortedReports.filter((report) => {
      const treatmentMatch =
        report.completedTreatments.some(
          (entry) =>
            entry.treatment
              .toLowerCase()
              .includes(query) ||
            entry.practitioner
              .toLowerCase()
              .includes(query)
        );

      return (
        report.patient
          .toLowerCase()
          .includes(query) ||
        report.concern
          .toLowerCase()
          .includes(query) ||
        report.treatmentProgramme
          .toLowerCase()
          .includes(query) ||
        treatmentMatch
      );
    });
  }, [reports, search]);

  const uniquePatients = useMemo(() => {
    return new Set(
      reports.map(
        (report) =>
          report.patientId ??
          report.patient
      )
    ).size;
  }, [reports]);

  const improvedReports = useMemo(() => {
    return reports.filter(
      (report) =>
        report.scoreChange > 0
    ).length;
  }, [reports]);

  const averageImprovement = useMemo(() => {
    if (reports.length === 0) {
      return 0;
    }

    const total = reports.reduce(
      (sum, report) =>
        sum + report.scoreChange,
      0
    );

    return (
      Math.round(
        (total / reports.length) *
          10
      ) / 10
    );
  }, [reports]);

  const uniqueTreatmentPatients = useMemo(() => {
    return new Set(
      treatmentHistory.map(
        (entry) =>
          entry.patientId ??
          entry.patient
      )
    ).size;
  }, [treatmentHistory]);

  const recentTreatments = useMemo(() => {
    return [...treatmentHistory]
      .sort((a, b) =>
        (b.completedAt || "").localeCompare(
          a.completedAt || ""
        )
      )
      .slice(0, 5);
  }, [treatmentHistory]);

  const recentAnalyses = useMemo(() => {
    return [...analysisHistory]
      .sort(
        (a, b) =>
          getAnalysisTimestamp(b) -
          getAnalysisTimestamp(a)
      )
      .slice(0, 5);
  }, [analysisHistory]);

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.status === "Confirmed" ||
        appointment.status === "Upcoming"
    );
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.status === "Completed"
    ).length;
  }, [appointments]);

  const cancelledAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.status === "Cancelled"
    ).length;
  }, [appointments]);

  const topTreatment = useMemo(() => {
    if (treatmentHistory.length === 0) {
      return "No data";
    }

    const counts = treatmentHistory.reduce<
      Record<string, number>
    >((acc, entry) => {
      acc[entry.treatment] =
        (acc[entry.treatment] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "No data";
  }, [treatmentHistory]);

  const patientOutcomeRows = useMemo(() => {
    return patients
      .map((patient) => {
        const patientReports =
          reports.filter(
            (report) =>
              report.patientId === patient.id ||
              report.patient.toLowerCase() ===
                patient.name.toLowerCase()
          );

        const patientAnalyses =
          analysisHistory.filter(
            (analysis) =>
              analysis.patientId ===
                patient.id ||
              analysis.patient
                ?.toLowerCase() ===
                patient.name.toLowerCase()
          );

        const patientTreatments =
          treatmentHistory.filter(
            (entry) =>
              entry.patientId === patient.id ||
              entry.patient.toLowerCase() ===
                patient.name.toLowerCase()
          );

        const latestAnalysis =
          [...patientAnalyses].sort(
            (a, b) =>
              getAnalysisTimestamp(b) -
              getAnalysisTimestamp(a)
          )[0];

        const latestReport =
          getNewestReport(patientReports);

        return {
          patient,
          analyses: patientAnalyses.length,
          treatments: patientTreatments.length,
          reports: patientReports.length,
          latestScore: latestAnalysis
            ? getAnalysisScore(latestAnalysis)
            : null,
          latestChange:
            latestReport?.scoreChange ??
            null,
        };
      })
      .filter(
        (row) =>
          row.analyses > 0 ||
          row.treatments > 0 ||
          row.reports > 0
      )
      .slice(0, 8);
  }, [
    patients,
    reports,
    analysisHistory,
    treatmentHistory,
  ]);

  const openReport = (
    report: NormalizedReport
  ) => {
    localStorage.setItem(
      "dermisSelectedProgressReport",
      JSON.stringify(report.raw)
    );

    const selectedPatient =
      patients.find(
        (patient) =>
          patient.id === report.patientId
      ) ||
      patients.find(
        (patient) =>
          patient.name.toLowerCase() ===
          report.patient.toLowerCase()
      );

    if (selectedPatient) {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(selectedPatient)
      );
    }

    if (report.patientId !== undefined) {
      localStorage.setItem(
        "dermisProgressReportPatientId",
        String(report.patientId)
      );
    }

    localStorage.setItem(
      "dermisReportClinicSettings",
      JSON.stringify(clinicSettings)
    );

    window.location.href =
      "/before-after";
  };

  const openPatientTreatmentHistory = (
    entry: TreatmentHistoryEntry
  ) => {
    const selectedPatient =
      patients.find(
        (patient) =>
          patient.id === entry.patientId
      ) ||
      patients.find(
        (patient) =>
          patient.name.toLowerCase() ===
          entry.patient.toLowerCase()
      );

    if (selectedPatient) {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(selectedPatient)
      );
      localStorage.setItem(
        "dermisPatientTab",
        "Treatments"
      );
    }

    window.location.href =
      "/patient";
  };

  const openAnalysisPatient = (
    analysis: SavedAnalysis
  ) => {
    const selectedPatient =
      patients.find(
        (patient) =>
          patient.id === analysis.patientId
      ) ||
      patients.find(
        (patient) =>
          analysis.patient &&
          patient.name.toLowerCase() ===
            analysis.patient.toLowerCase()
      );

    if (selectedPatient) {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(selectedPatient)
      );
      localStorage.setItem(
        "dermisPatientTab",
        "Analysis History"
      );

      /*
       * Keep the clicked historical record separate from the true latest
       * analysis cache. Otherwise opening an older report row can make it
       * appear to be the patient's newest analysis elsewhere.
       */
      const selectedHistoricalAnalysis = {
        patient: selectedPatient.name,
        patientId: selectedPatient.id,
        id: analysis.id,
        date: analysis.date,
        score: analysis.score,
        metrics: analysis.metrics,
      };

      try {
        localStorage.setItem(
          "dermisSelectedAnalysis",
          JSON.stringify(
            selectedHistoricalAnalysis
          )
        );
      } catch (error) {
        console.error(
          "Could not store selected analysis:",
          error
        );
      }
    }

    window.location.href =
      "/patient";
  };

  const openPatient = (
    patient: Patient
  ) => {
    localStorage.setItem(
      "dermisSelectedPatient",
      JSON.stringify(patient)
    );

    window.location.href =
      "/patient";
  };

  const practitionerInitials =
    clinicSettings.initials
      ?.trim()
      .toUpperCase() ||
    getInitials(
      clinicSettings.practitionerName
    ) ||
    "SW";

  return (
    <main className="min-h-screen bg-[#F2F5F2] text-[#182019]">
      <div className="flex min-h-screen">
        <Sidebar activePage="Reports" />

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E1E7E0] bg-[#FDFEFC]/96 px-6 py-4 backdrop-blur-xl lg:px-10">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[#74887A]">
                Velyquo intelligence
              </p>

              <h1 className="mt-1.5 text-[20px] font-semibold tracking-[-0.045em] text-[#202922]">
                Reports
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-[#D7E3D7] bg-[#EDF4ED] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#45634D] sm:block">
                Clinical reporting
              </div>

              <a
                href="/settings"
                title={clinicSettings.practitionerName}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4DFD4] bg-[#E8F0E8] text-[10px] font-semibold text-[#3F5A47] transition hover:bg-[#E1EBE1]"
              >
                {practitionerInitials}
              </a>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1520px] p-6 lg:px-10 lg:py-9">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6E8375]">
                Patient intelligence
              </p>

              <h2 className="mt-2 text-[38px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#19231B]">
                Clinic reports
              </h2>

              <p className="mt-4 max-w-3xl text-[12px] leading-6 text-[#77827A]">
                Track analyses, completed treatments, appointment activity and measurable
                patient progress across {clinicSettings.clinicName}.
              </p>
            </div>

            <div className="mt-7 flex flex-col justify-between gap-4 rounded-[24px] border border-[#DDE5DC] bg-[#FFFFFE] p-5 shadow-[0_14px_40px_rgba(27,43,32,0.045)] sm:flex-row sm:items-center">
              <div>
                <p className="text-xs text-[#8C978F]">
                  Reporting workspace
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {clinicSettings.clinicName}
                </p>

                <p className="mt-1 text-xs text-[#667169]">
                  Primary practitioner:{" "}
                  {clinicSettings.practitionerName}
                </p>
              </div>

              <span className="w-fit rounded-full border border-[#D3E0D3] bg-[#EAF3EA] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#45634D]">
                Live prototype data
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<Activity size={18} strokeWidth={1.7} />}
                label="Saved analyses"
                value={String(analysisHistory.length)}
                detail="Across all patients"
              />

              <StatCard
                icon={<CheckCircle2 size={18} strokeWidth={1.7} />}
                label="Treatments completed"
                value={String(treatmentHistory.length)}
                detail={`Across ${uniqueTreatmentPatients} ${
                  uniqueTreatmentPatients === 1 ? "patient" : "patients"
                }`}
              />

              <StatCard
                icon={<CalendarDays size={18} strokeWidth={1.7} />}
                label="Upcoming appointments"
                value={String(upcomingAppointments.length)}
                detail={`${completedAppointments} completed · ${cancelledAppointments} cancelled`}
              />

              <StatCard
                icon={<FileText size={18} strokeWidth={1.7} />}
                label="Progress reports"
                value={String(reports.length)}
                detail={`${improvedReports} with positive score change`}
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <OutcomeCard
                icon={<Users size={18} strokeWidth={1.7} />}
                label="Reported patients"
                value={String(uniquePatients)}
                detail="Patients with saved progress reports"
              />

              <OutcomeCard
                icon={<BriefcaseMedical size={18} strokeWidth={1.7} />}
                label="Top completed treatment"
                value={topTreatment}
                detail="Most frequently completed treatment"
              />

              <OutcomeCard
                icon={
                  averageImprovement >= 0 ? (
                    <TrendingUp size={18} strokeWidth={1.7} />
                  ) : (
                    <TrendingDown size={18} strokeWidth={1.7} />
                  )
                }
                label="Average outcome change"
                value={
                  reports.length === 0
                    ? "No data"
                    : averageImprovement > 0
                    ? `+${averageImprovement}`
                    : String(averageImprovement)
                }
                detail="Average progress-report skin score change"
              />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <div className="rounded-[24px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_14px_40px_rgba(27,43,32,0.045)]">
                <div className="flex items-center justify-between border-b border-[#E7ECE6] px-6 py-5">
                  <div>
                    <p className="text-sm text-[#667169]">
                      Skin intelligence
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">
                      Recent analyses
                    </h3>
                  </div>

                  <a
                    href="/analysis"
                    className="text-xs font-medium text-[#45634D] hover:text-[#171717]"
                  >
                    Open analysis →
                  </a>
                </div>

                {recentAnalyses.length > 0 ? (
                  <div className="divide-y divide-[#E9EEE8]">
                    {recentAnalyses.map((analysis, index) => {
                      const analysisPatient =
                        patients.find(
                          (patient) =>
                            patient.id === analysis.patientId
                        ) ||
                        patients.find(
                          (patient) =>
                            analysis.patient &&
                            patient.name.toLowerCase() ===
                              analysis.patient.toLowerCase()
                        );

                      return (
                        <button
                          type="button"
                          key={String(
                            analysis.id ??
                              `${analysis.patient}-${index}`
                          )}
                          onClick={() =>
                            openAnalysisPatient(analysis)
                          }
                          className="grid w-full gap-4 px-6 py-5 text-left transition hover:bg-[#F6F9F6] sm:grid-cols-[1fr_auto] sm:items-center"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4DFD4] bg-[#E8F0E8] text-[#3F5A47] text-[10px] font-medium">
                              {getInitials(
                                analysisPatient?.name ||
                                  analysis.patient ||
                                  "Patient"
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {analysisPatient?.name ||
                                  analysis.patient ||
                                  "Unknown patient"}
                              </p>

                              <p className="mt-1 text-xs text-[#667169]">
                                {getAnalysisDate(analysis)}
                              </p>
                            </div>
                          </div>

                          <div className="flex min-h-[68px] min-w-[100px] flex-col items-center justify-center rounded-[13px] border border-[#E4E9E3] bg-[#F6F8F5] px-4 py-3 text-center">
                            <p className="text-[9px] uppercase tracking-[0.1em] text-[#8C978F]">
                              Skin score
                            </p>
                            <p className="mt-1 w-full text-center text-lg font-semibold tabular-nums leading-none">
                              {getAnalysisScore(analysis)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyMiniState text="No saved analyses yet." />
                )}
              </div>

              <div className="rounded-[24px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_14px_40px_rgba(27,43,32,0.045)]">
                <div className="flex items-center justify-between border-b border-[#E7ECE6] px-6 py-5">
                  <div>
                    <p className="text-sm text-[#667169]">
                      Treatment activity
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">
                      Recent completed treatments
                    </h3>
                  </div>

                  <a
                    href="/appointments"
                    className="text-xs font-medium text-[#45634D] hover:text-[#171717]"
                  >
                    Appointments →
                  </a>
                </div>

                {recentTreatments.length > 0 ? (
                  <div className="divide-y divide-[#E9EEE8]">
                    {recentTreatments.map((entry) => (
                      <button
                        type="button"
                        key={`${entry.id}-${entry.appointmentId}`}
                        onClick={() =>
                          openPatientTreatmentHistory(entry)
                        }
                        className="grid w-full gap-4 px-6 py-5 text-left transition hover:bg-[#F6F9F6] sm:grid-cols-[1.2fr_0.8fr_auto] sm:items-center"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4DFD4] bg-[#E8F0E8] text-[#3F5A47] text-[10px] font-medium">
                            {getInitials(entry.patient)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {entry.patient}
                            </p>
                            <p className="mt-1 truncate text-xs text-[#667169]">
                              {entry.treatment}
                            </p>
                          </div>
                        </div>

                        <TreatmentDetail
                          label="Completed"
                          value={entry.date}
                        />

                        <span className="w-fit rounded-full bg-[#EAF3EA] px-3 py-1 text-[9px] font-medium text-[#45634D]">
                          Completed
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <EmptyMiniState text="No completed treatments yet." />
                )}
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_14px_40px_rgba(27,43,32,0.045)]">
              <div className="border-b border-[#E7ECE6] px-6 py-5">
                <p className="text-sm text-[#667169]">
                  Patient outcomes
                </p>

                <h3 className="mt-1 text-lg font-semibold">
                  Patient reporting overview
                </h3>

                <p className="mt-2 text-xs text-[#8C978F]">
                  Combined view of analyses, completed treatments and progress reports.
                </p>
              </div>

              {patientOutcomeRows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-[#F7F9F6] text-[10px] uppercase tracking-[0.08em] text-[#8C978F]">
                      <tr>
                        <th className="px-6 py-4 font-medium">
                          Patient
                        </th>
                        <th className="px-4 py-4 text-center font-medium">
                          Analyses
                        </th>
                        <th className="px-4 py-4 text-center font-medium">
                          Treatments
                        </th>
                        <th className="px-4 py-4 text-center font-medium">
                          Reports
                        </th>
                        <th className="px-4 py-4 text-center font-medium">
                          Latest Score
                        </th>
                        <th className="px-4 py-4 text-center font-medium">
                          Latest Change
                        </th>
                        <th className="px-6 py-4 font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#E9EEE8]">
                      {patientOutcomeRows.map((row) => (
                        <tr key={row.patient.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4DFD4] bg-[#E8F0E8] text-[#3F5A47] text-[10px] font-medium">
                                {getInitials(row.patient.name)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold">
                                  {row.patient.name}
                                </p>
                                <p className="mt-1 text-[10px] text-[#8C978F]">
                                  {row.patient.concern}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center text-sm font-medium tabular-nums">
                            {row.analyses}
                          </td>

                          <td className="px-4 py-4 text-center text-sm font-medium tabular-nums">
                            {row.treatments}
                          </td>

                          <td className="px-4 py-4 text-center text-sm font-medium tabular-nums">
                            {row.reports}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex min-w-[78px] justify-center text-sm font-medium tabular-nums">
                              {row.latestScore !== null
                                ? `${row.latestScore} / 100`
                                : "—"}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center">
                            {row.latestChange !== null ? (
                              <span
                                className={`inline-flex min-w-[56px] justify-center rounded-full px-3 py-1 text-[10px] font-medium tabular-nums ${
                                  row.latestChange > 0
                                    ? "bg-[#EAF3EA] text-[#45634D]"
                                    : row.latestChange < 0
                                    ? "bg-[#F3EAEA] text-[#8A6666]"
                                    : "bg-[#F3F5F2] text-[#667169]"
                                }`}
                              >
                                {row.latestChange > 0
                                  ? `+${row.latestChange}`
                                  : row.latestChange}
                              </span>
                            ) : (
                              <span className="inline-flex min-w-[56px] justify-center text-xs text-[#8C978F]">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                openPatient(row.patient)
                              }
                              className="rounded-[12px] border border-[#DCE4DB] bg-[#FFFFFE] px-4 py-2 text-[10px] font-semibold text-[#4D5A51] transition hover:-translate-y-px hover:bg-[#F5F8F5]"
                            >
                              Open patient →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyMiniState text="No patient outcome data yet." />
              )}
            </div>

            <div className="mt-8 rounded-[24px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_14px_40px_rgba(27,43,32,0.045)] p-4">
              <div className="relative">
                <Search
                  size={17}
                  strokeWidth={1.7}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C978F]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by patient, concern, treatment or practitioner..."
                  className="w-full rounded-[14px] border border-[#DCE5DC] bg-[#F7F9F6] py-3.5 pl-11 pr-4 text-[12px] outline-none transition placeholder:text-[#A1AAA3] focus:border-[#6E8A75] focus:bg-white focus:shadow-[0_0_0_3px_rgba(53,91,63,0.08)]"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-[#667169]">
                    Clinical reporting
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    Generated reports
                  </h3>
                </div>

                <p className="text-xs text-[#8C978F]">
                  {filteredReports.length}{" "}
                  {filteredReports.length === 1
                    ? "report"
                    : "reports"}
                </p>
              </div>

              {filteredReports.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-[24px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_14px_40px_rgba(27,43,32,0.045)] p-6 transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D4DFD4] bg-[#E8F0E8] text-[#3F5A47] text-xs font-medium">
                            {getInitials(report.patient)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <h4 className="text-base font-semibold">
                                {report.patient}
                              </h4>

                              <span className="rounded-full bg-[#EAF3EA] px-3 py-1 text-[9px] font-medium text-[#45634D]">
                                Progress report
                              </span>

                              {report.completedTreatments.length > 0 && (
                                <span className="rounded-full bg-[#F3F5F2] px-3 py-1 text-[9px] text-[#667169]">
                                  {report.completedTreatments.length} completed{" "}
                                  {report.completedTreatments.length === 1
                                    ? "treatment"
                                    : "treatments"}
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-[#667169]">
                              {report.concern}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-[#8C978F]">
                              <span className="flex items-center gap-1.5">
                                <CalendarDays
                                  size={12}
                                  strokeWidth={1.7}
                                />
                                {report.beforeDate}
                                {" → "}
                                {report.afterDate}
                              </span>

                              <span>
                                Generated {report.generatedAt}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <ScoreBox
                            label="Baseline"
                            value={report.beforeScore}
                          />

                          <ArrowRight
                            size={16}
                            strokeWidth={1.7}
                            className="text-[#8C978F]"
                          />

                          <ScoreBox
                            label="Comparison"
                            value={report.afterScore}
                          />

                          <div
                            className={`min-w-[82px] rounded-xl px-4 py-3 ${
                              report.scoreChange > 0
                                ? "bg-[#EDF4ED]"
                                : report.scoreChange < 0
                                ? "bg-[#F3EAEA]"
                                : "bg-[#F3F5F2]"
                            }`}
                          >
                            <p
                              className={`text-[9px] uppercase tracking-[0.1em] ${
                                report.scoreChange > 0
                                  ? "text-[#45634D]"
                                  : report.scoreChange < 0
                                  ? "text-[#8A6666]"
                                  : "text-[#667169]"
                              }`}
                            >
                              Change
                            </p>

                            <p
                              className={`mt-1 text-lg font-semibold ${
                                report.scoreChange > 0
                                  ? "text-[#45634D]"
                                  : report.scoreChange < 0
                                  ? "text-[#8A6666]"
                                  : ""
                              }`}
                            >
                              {report.scoreChange > 0
                                ? `+${report.scoreChange}`
                                : report.scoreChange}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-5 border-t border-[#E7ECE6] pt-5 lg:grid-cols-[1fr_1.2fr_auto] lg:items-end">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.12em] text-[#8C978F]">
                            Treatment programme
                          </p>

                          <p className="mt-2 text-sm font-medium">
                            {report.treatmentProgramme}
                          </p>

                          {report.completedTreatments.length > 0 && (
                            <p className="mt-2 text-[10px] text-[#6E8375]">
                              Latest completed:{" "}
                              {report.completedTreatments[0].treatment}
                              {" · "}
                              {report.completedTreatments[0].date}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-[0.12em] text-[#8C978F]">
                            Clinical summary
                          </p>

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#667169]">
                            {report.summary}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openReport(report)
                          }
                          className="whitespace-nowrap rounded-[13px] bg-[#173725] px-5 py-3 text-[11px] font-semibold text-white shadow-[0_10px_26px_rgba(23,55,37,0.16)] transition hover:-translate-y-px hover:bg-[#102D1C]"
                        >
                          View report →
                        </button>
                      </div>

                      {report.metrics.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#F0EFEA] pt-5">
                          {report.metrics
                            .slice(0, 5)
                            .map((metric) => (
                              <span
                                key={metric.label}
                                className={`rounded-full px-3 py-1.5 text-[9px] font-medium ${
                                  metric.change > 0
                                    ? "bg-[#EAF3EA] text-[#45634D]"
                                    : metric.change < 0
                                    ? "bg-[#F3EAEA] text-[#8A6666]"
                                    : "bg-[#F3F5F2] text-[#667169]"
                                }`}
                              >
                                {metric.label}{" "}
                                {metric.change > 0
                                  ? `+${metric.change}`
                                  : metric.change}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : reports.length > 0 ? (
                <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-[24px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_14px_40px_rgba(27,43,32,0.045)] p-8">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[13px] border border-[#DCE5DC] bg-[#EDF3ED] text-[#45634D]">
                      <Search size={19} strokeWidth={1.7} />
                    </div>

                    <h3 className="mt-4 text-base font-semibold">
                      No reports found
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[#667169]">
                      Try searching for another patient,
                      concern, treatment or practitioner.
                    </p>

                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mt-5 rounded-xl border border-[#DDE5DC] px-4 py-2.5 text-xs font-medium hover:bg-[#F7F6F2]"
                    >
                      Clear search
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex min-h-[380px] items-center justify-center rounded-[24px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_14px_40px_rgba(27,43,32,0.045)] p-8">
                  <div className="max-w-md text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0EFEA]">
                      <FileText
                        size={24}
                        strokeWidth={1.6}
                        className="text-[#667169]"
                      />
                    </div>

                    <h3 className="mt-5 text-xl font-semibold">
                      No progress reports yet
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#667169]">
                      Generate a report from a patient&apos;s
                      Before &amp; After comparison and it
                      will appear here automatically.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href =
                          "/patients";
                      }}
                      className="mt-6 rounded-[13px] bg-[#173725] px-5 py-3 text-[11px] font-semibold text-white shadow-[0_12px_30px_rgba(23,55,37,0.18)] transition hover:-translate-y-px hover:bg-[#102D1C]"
                    >
                      Open patients →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_14px_40px_rgba(27,43,32,0.045)] p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-[13px] border border-[#DCE5DC] bg-[#EDF3ED] text-[#45634D]">
        {icon}
      </div>

      <p className="mt-5 text-xs text-[#667169]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-2 text-[10px] text-[#8C978F]">
        {detail}
      </p>
    </div>
  );
}

function OutcomeCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-[24px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_14px_40px_rgba(27,43,32,0.045)] p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-[#DCE5DC] bg-[#EDF3ED] text-[#45634D]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-[#667169]">
          {label}
        </p>

        <p className="mt-1 truncate text-lg font-semibold">
          {value}
        </p>

        <p className="mt-1 text-[10px] leading-4 text-[#8C978F]">
          {detail}
        </p>
      </div>
    </div>
  );
}

function TreatmentDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] uppercase tracking-[0.1em] text-[#8C978F]">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-medium text-[#55544F]">
        {value || "—"}
      </p>
    </div>
  );
}

function ScoreBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-[82px] rounded-[13px] border border-[#E4E9E3] bg-[#F6F8F5] px-4 py-3">
      <p className="text-[9px] uppercase tracking-[0.1em] text-[#8C978F]">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}

function EmptyMiniState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="px-6 py-10 text-center">
      <p className="text-sm font-medium">
        {text}
      </p>
    </div>
  );
}

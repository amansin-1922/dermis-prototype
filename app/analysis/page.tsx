"use client";

import { useEffect, useState } from "react";
import {
  Upload,
  Sparkles,
  Check,
  Camera,
  History,
  ArrowRight,
  Save,
  ScanFace,
  Target,
  TrendingUp,
} from "lucide-react";

import Sidebar from "../components/sidebar";
import { createClient } from "@/app/lib/supabase-browser";

type ImageSlot = "front" | "left" | "right";

type UploadedImages = {
  front: string | null;
  left: string | null;
  right: string | null;
};

type Patient = {
  id: string | number;
  legacyId?: number;
  clinicId?: string;
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

type TimelineItem = {
  date: string;
  title: string;
  description: string;
  type: string;
};

type TreatmentItem = {
  name: string;
  reason: string;
  price: string;
};

type ClinicalProfile = {
  score: number;
  change: string;
  skinType: string;
  metrics: SkinMetric[];
  timeline: TimelineItem[];
  treatments: TreatmentItem[];
};

type AnalysisRecord = {
  id: string | number;
  patientId?: string | number;
  date: string;
  score: number;
  image: string;
  metrics: SkinMetric[];
  change?: number;
  recommendations?: TreatmentRecommendation[];
  summary?: string;
  expectedImprovement?: string;
};

type FollowUpStatus =
  | "Due"
  | "Scheduled"
  | "Analysis started"
  | "Completed";

type FollowUpRecord = {
  id: string | number;
  appointmentId: string | number;
  patientId?: string | number;
  patient: string;
  treatment: string;
  completedDate: string;
  completedRawDate?: string;
  practitioner?: string;
  practitionerId?: string | number;
  status: FollowUpStatus;
  createdAt: string;
  followUpAppointmentId?: string | number;
};

type FollowUpSource = {
  followUpId?: string | number;
  appointmentId?: string | number;
  patientId?: string | number;
  patient: string;
  treatment: string;
  completedDate: string;
};

type ConcernInsight = {
  label: string;
  score: number;
  severity: "High" | "Moderate" | "Low";
  message: string;
};

type TreatmentRecommendation = {
  name: string;
  reason: string;
  match: string;
  price: string;
  target: string;
};

type AnalysisResult = {
  score: number;
  change: number;
  metrics: SkinMetric[];
  priorities: ConcernInsight[];
  recommendations: TreatmentRecommendation[];
  summary: string;
  expectedImprovement: string;
};

/*
 * localStorage is intentionally used only for this prototype.
 * Full-resolution base64 photos can fill the browser's storage very quickly,
 * so photos are reduced before being persisted.
 */
async function compressImageDataUrl(
  dataUrl: string,
  maxDimension = 720,
  quality = 0.68
): Promise<string> {
  if (
    !dataUrl ||
    !dataUrl.startsWith("data:image/")
  ) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const largestSide = Math.max(
        image.naturalWidth,
        image.naturalHeight
      );

      const scale =
        largestSide > maxDimension
          ? maxDimension / largestSide
          : 1;

      const width = Math.max(
        1,
        Math.round(
          image.naturalWidth * scale
        )
      );

      const height = Math.max(
        1,
        Math.round(
          image.naturalHeight * scale
        )
      );

      const canvas =
        document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context =
        canvas.getContext("2d");

      if (!context) {
        resolve(dataUrl);
        return;
      }

      context.drawImage(
        image,
        0,
        0,
        width,
        height
      );

      try {
        const compressed =
          canvas.toDataURL(
            "image/jpeg",
            quality
          );

        resolve(
          compressed.length <
            dataUrl.length
            ? compressed
            : dataUrl
        );
      } catch {
        resolve(dataUrl);
      }
    };

    image.onerror = () =>
      resolve(dataUrl);

    image.src = dataUrl;
  });
}

function getTodayClinicalDate() {
  return new Date().toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return 0;

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return Math.max(age, 0);
}

function formatClinicalDate(value: string | null | undefined) {
  if (!value) return getTodayClinicalDate();

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return getTodayClinicalDate();

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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

const baseMetrics: SkinMetric[] = [
  {
    label: "Hydration",
    value: 68,
    status: "Moderate",
  },
  {
    label: "Texture",
    value: 72,
    status: "Good",
  },
  {
    label: "Pigmentation",
    value: 60,
    status: "Moderate",
  },
  {
    label: "Acne",
    value: 63,
    status: "Moderate",
  },
  {
    label: "Redness",
    value: 66,
    status: "Moderate",
  },
  {
    label: "Fine lines",
    value: 74,
    status: "Good",
  },
];

const treatmentCatalog = [
  {
    name: "Hydration Facial",
    reason: "Supports moisture balance and skin texture",
    price: "£120",
    targets: ["Hydration", "Texture", "Sensitivity"],
  },
  {
    name: "Pigmentation Peel",
    reason: "Targets uneven tone and visible pigmentation",
    price: "£150",
    targets: ["Pigmentation", "Texture"],
  },
  {
    name: "Acne Clarifying Treatment",
    reason: "Supports clearer-looking skin and reduced congestion",
    price: "£135",
    targets: ["Acne", "Congestion", "Texture"],
  },
  {
    name: "Skin Renewal Treatment",
    reason: "Supports visible fine lines, firmness and overall renewal",
    price: "£195",
    targets: ["Fine lines", "Firmness", "Texture"],
  },
  {
    name: "Calming Barrier Facial",
    reason: "Supports redness, sensitivity and barrier comfort",
    price: "£125",
    targets: ["Redness", "Sensitivity", "Hydration"],
  },
];

type ClinicSettings = {
  clinicName?: string;
  practitionerName?: string;
  initials?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AnalysisPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);

  const [patients, setPatients] =
    useState<Patient[]>(defaultPatients);

  const [clinicSettings, setClinicSettings] =
    useState<ClinicSettings>({
      clinicName: "Skinhouse Clinic",
      practitionerName: "Sarah Williams",
      initials: "SW",
    });

  const [selectedPatient, setSelectedPatient] =
    useState<Patient>(defaultPatients[0]);

  const [images, setImages] = useState<UploadedImages>({
    front: null,
    left: null,
    right: null,
  });

  const [saved, setSaved] = useState(false);
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [primaryPractitionerId, setPrimaryPractitionerId] =
    useState<string | null>(null);

  const [historicalAnalysis, setHistoricalAnalysis] =
    useState<AnalysisRecord | null>(null);

  const [followUpSource, setFollowUpSource] =
    useState<FollowUpSource | null>(null);

  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResult>({
      score: 76,
      change: 0,
      metrics: baseMetrics,
      priorities: buildPriorityInsights(baseMetrics),
      recommendations: buildRecommendations(baseMetrics),
      summary:
        "Prototype assessment ready. Upload a front-facing image and run the simulated analysis to generate patient-specific results.",
      expectedImprovement: "—",
    });

  /*
   * LOAD PATIENTS
   */
  useEffect(() => {
    const storedClinicSettings =
      localStorage.getItem(
        "dermisClinicSettings"
      );

    if (storedClinicSettings) {
      try {
        const parsedClinicSettings: ClinicSettings =
          JSON.parse(storedClinicSettings);

        setClinicSettings((current) => ({
          ...current,
          ...parsedClinicSettings,
        }));
      } catch (error) {
        console.error(
          "Could not load clinic settings:",
          error
        );
      }
    }

    const storedPatients =
      localStorage.getItem("dermisPatients");

    let availablePatients = defaultPatients;

    if (storedPatients) {
      try {
        const parsedPatients: Patient[] =
          JSON.parse(storedPatients);

        if (parsedPatients.length > 0) {
          availablePatients = parsedPatients;
          setPatients(parsedPatients);
        }
      } catch (error) {
        console.error(
          "Could not load patients:",
          error
        );
      }
    }

    const savedSelectedPatient =
      localStorage.getItem(
        "dermisSelectedPatient"
      );

    const resolvedPatientFallback: Patient =
      availablePatients[0] ?? defaultPatients[0];

    let resolvedPatient: Patient =
      resolvedPatientFallback;

    if (savedSelectedPatient) {
      try {
        const parsedPatient: Patient =
          JSON.parse(savedSelectedPatient);

        resolvedPatient = parsedPatient;
        setSelectedPatient(parsedPatient);

        const exists =
          availablePatients.some(
            (patient) =>
              String(patient.id) ===
              String(parsedPatient.id)
          );

        if (!exists) {
          setPatients((current) => [
            parsedPatient,
            ...current,
          ]);
        }
      } catch (error) {
        console.error(
          "Could not load selected patient:",
          error
        );
      }
    }

    /*
     * HISTORICAL ANALYSIS VIEW
     *
     * Patient Analysis History stores a hand-off record in
     * dermisSelectedAnalysis and opens /analysis?mode=history.
     *
     * The patient page may hand off only the core fields, so this page
     * also looks up the matching record in dermisAnalysisHistory. That
     * restores the original saved photo and any other persisted fields.
     *
     * Historical mode is read-only and must never overwrite
     * dermisLatestAnalysis.
     */
    const isHistoryMode =
      new URLSearchParams(
        window.location.search
      ).get("mode") === "history";

    if (isHistoryMode) {
      const storedSelectedAnalysis =
        localStorage.getItem(
          "dermisSelectedAnalysis"
        );

      if (storedSelectedAnalysis) {
        try {
          type HistoricalAnalysisHandoff =
            Partial<AnalysisRecord> & {
              patient?: string;
              patientId?: string | number;
            };

          const parsedSelectedAnalysis =
            JSON.parse(
              storedSelectedAnalysis
            ) as HistoricalAnalysisHandoff;

          /*
           * Resolve the patient from the historical hand-off first.
           * This prevents another previously selected patient from being
           * used when opening an old record.
           */
          const historicalPatient =
            parsedSelectedAnalysis.patientId != null
              ? availablePatients.find(
                  (patient) =>
                    String(patient.id) ===
                    String(parsedSelectedAnalysis.patientId) ||
                    (patient.legacyId != null &&
                      String(patient.legacyId) ===
                        String(parsedSelectedAnalysis.patientId))
                )
              : typeof parsedSelectedAnalysis.patient === "string"
                ? availablePatients.find(
                    (patient) =>
                      patient.name ===
                      parsedSelectedAnalysis.patient
                  )
                : undefined;

          if (historicalPatient) {
            resolvedPatient =
              historicalPatient;

            setSelectedPatient(
              historicalPatient
            );

            localStorage.setItem(
              "dermisSelectedPatient",
              JSON.stringify(
                historicalPatient
              )
            );
          }

          const storedHistory =
            localStorage.getItem(
              "dermisAnalysisHistory"
            );

          let previousHistory:
            AnalysisRecord[] = [];

          if (storedHistory) {
            try {
              const parsedHistory: Record<
                string,
                AnalysisRecord[]
              > = JSON.parse(storedHistory);

              previousHistory =
                parsedHistory[String(resolvedPatient.id)] ||
                (resolvedPatient.legacyId != null
                  ? parsedHistory[String(resolvedPatient.legacyId)]
                  : []) ||
                [];
            } catch (error) {
              console.error(
                "Could not load historical analysis history:",
                error
              );
            }
          }

          /*
           * Recover the full stored record.
           *
           * The hand-off from Patient Profile can omit the image, while
           * dermisAnalysisHistory contains the complete saved analysis.
           */
          const matchingStoredRecord =
            previousHistory.find(
              (record) =>
                parsedSelectedAnalysis.id != null &&
                String(record.id) ===
                  String(
                    parsedSelectedAnalysis.id
                  )
            ) ||
            previousHistory.find(
              (record) =>
                typeof parsedSelectedAnalysis.date === "string" &&
                typeof parsedSelectedAnalysis.score === "number" &&
                record.date ===
                  parsedSelectedAnalysis.date &&
                record.score ===
                  parsedSelectedAnalysis.score
            ) ||
            null;

          const restoredHistoricalAnalysis:
            AnalysisRecord | null =
            (() => {
              const mergedRecord = {
                ...(matchingStoredRecord || {}),
                ...parsedSelectedAnalysis,
                image:
                  parsedSelectedAnalysis.image ||
                  matchingStoredRecord?.image ||
                  "",
                metrics:
                  Array.isArray(
                    parsedSelectedAnalysis.metrics
                  ) &&
                  parsedSelectedAnalysis.metrics.length > 0
                    ? parsedSelectedAnalysis.metrics
                    : matchingStoredRecord?.metrics ||
                      [],
              };

              const validId =
                typeof mergedRecord.id === "number" ||
                typeof mergedRecord.id === "string";

              const validDate =
                typeof mergedRecord.date === "string";

              const validScore =
                typeof mergedRecord.score === "number";

              const validMetrics =
                Array.isArray(
                  mergedRecord.metrics
                );

              if (
                !validId ||
                !validDate ||
                !validScore ||
                !validMetrics
              ) {
                return null;
              }

              return {
                id: mergedRecord.id as string | number,
                date: mergedRecord.date as string,
                score: mergedRecord.score as number,
                image:
                  typeof mergedRecord.image === "string"
                    ? mergedRecord.image
                    : "",
                metrics:
                  mergedRecord.metrics as SkinMetric[],
              };
            })();

          if (restoredHistoricalAnalysis) {
            const historicalMetrics =
              restoredHistoricalAnalysis.metrics;

            const selectedIndex =
              previousHistory.findIndex(
                (record) =>
                  record.id ===
                    restoredHistoricalAnalysis.id ||
                  (
                    record.date ===
                      restoredHistoricalAnalysis.date &&
                    record.score ===
                      restoredHistoricalAnalysis.score
                  )
              );

            const previousRecord =
              selectedIndex > 0
                ? previousHistory[
                    selectedIndex - 1
                  ]
                : null;

            const historicalChange =
              previousRecord
                ? restoredHistoricalAnalysis.score -
                  previousRecord.score
                : 0;

            setHistoricalAnalysis(
              restoredHistoricalAnalysis
            );

            setImages({
              front:
                restoredHistoricalAnalysis.image ||
                null,
              left: null,
              right: null,
            });

            setAnalysisResult({
              score:
                restoredHistoricalAnalysis.score,
              change:
                historicalChange,
              metrics:
                historicalMetrics,
              priorities:
                buildPriorityInsights(
                  historicalMetrics
                ),
              recommendations:
                buildRecommendations(
                  historicalMetrics
                ),
              summary: `Saved historical assessment for ${resolvedPatient.name} from ${restoredHistoricalAnalysis.date}. Overall skin score: ${restoredHistoricalAnalysis.score}/100.`,
              expectedImprovement:
                restoredHistoricalAnalysis.score >= 85
                  ? "Maintain current progress"
                  : "+4–8 points over the next treatment cycle",
            });

            setSaved(true);
            setProgress(100);
            setStep(3);
          } else {
            console.error(
              "Historical analysis hand-off was incomplete and no matching saved record was found."
            );
          }
        } catch (error) {
          console.error(
            "Could not load selected historical analysis:",
            error
          );
        }
      }
    }

    const storedFollowUpSource =
      localStorage.getItem(
        "dermisFollowUpSource"
      );

    if (storedFollowUpSource) {
      try {
        const parsedSource =
          JSON.parse(storedFollowUpSource) as Partial<FollowUpSource>;

        const validSource =
          typeof parsedSource.patient === "string" &&
          typeof parsedSource.treatment === "string" &&
          typeof parsedSource.completedDate === "string";

        const matchesPatient =
          validSource &&
          (parsedSource.patientId === resolvedPatient.id ||
            parsedSource.patient === resolvedPatient.name);

        if (matchesPatient) {
          setFollowUpSource(
            parsedSource as FollowUpSource
          );
        } else {
          localStorage.removeItem(
            "dermisFollowUpSource"
          );
        }
      } catch (error) {
        console.error(
          "Could not load follow-up source:",
          error
        );

        localStorage.removeItem(
          "dermisFollowUpSource"
        );
      }
    }
  }, []);

  /*
   * SUPABASE SYNC
   *
   * Supabase is authoritative for patients and saved skin analyses.
   * localStorage remains a compatibility cache for the patient profile,
   * progress and follow-up modules while those areas are migrated.
   */
  useEffect(() => {
    let cancelled = false;

    const loadSupabaseAnalysisData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || cancelled) return;

        const { data: membership, error: membershipError } = await supabase
          .from("clinic_memberships")
          .select("clinic_id")
          .eq("user_id", user.id)
          .eq("active", true)
          .limit(1)
          .maybeSingle();

        if (membershipError || !membership?.clinic_id || cancelled) {
          if (membershipError) {
            console.error("Could not resolve clinic membership:", membershipError);
          }
          return;
        }

        const resolvedClinicId = String(membership.clinic_id);
        setClinicId(resolvedClinicId);

        const [patientResult, practitionerResult, analysisResultResponse] =
          await Promise.all([
            supabase
              .from("patients")
              .select(
                "id, legacy_id, first_name, last_name, email, phone, date_of_birth, status, primary_concern, last_visit_at"
              )
              .eq("clinic_id", resolvedClinicId)
              .order("created_at", { ascending: true }),
            supabase
              .from("practitioners")
              .select("id, is_primary")
              .eq("clinic_id", resolvedClinicId)
              .eq("active", true)
              .order("is_primary", { ascending: false })
              .limit(1),
            supabase
              .from("skin_analyses")
              .select(
                "id, patient_id, analysis_date, overall_score, score_change, metrics, recommendations, ai_summary, expected_improvement, image_path"
              )
              .eq("clinic_id", resolvedClinicId)
              .order("analysis_date", { ascending: true }),
          ]);

        if (cancelled) return;

        if (patientResult.error) {
          console.error("Could not load Supabase patients:", patientResult.error);
          return;
        }

        if (analysisResultResponse.error) {
          console.error(
            "Could not load Supabase skin analyses:",
            analysisResultResponse.error
          );
          return;
        }

        const practitionerRow = Array.isArray(practitionerResult.data)
          ? practitionerResult.data[0]
          : null;

        if (practitionerRow?.id) {
          setPrimaryPractitionerId(String(practitionerRow.id));
        }

        const analysisRows = Array.isArray(analysisResultResponse.data)
          ? analysisResultResponse.data
          : [];

        const analysisCounts = new Map<string, number>();
        const historyByPatient: Record<string, AnalysisRecord[]> = {};

        for (const row of analysisRows) {
          const patientId = String(row.patient_id);
          const metrics = Array.isArray(row.metrics)
            ? (row.metrics as SkinMetric[])
            : [];
          const recommendations = Array.isArray(row.recommendations)
            ? (row.recommendations as TreatmentRecommendation[])
            : [];

          const record: AnalysisRecord = {
            id: String(row.id),
            patientId,
            date: formatClinicalDate(row.analysis_date),
            score: Number(row.overall_score ?? 0),
            image: typeof row.image_path === "string" ? row.image_path : "",
            metrics,
            change:
              row.score_change == null ? undefined : Number(row.score_change),
            recommendations,
            summary:
              typeof row.ai_summary === "string" ? row.ai_summary : undefined,
            expectedImprovement:
              typeof row.expected_improvement === "string"
                ? row.expected_improvement
                : undefined,
          };

          historyByPatient[patientId] = [
            ...(historyByPatient[patientId] || []),
            record,
          ];
          analysisCounts.set(patientId, (analysisCounts.get(patientId) || 0) + 1);
        }

        let cachedPatients: Patient[] = [];
        try {
          const cachedPatientsRaw = localStorage.getItem("dermisPatients");
          cachedPatients = cachedPatientsRaw ? JSON.parse(cachedPatientsRaw) : [];
        } catch {
          cachedPatients = [];
        }

        const mappedPatients: Patient[] = (patientResult.data || []).map((row) => {
          const rowId = String(row.id);
          const cached = cachedPatients.find(
            (item) =>
              String(item.id) === rowId ||
              (row.legacy_id != null &&
                String(item.id) === String(row.legacy_id)) ||
              (row.legacy_id != null &&
                String(item.legacyId ?? "") === String(row.legacy_id))
          );
          const name = `${row.first_name || ""} ${row.last_name || ""}`.trim();

          const patient: Patient = {
            id: rowId,
            legacyId: row.legacy_id ?? undefined,
            clinicId: resolvedClinicId,
            name,
            email: row.email || "",
            phone: row.phone || "",
            age: calculateAge(row.date_of_birth),
            lastVisit: row.last_visit_at
              ? formatClinicalDate(row.last_visit_at)
              : cached?.lastVisit || "No visits yet",
            status:
              String(row.status || "active").toLowerCase() === "inactive"
                ? "Inactive"
                : "Active",
            concern: row.primary_concern || "",
            analyses: analysisCounts.get(rowId) || 0,
          };

          if (patient.legacyId != null && historyByPatient[rowId]) {
            historyByPatient[String(patient.legacyId)] = historyByPatient[rowId];
          }

          return patient;
        });

        localStorage.setItem(
          "dermisAnalysisHistory",
          JSON.stringify(historyByPatient)
        );
        localStorage.setItem("dermisPatients", JSON.stringify(mappedPatients));

        setPatients(mappedPatients);

        const storedSelectedPatient = localStorage.getItem("dermisSelectedPatient");
        let cachedSelected: Patient | null = null;
        if (storedSelectedPatient) {
          try {
            cachedSelected = JSON.parse(storedSelectedPatient);
          } catch {
            cachedSelected = null;
          }
        }

        const matchedSelected =
          mappedPatients.find(
            (patient) =>
              cachedSelected != null &&
              (String(patient.id) === String(cachedSelected.id) ||
                (patient.legacyId != null &&
                  String(patient.legacyId) === String(cachedSelected.id)) ||
                (cachedSelected.legacyId != null &&
                  String(patient.legacyId ?? "") ===
                    String(cachedSelected.legacyId)))
          ) ||
          mappedPatients.find(
            (patient) =>
              cachedSelected != null && patient.email === cachedSelected.email
          ) ||
          mappedPatients[0];

        if (matchedSelected) {
          setSelectedPatient(matchedSelected);
          localStorage.setItem(
            "dermisSelectedPatient",
            JSON.stringify(matchedSelected)
          );
        }

        const isHistoryMode =
          new URLSearchParams(window.location.search).get("mode") === "history";

        if (isHistoryMode) {
          const selectedAnalysisRaw = localStorage.getItem("dermisSelectedAnalysis");

          if (selectedAnalysisRaw) {
            try {
              const handoff = JSON.parse(selectedAnalysisRaw) as
                Partial<AnalysisRecord> & {
                  patient?: string;
                  patientId?: string | number;
                };

              const historyPatient =
                mappedPatients.find(
                  (patient) =>
                    handoff.patientId != null &&
                    (String(patient.id) === String(handoff.patientId) ||
                      String(patient.legacyId ?? "") ===
                        String(handoff.patientId))
                ) ||
                mappedPatients.find(
                  (patient) => handoff.patient && patient.name === handoff.patient
                ) ||
                matchedSelected;

              if (historyPatient) {
                const history = historyByPatient[String(historyPatient.id)] || [];
                const selectedIndex = history.findIndex(
                  (record) =>
                    (handoff.id != null && String(record.id) === String(handoff.id)) ||
                    (handoff.date != null &&
                      handoff.score != null &&
                      record.date === handoff.date &&
                      record.score === Number(handoff.score))
                );
                const record = selectedIndex >= 0 ? history[selectedIndex] : null;

                if (record) {
                  const previousRecord =
                    selectedIndex > 0 ? history[selectedIndex - 1] : null;
                  const change =
                    record.change ??
                    (previousRecord ? record.score - previousRecord.score : 0);

                  setSelectedPatient(historyPatient);
                  localStorage.setItem(
                    "dermisSelectedPatient",
                    JSON.stringify(historyPatient)
                  );
                  setHistoricalAnalysis(record);
                  setImages({
                    front: record.image || null,
                    left: null,
                    right: null,
                  });
                  setAnalysisResult({
                    score: record.score,
                    change,
                    metrics: record.metrics,
                    priorities: buildPriorityInsights(record.metrics),
                    recommendations:
                      record.recommendations?.length
                        ? record.recommendations
                        : buildRecommendations(record.metrics),
                    summary:
                      record.summary ||
                      `Saved historical assessment for ${historyPatient.name} from ${record.date}. Overall skin score: ${record.score}/100.`,
                    expectedImprovement:
                      record.expectedImprovement ||
                      (record.score >= 85
                        ? "Maintain current progress"
                        : "+4–8 points over the next treatment cycle"),
                  });
                  setSaved(true);
                  setProgress(100);
                  setStep(3);
                }
              }
            } catch (error) {
              console.error("Could not restore Supabase historical analysis:", error);
            }
          }
        }
      } catch (error) {
        console.error("Could not load Supabase analysis data:", error);
      }
    };

    void loadSupabaseAnalysisData();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * PROGRESS 0 → 100
   */
  useEffect(() => {
    if (step !== 2) {
      return;
    }

    setProgress(0);

    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(interval);
          return 100;
        }

        return Math.min(
          current + 2,
          100
        );
      });
    }, 80);

    return () =>
      clearInterval(interval);
  }, [step]);

  /*
   * IMAGE UPLOAD
   *
   * FileReader is used instead of
   * URL.createObjectURL because we need
   * the image to survive navigation.
   */
  const handleImageUpload = (
    slot: ImageSlot,
    file: File | undefined
  ) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      const imageData =
        reader.result;

      if (
        typeof imageData !==
        "string"
      ) {
        return;
      }

      const compressedImage =
        await compressImageDataUrl(
          imageData
        );

      setImages((current) => ({
        ...current,
        [slot]: compressedImage,
      }));
    };

    reader.readAsDataURL(file);
  };

  const hasFrontImage =
    Boolean(images.front);

  /*
   * GENERATE A SIMULATED AI RESULT
   *
   * It checks the patient's last saved analysis.
   * Each future analysis generally improves
   * slightly instead of returning the same score.
   */
  const generateAnalysisResult =
    (): AnalysisResult => {
      let previousScore: number | null =
        null;

      let previousMetrics:
        | SkinMetric[]
        | null = null;

      const storedHistory =
        localStorage.getItem(
          "dermisAnalysisHistory"
        );

      if (storedHistory) {
        try {
          const parsedHistory: Record<
            string,
            AnalysisRecord[]
          > = JSON.parse(
            storedHistory
          );

          const patientHistory =
            parsedHistory[String(selectedPatient.id)] ||
            (selectedPatient.legacyId != null
              ? parsedHistory[String(selectedPatient.legacyId)]
              : []) ||
            [];

          if (
            patientHistory.length > 0
          ) {
            const latest =
              patientHistory[
                patientHistory.length - 1
              ];

            previousScore =
              latest.score;

            previousMetrics =
              latest.metrics;
          }
        } catch (error) {
          console.error(
            "Could not read previous analysis:",
            error
          );
        }
      }

      /*
       * First analysis score depends slightly
       * on patient ID so every demo patient
       * does not start at exactly the same score.
       */
      const startingScores: Record<
        number,
        number
      > = {
        1: 68,
        2: 74,
        3: 62,
        4: 70,
        5: 66,
        6: 59,
      };

      const startingScoreKey =
        selectedPatient.legacyId ??
        (typeof selectedPatient.id === "number"
          ? selectedPatient.id
          : 0);

      const baselineScore =
        previousScore ??
        startingScores[startingScoreKey] ??
        64 +
          Math.floor(
            Math.random() * 8
          );

      /*
       * Usually improve by 2–6 points.
       *
       * Once score becomes high,
       * improvement naturally slows.
       */
      let improvement =
        2 +
        Math.floor(
          Math.random() * 5
        );

      if (baselineScore >= 85) {
        improvement =
          Math.floor(
            Math.random() * 3
          );
      }

      if (baselineScore >= 92) {
        improvement =
          Math.floor(
            Math.random() * 2
          );
      }

      const newScore = Math.min(
        baselineScore +
          improvement,
        96
      );

      const sourceMetrics =
        previousMetrics &&
        previousMetrics.length > 0
          ? previousMetrics
          : getPatientStartingMetrics(
              selectedPatient
            );

      const newMetrics =
        sourceMetrics.map(
          (metric) => {
            let metricImprovement =
              1 +
              Math.floor(
                Math.random() * 6
              );

            if (
              metric.value >= 85
            ) {
              metricImprovement =
                Math.floor(
                  Math.random() * 3
                );
            }

            const newValue =
              Math.min(
                metric.value +
                  metricImprovement,
                96
              );

            return {
              label: metric.label,
              value: newValue,
              status:
                getMetricStatus(
                  newValue
                ),
            };
          }
        );

      const priorities =
        buildPriorityInsights(newMetrics);

      const generatedRecommendations =
        buildRecommendations(newMetrics);

      const weakest =
        priorities[0]?.label ||
        selectedPatient.concern;

      return {
        score: newScore,
        change:
          newScore -
          baselineScore,
        metrics: newMetrics,
        priorities,
        recommendations:
          generatedRecommendations,
        summary: `This simulated assessment shows an overall skin score of ${newScore}/100. ${weakest} is the highest-priority visible concern, while stronger metrics should be maintained with the current routine.`,
        expectedImprovement:
          newScore >= 85
            ? "Maintain / +1–3 points"
            : "+4–8 points over the next treatment cycle",
      };
    };

  /*
   * RUN ANALYSIS
   */
  const runAnalysis = () => {
    if (!hasFrontImage) return;

    const result =
      generateAnalysisResult();

    setAnalysisResult(result);

    setSaved(false);
    setProgress(0);
    setStep(2);
  };

  const viewResults = () => {
    if (progress < 100) return;

    setStep(3);
  };

  /*
   * RESET
   */
  const resetAnalysis = () => {
    setHistoricalAnalysis(null);

    localStorage.removeItem(
      "dermisSelectedAnalysis"
    );

    if (
      new URLSearchParams(
        window.location.search
      ).get("mode") === "history"
    ) {
      window.history.replaceState(
        {},
        "",
        "/analysis"
      );
    }

    setStep(1);
    setProgress(0);
    setSaved(false);

    setImages({
      front: null,
      left: null,
      right: null,
    });

    setAnalysisResult({
      score: 76,
      change: 0,
      metrics: baseMetrics,
      priorities:
        buildPriorityInsights(
          baseMetrics
        ),
      recommendations:
        buildRecommendations(
          baseMetrics
        ),
      summary:
        "Prototype assessment ready. Upload a front-facing image and run the simulated analysis to generate patient-specific results.",
      expectedImprovement: "—",
    });
  };

  /*
   * CHANGE PATIENT
   */
  const changePatient = (
    patientName: string
  ) => {
    const patient =
      patients.find(
        (item) =>
          item.name ===
          patientName
      );

    if (!patient) return;

    setSelectedPatient(patient);

    localStorage.setItem(
      "dermisSelectedPatient",
      JSON.stringify(patient)
    );

    if (
      followUpSource &&
      String(followUpSource.patientId ?? "") !== String(patient.id) &&
      followUpSource.patient !== patient.name
    ) {
      setFollowUpSource(null);
      localStorage.removeItem(
        "dermisFollowUpSource"
      );
    }

    resetAnalysis();
  };

  /*
   * SAVE ANALYSIS
   */
  const saveAnalysis = async () => {
    if (saved || savingAnalysis) return;

    setSavingAnalysis(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      let resolvedClinicId =
        clinicId ||
        (typeof selectedPatient.clinicId === "string"
          ? selectedPatient.clinicId
          : null);

      if (!resolvedClinicId) {
        const { data: membership, error: membershipError } = await supabase
          .from("clinic_memberships")
          .select("clinic_id")
          .eq("user_id", user.id)
          .eq("active", true)
          .limit(1)
          .maybeSingle();

        if (membershipError || !membership?.clinic_id) {
          throw new Error("Could not resolve your clinic membership.");
        }

        resolvedClinicId = String(membership.clinic_id);
        setClinicId(resolvedClinicId);
      }

      let patientUuid = isUuid(String(selectedPatient.id))
        ? String(selectedPatient.id)
        : null;

      if (!patientUuid) {
        let patientQuery = supabase
          .from("patients")
          .select("id")
          .eq("clinic_id", resolvedClinicId);

        if (selectedPatient.legacyId != null) {
          patientQuery = patientQuery.eq("legacy_id", selectedPatient.legacyId);
        } else if (typeof selectedPatient.id === "number") {
          patientQuery = patientQuery.eq("legacy_id", selectedPatient.id);
        } else {
          patientQuery = patientQuery.eq("email", selectedPatient.email);
        }

        const { data: patientRow, error: patientError } =
          await patientQuery.limit(1).maybeSingle();

        if (patientError || !patientRow?.id) {
          throw new Error("Could not match this patient to the Supabase record.");
        }

        patientUuid = String(patientRow.id);
      }

      let resolvedPractitionerId =
        primaryPractitionerId && isUuid(primaryPractitionerId)
          ? primaryPractitionerId
          : null;

      if (!resolvedPractitionerId) {
        const { data: practitionerRow } = await supabase
          .from("practitioners")
          .select("id")
          .eq("clinic_id", resolvedClinicId)
          .eq("active", true)
          .order("is_primary", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (practitionerRow?.id) {
          resolvedPractitionerId = String(practitionerRow.id);
          setPrimaryPractitionerId(resolvedPractitionerId);
        }
      }

      const { data: consultationRow } = await supabase
        .from("consultations")
        .select("id")
        .eq("clinic_id", resolvedClinicId)
        .eq("patient_id", patientUuid)
        .order("consultation_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      const analysisTimestamp = new Date().toISOString();
      const compactFrontImage = images.front
        ? await compressImageDataUrl(images.front)
        : "";

      const { data: savedRow, error: saveError } = await supabase
        .from("skin_analyses")
        .insert({
          clinic_id: resolvedClinicId,
          patient_id: patientUuid,
          practitioner_id: resolvedPractitionerId,
          consultation_id: consultationRow?.id || null,
          analysis_date: analysisTimestamp,
          overall_score: analysisResult.score,
          score_change: analysisResult.change,
          concerns: analysisResult.priorities,
          metrics: analysisResult.metrics,
          recommendations: analysisResult.recommendations,
          ai_summary: analysisResult.summary,
          expected_improvement: analysisResult.expectedImprovement,
          // Temporary compatibility storage. This will move to Supabase Storage
          // when the clinical image-storage migration is completed.
          image_path: compactFrontImage || null,
          thumbnail_path: null,
          model_name: "Velyquo Demo Simulator",
          model_version: "prototype-1",
          created_by: user.id,
        })
        .select(
          "id, patient_id, analysis_date, overall_score, score_change, metrics, recommendations, ai_summary, expected_improvement, image_path"
        )
        .single();

      if (saveError || !savedRow) {
        throw new Error(saveError?.message || "The analysis could not be saved.");
      }

      const analysisDate = formatClinicalDate(savedRow.analysis_date);
      const analysisMetrics = Array.isArray(savedRow.metrics)
        ? (savedRow.metrics as SkinMetric[])
        : analysisResult.metrics;
      const savedRecommendations = Array.isArray(savedRow.recommendations)
        ? (savedRow.recommendations as TreatmentRecommendation[])
        : analysisResult.recommendations;

      const newAnalysisRecord: AnalysisRecord = {
        id: String(savedRow.id),
        patientId: patientUuid,
        date: analysisDate,
        score: Number(savedRow.overall_score ?? analysisResult.score),
        image:
          typeof savedRow.image_path === "string"
            ? savedRow.image_path
            : compactFrontImage,
        metrics: analysisMetrics,
        change:
          savedRow.score_change == null
            ? analysisResult.change
            : Number(savedRow.score_change),
        recommendations: savedRecommendations,
        summary:
          typeof savedRow.ai_summary === "string"
            ? savedRow.ai_summary
            : analysisResult.summary,
        expectedImprovement:
          typeof savedRow.expected_improvement === "string"
            ? savedRow.expected_improvement
            : analysisResult.expectedImprovement,
      };

      let analysisHistory: Record<string, AnalysisRecord[]> = {};
      const storedHistory = localStorage.getItem("dermisAnalysisHistory");

      if (storedHistory) {
        try {
          analysisHistory = JSON.parse(storedHistory);
        } catch (error) {
          console.error("Could not read local analysis compatibility history:", error);
        }
      }

      const currentHistory =
        analysisHistory[patientUuid] ||
        (selectedPatient.legacyId != null
          ? analysisHistory[String(selectedPatient.legacyId)]
          : []) ||
        [];

      const updatedHistory = [...currentHistory, newAnalysisRecord];
      analysisHistory[patientUuid] = updatedHistory;

      if (selectedPatient.legacyId != null) {
        analysisHistory[String(selectedPatient.legacyId)] = updatedHistory;
      }

      try {
        localStorage.setItem(
          "dermisAnalysisHistory",
          JSON.stringify(analysisHistory)
        );
      } catch (storageError) {
        console.warn(
          "Local compatibility cache is full. Saving analysis history without photos.",
          storageError
        );

        const photoSafeHistory: Record<string, AnalysisRecord[]> = {};
        for (const [key, records] of Object.entries(analysisHistory)) {
          photoSafeHistory[key] = (Array.isArray(records) ? records : []).map(
            (record) => ({ ...record, image: "" })
          );
        }

        try {
          localStorage.setItem(
            "dermisAnalysisHistory",
            JSON.stringify(photoSafeHistory)
          );
        } catch (retryError) {
          console.warn(
            "Could not update the local analysis compatibility cache:",
            retryError
          );
        }
      }

      localStorage.setItem(
        "dermisLatestAnalysis",
        JSON.stringify({
          id: newAnalysisRecord.id,
          patient: selectedPatient.name,
          patientId: patientUuid,
          score: newAnalysisRecord.score,
          date: analysisDate,
          metrics: analysisMetrics,
        })
      );

      const treatmentItems: TreatmentItem[] = savedRecommendations.map(
        (recommendation) => ({
          name: recommendation.name,
          reason: recommendation.reason,
          price: recommendation.price,
        })
      );

      let clinicalProfiles: Record<string, ClinicalProfile> = {};
      const storedProfiles = localStorage.getItem("dermisClinicalProfiles");

      if (storedProfiles) {
        try {
          clinicalProfiles = JSON.parse(storedProfiles);
        } catch (error) {
          console.error("Could not read clinical profiles:", error);
        }
      }

      const existingProfile =
        clinicalProfiles[patientUuid] ||
        (selectedPatient.legacyId != null
          ? clinicalProfiles[String(selectedPatient.legacyId)]
          : undefined);

      const newTimelineItem: TimelineItem = {
        date: analysisDate,
        title: "AI skin analysis completed",
        description: `Latest skin assessment completed for ${selectedPatient.name}. Overall skin score: ${newAnalysisRecord.score}/100. Primary treatment focus remains ${selectedPatient.concern.toLowerCase()}.`,
        type: "Analysis",
      };

      const updatedProfile: ClinicalProfile = {
        score: newAnalysisRecord.score,
        change:
          Number(newAnalysisRecord.change || 0) > 0
            ? `+${newAnalysisRecord.change}`
            : String(newAnalysisRecord.change || 0),
        skinType:
          existingProfile?.skinType && existingProfile.skinType !== "Not assessed"
            ? existingProfile.skinType
            : getSkinType(selectedPatient),
        metrics: analysisMetrics,
        timeline: [newTimelineItem, ...(existingProfile?.timeline || [])],
        treatments: treatmentItems,
      };

      clinicalProfiles[patientUuid] = updatedProfile;
      if (selectedPatient.legacyId != null) {
        clinicalProfiles[String(selectedPatient.legacyId)] = updatedProfile;
      }
      localStorage.setItem(
        "dermisClinicalProfiles",
        JSON.stringify(clinicalProfiles)
      );

      const { error: patientUpdateError } = await supabase
        .from("patients")
        .update({ last_visit_at: analysisTimestamp })
        .eq("id", patientUuid)
        .eq("clinic_id", resolvedClinicId);

      if (patientUpdateError) {
        console.warn(
          "Analysis saved, but patient last visit could not be updated:",
          patientUpdateError
        );
      }

      const updatedPatient: Patient = {
        ...selectedPatient,
        id: patientUuid,
        clinicId: resolvedClinicId,
        lastVisit: analysisDate,
        analyses: updatedHistory.length,
      };

      const updatedPatients = patients.map((patient) =>
        String(patient.id) === String(selectedPatient.id) ||
        String(patient.id) === patientUuid
          ? updatedPatient
          : patient
      );

      setPatients(updatedPatients);
      setSelectedPatient(updatedPatient);
      localStorage.setItem("dermisPatients", JSON.stringify(updatedPatients));
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(updatedPatient)
      );

      if (followUpSource) {
        const storedFollowUps = localStorage.getItem("dermisFollowUps");

        if (storedFollowUps) {
          try {
            const parsedFollowUps = JSON.parse(storedFollowUps);

            if (Array.isArray(parsedFollowUps)) {
              const updatedFollowUps = parsedFollowUps.map(
                (followUp: FollowUpRecord) => {
                  const matchesFollowUp =
                    followUpSource.followUpId != null
                      ? String(followUp.id) === String(followUpSource.followUpId)
                      : followUpSource.appointmentId != null
                        ? String(followUp.appointmentId) ===
                          String(followUpSource.appointmentId)
                        : false;

                  return matchesFollowUp
                    ? {
                        ...followUp,
                        status: "Completed" as FollowUpStatus,
                      }
                    : followUp;
                }
              );

              localStorage.setItem(
                "dermisFollowUps",
                JSON.stringify(updatedFollowUps)
              );
            }
          } catch (error) {
            console.error("Could not complete follow-up:", error);
          }
        }

        if (isUuid(String(followUpSource.followUpId || ""))) {
          const { error: followUpError } = await supabase
            .from("follow_ups")
            .update({ status: "completed" })
            .eq("id", String(followUpSource.followUpId))
            .eq("clinic_id", resolvedClinicId);

          if (followUpError) {
            console.warn(
              "Analysis saved, but the Supabase follow-up status was not updated:",
              followUpError
            );
          }
        }

        localStorage.removeItem("dermisFollowUpSource");
        setFollowUpSource(null);
      }

      setSaved(true);
    } catch (error) {
      console.error("Could not save Supabase skin analysis:", error);
      const message =
        error instanceof Error
          ? error.message
          : "The analysis could not be saved.";
      window.alert(message);
    } finally {
      setSavingAnalysis(false);
    }
  };

  const scoreChangeText =
    analysisResult.change > 0
      ? `+${analysisResult.change}`
      : analysisResult.change === 0
      ? "No change"
      : String(
          analysisResult.change
        );

  const practitionerInitials =
    clinicSettings.initials?.trim().toUpperCase() ||
    getInitials(
      clinicSettings.practitionerName ||
        "Sarah Williams"
    ) ||
    "SW";

  return (
    <main className="min-h-screen bg-[#F4F6F3] text-[#172019]">

      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <Sidebar activePage="Skin Analysis" />

        {/* MAIN */}
        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E4E8E2] bg-[#FCFDFC]/95 px-6 py-4 backdrop-blur-xl lg:px-10">

            <div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7D8F81]">
                Velyquo intelligence
              </p>

              <h1 className="mt-1.5 text-[20px] font-semibold tracking-[-0.04em] text-[#202A22]">
                Skin analysis
              </h1>

              <p className="mt-1 text-[10px] text-[#929A93]">
                {clinicSettings.clinicName ||
                  "Skinhouse Clinic"}
              </p>

            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={resetAnalysis}
                className="hidden rounded-[11px] bg-[#24402F] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_9px_26px_rgba(36,64,47,0.16)] transition hover:-translate-y-px hover:bg-[#1B3325] sm:block"
              >
                + New analysis
              </button>

              <a
                href="/settings"
                title="Clinic settings"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D6E0D6] bg-[#EAF0EA] text-[10px] font-semibold text-[#486151] transition hover:bg-[#E2EBE2]"
              >
                {practitionerInitials}
              </a>

            </div>

          </header>

          {/* CONTENT */}
          <div className="mx-auto w-full max-w-[1520px] p-6 lg:px-10 lg:py-9">

            {/* TITLE */}
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6F8875]">
                  AI-powered assessment
                </p>

                <h2 className="mt-2 text-[36px] font-semibold leading-none tracking-[-0.055em] text-[#1C261F]">
                  {historicalAnalysis
                    ? "Historical skin analysis"
                    : "New skin analysis"}
                </h2>

                <p className="mt-4 max-w-2xl text-[12px] leading-6 text-[#7C867E]">
                  {historicalAnalysis
                    ? `Reviewing the saved assessment from ${historicalAnalysis.date}. Historical analyses are read-only and do not change the patient's latest analysis.`
                    : "Capture or upload clear patient images to review visible skin characteristics, highlight priority concerns and prepare treatment recommendations."}
                </p>

              </div>

              <button
                type="button"
                onClick={resetAnalysis}
                className="w-fit rounded-[12px] border border-[#DCE2DC] bg-white px-5 py-3 text-[12px] font-semibold text-[#59645C] shadow-[0_4px_16px_rgba(31,56,39,0.03)] transition hover:-translate-y-px hover:bg-[#F6F9F6]"
              >
                {historicalAnalysis
                  ? "Start new analysis"
                  : "Reset analysis"}
              </button>

            </div>

            <div className="mt-6 rounded-[14px] border border-[#E3E8E2] bg-[#F7F9F6] px-4 py-3 text-[10px] leading-5 text-[#7C857E]">
              Demo mode: assessment scores and concern detection are simulated for product demonstration and should not be treated as a medical diagnosis.
            </div>

            {/* FOLLOW-UP CONTEXT */}
            {followUpSource && (
              <div className="mt-6 rounded-[20px] border border-[#D6E2D5] bg-[#EDF4ED] p-5 shadow-[0_8px_28px_rgba(35,62,44,0.04)]">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#DBE5DA] bg-white text-[#4F6B54] shadow-[0_4px_14px_rgba(35,62,44,0.04)]">
                      <History
                        size={17}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="text-xs font-medium text-[#62715D]">
                          Follow-up analysis
                        </p>

                        <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-medium text-[#62715D]">
                          In progress
                        </span>

                      </div>

                      <h3 className="mt-1 text-sm font-semibold">
                        After {followUpSource.treatment}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-[#71806C]">
                        Treatment completed{" "}
                        {followUpSource.completedDate}. Save this
                        analysis to complete the follow-up workflow.
                      </p>

                    </div>

                  </div>

                  <div className="rounded-xl bg-white px-4 py-3 text-xs text-[#667068]">
                    Comparing post-treatment progress
                  </div>

                </div>

              </div>
            )}

            {/* PATIENT CONTEXT */}
            <div className={`${followUpSource ? "mt-4" : "mt-8"} flex flex-col justify-between gap-4 rounded-[22px] border border-[#E0E6DF] bg-[#FEFFFD] p-5 shadow-[0_10px_34px_rgba(28,44,33,0.035)] sm:flex-row sm:items-center`}>

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D5E1D5] bg-[#E9F0E9] text-[11px] font-semibold text-[#496050]">

                  {selectedPatient.name
                    .split(" ")
                    .filter(Boolean)
                    .map(
                      (word) =>
                        word[0]
                    )
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}

                </div>

                <div>

                  <p className="text-xs text-[#929A93]">
                    {historicalAnalysis
                      ? "Historical patient"
                      : "Current patient"}
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedPatient.name}
                  </p>

                  <p className="mt-1 text-xs text-[#667068]">
                    {selectedPatient.concern} ·{" "}
                    {selectedPatient.analyses} analyses
                  </p>

                </div>

              </div>

              {historicalAnalysis ? (
                <div className="rounded-[12px] border border-[#E0E5DF] bg-[#F8FAF7] px-4 py-3 text-sm">
                  {historicalAnalysis.date}
                </div>
              ) : (
                <select
                  value={
                    selectedPatient.name
                  }
                  onChange={(e) =>
                    changePatient(
                      e.target.value
                    )
                  }
                  className="rounded-[12px] border border-[#E0E5DF] bg-[#F8FAF7] px-4 py-3 text-[12px] font-medium text-[#465048] outline-none transition focus:border-[#829A87] focus:bg-white focus:shadow-[0_0_0_3px_rgba(77,112,83,0.07)]"
                >

                  {patients.map(
                    (patient) => (

                      <option
                        key={patient.id}
                        value={patient.name}
                      >
                        {patient.name}
                      </option>

                    )
                  )}

                </select>
              )}

            </div>

            {/* STEPS */}
            <div className="mt-6 rounded-[20px] border border-[#E0E6DF] bg-[#FEFFFD] p-4 shadow-[0_8px_28px_rgba(28,44,33,0.03)]">

              <div className="flex flex-wrap items-center gap-4">

                <StepItem
                  number={1}
                  label="Upload images"
                  active={step >= 1}
                />

                <div
                  className={`hidden h-px w-12 sm:block ${
                    step >= 2
                      ? "bg-[#171717]"
                      : "bg-[#DDDCD6]"
                  }`}
                />

                <StepItem
                  number={2}
                  label="AI analysis"
                  active={step >= 2}
                />

                <div
                  className={`hidden h-px w-12 sm:block ${
                    step >= 3
                      ? "bg-[#171717]"
                      : "bg-[#DDDCD6]"
                  }`}
                />

                <StepItem
                  number={3}
                  label="Results"
                  active={step >= 3}
                />

              </div>

            </div>

            {/* STEP 1 */}
            {step === 1 && (

              <div className="mt-6">

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#75877A]">
                    Clinical photography
                  </p>

                  <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-[#202A22]">
                    Upload facial images
                  </h3>

                  <p className="mt-2 text-[11px] leading-5 text-[#929A93]">
                    A front-facing image is required. Left and right profiles
                    can be added for a more complete demonstration.
                  </p>

                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-3">

                  <ImageUploader
                    title="Front"
                    subtitle="Required"
                    image={images.front}
                    onUpload={(file) =>
                      handleImageUpload(
                        "front",
                        file
                      )
                    }
                  />

                  <ImageUploader
                    title="Left profile"
                    subtitle="Optional"
                    image={images.left}
                    onUpload={(file) =>
                      handleImageUpload(
                        "left",
                        file
                      )
                    }
                  />

                  <ImageUploader
                    title="Right profile"
                    subtitle="Optional"
                    image={images.right}
                    onUpload={(file) =>
                      handleImageUpload(
                        "right",
                        file
                      )
                    }
                  />

                </div>

                {/* GUIDELINES */}
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">

                  <div className="rounded-[22px] border border-[#E0E6DF] bg-[#FEFFFD] p-6 shadow-[0_10px_34px_rgba(28,44,33,0.035)]">

                    <h3 className="text-lg font-semibold">
                      Image guidelines
                    </h3>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">

                      {[
                        "Use natural or evenly distributed lighting.",
                        "Keep the face centred and fully visible.",
                        "Avoid beauty filters and heavy makeup.",
                        "Use a high-resolution image where possible.",
                      ].map(
                        (
                          item,
                          index
                        ) => (

                          <div
                            key={item}
                            className="flex gap-3 rounded-xl bg-[#F8FAF7] p-4"
                          >

                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#DDE5DC] bg-white text-[9px] font-semibold text-[#526658]">
                              {index + 1}
                            </div>

                            <p className="text-xs leading-5 text-[#667068]">
                              {item}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  <div className="rounded-[22px] border border-[#D4E1D3] bg-[#EAF2EA] p-6 shadow-[0_10px_30px_rgba(35,62,44,0.04)]">

                    <Sparkles
                      size={22}
                      strokeWidth={1.7}
                      className="text-[#62715D]"
                    />

                    <p className="mt-4 text-xs font-medium text-[#62715D]">
                      AI preparation
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      Ready for analysis
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[#71806C]">
                      Velyquo prepares simulated skin metrics, priority concerns
                      and treatment recommendations for the selected patient.
                    </p>

                  </div>

                </div>

                <div className="mt-6 flex justify-end">

                  <button
                    type="button"
                    disabled={
                      !hasFrontImage
                    }
                    onClick={runAnalysis}
                    className={`flex items-center gap-2 rounded-[12px] px-6 py-3 text-[12px] font-semibold transition ${
                      hasFrontImage
                        ? "bg-[#24402F] text-white shadow-[0_10px_28px_rgba(36,64,47,0.16)] hover:-translate-y-px hover:bg-[#1B3325]"
                        : "cursor-not-allowed bg-[#E4E8E3] text-[#9AA29B]"
                    }`}
                  >

                    <Sparkles
                      size={16}
                      strokeWidth={1.8}
                    />

                    Run AI analysis

                  </button>

                </div>

              </div>

            )}

            {/* STEP 2 */}
            {step === 2 && (

              <div className="mt-6 rounded-[26px] border border-[#E0E6DF] bg-[#FEFFFD] p-8 shadow-[0_16px_48px_rgba(28,44,33,0.04)] lg:p-12">

                <div className="mx-auto max-w-xl text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] border border-[#D6E3D5] bg-[#EAF2EA] shadow-[0_10px_30px_rgba(35,62,44,0.06)]">

                    <Sparkles
                      size={30}
                      strokeWidth={1.6}
                      className="text-[#62715D]"
                    />

                  </div>

                  <p className="mt-7 text-xs font-medium uppercase tracking-[0.14em] text-[#71806C]">
                    AI processing
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Analysing{" "}
                    {selectedPatient.name}
                    &apos;s skin
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[#667068]">
                    Reviewing visible skin characteristics and generating
                    structured assessment metrics.
                  </p>

                  <div className="mt-8 overflow-hidden rounded-full bg-[#E8ECE7]">

                    <div
                      className="h-2 rounded-full bg-[#56715D] transition-all duration-100"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                  <div className="mt-3 flex justify-between text-xs text-[#929A93]">

                    <span>
                      {progress < 35
                        ? "Mapping skin texture"
                        : progress < 70
                        ? "Evaluating pigmentation"
                        : progress < 100
                        ? "Calculating skin quality"
                        : "Analysis complete"}
                    </span>

                    <span>
                      {progress}%
                    </span>

                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">

                    <ProcessingCard
                      label="Texture mapping"
                      completed={
                        progress >= 35
                      }
                    />

                    <ProcessingCard
                      label="Pigmentation"
                      completed={
                        progress >= 70
                      }
                    />

                    <ProcessingCard
                      label="Skin quality"
                      completed={
                        progress >= 100
                      }
                    />

                  </div>

                  <button
                    type="button"
                    disabled={
                      progress < 100
                    }
                    onClick={viewResults}
                    className={`mt-8 inline-flex items-center gap-2 rounded-[12px] px-6 py-3 text-[12px] font-semibold transition ${
                      progress === 100
                        ? "bg-[#24402F] text-white shadow-[0_10px_28px_rgba(36,64,47,0.16)] hover:-translate-y-px hover:bg-[#1B3325]"
                        : "cursor-not-allowed bg-[#E4E8E3] text-[#9AA29B]"
                    }`}
                  >

                    {progress === 100
                      ? "View results"
                      : "Analysing..."}

                    {progress === 100 && (
                      <ArrowRight
                        size={16}
                        strokeWidth={1.8}
                      />
                    )}

                  </button>

                </div>

              </div>

            )}

            {/* STEP 3 */}
            {step === 3 && (

              <div className="mt-6">

                {/* HEADER */}
                <div className="rounded-[22px] border border-[#E0E6DF] bg-[#FEFFFD] p-6 shadow-[0_10px_34px_rgba(28,44,33,0.035)]">

                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                    <div>

                      <div className="flex items-center gap-2">

                        <span className="rounded-full border border-[#D6E3D4] bg-[#EDF5EC] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#4F6B54]">
                          {historicalAnalysis
                            ? "Saved historical analysis"
                            : "Analysis complete"}
                        </span>

                        <span className="text-xs text-[#929A93]">
                          {historicalAnalysis
                            ? historicalAnalysis.date
                            : getTodayClinicalDate()}
                        </span>

                      </div>

                      <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.045em] text-[#1D271F]">
                        {selectedPatient.name}
                      </h2>

                      <p className="mt-1.5 text-[11px] font-medium text-[#758078]">
                        AI skin intelligence report
                      </p>

                    </div>

                    {historicalAnalysis ? (
                      <div className="flex w-fit items-center gap-2 rounded-xl bg-[#EDF4ED] px-5 py-3 text-sm font-medium text-[#62715D]">
                        <History
                          size={16}
                          strokeWidth={1.8}
                        />
                        Read-only record
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={saveAnalysis}
                        disabled={savingAnalysis || saved}
                        className={`flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium ${
                          saved
                            ? "bg-[#E8EEE5] text-[#62715D]"
                            : savingAnalysis
                              ? "cursor-wait bg-[#3E5144] text-white"
                              : "bg-[#171717] text-white hover:bg-[#333]"
                        }`}
                      >

                        {saved ? (
                          <Check
                            size={16}
                            strokeWidth={1.8}
                          />
                        ) : (
                          <Save
                            size={16}
                            strokeWidth={1.8}
                          />
                        )}

                        {saved
                          ? "Analysis saved"
                          : savingAnalysis
                            ? "Saving…"
                            : "Save analysis"}

                      </button>
                    )}

                  </div>

                </div>

                {/* RESULTS */}
                <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">

                  {/* PHOTO */}
                  <div className="rounded-[22px] border border-[#E0E6DF] bg-[#FEFFFD] p-6 shadow-[0_10px_34px_rgba(28,44,33,0.035)]">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm text-[#667068]">
                          Patient image
                        </p>

                        <h3 className="mt-1 text-lg font-semibold">
                          Facial assessment
                        </h3>

                      </div>

                      <Camera
                        size={20}
                        strokeWidth={1.7}
                        className="text-[#929A93]"
                      />

                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl bg-[#E8E5DD]">

                      {images.front ? (

                        <img
                          src={images.front}
                          alt="Patient analysis"
                          className="h-[440px] w-full object-cover"
                        />

                      ) : (

                        <div className="flex h-[440px] items-center justify-center">

                          <div className="text-xl font-semibold">
                            {selectedPatient.name
                              .split(" ")
                              .map(
                                (word) =>
                                  word[0]
                              )
                              .join("")
                              .slice(0, 2)}
                          </div>

                        </div>

                      )}

                      {images.front && (
                        <FaceAnalysisOverlay
                          priorities={
                            analysisResult.priorities
                          }
                        />
                      )}

                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">

                      <ImageThumbnail
                        label="Front"
                        image={
                          images.front
                        }
                      />

                      <ImageThumbnail
                        label="Left"
                        image={
                          images.left
                        }
                      />

                      <ImageThumbnail
                        label="Right"
                        image={
                          images.right
                        }
                      />

                    </div>

                  </div>

                  {/* SCORE */}
                  <div className="rounded-[22px] border border-[#E0E6DF] bg-[#FEFFFD] p-6 shadow-[0_10px_34px_rgba(28,44,33,0.035)]">

                    <div className="flex items-end justify-between gap-4">

                      <div>

                        <p className="text-sm text-[#667068]">
                          Overall skin score
                        </p>

                        <div className="mt-2 flex items-end gap-2">

                          <span className="text-5xl font-semibold tracking-[-0.06em]">
                            {analysisResult.score}
                          </span>

                          <span className="mb-2 text-sm text-[#929A93]">
                            / 100
                          </span>

                        </div>

                      </div>

                      <div className="text-right">

                        <span className="rounded-full bg-[#E8EEE5] px-3 py-1 text-xs font-medium text-[#62715D]">
                          {scoreChangeText}
                        </span>

                        <p className="mt-2 text-[10px] text-[#929A93]">
                          {historicalAnalysis &&
                          analysisResult.change === 0
                            ? "saved score"
                            : "vs previous analysis"}
                        </p>

                      </div>

                    </div>

                    {/* OVERALL BAR */}
                    <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#ECEBE6]">

                      <div
                        className="h-full rounded-full bg-[#7D8977] transition-all duration-500"
                        style={{
                          width: `${analysisResult.score}%`,
                        }}
                      />

                    </div>

                    {/* METRICS */}
                    <div className="mt-7 grid gap-3 sm:grid-cols-2">

                      {analysisResult.metrics.map(
                        (metric) => (

                          <div
                            key={metric.label}
                            className="rounded-xl border border-[#ECEBE6] p-4"
                          >

                            <div className="flex items-center justify-between">

                              <p className="text-xs text-[#667068]">
                                {
                                  metric.label
                                }
                              </p>

                              <span className="text-sm font-semibold">
                                {
                                  metric.value
                                }
                              </span>

                            </div>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ECEBE6]">

                              <div
                                className="h-full rounded-full bg-[#7D8977] transition-all duration-500"
                                style={{
                                  width: `${metric.value}%`,
                                }}
                              />

                            </div>

                            <p className="mt-2 text-[10px] text-[#71806C]">
                              {
                                metric.status
                              }
                            </p>

                          </div>

                        )
                      )}

                    </div>

                    {/* PRIORITY CONCERNS */}
                    <div className="mt-6">

                      <div className="flex items-center gap-2">
                        <Target
                          size={16}
                          strokeWidth={1.8}
                          className="text-[#667068]"
                        />

                        <p className="text-xs font-medium text-[#667068]">
                          Top priority concerns
                        </p>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        {analysisResult.priorities.map(
                          (priority, index) => (
                            <div
                              key={priority.label}
                              className="rounded-xl border border-[#ECEBE6] bg-[#F8FAF7] p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#929A93]">
                                    Priority {index + 1}
                                  </p>
                                  <p className="mt-1 text-sm font-semibold">
                                    {priority.label}
                                  </p>
                                </div>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${
                                    priority.severity === "High"
                                      ? "bg-[#F3E8E5] text-[#8B5F56]"
                                      : priority.severity === "Moderate"
                                      ? "bg-[#F3EFE3] text-[#85734E]"
                                      : "bg-[#E8EEE5] text-[#62715D]"
                                  }`}
                                >
                                  {priority.severity}
                                </span>
                              </div>

                              <p className="mt-3 text-xs leading-5 text-[#667068]">
                                {priority.message}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* EXPECTED IMPROVEMENT */}
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#E1E5DE] bg-[#F7F9F5] p-4">
                      <TrendingUp
                        size={17}
                        strokeWidth={1.8}
                        className="mt-0.5 shrink-0 text-[#62715D]"
                      />

                      <div>
                        <p className="text-xs font-medium text-[#62715D]">
                          Treatment goal
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {analysisResult.expectedImprovement}
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-[#71806C]">
                          Prototype estimate based on the simulated score trajectory, not a guaranteed clinical outcome.
                        </p>
                      </div>
                    </div>

                    {/* AI SUMMARY */}
                    <div className="mt-5 rounded-xl bg-[#EDF4ED] p-5">

                      <div className="flex items-center gap-2">

                        <Sparkles
                          size={16}
                          strokeWidth={1.8}
                          className="text-[#62715D]"
                        />

                        <p className="text-xs font-medium text-[#62715D]">
                          AI summary
                        </p>

                      </div>

                      <p className="mt-3 text-sm leading-6 text-[#5F685A]">
                        {analysisResult.summary}
                        {analysisResult.change > 0
                          ? ` Compared with the previous saved analysis, the simulated overall score improved by ${analysisResult.change} points.`
                          : ""}
                      </p>

                    </div>

                  </div>

                </div>

                {/* RECOMMENDATIONS */}
                <div className="mt-6 rounded-[22px] border border-[#E0E6DF] bg-[#FEFFFD] shadow-[0_10px_34px_rgba(28,44,33,0.035)] p-6">

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                    <div>

                      <p className="text-sm text-[#667068]">
                        AI treatment intelligence
                      </p>

                      <h3 className="mt-1 text-xl font-semibold">
                        Recommended treatments
                      </h3>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem(
                          "dermisSelectedPatient",
                          JSON.stringify(
                            selectedPatient
                          )
                        );

                        window.location.href =
                          "/treatments";
                      }}
                      className="text-xs font-medium text-[#667068] hover:text-black"
                    >
                      View treatment plans →
                    </button>

                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">

                    {analysisResult.recommendations.map(
                      (item) => (

                        <div
                          key={item.name}
                          className="rounded-xl border border-[#ECEBE6] p-5"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <p className="text-sm font-semibold">
                                {item.name}
                              </p>

                              <p className="mt-2 text-xs leading-5 text-[#667068]">
                                {
                                  item.reason
                                }
                              </p>

                              <p className="mt-2 text-[10px] font-medium text-[#71806C]">
                                Targets {item.target}
                              </p>

                            </div>

                            <span className="rounded-full bg-[#E8EEE5] px-2.5 py-1 text-[10px] font-medium text-[#62715D]">
                              {item.match}
                            </span>

                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-[#ECEBE6] pt-4">

                            <span className="text-sm font-semibold">
                              {item.price}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                localStorage.setItem(
                                  "dermisSelectedPatient",
                                  JSON.stringify(
                                    selectedPatient
                                  )
                                );

                                window.location.href =
                                  "/treatments";
                              }}
                              className="text-xs font-medium text-[#667068] hover:text-black"
                            >
                              Add to plan →
                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

                {/* HISTORY */}
                <AnalysisHistory
                  patient={
                    selectedPatient
                  }
                />

                {/* ACTIONS */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      resetAnalysis
                    }
                    className="rounded-xl border border-[#E0E6DF] bg-white px-5 py-3 text-sm font-medium hover:bg-[#F7F6F2]"
                  >
                    Start new analysis
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem(
                        "dermisSelectedPatient",
                        JSON.stringify(
                          selectedPatient
                        )
                      );

                      window.location.href =
                        "/treatments";
                    }}
                    className="rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white hover:bg-[#333]"
                  >
                    Create treatment plan →
                  </button>

                </div>

              </div>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}

function buildPriorityInsights(
  metrics: SkinMetric[]
): ConcernInsight[] {
  return [...metrics]
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)
    .map((metric) => {
      const severity: ConcernInsight["severity"] =
        metric.value < 60
          ? "High"
          : metric.value < 70
          ? "Moderate"
          : "Low";

      return {
        label: metric.label,
        score: metric.value,
        severity,
        message:
          severity === "High"
            ? `${metric.label} is the strongest simulated treatment priority in this assessment.`
            : severity === "Moderate"
            ? `${metric.label} shows room for improvement and should be monitored across future analyses.`
            : `${metric.label} is comparatively stable but can still be maintained within the treatment plan.`,
      };
    });
}

function buildRecommendations(
  metrics: SkinMetric[]
): TreatmentRecommendation[] {
  const priorities = [...metrics]
    .sort((a, b) => a.value - b.value)
    .map((metric) => metric.label);

  const ranked = treatmentCatalog
    .map((treatment) => {
      const bestPriorityIndex =
        priorities.findIndex((label) =>
          treatment.targets.includes(label)
        );

      return {
        treatment,
        priorityIndex:
          bestPriorityIndex === -1
            ? 99
            : bestPriorityIndex,
      };
    })
    .sort(
      (a, b) =>
        a.priorityIndex - b.priorityIndex
    )
    .slice(0, 3);

  return ranked.map((item, index) => {
    const target =
      priorities.find((label) =>
        item.treatment.targets.includes(label)
      ) || item.treatment.targets[0];

    const match = Math.max(
      82,
      96 - index * 5 - Math.min(item.priorityIndex, 3)
    );

    return {
      name: item.treatment.name,
      reason: item.treatment.reason,
      match: `${match}%`,
      price: item.treatment.price,
      target,
    };
  });
}

function FaceAnalysisOverlay({
  priorities,
}: {
  priorities: ConcernInsight[];
}) {
  const positions = [
    { left: "34%", top: "31%" },
    { left: "62%", top: "43%" },
    { left: "47%", top: "64%" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-medium shadow-sm backdrop-blur">
        <ScanFace
          size={13}
          strokeWidth={1.8}
        />
        Simulated concern map
      </div>

      {priorities.map((priority, index) => {
        const position =
          positions[index] || positions[0];

        return (
          <div
            key={priority.label}
            className="absolute"
            style={position}
          >
            <div className="relative">
              <div className="h-5 w-5 rounded-full border-2 border-white bg-[#7D8977]/80 shadow-sm" />
              <div className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-medium text-[#5F685A] shadow-sm backdrop-blur">
                {priority.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/*
 * STARTING METRICS PER PATIENT
 */
function getPatientStartingMetrics(
  patient: Patient
): SkinMetric[] {
  const profiles: Record<
    number,
    SkinMetric[]
  > = {
    1: [
      {
        label: "Hydration",
        value: 61,
        status: "Moderate",
      },
      {
        label: "Texture",
        value: 70,
        status: "Moderate",
      },
      {
        label: "Pigmentation",
        value: 56,
        status: "Priority",
      },
      {
        label: "Acne",
        value: 58,
        status: "Priority",
      },
      {
        label: "Redness",
        value: 65,
        status: "Moderate",
      },
      {
        label: "Fine lines",
        value: 76,
        status: "Good",
      },
    ],

    2: [
      {
        label: "Hydration",
        value: 55,
        status: "Priority",
      },
      {
        label: "Texture",
        value: 78,
        status: "Good",
      },
      {
        label: "Pigmentation",
        value: 79,
        status: "Good",
      },
      {
        label: "Fine lines",
        value: 63,
        status: "Moderate",
      },
    ],

    3: [
      {
        label: "Hydration",
        value: 73,
        status: "Good",
      },
      {
        label: "Texture",
        value: 69,
        status: "Moderate",
      },
      {
        label: "Pigmentation",
        value: 44,
        status: "Priority",
      },
      {
        label: "Redness",
        value: 67,
        status: "Moderate",
      },
    ],

    4: [
      {
        label: "Hydration",
        value: 54,
        status: "Priority",
      },
      {
        label: "Texture",
        value: 68,
        status: "Moderate",
      },
      {
        label: "Fine lines",
        value: 55,
        status: "Priority",
      },
      {
        label: "Firmness",
        value: 61,
        status: "Moderate",
      },
    ],

    5: [
      {
        label: "Hydration",
        value: 63,
        status: "Moderate",
      },
      {
        label: "Texture",
        value: 72,
        status: "Good",
      },
      {
        label: "Redness",
        value: 42,
        status: "Priority",
      },
      {
        label: "Sensitivity",
        value: 48,
        status: "Priority",
      },
    ],

    6: [
      {
        label: "Hydration",
        value: 62,
        status: "Moderate",
      },
      {
        label: "Texture",
        value: 58,
        status: "Priority",
      },
      {
        label: "Acne",
        value: 43,
        status: "Priority",
      },
      {
        label: "Congestion",
        value: 49,
        status: "Priority",
      },
    ],
  };

  const profileKey =
    patient.legacyId ??
    (typeof patient.id === "number" ? patient.id : 0);

  return profiles[profileKey] || baseMetrics;
}

function getMetricStatus(
  value: number
) {
  if (value >= 80) {
    return "Excellent";
  }

  if (value >= 70) {
    return "Good";
  }

  if (value >= 60) {
    return "Moderate";
  }

  return "Priority";
}

function getSkinType(
  patient: Patient
) {
  const skinTypes: Record<
    number,
    string
  > = {
    1: "Combination",
    2: "Dry",
    3: "Normal",
    4: "Dry",
    5: "Sensitive",
    6: "Oily",
  };

  const skinTypeKey =
    patient.legacyId ??
    (typeof patient.id === "number" ? patient.id : 0);

  return skinTypes[skinTypeKey] || "Combination";
}

function StepItem({
  number,
  label,
  active,
}: {
  number: number;
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
          active
            ? "bg-[#171717] text-white"
            : "border border-[#E0E6DF] bg-white text-[#929A93]"
        }`}
      >
        {number}
      </div>

      <span
        className={`text-xs ${
          active
            ? "font-medium text-[#171717]"
            : "text-[#929A93]"
        }`}
      >
        {label}
      </span>

    </div>
  );
}

function ImageUploader({
  title,
  subtitle,
  image,
  onUpload,
}: {
  title: string;
  subtitle: string;
  image: string | null;
  onUpload: (
    file: File | undefined
  ) => void;
}) {
  return (
    <label className="group cursor-pointer overflow-hidden rounded-[22px] border border-[#E0E6DF] bg-[#FEFFFD] shadow-[0_10px_34px_rgba(28,44,33,0.035)]">

      <div className="flex items-center justify-between border-b border-[#ECEBE6] px-5 py-4">

        <div>

          <p className="text-sm font-medium">
            {title}
          </p>

          <p className="mt-0.5 text-[10px] text-[#929A93]">
            {subtitle}
          </p>

        </div>

        {image ? (

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8EEE5] text-[#62715D]">

            <Check
              size={15}
              strokeWidth={2}
            />

          </div>

        ) : (

          <Upload
            size={18}
            strokeWidth={1.7}
            className="text-[#929A93]"
          />

        )}

      </div>

      <div className="relative flex h-[280px] items-center justify-center bg-[#F8FAF7]">

        {image ? (

          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />

        ) : (

          <div className="px-6 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ECEBE6]">

              <Camera
                size={21}
                strokeWidth={1.7}
                className="text-[#667068]"
              />

            </div>

            <p className="mt-4 text-sm font-medium">
              Upload{" "}
              {title.toLowerCase()} image
            </p>

            <p className="mt-2 text-xs leading-5 text-[#929A93]">
              Click to browse
              <br />
              JPG, PNG or WEBP
            </p>

          </div>

        )}

      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          onUpload(
            e.target.files?.[0]
          )
        }
      />

    </label>
  );
}

function ImageThumbnail({
  label,
  image,
}: {
  label: string;
  image: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#ECEBE6]">

      <div className="flex h-20 items-center justify-center bg-[#F8FAF7]">

        {image ? (

          <img
            src={image}
            alt={label}
            className="h-full w-full object-cover"
          />

        ) : (

          <Camera
            size={18}
            strokeWidth={1.6}
            className="text-[#BBB9B1]"
          />

        )}

      </div>

      <div className="px-3 py-2 text-center text-[10px] text-[#667068]">
        {label}
      </div>

    </div>
  );
}

function ProcessingCard({
  label,
  completed,
}: {
  label: string;
  completed: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#ECEBE6] bg-[#F8FAF7] p-4">

      <div
        className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
          completed
            ? "bg-[#E8EEE5]"
            : "bg-[#ECEBE6]"
        }`}
      >

        {completed ? (

          <Check
            size={13}
            strokeWidth={2}
            className="text-[#62715D]"
          />

        ) : (

          <span className="h-2 w-2 rounded-full bg-[#AAA89F]" />

        )}

      </div>

      <p className="mt-2 text-xs text-[#667068]">
        {label}
      </p>

    </div>
  );
}

function AnalysisHistory({
  patient,
}: {
  patient: Patient;
}) {
  const [history, setHistory] =
    useState<AnalysisRecord[]>([]);

  useEffect(() => {
    const storedHistory =
      localStorage.getItem(
        "dermisAnalysisHistory"
      );

    if (!storedHistory) {
      return;
    }

    try {
      const parsedHistory: Record<
        string,
        AnalysisRecord[]
      > = JSON.parse(
        storedHistory
      );

      setHistory(
        parsedHistory[
          patient.id
        ] || []
      );
    } catch (error) {
      console.error(
        "Could not load analysis history:",
        error
      );
    }
  }, [patient.id]);

  return (
    <div className="mt-6 rounded-[22px] border border-[#E0E6DF] bg-[#FEFFFD] shadow-[0_10px_34px_rgba(28,44,33,0.035)]">

      <div className="flex items-center gap-3 border-b border-[#ECEBE6] px-6 py-5">

        <History
          size={18}
          strokeWidth={1.7}
          className="text-[#667068]"
        />

        <div>

          <p className="text-sm text-[#667068]">
            Patient history
          </p>

          <h3 className="mt-0.5 text-lg font-semibold">
            Previous analyses
          </h3>

        </div>

      </div>

      {history.length > 0 ? (

        <div className="divide-y divide-[#F0EFEA]">

          {[...history]
            .reverse()
            .map(
              (
                item,
                index
              ) => (

                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center"
                >

                  <div className="flex items-center gap-4">

                    {item.image && (

                      <img
                        src={
                          item.image
                        }
                        alt="Analysis"
                        className="h-12 w-12 rounded-xl object-cover"
                      />

                    )}

                    <div>

                      <p className="text-sm font-medium">
                        {item.date}
                      </p>

                      <p className="mt-1 text-xs text-[#929A93]">
                        Skin intelligence assessment
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-5">

                    <div className="text-right">

                      <p className="text-[10px] text-[#929A93]">
                        Score
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {item.score}/100
                      </p>

                    </div>

                    {index === 0 && (

                      <span className="rounded-full border border-[#D6E3D4] bg-[#EDF5EC] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#4F6B54]">
                        Latest
                      </span>

                    )}

                  </div>

                </div>

              )
            )}

        </div>

      ) : (

        <div className="px-6 py-10 text-center">

          <p className="text-sm font-medium">
            No previous analyses
          </p>

          <p className="mt-2 text-[11px] leading-5 text-[#929A93]">
            Save this analysis to begin tracking progress.
          </p>

        </div>

      )}

    </div>
  );
}
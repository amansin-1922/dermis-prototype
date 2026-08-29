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

type ImageSlot = "front" | "left" | "right";

type UploadedImages = {
  front: string | null;
  left: string | null;
  right: string | null;
};

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
  id: number;
  date: string;
  score: number;
  image: string;
  metrics: SkinMetric[];
};

type FollowUpStatus =
  | "Due"
  | "Scheduled"
  | "Analysis started"
  | "Completed";

type FollowUpRecord = {
  id: number;
  appointmentId: number;
  patientId?: number;
  patient: string;
  treatment: string;
  completedDate: string;
  completedRawDate?: string;
  practitioner?: string;
  practitionerId?: number;
  status: FollowUpStatus;
  createdAt: string;
  followUpAppointmentId?: number;
};

type FollowUpSource = {
  followUpId?: number;
  appointmentId?: number;
  patientId?: number;
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
              patient.id ===
              parsedPatient.id
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
              patientId?: number;
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
            typeof parsedSelectedAnalysis.patientId === "number"
              ? availablePatients.find(
                  (patient) =>
                    patient.id ===
                    parsedSelectedAnalysis.patientId
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
                number,
                AnalysisRecord[]
              > = JSON.parse(storedHistory);

              previousHistory =
                parsedHistory[
                  resolvedPatient.id
                ] || [];
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
                typeof mergedRecord.id === "number";

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
                id: mergedRecord.id as number,
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
            number,
            AnalysisRecord[]
          > = JSON.parse(
            storedHistory
          );

          const patientHistory =
            parsedHistory[
              selectedPatient.id
            ] || [];

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

      const baselineScore =
        previousScore ??
        startingScores[
          selectedPatient.id
        ] ??
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
      followUpSource.patientId !== patient.id &&
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
    /*
     * Prevent duplicate clicking.
     */
    if (saved) return;

    const analysisDate =
      getTodayClinicalDate();

    const analysisMetrics =
      analysisResult.metrics;

    const treatmentItems: TreatmentItem[] =
      analysisResult.recommendations.map(
        (recommendation) => ({
          name: recommendation.name,
          reason:
            recommendation.reason,
          price:
            recommendation.price,
        })
      );

    /*
     * ANALYSIS PHOTO HISTORY
     */
    const savedAnalysisHistory =
      localStorage.getItem(
        "dermisAnalysisHistory"
      );

    let analysisHistory: Record<
      number,
      AnalysisRecord[]
    > = {};

    if (savedAnalysisHistory) {
      try {
        analysisHistory =
          JSON.parse(
            savedAnalysisHistory
          );
      } catch (error) {
        console.error(
          "Could not load analysis history:",
          error
        );
      }
    }

    /*
     * COMPACT EXISTING PHOTO HISTORY
     *
     * Older versions of this prototype stored the original full-resolution
     * base64 photo. Compress those legacy records before writing the history
     * back so existing users are repaired automatically.
     */
    const compactedHistory: Record<
      number,
      AnalysisRecord[]
    > = {};

    for (
      const [patientId, records] of
      Object.entries(analysisHistory)
    ) {
      compactedHistory[
        Number(patientId)
      ] = await Promise.all(
        (Array.isArray(records)
          ? records
          : []
        ).map(async (record) => ({
          ...record,
          image: record.image
            ? await compressImageDataUrl(
                record.image
              )
            : "",
        }))
      );
    }

    analysisHistory =
      compactedHistory;

    const patientHistory =
      analysisHistory[
        selectedPatient.id
      ] || [];

    const compactFrontImage =
      images.front
        ? await compressImageDataUrl(
            images.front
          )
        : "";

    const newAnalysisRecord: AnalysisRecord =
      {
        id: Date.now(),
        date: analysisDate,
        score:
          analysisResult.score,
        image:
          compactFrontImage,
        metrics:
          analysisResult.metrics,
      };

    analysisHistory[
      selectedPatient.id
    ] = [
      ...patientHistory,
      newAnalysisRecord,
    ];

    let historySaved = false;

    try {
      localStorage.setItem(
        "dermisAnalysisHistory",
        JSON.stringify(
          analysisHistory
        )
      );

      historySaved = true;
    } catch (error) {
      /*
       * If storage is already very full, retry with smaller photos.
       * We preserve the first photo (baseline) and the five newest photos
       * for each patient. Older middle records keep their scores/metrics,
       * but their image is removed to prevent localStorage from overflowing.
       */
      console.warn(
        "Analysis history exceeded localStorage quota. Retrying with a compact history.",
        error
      );

      const quotaSafeHistory: Record<
        number,
        AnalysisRecord[]
      > = {};

      for (
        const [patientId, records] of
        Object.entries(
          analysisHistory
        )
      ) {
        const safeRecords =
          Array.isArray(records)
            ? records
            : [];

        const lastFiveStart =
          Math.max(
            1,
            safeRecords.length - 5
          );

        quotaSafeHistory[
          Number(patientId)
        ] = await Promise.all(
          safeRecords.map(
            async (
              record,
              index
            ) => {
              const keepPhoto =
                index === 0 ||
                index >=
                  lastFiveStart;

              return {
                ...record,
                image:
                  keepPhoto &&
                  record.image
                    ? await compressImageDataUrl(
                        record.image,
                        480,
                        0.5
                      )
                    : "",
              };
            }
          )
        );
      }

      try {
        localStorage.setItem(
          "dermisAnalysisHistory",
          JSON.stringify(
            quotaSafeHistory
          )
        );

        analysisHistory =
          quotaSafeHistory;

        historySaved = true;
      } catch (retryError) {
        console.error(
          "Could not save compact analysis history:",
          retryError
        );
      }
    }

    if (!historySaved) {
      window.alert(
        "The browser storage is full. The analysis could not be saved. Remove older prototype data or use a fresh browser profile, then try again."
      );
      return;
    }

    /*
     * LATEST ANALYSIS
     */
    localStorage.setItem(
      "dermisLatestAnalysis",
      JSON.stringify({
        patient:
          selectedPatient.name,
        patientId:
          selectedPatient.id,
        score:
          analysisResult.score,
        date: analysisDate,
        metrics:
          analysisResult.metrics,
      })
    );

    /*
     * CLINICAL PROFILE
     */
    let clinicalProfiles: Record<
      number,
      ClinicalProfile
    > = {};

    const storedProfiles =
      localStorage.getItem(
        "dermisClinicalProfiles"
      );

    if (storedProfiles) {
      try {
        clinicalProfiles =
          JSON.parse(
            storedProfiles
          );
      } catch (error) {
        console.error(
          "Could not read clinical profiles:",
          error
        );
      }
    }

    const existingProfile =
      clinicalProfiles[
        selectedPatient.id
      ];

    const newTimelineItem: TimelineItem =
      {
        date: analysisDate,
        title:
          "AI skin analysis completed",
        description: `Latest skin assessment completed for ${selectedPatient.name}. Overall skin score: ${analysisResult.score}/100. Primary treatment focus remains ${selectedPatient.concern.toLowerCase()}.`,
        type: "Analysis",
      };

    const updatedProfile: ClinicalProfile =
      {
        score:
          analysisResult.score,

        change:
          analysisResult.change > 0
            ? `+${analysisResult.change}`
            : String(
                analysisResult.change
              ),

        skinType:
          existingProfile?.skinType &&
          existingProfile.skinType !==
            "Not assessed"
            ? existingProfile.skinType
            : getSkinType(
                selectedPatient
              ),

        metrics:
          analysisMetrics,

        timeline: [
          newTimelineItem,
          ...(existingProfile?.timeline ||
            []),
        ],

        treatments:
          treatmentItems,
      };

    clinicalProfiles[
      selectedPatient.id
    ] = updatedProfile;

    localStorage.setItem(
      "dermisClinicalProfiles",
      JSON.stringify(
        clinicalProfiles
      )
    );

    /*
     * UPDATE PATIENT RECORD
     */
    const updatedPatient: Patient =
      {
        ...selectedPatient,

        lastVisit:
          analysisDate,

        analyses:
          selectedPatient.analyses +
          1,
      };

    const updatedPatients =
      patients.map((patient) =>
        patient.id ===
        selectedPatient.id
          ? updatedPatient
          : patient
      );

    setPatients(updatedPatients);

    setSelectedPatient(
      updatedPatient
    );

    localStorage.setItem(
      "dermisPatients",
      JSON.stringify(
        updatedPatients
      )
    );

    localStorage.setItem(
      "dermisSelectedPatient",
      JSON.stringify(
        updatedPatient
      )
    );

    /*
     * COMPLETE FOLLOW-UP
     *
     * A follow-up is only completed after
     * this new analysis has actually been saved.
     */
    if (followUpSource) {
      const storedFollowUps =
        localStorage.getItem(
          "dermisFollowUps"
        );

      if (storedFollowUps) {
        try {
          const parsedFollowUps =
            JSON.parse(storedFollowUps);

          if (Array.isArray(parsedFollowUps)) {
            const updatedFollowUps =
              parsedFollowUps.map(
                (followUp: FollowUpRecord) => {
                  const matchesFollowUp =
                    typeof followUpSource.followUpId === "number"
                      ? followUp.id === followUpSource.followUpId
                      : typeof followUpSource.appointmentId === "number"
                        ? followUp.appointmentId ===
                          followUpSource.appointmentId
                        : false;

                  if (!matchesFollowUp) {
                    return followUp;
                  }

                  return {
                    ...followUp,
                    status:
                      "Completed" as FollowUpStatus,
                  };
                }
              );

            localStorage.setItem(
              "dermisFollowUps",
              JSON.stringify(
                updatedFollowUps
              )
            );
          }
        } catch (error) {
          console.error(
            "Could not complete follow-up:",
            error
          );
        }
      }

      localStorage.removeItem(
        "dermisFollowUpSource"
      );
      setFollowUpSource(null);
    }

    setSaved(true);
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
    <main className="min-h-screen bg-[#F5F4F0] text-[#171717]">

      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <Sidebar activePage="Skin Analysis" />

        {/* MAIN */}
        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="flex items-center justify-between border-b border-[#DDDCD6] bg-white px-6 py-5 lg:px-10">

            <div>

              <p className="text-xs text-[#96958E]">
                AI skin intelligence
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                Skin analysis
              </h1>

              <p className="mt-1 text-[10px] text-[#999890]">
                {clinicSettings.clinicName ||
                  "Skinhouse Clinic"}
              </p>

            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={resetAnalysis}
                className="hidden rounded-xl bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#333] sm:block"
              >
                + New analysis
              </button>

              <a
                href="/settings"
                title="Clinic settings"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E2D9] text-xs font-medium transition hover:bg-[#DCD8CE]"
              >
                {practitionerInitials}
              </a>

            </div>

          </header>

          {/* CONTENT */}
          <div className="p-6 lg:p-10">

            {/* TITLE */}
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

              <div>

                <p className="text-sm text-[#71806C]">
                  AI-powered assessment
                </p>

                <h2 className="mt-1 text-3xl font-medium tracking-[-0.04em]">
                  {historicalAnalysis
                    ? "Historical skin analysis"
                    : "New skin analysis"}
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#77766F]">
                  {historicalAnalysis
                    ? `Reviewing the saved assessment from ${historicalAnalysis.date}. Historical analyses are read-only and do not change the patient's latest analysis.`
                    : "Capture or upload clear patient images to review visible skin characteristics, highlight priority concerns and prepare treatment recommendations."}
                </p>

              </div>

              <button
                type="button"
                onClick={resetAnalysis}
                className="w-fit rounded-xl border border-[#DDDCD6] bg-white px-5 py-3 text-sm font-medium hover:bg-[#F7F6F2]"
              >
                {historicalAnalysis
                  ? "Start new analysis"
                  : "Reset analysis"}
              </button>

            </div>

            <div className="mt-5 rounded-xl border border-[#E3E1DA] bg-[#FAF9F6] px-4 py-3 text-xs leading-5 text-[#77766F]">
              Demo mode: assessment scores and concern detection are simulated for product demonstration and should not be treated as a medical diagnosis.
            </div>

            {/* FOLLOW-UP CONTEXT */}
            {followUpSource && (
              <div className="mt-6 rounded-2xl border border-[#D7DDD4] bg-[#F0F3EE] p-5">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#62715D]">
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

                  <div className="rounded-xl bg-white px-4 py-3 text-xs text-[#77766F]">
                    Comparing post-treatment progress
                  </div>

                </div>

              </div>
            )}

            {/* PATIENT CONTEXT */}
            <div className={`${followUpSource ? "mt-4" : "mt-8"} flex flex-col justify-between gap-4 rounded-2xl border border-[#DDDCD6] bg-white p-5 sm:flex-row sm:items-center`}>

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E5E2D9] text-sm font-medium">

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

                  <p className="text-xs text-[#999890]">
                    {historicalAnalysis
                      ? "Historical patient"
                      : "Current patient"}
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedPatient.name}
                  </p>

                  <p className="mt-1 text-xs text-[#77766F]">
                    {selectedPatient.concern} ·{" "}
                    {selectedPatient.analyses} analyses
                  </p>

                </div>

              </div>

              {historicalAnalysis ? (
                <div className="rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm">
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
                  className="rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm outline-none"
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
            <div className="mt-6 rounded-2xl border border-[#DDDCD6] bg-white p-5">

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

                  <p className="text-sm text-[#77766F]">
                    Patient photography
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    Upload facial images
                  </h3>

                  <p className="mt-2 text-xs text-[#999890]">
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

                  <div className="rounded-2xl border border-[#DDDCD6] bg-white p-6">

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
                            className="flex gap-3 rounded-xl bg-[#FAF9F6] p-4"
                          >

                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-semibold">
                              {index + 1}
                            </div>

                            <p className="text-xs leading-5 text-[#77766F]">
                              {item}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  <div className="rounded-2xl border border-[#D7DDD4] bg-[#F0F3EE] p-6">

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
                    className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition ${
                      hasFrontImage
                        ? "bg-[#171717] text-white hover:bg-[#333]"
                        : "cursor-not-allowed bg-[#DDDCD6] text-[#999890]"
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

              <div className="mt-6 rounded-2xl border border-[#DDDCD6] bg-white p-8 lg:p-12">

                <div className="mx-auto max-w-xl text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F0F3EE]">

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

                  <p className="mt-3 text-sm leading-6 text-[#77766F]">
                    Reviewing visible skin characteristics and generating
                    structured assessment metrics.
                  </p>

                  <div className="mt-8 overflow-hidden rounded-full bg-[#ECEBE6]">

                    <div
                      className="h-2 rounded-full bg-[#7D8977] transition-all duration-100"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                  <div className="mt-3 flex justify-between text-xs text-[#999890]">

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
                    className={`mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition ${
                      progress === 100
                        ? "bg-[#171717] text-white hover:bg-[#333]"
                        : "cursor-not-allowed bg-[#DDDCD6] text-[#999890]"
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
                <div className="rounded-2xl border border-[#DDDCD6] bg-white p-6">

                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                    <div>

                      <div className="flex items-center gap-2">

                        <span className="rounded-full bg-[#E8EEE5] px-3 py-1 text-[10px] font-medium text-[#62715D]">
                          {historicalAnalysis
                            ? "Saved historical analysis"
                            : "Analysis complete"}
                        </span>

                        <span className="text-xs text-[#999890]">
                          {historicalAnalysis
                            ? historicalAnalysis.date
                            : getTodayClinicalDate()}
                        </span>

                      </div>

                      <h2 className="mt-3 text-2xl font-semibold">
                        {selectedPatient.name}
                      </h2>

                      <p className="mt-1 text-sm text-[#77766F]">
                        AI skin intelligence report
                      </p>

                    </div>

                    {historicalAnalysis ? (
                      <div className="flex w-fit items-center gap-2 rounded-xl bg-[#F0F3EE] px-5 py-3 text-sm font-medium text-[#62715D]">
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
                        className={`flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium ${
                          saved
                            ? "bg-[#E8EEE5] text-[#62715D]"
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
                          : "Save analysis"}

                      </button>
                    )}

                  </div>

                </div>

                {/* RESULTS */}
                <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">

                  {/* PHOTO */}
                  <div className="rounded-2xl border border-[#DDDCD6] bg-white p-6">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm text-[#77766F]">
                          Patient image
                        </p>

                        <h3 className="mt-1 text-lg font-semibold">
                          Facial assessment
                        </h3>

                      </div>

                      <Camera
                        size={20}
                        strokeWidth={1.7}
                        className="text-[#999890]"
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
                  <div className="rounded-2xl border border-[#DDDCD6] bg-white p-6">

                    <div className="flex items-end justify-between gap-4">

                      <div>

                        <p className="text-sm text-[#77766F]">
                          Overall skin score
                        </p>

                        <div className="mt-2 flex items-end gap-2">

                          <span className="text-5xl font-semibold tracking-[-0.06em]">
                            {analysisResult.score}
                          </span>

                          <span className="mb-2 text-sm text-[#999890]">
                            / 100
                          </span>

                        </div>

                      </div>

                      <div className="text-right">

                        <span className="rounded-full bg-[#E8EEE5] px-3 py-1 text-xs font-medium text-[#62715D]">
                          {scoreChangeText}
                        </span>

                        <p className="mt-2 text-[10px] text-[#999890]">
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

                              <p className="text-xs text-[#77766F]">
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
                          className="text-[#77766F]"
                        />

                        <p className="text-xs font-medium text-[#77766F]">
                          Top priority concerns
                        </p>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        {analysisResult.priorities.map(
                          (priority, index) => (
                            <div
                              key={priority.label}
                              className="rounded-xl border border-[#ECEBE6] bg-[#FAF9F6] p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#999890]">
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

                              <p className="mt-3 text-xs leading-5 text-[#77766F]">
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
                    <div className="mt-5 rounded-xl bg-[#F0F3EE] p-5">

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
                <div className="mt-6 rounded-2xl border border-[#DDDCD6] bg-white p-6">

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                    <div>

                      <p className="text-sm text-[#77766F]">
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
                      className="text-xs font-medium text-[#77766F] hover:text-black"
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

                              <p className="mt-2 text-xs leading-5 text-[#77766F]">
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
                              className="text-xs font-medium text-[#77766F] hover:text-black"
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
                    className="rounded-xl border border-[#DDDCD6] bg-white px-5 py-3 text-sm font-medium hover:bg-[#F7F6F2]"
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

  return (
    profiles[patient.id] ||
    baseMetrics
  );
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

  return (
    skinTypes[patient.id] ||
    "Combination"
  );
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
            : "border border-[#DDDCD6] bg-white text-[#999890]"
        }`}
      >
        {number}
      </div>

      <span
        className={`text-xs ${
          active
            ? "font-medium text-[#171717]"
            : "text-[#999890]"
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
    <label className="group cursor-pointer overflow-hidden rounded-2xl border border-[#DDDCD6] bg-white">

      <div className="flex items-center justify-between border-b border-[#ECEBE6] px-5 py-4">

        <div>

          <p className="text-sm font-medium">
            {title}
          </p>

          <p className="mt-0.5 text-[10px] text-[#999890]">
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
            className="text-[#999890]"
          />

        )}

      </div>

      <div className="relative flex h-[280px] items-center justify-center bg-[#FAF9F6]">

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
                className="text-[#77766F]"
              />

            </div>

            <p className="mt-4 text-sm font-medium">
              Upload{" "}
              {title.toLowerCase()} image
            </p>

            <p className="mt-2 text-xs leading-5 text-[#999890]">
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

      <div className="flex h-20 items-center justify-center bg-[#FAF9F6]">

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

      <div className="px-3 py-2 text-center text-[10px] text-[#77766F]">
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
    <div className="rounded-xl border border-[#ECEBE6] bg-[#FAF9F6] p-4">

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

      <p className="mt-2 text-xs text-[#77766F]">
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
        number,
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
    <div className="mt-6 rounded-2xl border border-[#DDDCD6] bg-white">

      <div className="flex items-center gap-3 border-b border-[#ECEBE6] px-6 py-5">

        <History
          size={18}
          strokeWidth={1.7}
          className="text-[#77766F]"
        />

        <div>

          <p className="text-sm text-[#77766F]">
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

                      <p className="mt-1 text-xs text-[#999890]">
                        Skin intelligence assessment
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-5">

                    <div className="text-right">

                      <p className="text-[10px] text-[#999890]">
                        Score
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {item.score}/100
                      </p>

                    </div>

                    {index === 0 && (

                      <span className="rounded-full bg-[#E8EEE5] px-3 py-1 text-[10px] font-medium text-[#62715D]">
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

          <p className="mt-2 text-xs text-[#999890]">
            Save this analysis to begin tracking progress.
          </p>

        </div>

      )}

    </div>
  );
}
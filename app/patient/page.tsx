"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  FileText,
  Images,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import Sidebar from "@/app/components/sidebar";
import { createClient } from "@/app/lib/supabase-browser";

type Patient = {
  id: string;
  legacyId?: number;
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
  patientId?: string | number;
  date?: string;
  createdAt?: string;
  generatedAt?: string;
  score?: number;
  overallScore?: number;
  skinScore?: number;
  concern?: string;
  summary?: string;
  image?: string;
  imageUrl?: string;
  photo?: string;
  photoUrl?: string;
  uploadedImage?: string;
  previewUrl?: string;
  metrics?: SavedAnalysisMetric[];
  [key: string]: unknown;
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

type Appointment = {
  id: number;
  patient: string;
  initials: string;
  treatment: string;
  date: string;
  time: string;
  duration: string;
  practitioner?: string;
  status: string;
};

type TreatmentHistoryEntry = {
  id: number;
  appointmentId: number;
  patientId?: string | number;
  patient: string;
  treatment: string;
  date: string;
  rawDate?: string;
  time: string;
  duration: string;
  practitioner: string;
  practitionerId?: string | number;
  notes: string;
  completedAt: string;
};

type SavedTreatmentPlan = {
  id: number;
  patient: string;
  patientId: string | number;
  treatment: string;
  duration: string;
  price: string;
  status: "Active" | "Completed";
  notes?: string;
  createdAt?: string;
  clinicalReviewRequired?: boolean;
  clinicalReviewAcknowledged?: boolean;
};

type RawSavedTreatmentPlan = Partial<SavedTreatmentPlan> & {
  id?: number | string;
  treatmentName?: string;
  name?: string;
  treatment?: string;
  duration?: string;
  treatmentDuration?: string;
  price?: string | number;
  treatmentPrice?: string | number;
  status?: string;
  notes?: string;
  reason?: string;
  recommendationReason?: string;
  createdAt?: string;
  date?: string;
  patient?: string;
  patientName?: string;
  patientId?: number | string;
  clinicalReviewRequired?: boolean;
  clinicalReviewAcknowledged?: boolean;
};

type Practitioner = {
  id: string | number;
  legacyId?: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  speciality: string;
  qualifications: string;
  registrationNumber: string;
  experience: string;
  workingDays: string[];
  startTime: string;
  endTime: string;
  notes: string;
  active: boolean;
};

type ConsultationRecord = {
  id: number;
  patientId: string | number;
  date: string;
  allergies: string;
  medications: string;
  pregnancyStatus: string;
  previousTreatments: string;
  contraindications: string;
  medicalHistory: string;
  consentGiven: boolean;
  practitionerNotes: string;
  practitioner?: string;
  practitionerId?: string | number;
};

type PatientLinkedRecord = {
  patientId?: string | number;
  patient?: string;
  concern?: string;
  [key: string]: unknown;
};

type FollowUpStatus =
  | "Due"
  | "Scheduled"
  | "Analysis started"
  | "Completed";

type FollowUpRecord = {
  id: number;
  appointmentId: number;
  patientId?: string | number;
  patient: string;
  treatment: string;
  completedDate: string;
  completedRawDate: string;
  practitioner: string;
  practitionerId?: string | number;
  status: FollowUpStatus;
  createdAt: string;
  followUpAppointmentId?: number;
};

const fallbackPatient: Patient = {
  id: "70583d4d-770f-4d73-9c4a-3a7f627a36fd",
  legacyId: 1,
  name: "Emily Johnson",
  email: "emily.johnson@email.com",
  phone: "+44 7700 900123",
  age: 29,
  lastVisit: "25 Aug 2026",
  status: "Active",
  concern: "Acne & Pigmentation",
  analyses: 4,
};

const defaultPatientDirectory: Patient[] = [
  fallbackPatient,
  {
    id: "0b8598a1-0cd9-4416-bf2b-c5a2f99b73b5",
    legacyId: 2,
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
    id: "6f9dc3fb-18ad-4807-b1e4-fc9ee3e60694",
    legacyId: 3,
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
    id: "e1d43ba3-4484-4bbf-89f0-3523686b90bf",
    legacyId: 4,
    name: "Sophia Williams",
    email: "sophia.williams@email.com",
    phone: "+44 7700 900126",
    age: 41,
    lastVisit: "21 Aug 2026",
    status: "Inactive",
    concern: "Skin Ageing",
    analyses: 2,
  },
  {
    id: "76558822-50ed-40e2-8e2c-caf424ce9cc2",
    legacyId: 5,
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
    id: "c3281eb5-4ea8-42ce-b237-cd6b18d3ee8b",
    legacyId: 6,
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

const defaultClinicalProfiles: Record<string, ClinicalProfile> = {
  1: {
    score: 76,
    change: "+8.4%",
    skinType: "Combination",
    metrics: [
      {
        label: "Hydration",
        value: 78,
        status: "Good",
      },
      {
        label: "Texture",
        value: 82,
        status: "Good",
      },
      {
        label: "Pigmentation",
        value: 64,
        status: "Moderate",
      },
      {
        label: "Acne",
        value: 71,
        status: "Improving",
      },
    ],
    timeline: [
      {
        date: "25 Aug 2026",
        title: "AI Skin Analysis Completed",
        description:
          "Latest analysis showed improvement in hydration and acne while pigmentation remains a priority.",
        type: "Analysis",
      },
      {
        date: "12 Aug 2026",
        title: "Hydration Facial",
        description:
          "Hydration treatment completed with a follow-up recommended in four weeks.",
        type: "Treatment",
      },
      {
        date: "15 Jul 2026",
        title: "Initial consultation",
        description:
          "Patient presented with acne, pigmentation and mild dehydration.",
        type: "Consultation",
      },
    ],
    treatments: [
      {
        name: "Hydration Facial",
        reason: "Recommended for hydration",
        price: "£120",
      },
      {
        name: "Pigmentation Peel",
        reason: "Recommended for Pigmentation",
        price: "£150",
      },
    ],
  },
};

const initialAppointments: Appointment[] = [
  {
    id: 1,
    patient: "Emily Johnson",
    initials: "EJ",
    treatment: "Hydration Facial",
    date: "25 Aug 2026",
    time: "10:30 AM",
    duration: "60 min",
    practitioner: "Sarah Williams",
    status: "Confirmed",
  },
];

function createEmptyClinicalProfile(
  patient: Patient
): ClinicalProfile {
  return {
    score: 0,
    change: "New",
    skinType: "Not Assessed",
    metrics: [],
    timeline: [
      {
        date: "New Patient",
        title: "Patient record created",
        description: `${patient.name} has been added to the clinic. Complete the first skin analysis to generate clinical insights.`,
        type: "Patient",
      },
    ],
    treatments: [],
  };
}

function getCompatibilityPatientId(patient: Patient): string | number {
  return patient.legacyId ?? patient.id;
}

function patientIdsMatch(
  recordPatientId: string | number | undefined,
  patient: Patient
): boolean {
  if (recordPatientId === undefined || recordPatientId === null) return false;

  const value = String(recordPatientId);
  return (
    value === String(patient.id) ||
    (patient.legacyId !== undefined && value === String(patient.legacyId))
  );
}

function approximateDateOfBirthFromAge(age: number): string {
  const today = new Date();
  const year = today.getFullYear() - age;
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeSavedTreatmentPlan(
  plan: RawSavedTreatmentPlan,
  selectedPatient: Patient,
  index: number
): SavedTreatmentPlan {
  const rawStatus = String(plan.status || "Active").trim().toLowerCase();

  const status: "Active" | "Completed" =
    rawStatus === "completed" ||
    rawStatus === "complete" ||
    rawStatus === "done"
      ? "Completed"
      : "Active";

  const treatment =
    String(
      plan.treatment ||
      plan.treatmentName ||
      plan.name ||
      "Treatment plan"
    ).trim() || "Treatment plan";

  const duration =
    String(
      plan.duration ||
      plan.treatmentDuration ||
      "Not recorded"
    ).trim() || "Not recorded";

  const rawPrice =
    plan.price ??
    plan.treatmentPrice ??
    "Not recorded";

  const price =
    typeof rawPrice === "number"
      ? `£${rawPrice}`
      : String(rawPrice).trim() || "Not recorded";

  const notes =
    String(
      plan.notes ||
      plan.reason ||
      plan.recommendationReason ||
      ""
    ).trim();

  const parsedPatientId = Number(plan.patientId);

  return {
    id:
      typeof plan.id === "number"
        ? plan.id
        : Number(plan.id) || Date.now() + index,
    patient:
      String(
        plan.patient ||
        plan.patientName ||
        selectedPatient.name
      ).trim() || selectedPatient.name,
    patientId:
      !Number.isNaN(parsedPatientId) && parsedPatientId > 0
        ? parsedPatientId
        : getCompatibilityPatientId(selectedPatient),
    treatment,
    duration,
    price,
    status,
    notes,
    createdAt:
      String(
        plan.createdAt ||
        plan.date ||
        ""
      ).trim() || undefined,
    clinicalReviewRequired:
      Boolean(plan.clinicalReviewRequired),
    clinicalReviewAcknowledged:
      Boolean(plan.clinicalReviewAcknowledged),
  };
}

export default function PatientProfile() {
  const [activeTab, setActiveTab] =
    useState("Overview");

  const [patient, setPatient] =
    useState<Patient>(fallbackPatient);

  const [patientResolved, setPatientResolved] =
    useState(false);

  const [clinicalProfile, setClinicalProfile] =
    useState<ClinicalProfile>(
      createEmptyClinicalProfile(fallbackPatient)
    );

  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);

  const [treatmentHistory, setTreatmentHistory] =
    useState<TreatmentHistoryEntry[]>([]);

  const [savedTreatmentPlans, setSavedTreatmentPlans] =
    useState<SavedTreatmentPlan[]>([]);

  const [consultations, setConsultations] =
    useState<ConsultationRecord[]>([]);

  const [practitioners, setPractitioners] =
    useState<Practitioner[]>([]);

  const [selectedPractitionerId, setSelectedPractitionerId] =
    useState<string | number | "">("");

  const [savedAnalyses, setSavedAnalyses] =
    useState<SavedAnalysis[]>([]);

  const [followUps, setFollowUps] =
    useState<FollowUpRecord[]>([]);

  const [allergies, setAllergies] =
    useState("");

  const [medications, setMedications] =
    useState("");

  const [
    pregnancyStatus,
    setPregnancyStatus,
  ] = useState("Not Applicable");

  const [
    previousTreatments,
    setPreviousTreatments,
  ] = useState("");

  const [
    contraindications,
    setContraindications,
  ] = useState("");

  const [
    medicalHistory,
    setMedicalHistory,
  ] = useState("");

  const [
    consentGiven,
    setConsentGiven,
  ] = useState(false);

  const [
    practitionerNotes,
    setPractitionerNotes,
  ] = useState("");

  const [
    consultationSaved,
    setConsultationSaved,
  ] = useState(false);

  const [
    showEditPatient,
    setShowEditPatient,
  ] = useState(false);

  const [
    editPatient,
    setEditPatient,
  ] = useState<Patient>(
    fallbackPatient
  );

  const [
    patientSaved,
    setPatientSaved,
  ] = useState(false);

  const [
    showDeletePatient,
    setShowDeletePatient,
  ] = useState(false);

  const [
    deleteConfirmation,
    setDeleteConfirmation,
  ] = useState("");

  const [
    deletingPatient,
    setDeletingPatient,
  ] = useState(false);

  const [
    deletePatientError,
    setDeletePatientError,
  ] = useState("");

  const tabs = [
    "Overview",
    "Skin Profile",
    "Analysis History",
    "Consultation",
    "Treatments",
    "Appointments",
  ];

  useEffect(() => {
    const initializePatientProfile = async () => {
    const requestedPatientTab =
      localStorage.getItem("dermisPatientTab");

    if (
      requestedPatientTab &&
      tabs.includes(requestedPatientTab)
    ) {
      setActiveTab(requestedPatientTab);
    }

    localStorage.removeItem("dermisPatientTab");

    const storedClinicSettings =
      localStorage.getItem("dermisClinicSettings");

    if (storedClinicSettings) {
      try {
        const parsedSettings = JSON.parse(storedClinicSettings);
        const clinicPractitioners: Practitioner[] =
          Array.isArray(parsedSettings?.practitioners)
            ? parsedSettings.practitioners.filter(
                (practitioner: Practitioner) =>
                  practitioner.active !== false
              )
            : [];

        setPractitioners(clinicPractitioners);

        const preferredPractitioner =
          clinicPractitioners.find(
            (practitioner) =>
              practitioner.name ===
              parsedSettings?.practitionerName
          ) || clinicPractitioners[0];

        if (preferredPractitioner) {
          setSelectedPractitionerId(
            preferredPractitioner.id
          );
        }
      } catch (error) {
        console.error(
          "Could not load clinic practitioners:",
          error
        );
      }
    }

    let selectedPatient = fallbackPatient;

    const requestedPatientId =
      new URLSearchParams(window.location.search).get("id");

    const storedPatients =
      localStorage.getItem("dermisPatients");

    let patientDirectory: Patient[] = [];

    if (storedPatients) {
      try {
        const parsedPatients = JSON.parse(storedPatients) as Patient[];
        patientDirectory = Array.isArray(parsedPatients) ? parsedPatients : [];
      } catch (error) {
        console.error("Could not load patient directory:", error);
      }
    }

    const savedPatient =
      localStorage.getItem("dermisSelectedPatient");

    let storedSelectedPatient: Patient | null = null;

    if (savedPatient) {
      try {
        storedSelectedPatient = JSON.parse(savedPatient) as Patient;
      } catch (error) {
        console.error("Could not load selected patient:", error);
      }
    }

    /*
     * A patient UUID in the URL is authoritative.
     * Always read that exact UUID from Supabase instead of trusting the
     * local compatibility cache. This prevents stale/corrupted cache data
     * from showing Emily under another patient's UUID.
     */
    if (requestedPatientId) {
      try {
        const supabase = createClient();
        const { data: row, error } = await supabase
          .from("patients")
          .select(
            "id, legacy_id, first_name, last_name, email, phone, date_of_birth, status, primary_concern, last_visit_at"
          )
          .eq("id", requestedPatientId)
          .maybeSingle();

        if (error) throw error;

        if (!row) {
          console.error(
            "No accessible patient matched the requested UUID:",
            requestedPatientId
          );
          window.location.href = "/patients";
          return;
        }

        const calculateAgeFromDateOfBirth = (value: string | null) => {
          if (!value) return 0;

          const birthDate = new Date(`${value}T00:00:00`);
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

          return Math.max(0, age);
        };

        const formatLastVisit = (value: string | null) => {
          if (!value) return "No visits yet";

          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "No visits yet";

          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        };

        const cachedSamePatient =
          patientDirectory.find(
            (candidate) => String(candidate.id) === String(row.id)
          ) || null;

        selectedPatient = {
          id: String(row.id),
          legacyId:
            typeof row.legacy_id === "number"
              ? row.legacy_id
              : undefined,
          name: [row.first_name, row.last_name]
            .filter(Boolean)
            .join(" ")
            .trim(),
          email: row.email || "",
          phone: row.phone || "",
          age: calculateAgeFromDateOfBirth(row.date_of_birth),
          lastVisit: formatLastVisit(row.last_visit_at),
          status:
            String(row.status).toLowerCase() === "inactive"
              ? "Inactive"
              : "Active",
          concern: row.primary_concern || "Not specified",
          analyses: cachedSamePatient?.analyses ?? 0,
        };

        const updatedDirectory = [
          ...patientDirectory.filter(
            (candidate) => String(candidate.id) !== selectedPatient.id
          ),
          selectedPatient,
        ];

        localStorage.setItem(
          "dermisPatients",
          JSON.stringify(updatedDirectory)
        );
        localStorage.setItem(
          "dermisSelectedPatient",
          JSON.stringify(selectedPatient)
        );
      } catch (error) {
        console.error(
          "Could not load requested patient from Supabase:",
          error
        );
        window.location.href = "/patients";
        return;
      }
    } else if (storedSelectedPatient) {
      selectedPatient = storedSelectedPatient;
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(storedSelectedPatient)
      );
    }

    setPatient(selectedPatient);
    setEditPatient(selectedPatient);
    setPatientResolved(true);

    const storedClinicalProfiles =
      localStorage.getItem(
        "dermisClinicalProfiles"
      );

    let customProfiles: Record<
      string,
      ClinicalProfile
    > = {};

    if (storedClinicalProfiles) {
      try {
        customProfiles =
          JSON.parse(
            storedClinicalProfiles
          );
      } catch (error) {
        console.error(
          "Could not load clinical profiles:",
          error
        );
      }
    }

    let profile =
      customProfiles[
        String(getCompatibilityPatientId(selectedPatient))
      ] ||
      defaultClinicalProfiles[
        Number(getCompatibilityPatientId(selectedPatient))
      ] ||
      createEmptyClinicalProfile(
        selectedPatient
      );

    const latestAnalysis =
      localStorage.getItem(
        "dermisLatestAnalysis"
      );

    if (latestAnalysis) {
      try {
        const analysis =
          JSON.parse(
            latestAnalysis
          );

        if (
          analysis.patient ===
          selectedPatient.name
        ) {
          const analysisMetrics:
            | SkinMetric[]
            | undefined =
            analysis.metrics?.map(
              (metric: {
                name?: string;
                label?: string;
                score?: number;
                value?: number;
                status?: string;
              }) => ({
                label:
                  metric.label ||
                  metric.name ||
                  "Metric",
                value:
                  metric.value ??
                  metric.score ??
                  0,
                status:
                  metric.status ||
                  "Recorded",
              })
            );

          profile = {
            ...profile,
            score:
              analysis.score ??
              profile.score,
            metrics:
              analysisMetrics &&
              analysisMetrics.length >
                0
                ? analysisMetrics
                : profile.metrics,
          };
        }
      } catch (error) {
        console.error(
          "Could not load latest analysis:",
          error
        );
      }
    }

    setClinicalProfile(
      profile
    );

    const storedAppointments =
      localStorage.getItem(
        "dermisAppointments"
      );

    if (storedAppointments) {
      try {
        setAppointments(
          JSON.parse(
            storedAppointments
          )
        );
      } catch (error) {
        console.error(
          "Could not load appointments:",
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
        const parsedHistory: TreatmentHistoryEntry[] =
          JSON.parse(storedTreatmentHistory);

        setTreatmentHistory(
          Array.isArray(parsedHistory)
            ? parsedHistory
            : []
        );
      } catch (error) {
        console.error(
          "Could not load treatment history:",
          error
        );
      }
    }

    /*
     * SAVED TREATMENT PLANS
     */
    const storedTreatmentPlansForPatient =
      localStorage.getItem("dermisTreatmentPlans");

    if (storedTreatmentPlansForPatient) {
      try {
        const parsedPlans = JSON.parse(
          storedTreatmentPlansForPatient
        ) as
          | RawSavedTreatmentPlan[]
          | Record<string, RawSavedTreatmentPlan[]>;

        let patientPlans: RawSavedTreatmentPlan[] = [];

        if (Array.isArray(parsedPlans)) {
          patientPlans = parsedPlans.filter((plan) => {
            const parsedPatientId = Number(plan.patientId);

            return (
              patientIdsMatch(plan.patientId, selectedPatient) ||
              plan.patient === selectedPatient.name ||
              plan.patientName === selectedPatient.name
            );
          });
        } else if (parsedPlans && typeof parsedPlans === "object") {
          const mappedPlans =
            parsedPlans[String(getCompatibilityPatientId(selectedPatient))] ||
            parsedPlans[String(selectedPatient.id)] ||
            [];

          patientPlans = Array.isArray(mappedPlans)
            ? mappedPlans
            : [];
        }

        setSavedTreatmentPlans(
          patientPlans.map((plan, index) =>
            normalizeSavedTreatmentPlan(
              plan,
              selectedPatient,
              index
            )
          )
        );
      } catch (error) {
        console.error(
          "Could not load treatment plans:",
          error
        );
      }
    }

    /*
     * SAVED ANALYSIS HISTORY
     */
    const storedAnalysisHistory =
      localStorage.getItem("dermisAnalysisHistory");

    if (storedAnalysisHistory) {
      try {
        const parsedHistory = JSON.parse(storedAnalysisHistory);
        let patientAnalyses: SavedAnalysis[] = [];

        if (Array.isArray(parsedHistory)) {
          patientAnalyses = parsedHistory.filter(
            (analysis: SavedAnalysis) =>
              patientIdsMatch(analysis.patientId, selectedPatient) ||
              analysis.patient === selectedPatient.name
          );
        } else if (parsedHistory && typeof parsedHistory === "object") {
          const value =
            parsedHistory[String(getCompatibilityPatientId(selectedPatient))] ||
            parsedHistory[String(selectedPatient.id)];
          patientAnalyses = Array.isArray(value) ? value : [];
        }

        setSavedAnalyses(
          [...patientAnalyses].sort(
            (a, b) => getAnalysisTimestamp(b) - getAnalysisTimestamp(a)
          )
        );
      } catch (error) {
        console.error("Could not load analysis history:", error);
        setSavedAnalyses([]);
      }
    }

    /*
     * FOLLOW-UPS
     */
    const storedFollowUps =
      localStorage.getItem("dermisFollowUps");

    if (storedFollowUps) {
      try {
        const parsedFollowUps =
          JSON.parse(storedFollowUps);

        if (Array.isArray(parsedFollowUps)) {
          setFollowUps(
            parsedFollowUps.filter(
              (followUp: FollowUpRecord) =>
                patientIdsMatch(followUp.patientId, selectedPatient) ||
                followUp.patient === selectedPatient.name
            )
          );
        }
      } catch (error) {
        console.error(
          "Could not load patient follow-ups:",
          error
        );
      }
    }

    /*
     * CONSULTATIONS
     */
    const storedConsultations =
      localStorage.getItem(
        "dermisConsultations"
      );

    if (storedConsultations) {
      try {
        const parsed:
          Record<
            string,
            ConsultationRecord[]
          > = JSON.parse(
            storedConsultations
          );

        const patientConsultations =
          parsed[
            String(getCompatibilityPatientId(selectedPatient))
          ] ||
          parsed[String(selectedPatient.id)] || [];

        setConsultations(
          patientConsultations
        );

        /*
         * Fill the form with the
         * latest consultation
         */
        if (
          patientConsultations.length >
          0
        ) {
          const latest =
            patientConsultations[0];

          setAllergies(
            latest.allergies
          );

          setMedications(
            latest.medications
          );

          setPregnancyStatus(
            latest.pregnancyStatus
          );

          setPreviousTreatments(
            latest.previousTreatments
          );

          setContraindications(
            latest.contraindications
          );

          setMedicalHistory(
            latest.medicalHistory
          );

          setConsentGiven(
            latest.consentGiven
          );

          setPractitionerNotes(
            latest.practitionerNotes
          );

          if (latest.practitionerId) {
            setSelectedPractitionerId(
              latest.practitionerId
            );
          }
        }
      } catch (error) {
        console.error(
          "Could not load consultations:",
          error
        );
      }
    }
    };

    void initializePatientProfile();
  }, []);

  const initials =
    patient.name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const patientAppointments =
    appointments.filter(
      (appointment) =>
        appointment.patient ===
        patient.name
    );

  const patientTreatmentHistory = treatmentHistory
    .filter(
      (entry) =>
        patientIdsMatch(entry.patientId, patient) ||
        entry.patient === patient.name
    )
    .sort((a, b) =>
      (b.completedAt || "").localeCompare(a.completedAt || "")
    );

  const activeTreatmentPlans = savedTreatmentPlans.filter(
    (plan) => plan.status === "Active"
  );

  const completedTreatmentPlans = savedTreatmentPlans.filter(
    (plan) => plan.status === "Completed"
  );

  const lastCompletedTreatment = patientTreatmentHistory[0] || null;

  const analysisHistory = useMemo(
    () =>
      [...savedAnalyses].sort(
        (a, b) => getAnalysisTimestamp(b) - getAnalysisTimestamp(a)
      ),
    [savedAnalyses]
  );

  const latestSavedAnalysis = analysisHistory[0] || null;
  const previousSavedAnalysis = analysisHistory[1] || null;

  /*
   * KEEP PATIENT ANALYSIS COUNT IN SYNC
   *
   * The patient directory previously relied on the manually stored
   * `patient.analyses` value. The real source of truth is now the
   * patient's saved records in `dermisAnalysisHistory`.
   */
  useEffect(() => {
    if (!patient?.id) return;

    const actualAnalysisCount =
      savedAnalyses.length;

    if (patient.analyses === actualAnalysisCount) {
      return;
    }

    const updatedPatient: Patient = {
      ...patient,
      analyses: actualAnalysisCount,
    };

    setPatient(updatedPatient);

    try {
      const storedPatients =
        localStorage.getItem("dermisPatients");

      if (storedPatients) {
        const parsedPatients = JSON.parse(
          storedPatients
        ) as Patient[];

        if (Array.isArray(parsedPatients)) {
          const updatedPatients =
            parsedPatients.map((item) =>
              item.id === patient.id
                ? {
                    ...item,
                    analyses:
                      actualAnalysisCount,
                  }
                : item
            );

          localStorage.setItem(
            "dermisPatients",
            JSON.stringify(updatedPatients)
          );
        }
      }

      const storedSelectedPatient =
        localStorage.getItem(
          "dermisSelectedPatient"
        );

      if (storedSelectedPatient) {
        const parsedSelectedPatient =
          JSON.parse(
            storedSelectedPatient
          ) as Patient;

        if (
          parsedSelectedPatient.id ===
          patient.id
        ) {
          localStorage.setItem(
            "dermisSelectedPatient",
            JSON.stringify({
              ...parsedSelectedPatient,
              analyses:
                actualAnalysisCount,
            })
          );
        }
      }
    } catch (error) {
      console.error(
        "Could not synchronize patient analysis count:",
        error
      );
    }
  }, [
    patient,
    savedAnalyses.length,
  ]);

  const selectedPractitioner =
    practitioners.find(
      (practitioner) =>
        practitioner.id === selectedPractitionerId
    ) || null;

  const latestConsultation =
    consultations[0] || null;

  const hasPotentialContraindication =
    useMemo(() => {
      return (
        contraindications.trim() !==
          "" ||
        medicalHistory.trim() !==
          "" ||
        allergies.trim() !==
          "" ||
        pregnancyStatus ===
          "Pregnant" ||
        pregnancyStatus ===
          "Breastfeeding"
      );
    }, [
      contraindications,
      medicalHistory,
      allergies,
      pregnancyStatus,
    ]);

  const currentFollowUp =
    useMemo(() => {
      const priority: Record<
        Exclude<FollowUpStatus, "Completed">,
        number
      > = {
        "Due": 3,
        "Scheduled": 2,
        "Analysis started": 1,
      };

      const actionableFollowUps = followUps.filter(
        (record) => record.status !== "Completed"
      );

      return [...actionableFollowUps].sort((a, b) => {
        const aPriority =
          priority[
            a.status as Exclude<
              FollowUpStatus,
              "Completed"
            >
          ] ?? 0;

        const bPriority =
          priority[
            b.status as Exclude<
              FollowUpStatus,
              "Completed"
            >
          ] ?? 0;

        const statusDifference =
          bPriority - aPriority;

        if (statusDifference !== 0) {
          return statusDifference;
        }

        return (b.createdAt || "").localeCompare(
          a.createdAt || ""
        );
      })[0] || null;
    }, [followUps]);

  const savePatientFollowUps = (
    patientFollowUps: FollowUpRecord[]
  ) => {
    const stored =
      localStorage.getItem("dermisFollowUps");

    let allFollowUps: FollowUpRecord[] = [];

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        allFollowUps = Array.isArray(parsed)
          ? parsed
          : [];
      } catch (error) {
        console.error(
          "Could not read follow-ups:",
          error
        );
      }
    }

    const otherPatientFollowUps =
      allFollowUps.filter(
        (record) =>
          !(
            patientIdsMatch(record.patientId, patient) ||
            record.patient === patient.name
          )
      );

    const updatedFollowUps = [
      ...patientFollowUps,
      ...otherPatientFollowUps,
    ];

    localStorage.setItem(
      "dermisFollowUps",
      JSON.stringify(updatedFollowUps)
    );

    setFollowUps(patientFollowUps);
  };

  const bookPatientFollowUp = (
    followUp: FollowUpRecord
  ) => {
    localStorage.setItem(
      "dermisSelectedPatient",
      JSON.stringify(patient)
    );

    localStorage.setItem(
      "dermisFollowUpBooking",
      JSON.stringify({
        followUpId: followUp.id,
        appointmentId: followUp.appointmentId,
        patientId: getCompatibilityPatientId(patient),
        patient: patient.name,
        treatment: followUp.treatment,
        practitioner: followUp.practitioner,
        practitionerId: followUp.practitionerId,
        completedDate: followUp.completedDate,
      })
    );

    window.location.href =
      "/appointments?from=follow-up";
  };

  const startFollowUpAnalysis = (
    followUp: FollowUpRecord
  ) => {
    localStorage.setItem(
      "dermisSelectedPatient",
      JSON.stringify(patient)
    );

    const updatedPatientFollowUps =
      followUps.map((record) =>
        record.id === followUp.id
          ? {
              ...record,
              status:
                "Analysis started" as FollowUpStatus,
            }
          : record
      );

    savePatientFollowUps(
      updatedPatientFollowUps
    );

    localStorage.setItem(
      "dermisFollowUpSource",
      JSON.stringify({
        followUpId: followUp.id,
        appointmentId: followUp.appointmentId,
        patientId: getCompatibilityPatientId(patient),
        patient: patient.name,
        treatment: followUp.treatment,
        completedDate: followUp.completedDate,
      })
    );

    window.location.href = "/analysis";
  };

  const startNewAnalysis =
    () => {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(
          patient
        )
      );

      window.location.href =
        "/analysis";
    };

  const openSavedAnalysis = (analysis: SavedAnalysis) => {
    localStorage.setItem(
      "dermisSelectedPatient",
      JSON.stringify(patient)
    );

    /*
     * Keep historical analysis separate from the patient's true latest
     * analysis. Store a normalized, self-contained historical record so
     * the Analysis page can render it immediately in read-only mode.
     */
    const numericAnalysisId =
      typeof analysis.id === "number"
        ? analysis.id
        : typeof analysis.id === "string" &&
            /^\\d+$/.test(analysis.id)
          ? Number(analysis.id)
          : undefined;

    const selectedHistoricalAnalysis = {
      patient: patient.name,
      patientId: getCompatibilityPatientId(patient),
      ...(typeof numericAnalysisId === "number"
        ? { id: numericAnalysisId }
        : {}),
      date: getAnalysisDate(analysis),
      score: getAnalysisScore(analysis),
      image: getAnalysisImage(analysis),
      metrics: getAnalysisMetrics(analysis),
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
        "Could not open saved analysis:",
        error
      );
      return;
    }

    window.location.href =
      "/analysis?mode=history";
  };

  const compareSavedAnalyses = () => {
    localStorage.setItem("dermisSelectedPatient", JSON.stringify(patient));
    window.location.href = "/before-after";
  };

  const openTreatments =
    () => {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(
          patient
        )
      );

      window.location.href =
        "/treatments";
    };

  const openAppointments =
    () => {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(
          patient
        )
      );

      window.location.href =
        "/appointments";
    };

  const openEditPatient =
    () => {
      setEditPatient({
        ...patient,
      });

      setPatientSaved(false);
      setShowEditPatient(true);
    };

  const closeEditPatient =
    () => {
      setEditPatient({
        ...patient,
      });

      setPatientSaved(false);
      setShowEditPatient(false);
    };

  const updateEditPatientField = (
    field: keyof Patient,
    value: string | number
  ) => {
    setEditPatient(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setPatientSaved(false);
  };

  const saveEditedPatient =
    async () => {
      const cleanName =
        editPatient.name.trim();

      const cleanEmail =
        editPatient.email.trim();

      const cleanPhone =
        editPatient.phone.trim();

      const cleanConcern =
        editPatient.concern.trim();

      if (
        !cleanName ||
        !cleanEmail ||
        !cleanPhone ||
        !cleanConcern ||
        !editPatient.age ||
        editPatient.age < 1
      ) {
        return;
      }

      const oldName =
        patient.name;

      const updatedPatient: Patient = {
        ...editPatient,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        concern: cleanConcern,
        age: Number(
          editPatient.age
        ),
      };

      try {
        const supabase = createClient();
        const nameParts = cleanName.split(/\s+/).filter(Boolean);
        const firstName = nameParts[0] || cleanName;
        const lastName = nameParts.slice(1).join(" ") || "-";

        const { error: updateError } = await supabase
          .from("patients")
          .update({
            first_name: firstName,
            last_name: lastName,
            email: cleanEmail,
            phone: cleanPhone,
            date_of_birth: approximateDateOfBirthFromAge(Number(editPatient.age)),
            status: editPatient.status.toLowerCase(),
            primary_concern: cleanConcern,
          })
          .eq("id", updatedPatient.id);

        if (updateError) {
          console.error("Could not update patient in Supabase:", updateError);
          return;
        }
      } catch (error) {
        console.error("Could not update patient in Supabase:", error);
        return;
      }

      /*
       * UPDATE PATIENT DIRECTORY
       */
      let patientDirectory =
        defaultPatientDirectory;

      const storedPatients =
        localStorage.getItem(
          "dermisPatients"
        );

      if (storedPatients) {
        try {
          const parsedPatients =
            JSON.parse(
              storedPatients
            );

          if (
            Array.isArray(
              parsedPatients
            )
          ) {
            patientDirectory =
              parsedPatients;
          }
        } catch (error) {
          console.error(
            "Could not read patients:",
            error
          );
        }
      }

      const patientExists =
        patientDirectory.some(
          (item) =>
            item.id ===
            updatedPatient.id
        );

      const updatedDirectory =
        patientExists
          ? patientDirectory.map(
              (item) =>
                item.id ===
                updatedPatient.id
                  ? updatedPatient
                  : item
            )
          : [
              updatedPatient,
              ...patientDirectory,
            ];

      localStorage.setItem(
        "dermisPatients",
        JSON.stringify(
          updatedDirectory
        )
      );

      /*
       * UPDATE CURRENT PATIENT CONTEXT
       */
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(
          updatedPatient
        )
      );

      /*
       * UPDATE APPOINTMENTS IF NAME CHANGED
       */
      const storedAppointments =
        localStorage.getItem(
          "dermisAppointments"
        );

      if (storedAppointments) {
        try {
          const parsedAppointments: Appointment[] =
            JSON.parse(
              storedAppointments
            );

          const updatedAppointments =
            parsedAppointments.map(
              (appointment) => {
                const samePatient =
                  appointment.patient ===
                    oldName ||
                  (
                    "patientId" in
                      appointment &&
                    (
                      appointment as Appointment & {
                        patientId?: string | number;
                      }
                    ).patientId ===
                      updatedPatient.id
                  );

                if (!samePatient) {
                  return appointment;
                }

                return {
                  ...appointment,
                  patient:
                    updatedPatient.name,
                  initials:
                    updatedPatient.name
                      .split(" ")
                      .filter(Boolean)
                      .map(
                        (word) =>
                          word[0]
                      )
                      .join("")
                      .slice(0, 2)
                      .toUpperCase(),
                };
              }
            );

          localStorage.setItem(
            "dermisAppointments",
            JSON.stringify(
              updatedAppointments
            )
          );

          setAppointments(
            updatedAppointments
          );
        } catch (error) {
          console.error(
            "Could not update appointments:",
            error
          );
        }
      }

      /*
       * UPDATE TREATMENT PLAN HANDOFF
       */
      const storedTreatmentPlan =
        localStorage.getItem(
          "dermisTreatmentPlan"
        );

      if (storedTreatmentPlan) {
        try {
          const plan =
            JSON.parse(
              storedTreatmentPlan
            );

          if (
            plan.patientId ===
              updatedPatient.id ||
            plan.patient ===
              oldName
          ) {
            localStorage.setItem(
              "dermisTreatmentPlan",
              JSON.stringify({
                ...plan,
                patient:
                  updatedPatient.name,
                patientId:
                  getCompatibilityPatientId(updatedPatient),
              })
            );
          }
        } catch (error) {
          console.error(
            "Could not update treatment handoff:",
            error
          );
        }
      }

      /*
       * UPDATE SAVED TREATMENT PLANS
       */
      const storedTreatmentPlans =
        localStorage.getItem(
          "dermisTreatmentPlans"
        );

      if (storedTreatmentPlans) {
        try {
          const parsedPlans = JSON.parse(
            storedTreatmentPlans
          ) as
            | PatientLinkedRecord[]
            | Record<string, PatientLinkedRecord[]>;

          if (
            Array.isArray(
              parsedPlans
            )
          ) {
            const updatedPlans =
              parsedPlans.map(
                (plan: PatientLinkedRecord) =>
                  patientIdsMatch(plan.patientId, updatedPatient) ||
                  plan.patient ===
                    oldName
                    ? {
                        ...plan,
                        patient:
                          updatedPatient.name,
                        patientId:
                          getCompatibilityPatientId(updatedPatient),
                      }
                    : plan
              );

            localStorage.setItem(
              "dermisTreatmentPlans",
              JSON.stringify(
                updatedPlans
              )
            );
          } else if (
            parsedPlans &&
            typeof parsedPlans ===
              "object"
          ) {
            const patientPlans =
              parsedPlans[
                String(getCompatibilityPatientId(updatedPatient))
              ];

            if (
              Array.isArray(
                patientPlans
              )
            ) {
              parsedPlans[
                String(getCompatibilityPatientId(updatedPatient))
              ] =
                patientPlans.map(
                  (plan: PatientLinkedRecord) => ({
                    ...plan,
                    patient:
                      updatedPatient.name,
                    patientId:
                      updatedPatient.id,
                  })
                );
            }

            localStorage.setItem(
              "dermisTreatmentPlans",
              JSON.stringify(
                parsedPlans
              )
            );
          }
        } catch (error) {
          console.error(
            "Could not update treatment plans:",
            error
          );
        }
      }

      /*
       * UPDATE SAVED PROGRESS REPORTS
       */
      const storedReports =
        localStorage.getItem(
          "dermisProgressReports"
        );

      if (storedReports) {
        try {
          const parsedReports = JSON.parse(
            storedReports
          ) as
            | PatientLinkedRecord[]
            | Record<string, PatientLinkedRecord[]>;

          if (
            Array.isArray(
              parsedReports
            )
          ) {
            const updatedReports =
              parsedReports.map(
                (report: PatientLinkedRecord) =>
                  patientIdsMatch(report.patientId, updatedPatient) ||
                  report.patient ===
                    oldName
                    ? {
                        ...report,
                        patient:
                          updatedPatient.name,
                        patientId:
                          getCompatibilityPatientId(updatedPatient),
                        concern:
                          updatedPatient.concern,
                      }
                    : report
              );

            localStorage.setItem(
              "dermisProgressReports",
              JSON.stringify(
                updatedReports
              )
            );
          } else if (
            parsedReports &&
            typeof parsedReports ===
              "object"
          ) {
            Object.keys(
              parsedReports
            ).forEach(
              (key) => {
                const value =
                  parsedReports[key];

                if (
                  Array.isArray(
                    value
                  )
                ) {
                  parsedReports[key] =
                    value.map(
                      (report: PatientLinkedRecord) =>
                        patientIdsMatch(report.patientId, updatedPatient) ||
                        report.patient ===
                          oldName
                          ? {
                              ...report,
                              patient:
                                updatedPatient.name,
                              patientId:
                                updatedPatient.id,
                              concern:
                                updatedPatient.concern,
                            }
                          : report
                    );
                }
              }
            );

            localStorage.setItem(
              "dermisProgressReports",
              JSON.stringify(
                parsedReports
              )
            );
          }
        } catch (error) {
          console.error(
            "Could not update progress reports:",
            error
          );
        }
      }

      /*
       * UPDATE LATEST ANALYSIS NAME
       * WITHOUT TOUCHING ANALYSIS SCORES
       */
      const storedLatestAnalysis =
        localStorage.getItem(
          "dermisLatestAnalysis"
        );

      if (storedLatestAnalysis) {
        try {
          const latest =
            JSON.parse(
              storedLatestAnalysis
            );

          if (
            patientIdsMatch(latest.patientId, updatedPatient) ||
            latest.patient ===
              oldName
          ) {
            localStorage.setItem(
              "dermisLatestAnalysis",
              JSON.stringify({
                ...latest,
                patient:
                  updatedPatient.name,
                patientId:
                  getCompatibilityPatientId(updatedPatient),
              })
            );
          }
        } catch (error) {
          console.error(
            "Could not update latest analysis:",
            error
          );
        }
      }

      setPatient(
        updatedPatient
      );

      setEditPatient(
        updatedPatient
      );

      setPatientSaved(true);

      window.setTimeout(
        () => {
          setPatientSaved(
            false
          );

          setShowEditPatient(
            false
          );
        },
        900
      );
    };

  const closeDeletePatient = () => {
    if (deletingPatient) return;
    setShowDeletePatient(false);
    setDeleteConfirmation("");
    setDeletePatientError("");
  };

  const removePatientFromLocalCache = () => {
    const patientUuid = String(patient.id);
    const compatibilityId = String(getCompatibilityPatientId(patient));
    const patientName = patient.name;

    const belongsToPatient = (record: unknown) => {
      if (!record || typeof record !== "object") return false;

      const item = record as {
        patientId?: string | number;
        patient_id?: string | number;
        patient?: string;
        patientName?: string;
      };

      const recordId = item.patientId ?? item.patient_id;
      const idMatches =
        recordId !== undefined &&
        recordId !== null &&
        (String(recordId) === patientUuid ||
          String(recordId) === compatibilityId);

      const nameMatches =
        item.patient === patientName ||
        item.patientName === patientName;

      return idMatches || nameMatches;
    };

    const filterArrayKey = (key: string) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          localStorage.setItem(
            key,
            JSON.stringify(parsed.filter((item) => !belongsToPatient(item)))
          );
        }
      } catch (error) {
        console.error(`Could not clean ${key}:`, error);
      }
    };

    const cleanArrayOrPatientMap = (key: string) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          localStorage.setItem(
            key,
            JSON.stringify(parsed.filter((item) => !belongsToPatient(item)))
          );
          return;
        }

        if (parsed && typeof parsed === "object") {
          const map = parsed as Record<string, unknown>;
          delete map[patientUuid];
          delete map[compatibilityId];

          Object.keys(map).forEach((keyName) => {
            const value = map[keyName];
            if (Array.isArray(value)) {
              map[keyName] = value.filter((item) => !belongsToPatient(item));
            }
          });

          localStorage.setItem(key, JSON.stringify(map));
        }
      } catch (error) {
        console.error(`Could not clean ${key}:`, error);
      }
    };

    const cleanSingleRecordKey = (key: string) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        if (belongsToPatient(parsed)) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error(`Could not clean ${key}:`, error);
      }
    };

    const storedPatients = localStorage.getItem("dermisPatients");
    if (storedPatients) {
      try {
        const parsedPatients = JSON.parse(storedPatients) as Patient[];
        if (Array.isArray(parsedPatients)) {
          localStorage.setItem(
            "dermisPatients",
            JSON.stringify(
              parsedPatients.filter(
                (item) => String(item.id) !== patientUuid
              )
            )
          );
        }
      } catch (error) {
        console.error("Could not clean patient directory:", error);
      }
    }

    cleanSingleRecordKey("dermisSelectedPatient");
    cleanSingleRecordKey("dermisLatestAnalysis");
    cleanSingleRecordKey("dermisSelectedAnalysis");
    cleanSingleRecordKey("dermisSelectedProgressReport");
    cleanSingleRecordKey("dermisTreatmentPlan");
    cleanSingleRecordKey("dermisFollowUpSource");
    cleanSingleRecordKey("dermisFollowUpBooking");

    filterArrayKey("dermisAppointments");
    filterArrayKey("dermisTreatmentHistory");
    filterArrayKey("dermisFollowUps");

    cleanArrayOrPatientMap("dermisTreatmentPlans");
    cleanArrayOrPatientMap("dermisAnalysisHistory");
    cleanArrayOrPatientMap("dermisConsultations");
    cleanArrayOrPatientMap("dermisClinicalProfiles");
    cleanArrayOrPatientMap("dermisProgressReports");

    const progressReportPatientId = localStorage.getItem(
      "dermisProgressReportPatientId"
    );
    if (
      progressReportPatientId === patientUuid ||
      progressReportPatientId === compatibilityId
    ) {
      localStorage.removeItem("dermisProgressReportPatientId");
    }
  };

  const deletePatientPermanently = async () => {
    if (deleteConfirmation.trim() !== patient.name) return;
    if (deletingPatient) return;

    setDeletingPatient(true);
    setDeletePatientError("");

    try {
      const supabase = createClient();

      const { data: planRows, error: planLookupError } = await supabase
        .from("treatment_plans")
        .select("id")
        .eq("patient_id", patient.id);

      if (planLookupError) throw planLookupError;

      const treatmentPlanIds = (planRows || []).map((row) => row.id);

      const patientLinkedTables = [
        "follow_ups",
        "progress_reports",
        "appointments",
      ] as const;

      for (const table of patientLinkedTables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("patient_id", patient.id);

        if (error) throw error;
      }

      if (treatmentPlanIds.length > 0) {
        const { error: planItemsError } = await supabase
          .from("treatment_plan_items")
          .delete()
          .in("treatment_plan_id", treatmentPlanIds);

        if (planItemsError) throw planItemsError;
      }

      const { error: treatmentPlansError } = await supabase
        .from("treatment_plans")
        .delete()
        .eq("patient_id", patient.id);

      if (treatmentPlansError) throw treatmentPlansError;

      const remainingPatientLinkedTables = [
        "skin_analyses",
        "consultations",
      ] as const;

      for (const table of remainingPatientLinkedTables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("patient_id", patient.id);

        if (error) throw error;
      }

      const { data: deletedPatient, error: patientDeleteError } = await supabase
        .from("patients")
        .delete()
        .eq("id", patient.id)
        .select("id")
        .maybeSingle();

      if (patientDeleteError) throw patientDeleteError;

      if (!deletedPatient) {
        throw new Error(
          "No patient row was deleted. Check your clinic permissions and try again."
        );
      }

      removePatientFromLocalCache();
      window.location.href = "/patients";
    } catch (error) {
      console.error("Could not delete patient:", error);
      setDeletePatientError(
        error instanceof Error
          ? error.message
          : "The patient could not be deleted. Please try again."
      );
      setDeletingPatient(false);
    }
  };

  const saveConsultation =
    () => {
      if (
        !selectedPractitioner ||
        !consentGiven
      ) {
        return;
      }

      const newConsultation: ConsultationRecord =
        {
          id: Date.now(),
          patientId:
            getCompatibilityPatientId(patient),
          date:
            new Date().toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            ),
          allergies:
            allergies.trim(),
          medications:
            medications.trim(),
          pregnancyStatus,
          previousTreatments:
            previousTreatments.trim(),
          contraindications:
            contraindications.trim(),
          medicalHistory:
            medicalHistory.trim(),
          consentGiven,
          practitionerNotes:
            practitionerNotes.trim(),
          practitioner:
            selectedPractitioner?.name || "",
          practitionerId:
            selectedPractitioner?.id,
        };

      let consultationsByPatient: Record<
        string,
        ConsultationRecord[]
      > = {};

      const storedConsultations =
        localStorage.getItem(
          "dermisConsultations"
        );

      if (storedConsultations) {
        try {
          consultationsByPatient =
            JSON.parse(
              storedConsultations
            );
        } catch (error) {
          console.error(
            "Could not read consultations:",
            error
          );
        }
      }

      const currentConsultations =
        consultationsByPatient[
          String(getCompatibilityPatientId(patient))
        ] || [];

      const updatedConsultations =
        [
          newConsultation,
          ...currentConsultations,
        ];

      consultationsByPatient[
        String(getCompatibilityPatientId(patient))
      ] =
        updatedConsultations;

      localStorage.setItem(
        "dermisConsultations",
        JSON.stringify(
          consultationsByPatient
        )
      );

      setConsultations(
        updatedConsultations
      );

      setConsultationSaved(
        true
      );

      window.setTimeout(
        () => {
          setConsultationSaved(
            false
          );
        },
        2500
      );
    };

  if (!patientResolved) {
    return (
      <main className="min-h-screen bg-[#F4F6F3] text-[#172019]">
        <div className="flex min-h-screen">
          <Sidebar activePage="Patients" />
          <section className="flex min-w-0 flex-1 items-center justify-center">
            <div className="rounded-2xl border border-[#E4E8E2] bg-white px-6 py-5 text-sm font-medium text-[#667168]">
              Loading patient…
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F6F3] text-[#172019]">

      <div className="flex min-h-screen">

        <Sidebar activePage="Patients" />

        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E4E8E2] bg-[#FCFDFC]/95 px-6 py-4 backdrop-blur-xl lg:px-10">

            <div className="flex items-center gap-3">

              <a
                href="/patients"
                className="text-[11px] font-medium text-[#8B948C] transition hover:text-[#24402F]"
              >
                Patients
              </a>

              <span className="text-[#C8CDC7]">
                /
              </span>

              <span className="text-[11px] font-semibold text-[#2C352E]">
                {patient.name}
              </span>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D6E0D6] bg-[#EAF0EA] text-[10px] font-semibold text-[#486151] shadow-[0_4px_14px_rgba(31,56,39,0.06)]">
              {initials}
            </div>

          </header>

          {/* CONTENT */}
          <div className="mx-auto w-full max-w-[1520px] p-6 lg:px-10 lg:py-9">

            {/* PATIENT HEADER */}
            <div className="relative overflow-hidden rounded-[26px] border border-[#DFE5DE] bg-[#FEFFFD] p-6 shadow-[0_16px_50px_rgba(28,44,33,0.05)] lg:p-7">

              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

                <div className="flex items-center gap-5">

                  <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-full border border-[#D5E1D5] bg-[#E9F0E9] text-[16px] font-semibold tracking-[-0.02em] text-[#496050] shadow-[inset_0_0_0_6px_#F8FBF8]">
                    {initials}
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-3">

                      <h1 className="text-[30px] font-semibold tracking-[-0.05em] text-[#1C261F]">
                        {patient.name}
                      </h1>

                      <span
                        className={`rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${
                          patient.status ===
                          "Active"
                            ? "border border-[#D6E3D4] bg-[#EDF5EC] text-[#4F6B54]"
                            : "border border-[#E4E6E1] bg-[#F4F5F2] text-[#737B74]"
                        }`}
                      >
                        {patient.status}
                      </span>

                    </div>

                    <p className="mt-2 text-[12px] font-medium text-[#626D65]">
                      {patient.email}
                    </p>

                    <p className="mt-1.5 text-[10px] text-[#929A93]">
                      {patient.age} years old ·{" "}
                      {patient.analyses} analyses
                    </p>

                  </div>

                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmation("");
                      setDeletePatientError("");
                      setShowDeletePatient(true);
                    }}
                    className="flex items-center gap-2 rounded-[12px] border border-[#E8D9D6] bg-white px-4 py-3 text-[12px] font-semibold text-[#9B5148] shadow-[0_4px_14px_rgba(31,56,39,0.03)] transition hover:-translate-y-px hover:bg-[#FCF6F5] hover:text-[#7E3E37]"
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                    Delete Patient
                  </button>

                  <button
                    type="button"
                    onClick={
                      openEditPatient
                    }
                    className="rounded-[12px] border border-[#DCE2DC] bg-white px-4 py-3 text-[12px] font-semibold text-[#58635B] shadow-[0_4px_14px_rgba(31,56,39,0.03)] transition hover:-translate-y-px hover:bg-[#F6F9F6] hover:text-[#294333]"
                  >
                    Edit Patient
                  </button>

                  <button
                    type="button"
                    onClick={
                      startNewAnalysis
                    }
                    className="rounded-[12px] bg-[#24402F] px-4 py-3 text-[12px] font-semibold text-white shadow-[0_10px_28px_rgba(36,64,47,0.18)] transition hover:-translate-y-px hover:bg-[#1B3325]"
                  >
                    + New Analysis
                  </button>

                </div>

              </div>

              {/* TABS */}
              <div className="mt-7 flex gap-1 overflow-x-auto border-t border-[#ECEFEB] pt-4">

                {tabs.map(
                  (tab) => (

                    <button
                      key={tab}
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          tab
                        )
                      }
                      className={`whitespace-nowrap rounded-[11px] px-3.5 py-2.5 text-[11px] font-medium transition ${
                        activeTab ===
                        tab
                          ? "bg-[#E9F1E9] text-[#294333] shadow-[inset_0_0_0_1px_#D6E2D6]"
                          : "text-[#7F8981] hover:bg-[#F4F7F3] hover:text-[#374239]"
                      }`}
                    >
                      {tab}
                    </button>

                  )
                )}

              </div>

            </div>

            {/* DELETE PATIENT CONFIRMATION */}
            {showDeletePatient && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172019]/35 px-4 backdrop-blur-[2px]">
                <div className="w-full max-w-[520px] rounded-[22px] border border-[#E7DEDB] bg-[#FEFFFD] p-6 shadow-[0_24px_80px_rgba(23,32,25,0.18)]">
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ECD8D4] bg-[#FCF3F1] text-[#9B5148]">
                        <Trash2 size={18} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#A6756F]">
                          Permanent deletion
                        </p>
                        <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-[#1F2922]">
                          Delete {patient.name}?
                        </h2>
                        <p className="mt-2 text-xs leading-5 text-[#78827A]">
                          This permanently removes the patient and linked clinical records from this clinic. This action cannot be undone.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={closeDeletePatient}
                      disabled={deletingPatient}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E1E6E0] text-[#667068] transition hover:bg-[#F5F8F4] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Close delete patient confirmation"
                    >
                      <X size={16} strokeWidth={1.7} />
                    </button>
                  </div>

                  <div className="mt-6 rounded-[14px] border border-[#EEE4E1] bg-[#FCF8F7] p-4">
                    <p className="text-[11px] leading-5 text-[#79645F]">
                      To confirm, type <span className="font-semibold text-[#5F4540]">{patient.name}</span> below.
                    </p>

                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(event) => {
                        setDeleteConfirmation(event.target.value);
                        setDeletePatientError("");
                      }}
                      disabled={deletingPatient}
                      placeholder={patient.name}
                      className="mt-3 w-full rounded-[12px] border border-[#E5D7D3] bg-white px-4 py-3 text-sm text-[#263029] outline-none transition focus:border-[#B98A82] focus:shadow-[0_0_0_3px_rgba(155,81,72,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  {deletePatientError && (
                    <div className="mt-4 rounded-[12px] border border-[#EBCFCB] bg-[#FFF7F5] px-4 py-3 text-[11px] leading-5 text-[#93493F]">
                      {deletePatientError}
                    </div>
                  )}

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeDeletePatient}
                      disabled={deletingPatient}
                      className="rounded-[12px] border border-[#DDE3DD] bg-white px-5 py-3 text-[12px] font-semibold text-[#59645C] transition hover:bg-[#F6F8F5] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => void deletePatientPermanently()}
                      disabled={
                        deletingPatient ||
                        deleteConfirmation.trim() !== patient.name
                      }
                      className={`flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-[12px] font-semibold transition ${
                        !deletingPatient &&
                        deleteConfirmation.trim() === patient.name
                          ? "bg-[#93493F] text-white shadow-[0_8px_22px_rgba(147,73,63,0.16)] hover:bg-[#7D3C34]"
                          : "cursor-not-allowed bg-[#E7E3E0] text-[#A59C98]"
                      }`}
                    >
                      <Trash2 size={14} strokeWidth={1.8} />
                      {deletingPatient ? "Deleting…" : "Delete permanently"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EDIT PATIENT */}
            {showEditPatient && (

              <div className="mt-6 rounded-[22px] border border-[#E1E6E0] bg-[#FEFFFD] shadow-[0_10px_34px_rgba(28,44,33,0.035)] p-6">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-sm text-[#667068]">
                      Patient Management
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      Edit Patient
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-[#929A93]">
                      Update the patient record. Changes are saved across the prototype.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      closeEditPatient
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E1E6E0] text-[#667068] hover:bg-[#F5F8F4]"
                    aria-label="Close patient editor"
                  >
                    <X
                      size={16}
                      strokeWidth={1.7}
                    />
                  </button>

                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">

                  <EditPatientField
                    label="Full name"
                    value={
                      editPatient.name
                    }
                    onChange={(value) =>
                      updateEditPatientField(
                        "name",
                        value
                      )
                    }
                    placeholder="Patient name"
                  />

                  <EditPatientField
                    label="Email address"
                    value={
                      editPatient.email
                    }
                    onChange={(value) =>
                      updateEditPatientField(
                        "email",
                        value
                      )
                    }
                    placeholder="patient@email.com"
                    type="email"
                  />

                  <EditPatientField
                    label="Phone number"
                    value={
                      editPatient.phone
                    }
                    onChange={(value) =>
                      updateEditPatientField(
                        "phone",
                        value
                      )
                    }
                    placeholder="+44..."
                    type="tel"
                  />

                  <div>

                    <label className="text-xs font-medium text-[#667068]">
                      Age
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={
                        editPatient.age
                      }
                      onChange={(event) =>
                        updateEditPatientField(
                          "age",
                          Number(
                            event.target.value
                          )
                        )
                      }
                      className="mt-2 w-full rounded-[12px] border border-[#E0E5DF] bg-[#F8FAF7] px-4 py-3 text-sm outline-none transition focus:border-[#829A87] focus:bg-white focus:shadow-[0_0_0_3px_rgba(77,112,83,0.07)]"
                    />

                  </div>

                  <div>

                    <label className="text-xs font-medium text-[#667068]">
                      Primary Skin Concern
                    </label>

                    <select
                      value={
                        editPatient.concern
                      }
                      onChange={(event) =>
                        updateEditPatientField(
                          "concern",
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-[12px] border border-[#E0E5DF] bg-[#F8FAF7] px-4 py-3 text-sm outline-none transition focus:border-[#829A87] focus:bg-white focus:shadow-[0_0_0_3px_rgba(77,112,83,0.07)]"
                    >

                      <option value="Acne">
                        Acne
                      </option>

                      <option value="Acne & Pigmentation">
                        Acne & Pigmentation
                      </option>

                      <option value="Hyperpigmentation">
                        Hyperpigmentation
                      </option>

                      <option value="Fine lines">
                        Fine lines
                      </option>

                      <option value="Skin Ageing">
                        Skin Ageing
                      </option>

                      <option value="Rosacea">
                        Rosacea
                      </option>

                      <option value="Dryness">
                        Dryness
                      </option>

                      <option value="Uneven texture">
                        Uneven texture
                      </option>

                      <option value="Redness">
                        Redness
                      </option>

                      {![
                        "Acne",
                        "Acne & Pigmentation",
                        "Hyperpigmentation",
                        "Fine Lines",
                        "Skin Ageing",
                        "Rosacea",
                        "Dryness",
                        "Uneven Texture",
                        "Redness",
                      ].includes(
                        editPatient.concern
                      ) && (
                        <option
                          value={
                            editPatient.concern
                          }
                        >
                          {
                            editPatient.concern
                          }
                        </option>
                      )}

                    </select>

                  </div>

                  <div>

                    <label className="text-xs font-medium text-[#667068]">
                      Patient status
                    </label>

                    <select
                      value={
                        editPatient.status
                      }
                      onChange={(event) =>
                        updateEditPatientField(
                          "status",
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-[12px] border border-[#E0E5DF] bg-[#F8FAF7] px-4 py-3 text-sm outline-none transition focus:border-[#829A87] focus:bg-white focus:shadow-[0_0_0_3px_rgba(77,112,83,0.07)]"
                    >

                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>

                    </select>

                  </div>

                </div>

                <div className="mt-6 rounded-xl bg-[#F5F8F4] p-5">

                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#929A93]">
                    Patient preview
                  </p>

                  <div className="mt-4 flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF0EA] text-xs font-medium">
                      {editPatient.name
                        .split(" ")
                        .filter(Boolean)
                        .map(
                          (word) =>
                            word[0]
                        )
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() ||
                        "PT"}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold">
                        {editPatient.name ||
                          "Patient name"}
                      </p>

                      <p className="mt-1 text-xs text-[#667068]">
                        {editPatient.concern ||
                          "No concern"}
                        {" · "}
                        {
                          editPatient.status
                        }
                      </p>

                    </div>

                  </div>

                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closeEditPatient
                    }
                    className="rounded-xl border border-[#E1E6E0] px-5 py-3 text-sm font-medium hover:bg-[#F5F8F4]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      saveEditedPatient
                    }
                    disabled={
                      !editPatient.name.trim() ||
                      !editPatient.email.trim() ||
                      !editPatient.phone.trim() ||
                      !editPatient.concern.trim() ||
                      editPatient.age < 1
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
                      editPatient.name.trim() &&
                      editPatient.email.trim() &&
                      editPatient.phone.trim() &&
                      editPatient.concern.trim() &&
                      editPatient.age > 0
                        ? "bg-[#24402F] text-white shadow-[0_8px_22px_rgba(36,64,47,0.14)] hover:bg-[#1B3325]"
                        : "cursor-not-allowed bg-[#DDDCD6] text-[#929A93]"
                    }`}
                  >
                    {patientSaved ? (
                      <Check
                        size={15}
                        strokeWidth={2}
                      />
                    ) : (
                      <Save
                        size={15}
                        strokeWidth={1.8}
                      />
                    )}

                    {patientSaved
                      ? "Patient saved"
                      : "Save Patient"}
                  </button>

                </div>

              </div>

            )}

            {/* OVERVIEW */}
            {activeTab ===
              "Overview" && (

              <div className="mt-6">

                {currentFollowUp && (

                  <div className="mb-6 overflow-hidden rounded-2xl border border-[#D9DDD4] bg-white">

                    <div className="flex flex-col justify-between gap-5 p-6 lg:flex-row lg:items-center">

                      <div className="flex min-w-0 items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF1EB] text-[#62715D]">
                          <CalendarDays size={19} strokeWidth={1.7} />
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="text-sm font-semibold">
                              Patient Follow-up
                            </p>

                            <span
                              className={`rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${
                                currentFollowUp.status === "Due"
                                  ? "bg-[#F5F0E7] text-[#806E52]"
                                  : currentFollowUp.status === "Scheduled"
                                    ? "border border-[#D6E3D4] bg-[#EDF5EC] text-[#4F6B54]"
                                    : "bg-[#EEF0F5] text-[#667085]"
                              }`}
                            >
                              {currentFollowUp.status === "Due"
                                ? "Follow-up Due"
                                : currentFollowUp.status === "Scheduled"
                                  ? "Follow-up Scheduled"
                                  : "Analysis Started"}
                            </span>

                          </div>

                          <p className="mt-2 text-sm text-[#55544F]">
                            Follow-up after{" "}
                            <span className="font-medium text-[#171717]">
                              {currentFollowUp.treatment}
                            </span>
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#929A93]">
                            Treatment completed{" "}
                            {currentFollowUp.completedDate}
                            {currentFollowUp.practitioner
                              ? ` · ${currentFollowUp.practitioner}`
                              : ""}
                          </p>

                        </div>

                      </div>

                      <div className="flex flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            bookPatientFollowUp(currentFollowUp)
                          }
                          className="flex items-center gap-2 rounded-xl border border-[#E1E6E0] bg-white px-4 py-3 text-xs font-medium transition hover:bg-[#F5F8F4]"
                        >
                          <CalendarDays size={14} strokeWidth={1.7} />
                          Book Follow-up
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            startFollowUpAnalysis(currentFollowUp)
                          }
                          className="flex items-center gap-2 rounded-xl bg-[#171717] px-4 py-3 text-xs font-medium text-white transition hover:bg-[#333]"
                        >
                          <Activity size={14} strokeWidth={1.7} />
                          Start Analysis
                        </button>

                      </div>

                    </div>

                  </div>

                )}

                <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">

                {/* SCORE */}
                <div className="relative overflow-hidden rounded-[26px] border border-[#DFE5DE] bg-[#FEFFFD] p-6 shadow-[0_16px_50px_rgba(28,44,33,0.05)] lg:p-7">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm text-[#667068]">
                        Overall Skin Score
                      </p>

                      <div className="mt-3 flex items-end gap-3">

                        <span className="text-5xl font-semibold tracking-[-0.06em]">
                          {
                            clinicalProfile.score
                          }
                        </span>

                        <span className="mb-2 text-sm text-[#667068]">
                          / 100
                        </span>

                      </div>

                    </div>

                    <span className="rounded-full bg-[#E8EEE5] px-3 py-1 text-xs font-medium text-[#62715D]">
                      {
                        clinicalProfile.change
                      }
                    </span>

                  </div>

                  <div className="mt-7 h-3 overflow-hidden rounded-full bg-[#ECEBE6]">

                    <div
                      className="h-full rounded-full bg-[#7D8977]"
                      style={{
                        width: `${clinicalProfile.score}%`,
                      }}
                    />

                  </div>

                  {clinicalProfile.metrics.length >
                  0 ? (

                    <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">

                      {clinicalProfile.metrics.map(
                        (metric) => (

                          <div
                            key={
                              metric.label
                            }
                            className="rounded-xl border border-[#EAEEEA] p-4"
                          >

                            <p className="text-[10px] text-[#929A93]">
                              {
                                metric.label
                              }
                            </p>

                            <p className="mt-2 text-xl font-semibold">
                              {
                                metric.value
                              }
                            </p>

                            <p className="mt-1 text-[10px] text-[#71806C]">
                              {
                                metric.status
                              }
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <button
                      type="button"
                      onClick={
                        startNewAnalysis
                      }
                      className="mt-6 rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white hover:bg-[#333]"
                    >
                      Run first skin analysis →
                    </button>

                  )}

                </div>

                {/* DETAILS */}
                <div className="relative overflow-hidden rounded-[26px] border border-[#DFE5DE] bg-[#FEFFFD] p-6 shadow-[0_16px_50px_rgba(28,44,33,0.05)] lg:p-7">

                  <h2 className="text-lg font-semibold">
                    Patient details
                  </h2>

                  <div className="mt-6 space-y-5">

                    <Detail
                      label="Age"
                      value={`${patient.age} years`}
                    />

                    <Detail
                      label="Phone"
                      value={
                        patient.phone
                      }
                    />

                    <Detail
                      label="Primary Concern"
                      value={
                        patient.concern
                      }
                    />

                    <Detail
                      label="Skin type"
                      value={
                        clinicalProfile.skinType
                      }
                    />

                    <Detail
                      label="Last Visit"
                      value={
                        patient.lastVisit
                      }
                    />

                    <Detail
                      label="Consultations"
                      value={String(
                        consultations.length
                      )}
                    />

                  </div>

                </div>

                {/* CONSULTATION SUMMARY */}
                <div className="relative overflow-hidden rounded-[26px] border border-[#DFE5DE] bg-[#FEFFFD] p-6 shadow-[0_16px_50px_rgba(28,44,33,0.05)] lg:p-7">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EFEA]">

                      <FileText
                        size={18}
                        strokeWidth={1.7}
                      />

                    </div>

                    <div>

                      <p className="text-xs text-[#929A93]">
                        Clinical Intake
                      </p>

                      <h3 className="mt-1 text-lg font-semibold">
                        Consultation
                      </h3>

                    </div>

                  </div>

                  {latestConsultation ? (

                    <div className="mt-5">

                      <div className="grid gap-3 sm:grid-cols-2">

                        <MiniInfo
                          label="Last consultation"
                          value={
                            latestConsultation.date
                          }
                        />

                        <MiniInfo
                          label="Practitioner"
                          value={
                            latestConsultation.practitioner ||
                            "Not recorded"
                          }
                        />

                        <MiniInfo
                          label="Consent"
                          value={
                            latestConsultation.consentGiven
                              ? "Recorded"
                              : "Not recorded"
                          }
                        />

                        <MiniInfo
                          label="Allergies"
                          value={
                            latestConsultation.allergies ||
                            "None Recorded"
                          }
                        />

                        <MiniInfo
                          label="Contraindications"
                          value={
                            latestConsultation.contraindications ||
                            "None Recorded"
                          }
                        />

                      </div>

                    </div>

                  ) : (

                    <p className="mt-5 text-xs leading-5 text-[#667068]">
                      No consultation intake has
                      been saved for this patient.
                    </p>

                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        "Consultation"
                      )
                    }
                    className="mt-5 w-full rounded-xl border border-[#E1E6E0] px-5 py-3 text-sm font-medium hover:bg-[#F5F8F4]"
                  >
                    Open Consultation →
                  </button>

                </div>

                {/* TREATMENTS */}
                <div className="relative overflow-hidden rounded-[26px] border border-[#DFE5DE] bg-[#FEFFFD] p-6 shadow-[0_16px_50px_rgba(28,44,33,0.05)] lg:p-7">

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#929A93]">
                        Current Treatment Plan
                      </p>

                      <h3 className="mt-1 text-lg font-semibold">
                        Saved Treatment Plans
                      </h3>
                    </div>

                    <span className="rounded-full bg-[#F1F0EB] px-3 py-1 text-[10px] font-medium text-[#667068]">
                      {activeTreatmentPlans.length} active
                    </span>
                  </div>

                  {activeTreatmentPlans.length > 0 ? (

                    <div className="mt-5 space-y-3">

                      {activeTreatmentPlans.map(
                        (plan) => (

                          <div
                            key={plan.id}
                            className="rounded-xl bg-[#F5F8F4] p-4"
                          >

                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                              <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                  <p className="text-sm font-medium">
                                    {plan.treatment}
                                  </p>

                                  <span className="rounded-full bg-[#E8EEE5] px-2.5 py-1 text-[9px] font-medium text-[#62715D]">
                                    Active
                                  </span>

                                  {plan.clinicalReviewRequired &&
                                    !plan.clinicalReviewAcknowledged && (
                                      <span className="rounded-full bg-[#F3EAEA] px-2.5 py-1 text-[9px] font-medium text-[#8A6666]">
                                        Review required
                                      </span>
                                    )}

                                  {plan.clinicalReviewRequired &&
                                    plan.clinicalReviewAcknowledged && (
                                      <span className="rounded-full bg-[#F0F3EE] px-2.5 py-1 text-[9px] font-medium text-[#62715D]">
                                        Review acknowledged
                                      </span>
                                    )}

                                </div>

                                <p className="mt-2 text-xs leading-5 text-[#667068]">
                                  {plan.notes ||
                                    "Treatment plan saved from the Treatments workspace."}
                                </p>

                                {plan.createdAt && (
                                  <p className="mt-2 text-[10px] text-[#929A93]">
                                    Created {plan.createdAt}
                                  </p>
                                )}

                              </div>

                              <div className="grid shrink-0 grid-cols-2 gap-2 sm:min-w-[180px]">

                                <div className="rounded-lg bg-white px-3 py-2.5 text-center">
                                  <p className="text-[9px] uppercase tracking-[0.1em] text-[#929A93]">
                                    Duration
                                  </p>
                                  <p className="mt-1 text-xs font-semibold tabular-nums">
                                    {plan.duration || "—"}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-white px-3 py-2.5 text-center">
                                  <p className="text-[9px] uppercase tracking-[0.1em] text-[#929A93]">
                                    Price
                                  </p>
                                  <p className="mt-1 text-xs font-semibold tabular-nums">
                                    {plan.price || "—"}
                                  </p>
                                </div>

                              </div>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="mt-5 rounded-xl bg-[#F5F8F4] p-5">

                      <p className="text-sm font-medium">
                        No active treatment plan
                      </p>

                      <p className="mt-2 text-xs leading-5 text-[#929A93]">
                        Create or save a treatment plan from the Treatments workspace and it will appear here automatically.
                      </p>

                    </div>

                  )}

                  {completedTreatmentPlans.length > 0 && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E5E4DE] px-4 py-3">

                      <div>
                        <p className="text-xs font-medium">
                          Completed plans
                        </p>
                        <p className="mt-1 text-[10px] text-[#929A93]">
                          Historical plans are available in the Treatments tab.
                        </p>
                      </div>

                      <span className="text-sm font-semibold tabular-nums">
                        {completedTreatmentPlans.length}
                      </span>

                    </div>
                  )}

                  <button
                    type="button"
                    onClick={
                      openTreatments
                    }
                    className="mt-5 w-full rounded-xl bg-[#171717] py-3 text-xs font-medium text-white hover:bg-[#333]"
                  >
                    Manage Treatment Plans →
                  </button>

                </div>

              </div>

              </div>
            )}

            {/* SKIN PROFILE */}
            {activeTab ===
              "Skin Profile" && (

              <div className="mt-6 grid gap-6 lg:grid-cols-2">

                <TabCard
                  icon={
                    <UserRound
                      size={20}
                      strokeWidth={1.7}
                    />
                  }
                  eyebrow="Skin Type"
                  title={
                    clinicalProfile.skinType
                  }
                  description={`Recorded skin profile for ${patient.name}.`}
                />

                <TabCard
                  icon={
                    <Activity
                      size={20}
                      strokeWidth={1.7}
                    />
                  }
                  eyebrow="Overall Skin Score"
                  title={`${clinicalProfile.score} / 100`}
                  description={
                    clinicalProfile.score >
                    0
                      ? `Latest recorded assessment for ${patient.name}.`
                      : "No Skin Assessment has been completed yet."
                  }
                />

                {clinicalProfile.metrics.map(
                  (metric) => (

                    <div
                      key={
                        metric.label
                      }
                      className="rounded-[22px] border border-[#E1E6E0] bg-[#FEFFFD] shadow-[0_10px_34px_rgba(28,44,33,0.035)] p-6"
                    >

                      <div className="flex items-center justify-between">

                        <p className="text-sm font-medium">
                          {
                            metric.label
                          }
                        </p>

                        <span className="text-[21px] font-semibold tracking-[-0.035em] text-[#202A22]">
                          {
                            metric.value
                          }
                        </span>

                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#ECEBE6]">

                        <div
                          className="h-full rounded-full bg-[#7D8977]"
                          style={{
                            width: `${metric.value}%`,
                          }}
                        />

                      </div>

                      <p className="mt-3 text-xs text-[#71806C]">
                        {
                          metric.status
                        }
                      </p>

                    </div>

                  )
                )}

              </div>
            )}

            {/* ANALYSIS HISTORY */}
            {activeTab === "Analysis History" && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <AnalysisSummaryCard
                    label="Saved analyses"
                    value={String(analysisHistory.length)}
                    detail="Recorded for this patient"
                  />
                  <AnalysisSummaryCard
                    label="Latest skin score"
                    value={
                      latestSavedAnalysis
                        ? `${getAnalysisScore(latestSavedAnalysis)} / 100`
                        : "No data"
                    }
                    detail={
                      latestSavedAnalysis
                        ? getAnalysisDate(latestSavedAnalysis)
                        : "Run the first analysis"
                    }
                  />
                  <AnalysisSummaryCard
                    label="Score change"
                    value={
                      latestSavedAnalysis && previousSavedAnalysis
                        ? formatScoreChange(
                            getAnalysisScore(latestSavedAnalysis) -
                              getAnalysisScore(previousSavedAnalysis)
                          )
                        : "—"
                    }
                    detail={
                      latestSavedAnalysis && previousSavedAnalysis
                        ? "Compared with previous analysis"
                        : "Two analyses required"
                    }
                  />
                </div>

                <div className="rounded-[22px] border border-[#E1E6E0] bg-[#FEFFFD] shadow-[0_10px_34px_rgba(28,44,33,0.035)]">
                  <div className="flex flex-col justify-between gap-4 border-b border-[#EAEEEA] px-6 py-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm text-[#667068]">Skin Intelligence</p>
                      <h2 className="mt-1 text-lg font-semibold">Analysis History</h2>
                      <p className="mt-2 text-xs text-[#929A93]">
                        Saved AI skin analyses for this patient.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {analysisHistory.length >= 2 && (
                        <button
                          type="button"
                          onClick={compareSavedAnalyses}
                          className="rounded-xl border border-[#E1E6E0] px-4 py-2.5 text-xs font-medium hover:bg-[#F5F8F4]"
                        >
                          Compare analyses →
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={startNewAnalysis}
                        className="rounded-xl bg-[#171717] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#333]"
                      >
                        + New analysis
                      </button>
                    </div>
                  </div>

                  {analysisHistory.length > 0 ? (
                    <div className="divide-y divide-[#F0EFEA]">
                      {analysisHistory.map((analysis, index) => {
                        const metrics = getAnalysisMetrics(analysis);
                        const image = getAnalysisImage(analysis);
                        const score = getAnalysisScore(analysis);
                        const previous = analysisHistory[index + 1];
                        const change = previous
                          ? score - getAnalysisScore(previous)
                          : null;

                        return (
                          <div
                            key={String(
                              analysis.id ?? `${getAnalysisDate(analysis)}-${index}`
                            )}
                            className="px-6 py-6"
                          >
                            <div className="grid gap-5 lg:grid-cols-[120px_minmax(0,1fr)_auto] lg:items-center">
                              <div className="overflow-hidden rounded-xl border border-[#EAEEEA] bg-[#F5F8F4]">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={`${patient.name} analysis`}
                                    className="h-[110px] w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-[110px] items-center justify-center">
                                    <Images
                                      size={22}
                                      strokeWidth={1.6}
                                      className="text-[#929A93]"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold">AI Skin Analysis</p>
                                  {index === 0 && (
                                    <span className="rounded-full bg-[#E8EEE5] px-3 py-1 text-[9px] font-medium text-[#62715D]">
                                      Latest
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-[#929A93]">
                                  <span className="flex items-center gap-1.5">
                                    <CalendarDays size={12} strokeWidth={1.7} />
                                    {getAnalysisDate(analysis)}
                                  </span>
                                  <span>{metrics.length} metrics recorded</span>
                                  {change !== null && (
                                    <span
                                      className={
                                        change > 0
                                          ? "text-[#62715D]"
                                          : change < 0
                                          ? "text-[#8A6666]"
                                          : "text-[#667068]"
                                      }
                                    >
                                      {formatScoreChange(change)} vs previous
                                    </span>
                                  )}
                                </div>

                                <p className="mt-3 max-w-2xl text-xs leading-5 text-[#667068]">
                                  {getAnalysisSummary(analysis, patient.concern)}
                                </p>

                                {metrics.length > 0 && (
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {metrics.slice(0, 5).map((metric, metricIndex) => (
                                      <span
                                        key={`${metric.label}-${metricIndex}`}
                                        className="rounded-full bg-[#F1F0EB] px-3 py-1.5 text-[9px] font-medium text-[#66655F]"
                                      >
                                        {metric.label} {metric.value}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                                <div className="min-w-[92px] rounded-xl bg-[#F5F8F4] px-4 py-3">
                                  <p className="text-[9px] uppercase tracking-[0.1em] text-[#929A93]">
                                    Skin score
                                  </p>
                                  <p className="mt-1 text-xl font-semibold">{score}</p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openSavedAnalysis(analysis)}
                                  className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-[#E1E6E0] px-4 py-2.5 text-xs font-medium hover:bg-[#F5F8F4]"
                                >
                                  Open analysis
                                  <ArrowRight size={13} strokeWidth={1.8} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-6 py-14 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0EFEA]">
                        <Activity size={19} strokeWidth={1.7} />
                      </div>
                      <p className="mt-4 text-sm font-medium">No saved analyses yet</p>
                      <p className="mt-2 text-xs text-[#929A93]">
                        Complete and save a skin analysis for this patient.
                      </p>
                      <button
                        type="button"
                        onClick={startNewAnalysis}
                        className="mt-5 rounded-xl bg-[#171717] px-5 py-3 text-xs font-medium text-white hover:bg-[#333]"
                      >
                        Run first analysis →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CONSULTATION */}
            {activeTab ===
              "Consultation" && (

              <div className="mt-6 space-y-6">

                {/* CONSULTATION STATUS */}
                <div className="relative overflow-hidden rounded-[26px] border border-[#DFE5DE] bg-[#FEFFFD] p-6 shadow-[0_16px_50px_rgba(28,44,33,0.05)] lg:p-7">

                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0EFEA]">

                        <ShieldCheck
                          size={20}
                          strokeWidth={1.7}
                        />

                      </div>

                      <div>

                        <p className="text-xs text-[#929A93]">
                          Patient safety
                        </p>

                        <h2 className="mt-1 text-lg font-semibold">
                          Consultation & intake
                        </h2>

                        <p className="mt-1 text-xs text-[#667068]">
                          Record relevant clinical
                          information before
                          treatment.
                        </p>

                      </div>

                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-medium ${
                        hasPotentialContraindication
                          ? "bg-[#F3EAEA] text-[#8A6666]"
                          : "bg-[#E8EEE5] text-[#62715D]"
                      }`}
                    >
                      {hasPotentialContraindication
                        ? "Review required"
                        : "No Flags Recorded"}
                    </span>

                  </div>

                </div>

                {/* FORM */}
                <div className="relative overflow-hidden rounded-[26px] border border-[#DFE5DE] bg-[#FEFFFD] p-6 shadow-[0_16px_50px_rgba(28,44,33,0.05)] lg:p-7">

                  <div className="grid gap-5 md:grid-cols-2">

                    <ConsultationField
                      label="Allergies"
                      value={
                        allergies
                      }
                      onChange={
                        setAllergies
                      }
                      placeholder="e.g. Latex, Penicillin, Adhesives"
                    />

                    <ConsultationField
                      label="Current medications"
                      value={
                        medications
                      }
                      onChange={
                        setMedications
                      }
                      placeholder="List Current Medication"
                    />

                    <div>

                      <label className="text-xs font-medium text-[#667068]">
                        Pregnancy / Breastfeeding
                      </label>

                      <select
                        value={
                          pregnancyStatus
                        }
                        onChange={(event) =>
                          setPregnancyStatus(
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-[12px] border border-[#E0E5DF] bg-[#F8FAF7] px-4 py-3 text-sm outline-none"
                      >
                        <option>
                          Not Applicable
                        </option>
                        <option>
                          Not pregnant / breastfeeding
                        </option>
                        <option>
                          Pregnant
                        </option>
                        <option>
                          Breastfeeding
                        </option>
                        <option>
                          Prefer not to say
                        </option>
                      </select>

                    </div>

                    <ConsultationField
                      label="Previous Aesthetic Treatments"
                      value={
                        previousTreatments
                      }
                      onChange={
                        setPreviousTreatments
                      }
                      placeholder="e.g. Peel, Microneedling, Laser"
                    />

                    <ConsultationField
                      label="Contraindications"
                      value={
                        contraindications
                      }
                      onChange={
                        setContraindications
                      }
                      placeholder="Known Contraindications Or Restrictions"
                    />

                    <ConsultationField
                      label="Relevant Medical History"
                      value={
                        medicalHistory
                      }
                      onChange={
                        setMedicalHistory
                      }
                      placeholder="Relevant Medical History"
                    />

                  </div>

                  {/* NOTES */}
                                    <div>
                    <label className="text-xs font-medium text-[#667068]">
                      Practitioner
                    </label>

                    <select
                      value={selectedPractitionerId}
                      onChange={(event) =>
                        setSelectedPractitionerId(
                          event.target.value
                            ? Number(event.target.value)
                            : ""
                        )
                      }
                      className="mt-2 w-full rounded-[12px] border border-[#E0E5DF] bg-[#F8FAF7] px-4 py-3 text-sm outline-none transition focus:border-[#829A87] focus:bg-white focus:shadow-[0_0_0_3px_rgba(77,112,83,0.07)]"
                    >
                      <option value="">
                        Select practitioner
                      </option>

                      {practitioners.map((practitioner) => (
                        <option
                          key={practitioner.id}
                          value={practitioner.id}
                        >
                          {practitioner.name} · {practitioner.role}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-[10px] leading-4 text-[#929A93]">
                      Active practitioners are loaded from Clinic Settings.
                    </p>
                  </div>

<div className="mt-5">

                    <label className="text-xs font-medium text-[#667068]">
                      Practitioner Notes
                    </label>

                    <textarea
                      rows={5}
                      value={
                        practitionerNotes
                      }
                      onChange={(event) =>
                        setPractitionerNotes(
                          event.target.value
                        )
                      }
                      placeholder="Add Consultation Notes, Observations Or Treatment Considerations..."
                      className="mt-2 w-full resize-none rounded-[12px] border border-[#E0E5DF] bg-[#F8FAF7] px-4 py-3 text-sm outline-none"
                    />

                  </div>

                  {/* CONSENT */}
                  <div className="mt-5 rounded-xl bg-[#F5F8F4] p-5">

                    <label className="flex cursor-pointer items-start gap-3">

                      <input
                        type="checkbox"
                        checked={
                          consentGiven
                        }
                        onChange={(event) =>
                          setConsentGiven(
                            event.target.checked
                          )
                        }
                        className="mt-1 h-4 w-4"
                      />

                      <div>

                        <p className="text-sm font-medium">
                          Patient Consent Recorded
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#667068]">
                          Confirm that the patient
                          has reviewed the relevant
                          consultation information
                          and consented to the
                          proposed treatment process.
                        </p>

                      </div>

                    </label>

                  </div>

                  {/* ACTION */}
                  <div className="mt-6">

                    {(!selectedPractitioner ||
                      !consentGiven) && (
                      <div className="mb-3 rounded-xl border border-[#E7DDD2] bg-[#FBF7F1] px-4 py-3">
                        <p className="text-xs font-medium text-[#7D6754]">
                          Complete the required consultation details before saving.
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-[#8F8174]">
                          {!selectedPractitioner &&
                          !consentGiven
                            ? "Select a practitioner and record patient consent."
                            : !selectedPractitioner
                            ? "Select the practitioner who performed this consultation."
                            : "Record patient consent to enable Save Consultation."}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end">

                      <button
                        type="button"
                        onClick={
                          saveConsultation
                        }
                        disabled={
                          !selectedPractitioner ||
                          !consentGiven
                        }
                        className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
                          !selectedPractitioner ||
                          !consentGiven
                            ? "cursor-not-allowed bg-[#D8D7D1] text-[#8C8B84]"
                            : "bg-[#24402F] text-white shadow-[0_8px_22px_rgba(36,64,47,0.14)] hover:bg-[#1B3325]"
                        }`}
                      >

                        {consultationSaved && (
                          <Check
                            size={15}
                            strokeWidth={2}
                          />
                        )}

                        {consultationSaved
                          ? "Consultation Saved"
                          : "Save Consultation"}

                      </button>

                    </div>

                  </div>

                </div>

                {/* CONSULTATION HISTORY */}
                <div className="rounded-[22px] border border-[#E1E6E0] bg-[#FEFFFD] shadow-[0_10px_34px_rgba(28,44,33,0.035)]">

                  <div className="border-b border-[#EAEEEA] px-6 py-5">

                    <p className="text-sm text-[#667068]">
                      Clinical record
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      Consultation History
                    </h3>

                  </div>

                  {consultations.length >
                  0 ? (

                    <div className="divide-y divide-[#F0EFEA]">

                      {consultations.map(
                        (
                          consultation
                        ) => (

                          <div
                            key={
                              consultation.id
                            }
                            className="px-6 py-5"
                          >

                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                              <div>

                                <p className="text-sm font-medium">
                                  Consultation
                                </p>

                                <p className="mt-1.5 text-[10px] text-[#929A93]">
                                  {
                                    consultation.date
                                  }
                                </p>

                              </div>

                              <span
                                className={`w-fit rounded-full px-3 py-1 text-[10px] font-medium ${
                                  consultation.consentGiven
                                    ? "border border-[#D6E3D4] bg-[#EDF5EC] text-[#4F6B54]"
                                    : "border border-[#E4E6E1] bg-[#F4F5F2] text-[#737B74]"
                                }`}
                              >
                                {consultation.consentGiven
                                  ? "Consent recorded"
                                  : "Consent not recorded"}
                              </span>

                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                              <MiniInfo
                                label="Allergies"
                                value={
                                  consultation.allergies ||
                                  "None Recorded"
                                }
                              />

                              <MiniInfo
                                label="Medications"
                                value={
                                  consultation.medications ||
                                  "None Recorded"
                                }
                              />

                              <MiniInfo
                                label="Contraindications"
                                value={
                                  consultation.contraindications ||
                                  "None Recorded"
                                }
                              />

                              <MiniInfo
                                label="Pregnancy status"
                                value={
                                  consultation.pregnancyStatus
                                }
                              />

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="px-6 py-12 text-center">

                      <p className="text-sm font-medium">
                        No consultations yet
                      </p>

                      <p className="mt-2 text-xs text-[#929A93]">
                        Save the first patient intake above.
                      </p>

                    </div>

                  )}

                </div>

              </div>
            )}

            {/* TREATMENTS */}
            {activeTab ===
              "Treatments" && (

              <div className="mt-6 space-y-6">

                {/* TREATMENT SUMMARY */}
                <div className="grid gap-4 md:grid-cols-3">
                  <TreatmentSummaryCard
                    label="Completed Treatments"
                    value={String(patientTreatmentHistory.length)}
                    detail={
                      patientTreatmentHistory.length === 1
                        ? "1 Recorded Treatment"
                        : `${patientTreatmentHistory.length} Recorded Treatments`
                    }
                  />

                  <TreatmentSummaryCard
                    label="Last treatment"
                    value={lastCompletedTreatment?.treatment || "None yet"}
                    detail={lastCompletedTreatment?.date || "No Completed Treatment"}
                  />

                  <TreatmentSummaryCard
                    label="Active Plans"
                    value={String(activeTreatmentPlans.length)}
                    detail={
                      completedTreatmentPlans.length > 0
                        ? `${completedTreatmentPlans.length} Completed Plan${completedTreatmentPlans.length === 1 ? "" : "s"}`
                        : "Treatment planning"
                    }
                  />
                </div>

                {/* ACTIVE TREATMENT PLANS */}
                <div className="rounded-[22px] border border-[#E1E6E0] bg-[#FEFFFD] shadow-[0_10px_34px_rgba(28,44,33,0.035)]">
                  <div className="flex flex-col justify-between gap-4 border-b border-[#EAEEEA] px-6 py-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EFEA]">
                        <ClipboardList size={19} strokeWidth={1.7} />
                      </div>
                      <div>
                        <p className="text-sm text-[#667068]">Treatment Management</p>
                        <h2 className="mt-1 text-lg font-semibold">Active Treatment Plans</h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={openTreatments}
                      className="rounded-xl bg-[#171717] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#333]"
                    >
                      Manage treatments →
                    </button>
                  </div>

                  {activeTreatmentPlans.length > 0 ? (
                    <div className="divide-y divide-[#F0EFEA]">
                      {activeTreatmentPlans.map((plan) => (
                        <div key={plan.id} className="px-6 py-5">
                          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold">{plan.treatment}</p>
                                <span className="rounded-full bg-[#E8EEE5] px-3 py-1 text-[10px] font-medium text-[#62715D]">
                                  Active
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-[#667068]">
                                {plan.notes || "Treatment plan recorded for this patient."}
                              </p>
                              {plan.createdAt && (
                                <p className="mt-2 text-[10px] text-[#929A93]">
                                  Created {plan.createdAt}
                                </p>
                              )}
                            </div>

                            <div className="flex shrink-0 gap-3 text-xs">
                              <div className="rounded-xl bg-[#F5F8F4] px-4 py-3">
                                <p className="text-[9px] uppercase tracking-[0.1em] text-[#929A93]">Duration</p>
                                <p className="mt-1 font-medium">{plan.duration}</p>
                              </div>
                              <div className="rounded-xl bg-[#F5F8F4] px-4 py-3">
                                <p className="text-[9px] uppercase tracking-[0.1em] text-[#929A93]">Price</p>
                                <p className="mt-1 font-medium">{plan.price}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-10 text-center">
                      <p className="text-sm font-medium">No Active Treatment Plans</p>
                      <p className="mt-2 text-xs text-[#929A93]">Create a treatment plan from the Treatments workspace.</p>
                    </div>
                  )}
                </div>

                {/* COMPLETED TREATMENT HISTORY */}
                <div className="rounded-[22px] border border-[#E1E6E0] bg-[#FEFFFD] shadow-[0_10px_34px_rgba(28,44,33,0.035)]">
                  <div className="border-b border-[#EAEEEA] px-6 py-5">
                    <p className="text-sm text-[#667068]">Clinical Record</p>
                    <h2 className="mt-1 text-lg font-semibold">Completed Treatment History</h2>
                    <p className="mt-2 text-xs text-[#929A93]">
                      Treatments appear here automatically when an appointment is marked completed.
                    </p>
                  </div>

                  {patientTreatmentHistory.length > 0 ? (
                    <div className="divide-y divide-[#F0EFEA]">
                      {patientTreatmentHistory.map((entry) => (
                        <div key={entry.id} className="px-6 py-6">
                          <div className="grid gap-5 lg:grid-cols-[minmax(240px,1fr)_minmax(560px,1.45fr)] lg:items-center">
                            <div className="min-w-0">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8EEE5] text-[#62715D]">
                                  <Check size={16} strokeWidth={2} />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold">{entry.treatment}</p>
                                  <p className="mt-1 text-[10px] text-[#929A93]">Completed Treatment</p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              <TreatmentRecordDetail label="Date" value={entry.date} />
                              <TreatmentRecordDetail label="Time" value={entry.time} />
                              <TreatmentRecordDetail label="Duration" value={entry.duration} />
                              <TreatmentRecordDetail label="Practitioner" value={entry.practitioner || "Not recorded"} />
                            </div>
                          </div>

                          {entry.notes ? (
                            <div className="mt-4 rounded-xl bg-[#F5F8F4] p-4">
                              <p className="text-[9px] uppercase tracking-[0.1em] text-[#929A93]">Appointment notes</p>
                              <p className="mt-2 text-xs leading-5 text-[#667068]">{entry.notes}</p>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0EFEA]">
                        <ClipboardList size={18} strokeWidth={1.7} />
                      </div>
                      <p className="mt-4 text-sm font-medium">No Completed Treatments Yet</p>
                      <p className="mt-2 text-xs text-[#929A93]">
                        Complete an appointment to create the first treatment-history record.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* APPOINTMENTS */}
            {activeTab ===
              "Appointments" && (

              <div className="mt-6 rounded-[22px] border border-[#E1E6E0] bg-[#FEFFFD] shadow-[0_10px_34px_rgba(28,44,33,0.035)]">

                <div className="flex items-center justify-between border-b border-[#EAEEEA] px-6 py-5">

                  <div className="flex items-center gap-3">

                    <CalendarDays
                      size={19}
                      strokeWidth={1.7}
                    />

                    <div>

                      <p className="text-sm text-[#667068]">
                        Clinic schedule
                      </p>

                      <h2 className="mt-1 text-lg font-semibold">
                        Patient appointments
                      </h2>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      openAppointments
                    }
                    className="rounded-xl bg-[#171717] px-4 py-2.5 text-xs font-medium text-white"
                  >
                    + Appointment
                  </button>

                </div>

                {patientAppointments.length >
                0 ? (

                  <div className="divide-y divide-[#F0EFEA]">

                    {patientAppointments.map(
                      (
                        appointment
                      ) => (

                        <div
                          key={
                            appointment.id
                          }
                          className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center"
                        >

                          <div className="min-w-0 flex-1">

                            <p className="text-sm font-medium">
                              {
                                appointment.treatment
                              }
                            </p>

                            <p className="mt-1.5 text-[10px] text-[#929A93]">
                              {
                                appointment.practitioner
                              }
                            </p>

                          </div>

                          <div>

                            <p className="text-xs text-[#929A93]">
                              Date
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {
                                appointment.date
                              }
                            </p>

                          </div>

                          <div className="md:w-[110px]">

                            <p className="text-xs text-[#929A93]">
                              Time
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {
                                appointment.time
                              }
                            </p>

                          </div>

                          <span className="rounded-full bg-[#E8EEE5] px-3 py-1 text-[10px] font-medium text-[#62715D]">
                            {
                              appointment.status
                            }
                          </span>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="px-6 py-12 text-center">
                    <p className="text-sm font-medium">
                      No appointments
                    </p>
                  </div>

                )}

              </div>
            )}

          </div>

        </section>

      </div>

    </main>
  );
}

function getAnalysisTimestamp(analysis: SavedAnalysis) {
  if (typeof analysis.id === "number" && analysis.id > 1000000000000) {
    return analysis.id;
  }
  if (typeof analysis.id === "string" && /^\d{13}$/.test(analysis.id)) {
    return Number(analysis.id);
  }
  const raw = analysis.createdAt || analysis.generatedAt || analysis.date || "";
  const parsed = new Date(raw).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getAnalysisDate(analysis: SavedAnalysis) {
  const raw = analysis.date || analysis.createdAt || analysis.generatedAt;
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
  const score = analysis.score ?? analysis.overallScore ?? analysis.skinScore ?? 0;
  return typeof score === "number" ? score : Number(score) || 0;
}

function getAnalysisMetrics(analysis: SavedAnalysis): SkinMetric[] {
  if (!Array.isArray(analysis.metrics)) return [];
  return analysis.metrics.map((metric) => ({
    label: metric.label || metric.name || "Metric",
    value: metric.value ?? metric.score ?? 0,
    status: metric.status || "Recorded",
  }));
}

function getAnalysisImage(analysis: SavedAnalysis) {
  const values = [
    analysis.image,
    analysis.imageUrl,
    analysis.photo,
    analysis.photoUrl,
    analysis.uploadedImage,
    analysis.previewUrl,
  ];
  const image = values.find(
    (value) => typeof value === "string" && value.trim() !== ""
  );
  return typeof image === "string" ? image : "";
}

function getAnalysisSummary(analysis: SavedAnalysis, concern: string) {
  if (typeof analysis.summary === "string" && analysis.summary.trim()) {
    return analysis.summary;
  }
  if (typeof analysis.concern === "string" && analysis.concern.trim()) {
    return `Assessment recorded for ${analysis.concern}.`;
  }
  return `Saved skin assessment for ${concern}.`;
}

function formatScoreChange(change: number) {
  return change > 0 ? `+${change}` : String(change);
}

function AnalysisSummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#E1E6E0] bg-[#FEFFFD] shadow-[0_10px_34px_rgba(28,44,33,0.035)] p-5">
      <p className="text-[10px] uppercase tracking-[0.1em] text-[#929A93]">
        {label}
      </p>
      <p className="mt-3 text-xl font-semibold">{value}</p>
      <p className="mt-2 text-xs text-[#667068]">{detail}</p>
    </div>
  );
}

function TreatmentSummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#E1E6E0] bg-[#FEFFFD] shadow-[0_10px_34px_rgba(28,44,33,0.035)] p-5">
      <p className="text-[10px] uppercase tracking-[0.1em] text-[#929A93]">{label}</p>
      <p className="mt-3 truncate text-xl font-semibold">{value}</p>
      <p className="mt-2 text-xs text-[#667068]">{detail}</p>
    </div>
  );
}

function TreatmentRecordDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[72px] flex-col justify-center rounded-xl bg-[#F5F8F4] px-4 py-3">
      <p className="text-[9px] uppercase tracking-[0.1em] text-[#929A93]">{label}</p>
      <p className="mt-2 break-words text-xs font-medium leading-4">{value}</p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[#F0EFEA] pb-4 last:border-0">

      <span className="text-xs text-[#929A93]">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-medium">
        {value}
      </span>

    </div>
  );
}

function TabCard({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-[#DFE5DE] bg-[#FEFFFD] p-6 shadow-[0_16px_50px_rgba(28,44,33,0.05)] lg:p-7">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EFEA]">
        {icon}
      </div>

      <p className="mt-5 text-xs text-[#929A93]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-[#667068]">
        {description}
      </p>

    </div>
  );
}

function ConsultationField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>

      <label className="text-xs font-medium text-[#667068]">
        {label}
      </label>

      <textarea
        rows={3}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-[12px] border border-[#E0E5DF] bg-[#F8FAF7] px-4 py-3 text-sm outline-none"
      />

    </div>
  );
}

function EditPatientField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "email" | "tel";
}) {
  return (
    <div>

      <label className="text-xs font-medium text-[#667068]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-[12px] border border-[#E0E5DF] bg-[#F8FAF7] px-4 py-3 text-sm outline-none transition focus:border-[#829A87] focus:bg-white focus:shadow-[0_0_0_3px_rgba(77,112,83,0.07)]"
      />

    </div>
  );
}

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#F5F8F4] p-4">

      <p className="text-[9px] uppercase tracking-[0.1em] text-[#929A93]">
        {label}
      </p>

      <p className="mt-2 break-words text-xs font-medium">
        {value}
      </p>

    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  Pencil,
  Plus,
  Power,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import Sidebar from "../components/sidebar";

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

type Treatment = {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: string;
  match: string;
  description: string;
  keywords: string[];
  active: boolean;
};

type TreatmentFormState = {
  name: string;
  category: string;
  duration: string;
  price: string;
  match: string;
  description: string;
  keywords: string;
};

type ConsultationRecord = {
  id: number;
  patientId: number;
  date: string;
  allergies: string;
  medications: string;
  pregnancyStatus: string;
  previousTreatments: string;
  contraindications: string;
  medicalHistory: string;
  consentGiven: boolean;
  practitionerNotes: string;
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

  clinicalReviewRequired?: boolean;
  clinicalReviewAcknowledged?: boolean;
  consultationId?: number | null;
  consultationDate?: string | null;
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
  concern: "Acne & Pigmentation",
  analyses: 4,
};

const defaultTreatments: Treatment[] = [
  {
    id: "hydration-facial",
    name: "Hydration Facial",
    category: "Facial",
    duration: "60 min",
    price: "£120",
    match: "94%",
    description:
      "Deep hydration treatment designed to improve moisture levels, texture and overall skin appearance.",
    keywords: [
      "hydration",
      "dry",
      "dryness",
      "dehydration",
      "texture",
      "sensitive",
      "rosacea",
    ],
    active: true,
  },
  {
    id: "pigmentation-peel",
    name: "Pigmentation Peel",
    category: "Peel",
    duration: "45 min",
    price: "£150",
    match: "89%",
    description:
      "Targeted peel designed to improve the appearance of pigmentation and uneven skin tone.",
    keywords: [
      "pigmentation",
      "hyperpigmentation",
      "uneven tone",
      "Acne & Pigmentation",
    ],
    active: true,
  },
  {
    id: "acne-clarifying-treatment",
    name: "Acne Clarifying Treatment",
    category: "Acne",
    duration: "50 min",
    price: "£135",
    match: "86%",
    description:
      "Targeted treatment designed to support clearer-looking skin and reduce congestion.",
    keywords: [
      "acne",
      "congestion",
      "oily",
      "breakouts",
      "Acne & Pigmentation",
    ],
    active: true,
  },
  {
    id: "skin-renewal-treatment",
    name: "Skin Renewal Treatment",
    category: "Advanced",
    duration: "75 min",
    price: "£195",
    match: "82%",
    description:
      "Advanced skin-renewal treatment focused on texture, tone and overall skin quality.",
    keywords: [
      "fine lines",
      "ageing",
      "skin ageing",
      "texture",
      "firmness",
      "renewal",
    ],
    active: true,
  },
];

const emptyTreatmentForm: TreatmentFormState = {
  name: "",
  category: "",
  duration: "",
  price: "",
  match: "85",
  description: "",
  keywords: "",
};

function hasRecordedValue(value?: string) {
  if (!value) return false;

  const normalised = value.trim().toLowerCase();

  return (
    normalised !== "" &&
    normalised !== "none" &&
    normalised !== "none recorded" &&
    normalised !== "no" &&
    normalised !== "n/a" &&
    normalised !== "not applicable"
  );
}

export default function TreatmentsPage() {
  const [patient, setPatient] =
    useState<Patient>(fallbackPatient);

  const [clinicalProfile, setClinicalProfile] =
    useState<ClinicalProfile | null>(null);

  const [consultations, setConsultations] =
    useState<ConsultationRecord[]>([]);

  const [selected, setSelected] =
    useState<string | null>(null);

  const [showPlan, setShowPlan] =
    useState(false);

  const [notes, setNotes] =
    useState("");

  const [savedPlans, setSavedPlans] =
    useState<SavedTreatmentPlan[]>([]);

  const [planSaved, setPlanSaved] =
    useState(false);

  const [clinicSettings, setClinicSettings] =
    useState<ClinicSettings>({
      clinicName: "Velyquo Aesthetics",
      practitionerName: "Sarah Williams",
      initials: "SW",
    });

  const [
    clinicalReviewAcknowledged,
    setClinicalReviewAcknowledged,
  ] = useState(false);

  const [saveMessage, setSaveMessage] =
    useState("");

  const [treatmentCatalogue, setTreatmentCatalogue] =
    useState<Treatment[]>(defaultTreatments);

  const [catalogueSearch, setCatalogueSearch] =
    useState("");

  const [catalogueCategory, setCatalogueCategory] =
    useState("All");

  const [showTreatmentModal, setShowTreatmentModal] =
    useState(false);

  const [editingTreatmentId, setEditingTreatmentId] =
    useState<string | null>(null);

  const [treatmentForm, setTreatmentForm] =
    useState<TreatmentFormState>(emptyTreatmentForm);

  const [catalogueMessage, setCatalogueMessage] =
    useState("");

  /*
   * LOAD PATIENT + PROFILE +
   * CONSULTATION + SAVED PLANS
   */
  useEffect(() => {
    const storedClinicSettings =
      localStorage.getItem(
        "dermisClinicSettings"
      );

    if (storedClinicSettings) {
      try {
        const parsedClinicSettings =
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

    /*
     * TREATMENT CATALOGUE
     */
    const storedCatalogue =
      localStorage.getItem(
        "dermisTreatments"
      );

    if (storedCatalogue) {
      try {
        const parsed = JSON.parse(
          storedCatalogue
        );

        if (Array.isArray(parsed)) {
          const normalised: Treatment[] =
            parsed.map((item, index) => ({
              id:
                typeof item.id === "string"
                  ? item.id
                  : `treatment-${index}-${Date.now()}`,
              name: item.name || "Untitled treatment",
              category: item.category || "Other",
              duration: item.duration || "30 min",
              price: item.price || "£0",
              match: item.match || "80%",
              description: item.description || "",
              keywords: Array.isArray(item.keywords)
                ? item.keywords
                : [],
              active: item.active !== false,
            }));

          setTreatmentCatalogue(normalised);

          localStorage.setItem(
            "dermisTreatments",
            JSON.stringify(normalised)
          );
        }
      } catch (error) {
        console.error(
          "Could not load treatment catalogue:",
          error
        );
      }
    } else {
      localStorage.setItem(
        "dermisTreatments",
        JSON.stringify(defaultTreatments)
      );
    }

    let currentPatient =
      fallbackPatient;

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
     * CLINICAL PROFILE
     */
    const savedProfiles =
      localStorage.getItem(
        "dermisClinicalProfiles"
      );

    if (savedProfiles) {
      try {
        const profiles: Record<
          number,
          ClinicalProfile
        > = JSON.parse(savedProfiles);

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
     * CONSULTATIONS
     */
    const storedConsultations =
      localStorage.getItem(
        "dermisConsultations"
      );

    if (storedConsultations) {
      try {
        const consultationsByPatient: Record<
          number,
          ConsultationRecord[]
        > = JSON.parse(
          storedConsultations
        );

        setConsultations(
          consultationsByPatient[
            currentPatient.id
          ] || []
        );
      } catch (error) {
        console.error(
          "Could not load consultations:",
          error
        );
      }
    }

    /*
     * SAVED TREATMENT PLANS
     */
    const storedPlans =
      localStorage.getItem(
        "dermisTreatmentPlans"
      );

    if (storedPlans) {
      try {
        const plansByPatient: Record<
          number,
          SavedTreatmentPlan[]
        > = JSON.parse(storedPlans);

        setSavedPlans(
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
  }, []);

  const initials = patient.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const patientConcern =
    patient.concern.toLowerCase();

  /*
   * LATEST CONSULTATION
   */
  const latestConsultation =
    consultations[0] || null;

  /*
   * CLINICAL REVIEW FLAGS
   */
  const clinicalFlags = useMemo(() => {
    if (!latestConsultation) {
      return [];
    }

    const flags: {
      label: string;
      value: string;
    }[] = [];

    if (
      hasRecordedValue(
        latestConsultation.allergies
      )
    ) {
      flags.push({
        label: "Allergies",
        value:
          latestConsultation.allergies,
      });
    }

    if (
      hasRecordedValue(
        latestConsultation.medications
      )
    ) {
      flags.push({
        label: "Current medications",
        value:
          latestConsultation.medications,
      });
    }

    if (
      hasRecordedValue(
        latestConsultation.contraindications
      )
    ) {
      flags.push({
        label: "Contraindications",
        value:
          latestConsultation.contraindications,
      });
    }

    if (
      hasRecordedValue(
        latestConsultation.medicalHistory
      )
    ) {
      flags.push({
        label: "Relevant medical history",
        value:
          latestConsultation.medicalHistory,
      });
    }

    const pregnancyStatus =
      latestConsultation.pregnancyStatus
        ?.trim()
        .toLowerCase();

    if (
      pregnancyStatus === "pregnant" ||
      pregnancyStatus ===
        "breastfeeding"
    ) {
      flags.push({
        label:
          "Pregnancy / breastfeeding",
        value:
          latestConsultation.pregnancyStatus,
      });
    }

    return flags;
  }, [latestConsultation]);

  /*
   * Review is required when:
   *
   * 1. No consultation exists.
   * 2. Consultation has recorded
   *    clinical information requiring
   *    practitioner review.
   * 3. Consent has not been recorded.
   */
  const clinicalReviewRequired =
    !latestConsultation ||
    clinicalFlags.length > 0 ||
    latestConsultation.consentGiven ===
      false;

  /*
   * SORT RECOMMENDATIONS
   */
  const recommendedTreatments =
    useMemo(() => {
      const clinicalTreatmentNames =
        clinicalProfile?.treatments.map(
          (item) => item.name
        ) || [];

      return treatmentCatalogue
        .filter((treatment) => treatment.active)
        .sort(
        (a, b) => {
          const aClinical =
            clinicalTreatmentNames.includes(
              a.name
            )
              ? 1
              : 0;

          const bClinical =
            clinicalTreatmentNames.includes(
              b.name
            )
              ? 1
              : 0;

          if (
            aClinical !== bClinical
          ) {
            return (
              bClinical -
              aClinical
            );
          }

          const aConcern =
            a.keywords.some(
              (keyword) =>
                patientConcern.includes(
                  keyword.toLowerCase()
                )
            )
              ? 1
              : 0;

          const bConcern =
            b.keywords.some(
              (keyword) =>
                patientConcern.includes(
                  keyword.toLowerCase()
                )
            )
              ? 1
              : 0;

          return (
            bConcern -
            aConcern
          );
        }
      );
    }, [
      clinicalProfile,
      patientConcern,
      treatmentCatalogue,
    ]);

  /*
   * LOWEST METRIC = PRIORITY
   */
  const primaryMetric =
    useMemo(() => {
      if (
        !clinicalProfile?.metrics ||
        clinicalProfile.metrics.length ===
          0
      ) {
        return null;
      }

      return [
        ...clinicalProfile.metrics,
      ].sort(
        (a, b) =>
          a.value -
          b.value
      )[0];
    }, [clinicalProfile]);

  const catalogueCategories =
    useMemo(() => {
      return [
        "All",
        ...Array.from(
          new Set(
            treatmentCatalogue
              .map((treatment) => treatment.category.trim())
              .filter(Boolean)
          )
        ).sort(),
      ];
    }, [treatmentCatalogue]);

  const filteredCatalogue =
    useMemo(() => {
      const query =
        catalogueSearch.trim().toLowerCase();

      return treatmentCatalogue.filter(
        (treatment) => {
          const categoryMatches =
            catalogueCategory === "All" ||
            treatment.category === catalogueCategory;

          const searchMatches =
            !query ||
            treatment.name.toLowerCase().includes(query) ||
            treatment.category.toLowerCase().includes(query) ||
            treatment.description.toLowerCase().includes(query) ||
            treatment.keywords.some((keyword) =>
              keyword.toLowerCase().includes(query)
            );

          return categoryMatches && searchMatches;
        }
      );
    }, [
      treatmentCatalogue,
      catalogueSearch,
      catalogueCategory,
    ]);

  const persistTreatmentCatalogue = (
    updated: Treatment[]
  ) => {
    setTreatmentCatalogue(updated);

    localStorage.setItem(
      "dermisTreatments",
      JSON.stringify(updated)
    );
  };

  const openAddTreatment = () => {
    setEditingTreatmentId(null);
    setTreatmentForm(emptyTreatmentForm);
    setCatalogueMessage("");
    setShowTreatmentModal(true);
  };

  const openEditTreatment = (
    treatment: Treatment
  ) => {
    setEditingTreatmentId(treatment.id);

    setTreatmentForm({
      name: treatment.name,
      category: treatment.category,
      duration: treatment.duration,
      price: treatment.price.replace(/^£/, ""),
      match: treatment.match.replace(/%$/, ""),
      description: treatment.description,
      keywords: treatment.keywords.join(", "),
    });

    setCatalogueMessage("");
    setShowTreatmentModal(true);
  };

  const closeTreatmentModal = () => {
    setShowTreatmentModal(false);
    setEditingTreatmentId(null);
    setTreatmentForm(emptyTreatmentForm);
  };

  const updateTreatmentForm = (
    field: keyof TreatmentFormState,
    value: string
  ) => {
    setTreatmentForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveCatalogueTreatment = () => {
    const name = treatmentForm.name.trim();
    const category = treatmentForm.category.trim();
    const duration = treatmentForm.duration.trim();
    const rawPrice = treatmentForm.price.trim();
    const description = treatmentForm.description.trim();

    if (
      !name ||
      !category ||
      !duration ||
      !rawPrice ||
      !description
    ) {
      setCatalogueMessage(
        "Complete the treatment name, category, duration, price and description."
      );
      return;
    }

    const duplicate = treatmentCatalogue.some(
      (treatment) =>
        treatment.id !== editingTreatmentId &&
        treatment.name.trim().toLowerCase() ===
          name.toLowerCase()
    );

    if (duplicate) {
      setCatalogueMessage(
        "A treatment with this name already exists."
      );
      return;
    }

    const matchNumber = Math.min(
      100,
      Math.max(
        0,
        Number(
          treatmentForm.match.replace(/%/g, "")
        ) || 0
      )
    );

    const keywords = treatmentForm.keywords
      .split(",")
      .map((keyword) => keyword.trim().toLowerCase())
      .filter(Boolean);

    const price = rawPrice.startsWith("£")
      ? rawPrice
      : `£${rawPrice}`;

    if (editingTreatmentId) {
      const previous = treatmentCatalogue.find(
        (treatment) => treatment.id === editingTreatmentId
      );

      const updated = treatmentCatalogue.map(
        (treatment) =>
          treatment.id === editingTreatmentId
            ? {
                ...treatment,
                name,
                category,
                duration,
                price,
                match: `${matchNumber}%`,
                description,
                keywords,
              }
            : treatment
      );

      persistTreatmentCatalogue(updated);

      if (previous && selected === previous.name) {
        setSelected(name);
      }

      setCatalogueMessage(
        "Treatment updated successfully."
      );
    } else {
      const newTreatment: Treatment = {
        id: `treatment-${Date.now()}`,
        name,
        category,
        duration,
        price,
        match: `${matchNumber}%`,
        description,
        keywords,
        active: true,
      };

      persistTreatmentCatalogue([
        newTreatment,
        ...treatmentCatalogue,
      ]);

      setCatalogueMessage(
        "Treatment added successfully."
      );
    }

    window.setTimeout(() => {
      closeTreatmentModal();
      setCatalogueMessage("");
    }, 650);
  };

  const toggleTreatmentActive = (
    treatmentId: string
  ) => {
    const updated = treatmentCatalogue.map(
      (treatment) =>
        treatment.id === treatmentId
          ? {
              ...treatment,
              active: !treatment.active,
            }
          : treatment
    );

    persistTreatmentCatalogue(updated);

    const changed = updated.find(
      (treatment) => treatment.id === treatmentId
    );

    setCatalogueMessage(
      changed?.active
        ? `${changed.name} reactivated.`
        : `${changed?.name || "Treatment"} deactivated.`
    );
  };

  const treatmentIsUsed = (
    treatmentName: string
  ) => {
    const storedPlans = localStorage.getItem(
      "dermisTreatmentPlans"
    );

    if (storedPlans) {
      try {
        const parsed = JSON.parse(storedPlans);

        if (Array.isArray(parsed)) {
          if (
            parsed.some(
              (plan) => plan.treatment === treatmentName
            )
          ) {
            return true;
          }
        } else if (parsed && typeof parsed === "object") {
          const allPlans = Object.values(parsed).flatMap(
            (value) =>
              Array.isArray(value) ? value : []
          ) as SavedTreatmentPlan[];

          if (
            allPlans.some(
              (plan) => plan.treatment === treatmentName
            )
          ) {
            return true;
          }
        }
      } catch (error) {
        console.error(
          "Could not check treatment plan usage:",
          error
        );
      }
    }

    const handoff = localStorage.getItem(
      "dermisTreatmentPlan"
    );

    if (handoff) {
      try {
        const parsed = JSON.parse(handoff);

        if (parsed?.treatment === treatmentName) {
          return true;
        }
      } catch {
        // Ignore malformed prototype handoff data.
      }
    }

    return false;
  };

  const deleteTreatment = (
    treatment: Treatment
  ) => {
    if (treatmentIsUsed(treatment.name)) {
      setCatalogueMessage(
        `${treatment.name} is already referenced by a saved treatment plan and cannot be deleted. Deactivate it instead.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete ${treatment.name} from the treatment catalogue?`
    );

    if (!confirmed) {
      return;
    }

    const updated = treatmentCatalogue.filter(
      (item) => item.id !== treatment.id
    );

    persistTreatmentCatalogue(updated);

    if (selected === treatment.name) {
      setSelected(null);
      setShowPlan(false);
      setNotes("");
      setPlanSaved(false);
    }

    setCatalogueMessage(
      `${treatment.name} deleted.`
    );
  };

  const aiHeadline =
    clinicalProfile &&
    clinicalProfile.score > 0
      ? primaryMetric
        ? `Focus on ${primaryMetric.label.toLowerCase()}`
        : `Focus on ${patient.concern.toLowerCase()}`
      : `Focus on ${patient.concern.toLowerCase()}`;

  const aiDescription =
    clinicalProfile &&
    clinicalProfile.score > 0
      ? `${patient.name}'s latest skin score is ${clinicalProfile.score}/100. The strongest treatment opportunity is ${
          primaryMetric?.label.toLowerCase() ||
          patient.concern.toLowerCase()
        }, with recommendations tailored to the current clinical profile.`
      : `${patient.name} has not completed a saved AI skin analysis yet. Recommendations are currently based on the recorded primary concern: ${patient.concern.toLowerCase()}.`;

  /*
   * OPEN PATIENT CONSULTATION
   */
  const openConsultation = () => {
    localStorage.setItem(
      "dermisSelectedPatient",
      JSON.stringify(patient)
    );

    localStorage.setItem(
      "dermisPatientTab",
      "Consultation"
    );

    window.location.href =
      "/patient";
  };

  /*
   * OPEN PLAN
   */
  const selectTreatment = (
    treatmentName: string
  ) => {
    setSelected(
      treatmentName
    );

    setShowPlan(true);

    setPlanSaved(false);

    setSaveMessage("");

    /*
     * Require acknowledgement again
     * whenever a new treatment is
     * selected.
     */
    setClinicalReviewAcknowledged(
      false
    );

    setNotes(
      `Recommended ${treatmentName} for ${patient.name} based on the latest skin analysis and recorded concern: ${patient.concern}.`
    );

    window.setTimeout(() => {
      document
        .getElementById(
          "treatment-plan-builder"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /*
   * VALIDATE CLINICAL REVIEW
   */
  const canProceedWithPlan = () => {
    if (
      clinicalReviewRequired &&
      !clinicalReviewAcknowledged
    ) {
      setSaveMessage(
        "Review the recorded clinical information and confirm the practitioner acknowledgement before continuing."
      );

      return false;
    }

    return true;
  };

  /*
   * PERMANENTLY SAVE PLAN
   */
  const saveTreatmentPlan = () => {
    if (!selected) {
      return false;
    }

    if (!canProceedWithPlan()) {
      return false;
    }

    const treatmentDetails =
      treatmentCatalogue.find(
        (treatment) =>
          treatment.name ===
          selected
      );

    if (!treatmentDetails) {
      return false;
    }

    const newPlan: SavedTreatmentPlan =
      {
        id: Date.now(),

        patient:
          patient.name,

        patientId:
          patient.id,

        treatment:
          selected,

        duration:
          treatmentDetails.duration,

        price:
          treatmentDetails.price,

        status:
          "Active",

        notes,

        createdAt:
          new Date().toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }
          ),

        clinicalReviewRequired,

        clinicalReviewAcknowledged:
          clinicalReviewRequired
            ? clinicalReviewAcknowledged
            : true,

        consultationId:
          latestConsultation?.id ||
          null,

        consultationDate:
          latestConsultation?.date ||
          null,
      };

    let plansByPatient: Record<
      number,
      SavedTreatmentPlan[]
    > = {};

    const storedPlans =
      localStorage.getItem(
        "dermisTreatmentPlans"
      );

    if (storedPlans) {
      try {
        plansByPatient =
          JSON.parse(
            storedPlans
          );
      } catch (error) {
        console.error(
          "Could not read treatment plans:",
          error
        );
      }
    }

    const currentPlans =
      plansByPatient[
        patient.id
      ] || [];

    /*
     * Avoid duplicate active copies
     * of the same treatment.
     */
    const filtered =
      currentPlans.filter(
        (plan) =>
          !(
            plan.treatment ===
              selected &&
            plan.status ===
              "Active"
          )
      );

    const updatedPlans = [
      newPlan,
      ...filtered,
    ];

    plansByPatient[
      patient.id
    ] = updatedPlans;

    localStorage.setItem(
      "dermisTreatmentPlans",
      JSON.stringify(
        plansByPatient
      )
    );

    setSavedPlans(
      updatedPlans
    );

    setPlanSaved(true);

    setSaveMessage(
      "Treatment plan saved successfully."
    );

    return true;
  };

  /*
   * SAVE PLAN + SEND TO
   * APPOINTMENTS
   */
  const continueToAppointment =
    () => {
      if (!selected) return;

      if (!canProceedWithPlan()) {
        return;
      }

      const treatmentDetails =
        treatmentCatalogue.find(
          (treatment) =>
            treatment.name ===
            selected
        );

      if (!treatmentDetails) {
        return;
      }

      /*
       * Save permanently first if
       * user hasn't already done it.
       */
      if (!planSaved) {
        const saved =
          saveTreatmentPlan();

        if (!saved) {
          return;
        }
      }

      /*
       * Temporary booking handoff.
       */
      localStorage.setItem(
        "dermisTreatmentPlan",
        JSON.stringify({
          patient:
            patient.name,

          patientId:
            patient.id,

          treatment:
            selected,

          duration:
            treatmentDetails.duration,

          price:
            treatmentDetails.price,

          status:
            "Active",

          notes,

          clinicalReviewRequired,

          clinicalReviewAcknowledged:
            clinicalReviewRequired
              ? clinicalReviewAcknowledged
              : true,

          consultationId:
            latestConsultation?.id ||
            null,

          consultationDate:
            latestConsultation?.date ||
            null,
        })
      );

      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(
          patient
        )
      );

      window.location.href =
        "/appointments?from=treatment";
    };

  return (
    <main className="min-h-screen bg-[#F3F6F3] text-[#182019]">

      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <Sidebar activePage="Treatments" />

        {/* MAIN */}
        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E3E8E2] bg-[#FCFDFC]/95 px-6 py-4 backdrop-blur-xl lg:px-10">

            <div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[#7E9182]">
                Velyquo treatment intelligence
              </p>

              <h1 className="mt-1.5 text-[20px] font-semibold tracking-[-0.045em] text-[#202922]">
                Treatments
              </h1>

              <p className="mt-1 text-[10px] text-[#929B93]">
                {clinicSettings.clinicName || "Velyquo Aesthetics"}
              </p>

            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={openAddTreatment}
                className="flex items-center gap-2 rounded-[12px] bg-[#1F3A2B] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_10px_28px_rgba(31,58,43,0.16)] transition hover:-translate-y-px hover:bg-[#183023]"
              >
                <Plus size={15} strokeWidth={2} />
                Add treatment
              </button>

              <a
                href="/settings"
                title={
                  clinicSettings.practitionerName ||
                  clinicSettings.clinicName ||
                  "Clinic settings"
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D7E1D7] bg-[#EAF1EA] text-[10px] font-semibold text-[#4A6150] transition hover:bg-[#E3ECE3]"
              >
                {(
                  clinicSettings.initials ||
                  clinicSettings.practitionerName
                    ?.split(" ")
                    .filter(Boolean)
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2) ||
                  "CL"
                ).toUpperCase()}
              </a>

            </div>

          </header>

          {/* CONTENT */}
          <div className="mx-auto w-full max-w-[1520px] p-6 lg:px-10 lg:py-9">

            {/* TITLE */}
            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#688171]">
                Intelligent treatment planning
              </p>

              <h2 className="mt-2 text-[38px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#1A241C]">
                Treatment plans
              </h2>

              <p className="mt-4 max-w-2xl text-[12px] leading-6 text-[#7B857D]">
                Turn skin analysis insights into personalised treatment recommendations, complete the clinical review and move directly into booking.
              </p>

            </div>

            {/* PATIENT */}
            <div className="mt-8 flex flex-col justify-between gap-5 rounded-[24px] border border-[#DEE5DD] bg-[#FEFFFD] p-5 shadow-[0_14px_42px_rgba(26,42,31,0.04)] sm:flex-row sm:items-center">

              <div className="flex items-center gap-4">

                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-[#D3DFD3] bg-[#EAF2EA] text-[11px] font-semibold text-[#46604D] shadow-[inset_0_0_0_4px_rgba(255,255,255,0.55)]">
                  {initials}
                </div>

                <div>

                  <p className="text-xs text-[#929A93]">
                    Current patient
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {patient.name}
                  </p>

                  <p className="mt-1 text-xs text-[#667068]">
                    {patient.concern}
                    {" · "}
                    {clinicalProfile?.skinType ||
                      "Skin type not assessed"}
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap items-center gap-3">

                {clinicalProfile &&
                  clinicalProfile.score >
                    0 && (

                  <div className="rounded-full border border-[#D7E3D5] bg-[#EDF5ED] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.07em] text-[#4E6855]">
                    Skin score{" "}
                    {
                      clinicalProfile.score
                    }
                    /100
                  </div>

                )}

                <button
                  type="button"
                  onClick={
                    openConsultation
                  }
                  className="rounded-[12px] border border-[#DAE2DA] bg-white px-4 py-3 text-[11px] font-semibold text-[#566159] shadow-[0_4px_14px_rgba(27,43,32,0.025)] transition hover:-translate-y-px hover:bg-[#F6F9F6]"
                >
                  View patient →
                </button>

              </div>

            </div>

            {/* CONSULTATION / SAFETY REVIEW */}
            {!latestConsultation ? (

              <div className="mt-6 rounded-[22px] border border-[#E9DCCB] bg-[#FAF6F0] p-6 shadow-[0_10px_30px_rgba(86,66,40,0.035)]">

                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">

                      <AlertTriangle
                        size={20}
                        strokeWidth={1.7}
                        className="text-[#8B6E4F]"
                      />

                    </div>

                    <div>

                      <p className="text-xs font-medium text-[#8B6E4F]">
                        Clinical review required
                      </p>

                      <h3 className="mt-1 text-lg font-semibold">
                        No consultation recorded
                      </h3>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#746555]">
                        A consultation has not
                        been recorded for{" "}
                        {patient.name}. Record
                        the patient&apos;s
                        relevant clinical
                        information before
                        proceeding with a
                        treatment plan.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      openConsultation
                    }
                    className="shrink-0 rounded-xl bg-[#171717] px-5 py-3 text-xs font-medium text-white hover:bg-[#333]"
                  >
                    Open consultation →
                  </button>

                </div>

              </div>

            ) : clinicalFlags.length >
              0 ||
              !latestConsultation.consentGiven ? (

              <div className="mt-6 rounded-[22px] border border-[#E8D7D7] bg-[#FAF4F4] p-6 shadow-[0_10px_30px_rgba(93,55,55,0.035)]">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">

                    <AlertTriangle
                      size={20}
                      strokeWidth={1.7}
                      className="text-[#8A6666]"
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                      <div>

                        <p className="text-xs font-medium text-[#8A6666]">
                          Clinical review required
                        </p>

                        <h3 className="mt-1 text-lg font-semibold">
                          Recorded information
                          requires practitioner
                          review
                        </h3>

                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#735F5F]">
                          This does not
                          automatically determine
                          whether a treatment is
                          suitable. Review the
                          patient&apos;s recorded
                          information before
                          proceeding.
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={
                          openConsultation
                        }
                        className="shrink-0 rounded-xl border border-[#DECACA] bg-white px-4 py-2.5 text-xs font-medium hover:bg-[#FAF7F7]"
                      >
                        View consultation →
                      </button>

                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                      {clinicalFlags.map(
                        (flag) => (

                          <div
                            key={
                              flag.label
                            }
                            className="rounded-xl border border-[#E7DADA] bg-white p-4"
                          >

                            <p className="text-[9px] uppercase tracking-[0.12em] text-[#9B7D7D]">
                              {
                                flag.label
                              }
                            </p>

                            <p className="mt-2 break-words text-xs font-medium leading-5">
                              {
                                flag.value
                              }
                            </p>

                          </div>

                        )
                      )}

                      {!latestConsultation.consentGiven && (

                        <div className="rounded-xl border border-[#E7DADA] bg-white p-4">

                          <p className="text-[9px] uppercase tracking-[0.12em] text-[#9B7D7D]">
                            Consent
                          </p>

                          <p className="mt-2 text-xs font-medium">
                            Consent not recorded
                          </p>

                        </div>

                      )}

                    </div>

                    <p className="mt-4 text-[10px] text-[#927979]">
                      Consultation recorded{" "}
                      {
                        latestConsultation.date
                      }
                    </p>

                  </div>

                </div>

              </div>

            ) : (

              <div className="mt-6 rounded-[22px] border border-[#D5E2D4] bg-[#ECF4EC] p-5 shadow-[0_10px_30px_rgba(35,62,44,0.04)]">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                  <div className="flex items-center gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">

                      <ShieldCheck
                        size={19}
                        strokeWidth={1.7}
                        className="text-[#62715D]"
                      />

                    </div>

                    <div>

                      <p className="text-xs font-medium text-[#62715D]">
                        Consultation recorded
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        No review flags recorded
                      </p>

                      <p className="mt-1 text-xs text-[#71806C]">
                        Latest consultation:{" "}
                        {
                          latestConsultation.date
                        }
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      openConsultation
                    }
                    className="rounded-xl border border-[#D7DDD4] bg-white px-4 py-2.5 text-xs font-medium hover:bg-[#F7F8F6]"
                  >
                    View consultation
                  </button>

                </div>

              </div>

            )}

            {/* AI RECOMMENDATION */}
            <div className="mt-6 rounded-[24px] border border-[#D5E2D4] bg-[#EAF3EA] p-6 shadow-[0_14px_38px_rgba(35,62,44,0.05)]">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">

                  <Sparkles
                    size={19}
                    strokeWidth={1.7}
                    className="text-[#62715D]"
                  />

                </div>

                <div>

                  <p className="text-xs font-medium text-[#62715D]">
                    AI recommendation
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    {aiHeadline}
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5F685A]">
                    {aiDescription}
                  </p>

                  <p className="mt-3 text-[10px] leading-5 text-[#71806C]">
                    Recommendations support treatment planning and do not replace practitioner clinical judgement.
                  </p>

                </div>

              </div>

            </div>

            {/* CLINICAL METRICS */}
            {clinicalProfile?.metrics &&
              clinicalProfile.metrics
                .length > 0 && (

              <div className="mt-6 rounded-[24px] border border-[#DEE5DD] bg-[#FEFFFD] p-6 shadow-[0_12px_36px_rgba(26,42,31,0.04)]">

                <p className="text-sm text-[#667068]">
                  Latest skin analysis
                </p>

                <h3 className="mt-1 text-lg font-semibold">
                  Clinical priorities
                </h3>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                  {clinicalProfile.metrics
                    .slice(0, 4)
                    .map(
                      (metric) => (

                        <div
                          key={
                            metric.label
                          }
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
                              className="h-full rounded-full bg-[#52705A]"
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

              </div>

            )}

            {/* SAVED PLANS */}
            {savedPlans.filter(
              (plan) =>
                plan.status ===
                "Active"
            ).length > 0 && (

              <div className="mt-6 rounded-[24px] border border-[#DEE5DD] bg-[#FEFFFD] p-6 shadow-[0_12px_36px_rgba(26,42,31,0.04)]">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EFEA]">

                    <ClipboardList
                      size={18}
                      strokeWidth={1.7}
                    />

                  </div>

                  <div>

                    <p className="text-sm text-[#667068]">
                      Patient treatment
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      Active treatment plans
                    </h3>

                  </div>

                </div>

                <div className="mt-5 space-y-3">

                  {savedPlans
                    .filter(
                      (plan) =>
                        plan.status ===
                        "Active"
                    )
                    .map((plan) => (

                      <div
                        key={plan.id}
                        className="flex flex-col justify-between gap-4 rounded-xl bg-[#F5F8F4] p-4 sm:flex-row sm:items-center"
                      >

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="text-sm font-medium">
                              {
                                plan.treatment
                              }
                            </p>

                            <span className="rounded-full bg-[#E8EEE5] px-2.5 py-1 text-[9px] font-medium text-[#62715D]">
                              Active
                            </span>

                            {plan.clinicalReviewRequired && (

                              <span
                                className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${
                                  plan.clinicalReviewAcknowledged
                                    ? "bg-[#EEECE5] text-[#706D62]"
                                    : "bg-[#F3EAEA] text-[#8A6666]"
                                }`}
                              >
                                {plan.clinicalReviewAcknowledged
                                  ? "Review acknowledged"
                                  : "Review required"}
                              </span>

                            )}

                          </div>

                          <p className="mt-1 text-xs text-[#929A93]">
                            {
                              plan.duration
                            }{" "}
                            ·{" "}
                            {
                              plan.createdAt
                            }
                          </p>

                        </div>

                        <span className="text-sm font-semibold">
                          {plan.price}
                        </span>

                      </div>

                    ))}

                </div>

              </div>

            )}

            {/* TREATMENT CATALOGUE */}
            <div className="mt-8 rounded-[26px] border border-[#DDE4DC] bg-[#FEFFFD] p-6 shadow-[0_14px_42px_rgba(26,42,31,0.045)]">

              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">

                <div>
                  <p className="text-sm text-[#667068]">
                    Clinic catalogue
                  </p>

                  <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.045em] text-[#202922]">
                    Treatment catalogue
                  </h3>

                  <p className="mt-2 max-w-2xl text-[11px] leading-5 text-[#8D978F]">
                    Manage the treatments available for recommendations, treatment planning and booking. Inactive treatments stay in your catalogue but are removed from new recommendations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddTreatment}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[#1F3A2B] px-4 py-3 text-[11px] font-semibold text-white shadow-[0_9px_24px_rgba(31,58,43,0.14)] transition hover:-translate-y-px hover:bg-[#183023]"
                >
                  <Plus size={14} />
                  Add treatment
                </button>

              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">

                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929A93]"
                  />

                  <input
                    value={catalogueSearch}
                    onChange={(event) =>
                      setCatalogueSearch(event.target.value)
                    }
                    placeholder="Search treatments, categories or keywords..."
                    className="w-full rounded-[13px] border border-[#DEE5DD] bg-[#F7FAF7] py-3 pl-11 pr-4 text-[12px] outline-none transition focus:border-[#7E9984] focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,111,82,0.07)]"
                  />
                </div>

                <select
                  value={catalogueCategory}
                  onChange={(event) =>
                    setCatalogueCategory(event.target.value)
                  }
                  className="rounded-[13px] border border-[#DEE5DD] bg-[#F7FAF7] px-4 py-3 text-[12px] outline-none transition focus:border-[#7E9984] focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,111,82,0.07)]"
                >
                  {catalogueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category === "All"
                        ? "All categories"
                        : category}
                    </option>
                  ))}
                </select>

              </div>

              {catalogueMessage && (
                <div className="mt-4 rounded-xl bg-[#F5F8F4] px-4 py-3 text-xs text-[#667068]">
                  {catalogueMessage}
                </div>
              )}

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {filteredCatalogue.map((treatment) => (
                  <div
                    key={treatment.id}
                    className={`rounded-xl border p-5 ${
                      treatment.active
                        ? "border-[#DFE6DE] bg-[#F8FAF7] shadow-[0_6px_20px_rgba(27,43,32,0.025)]"
                        : "border-[#E5E9E4] bg-[#F3F5F2] opacity-65"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-[#E4E9E3] bg-white px-2.5 py-1 text-[9px] font-medium text-[#67726A]">
                            {treatment.category}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${
                              treatment.active
                                ? "bg-[#E8EEE5] text-[#62715D]"
                                : "bg-[#E8E6E1] text-[#667068]"
                            }`}
                          >
                            {treatment.active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-semibold">
                          {treatment.name}
                        </p>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#667068]">
                          {treatment.description}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">
                          {treatment.price}
                        </p>
                        <p className="mt-1 text-[10px] text-[#929B93]">
                          {treatment.duration}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {treatment.keywords.slice(0, 4).map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-[8px] border border-[#E5EAE4] bg-white px-2.5 py-1.5 text-[9px] text-[#67726A]"
                        >
                          {keyword}
                        </span>
                      ))}

                      {treatment.keywords.length > 4 && (
                        <span className="rounded-[8px] border border-[#E5EAE4] bg-white px-2.5 py-1.5 text-[9px] text-[#929A93]">
                          +{treatment.keywords.length - 4} more
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E6E0] pt-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.12em] text-[#929A93]">
                          Recommendation match
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#62715D]">
                          {treatment.match}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditTreatment(treatment)}
                          className="flex items-center gap-1.5 rounded-lg border border-[#DEE5DD] bg-white px-3 py-2 text-[10px] font-medium hover:bg-[#F5F8F4]"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleTreatmentActive(treatment.id)
                          }
                          className="flex items-center gap-1.5 rounded-lg border border-[#DEE5DD] bg-white px-3 py-2 text-[10px] font-medium hover:bg-[#F5F8F4]"
                        >
                          <Power size={12} />
                          {treatment.active
                            ? "Deactivate"
                            : "Reactivate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteTreatment(treatment)}
                          className="flex items-center gap-1.5 rounded-lg border border-[#E6DADA] bg-white px-3 py-2 text-[10px] font-medium text-[#8A6666] hover:bg-[#FAF5F5]"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCatalogue.length === 0 && (
                <div className="mt-5 rounded-xl border border-dashed border-[#DEE5DD] p-8 text-center">
                  <p className="text-sm font-medium">
                    No treatments found
                  </p>
                  <p className="mt-1 text-xs text-[#929A93]">
                    Try a different search or category filter.
                  </p>
                </div>
              )}

            </div>

            {/* RECOMMENDATIONS */}
            <div className="mt-8">

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#728479]">
                    Recommended treatments
                  </p>

                  <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.045em] text-[#202922]">
                    Best matches
                  </h3>

                </div>

                <span className="text-xs text-[#929A93]">
                  {
                    recommendedTreatments.length
                  }{" "}
                  recommendations
                </span>

              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">

                {recommendedTreatments.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#DEE5DD] bg-white p-8 md:col-span-2">
                    <p className="text-sm font-medium">
                      No active treatments available
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#929A93]">
                      Reactivate a catalogue treatment or add a new treatment to restore recommendations.
                    </p>
                  </div>
                )}

                {recommendedTreatments.map(
                  (
                    treatment,
                    index
                  ) => {

                    const clinicalMatch =
                      clinicalProfile?.treatments.find(
                        (item) =>
                          item.name ===
                          treatment.name
                      );

                    const match =
                      clinicalMatch
                        ? index === 0
                          ? "96%"
                          : index === 1
                          ? "91%"
                          : treatment.match
                        : treatment.match;

                    const alreadyActive =
                      savedPlans.some(
                        (plan) =>
                          plan.treatment ===
                            treatment.name &&
                          plan.status ===
                            "Active"
                      );

                    return (

                      <div
                        key={
                          treatment.name
                        }
                        className="rounded-[24px] border border-[#DEE5DD] bg-[#FEFFFD] shadow-[0_12px_36px_rgba(26,42,31,0.04)] p-6 transition hover:-translate-y-0.5 hover:shadow-sm"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <span className="rounded-full bg-[#F0EFEA] px-3 py-1 text-[10px] text-[#667068]">
                              {
                                treatment.category
                              }
                            </span>

                            <h3 className="mt-4 text-lg font-semibold">
                              {
                                treatment.name
                              }
                            </h3>

                          </div>

                          <div className="text-right">

                            <p className="text-lg font-semibold">
                              {
                                treatment.price
                              }
                            </p>

                            <p className="mt-1 text-[10px] text-[#929B93]">
                              {
                                treatment.duration
                              }
                            </p>

                          </div>

                        </div>

                        <p className="mt-4 text-sm leading-6 text-[#667068]">
                          {
                            treatment.description
                          }
                        </p>

                        <div className="mt-5 flex items-center justify-between border-t border-[#ECEBE6] pt-5">

                          <div>

                            <p className="text-[9px] uppercase tracking-[0.12em] text-[#929A93]">
                              AI match
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#62715D]">
                              {match} match
                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              selectTreatment(
                                treatment.name
                              )
                            }
                            className={`rounded-xl px-4 py-2.5 text-xs font-medium transition ${
                              alreadyActive
                                ? "border border-[#D7DDD4] bg-[#F0F3EE] text-[#62715D]"
                                : "bg-[#1F3A2B] text-white shadow-[0_9px_24px_rgba(31,58,43,0.14)] transition hover:-translate-y-px hover:bg-[#183023]"
                            }`}
                          >
                            {alreadyActive
                              ? "View plan"
                              : "Add to plan"}
                          </button>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

            {/* PLAN BUILDER */}
            {showPlan &&
              selected && (

              <div
                id="treatment-plan-builder"
                className="mt-8 scroll-mt-6 rounded-[24px] border border-[#DEE5DD] bg-[#FEFFFD] shadow-[0_12px_36px_rgba(26,42,31,0.04)] p-6"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-xs text-[#71806C]">
                      Treatment planning
                    </p>

                    <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                      Treatment plan
                    </h3>

                    <p className="mt-2 text-sm text-[#667068]">
                      Create a personalised
                      treatment plan for{" "}
                      {patient.name}.
                    </p>

                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-medium ${
                      planSaved
                        ? "bg-[#E8EEE5] text-[#62715D]"
                        : "bg-[#F1F0EB] text-[#667068]"
                    }`}
                  >
                    {planSaved
                      ? "Saved"
                      : "Draft"}
                  </span>

                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">

                  <div className="rounded-xl border border-[#ECEBE6] bg-[#F7FAF7] p-5">

                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#929A93]">
                      Patient
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {patient.name}
                    </p>

                    <p className="mt-1 text-xs text-[#667068]">
                      {patient.concern}
                      {" · "}
                      {clinicalProfile?.skinType ||
                        "Skin type not assessed"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-[#ECEBE6] bg-[#F7FAF7] p-5">

                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#929A93]">
                      Selected treatment
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {selected}
                    </p>

                    <p className="mt-1 text-xs text-[#667068]">
                      Recommended based
                      on the patient&apos;s
                      latest recorded
                      clinical context.
                    </p>

                  </div>

                </div>

                {/* PLAN CLINICAL REVIEW */}
                <div
                  className={`mt-5 rounded-xl border p-5 ${
                    clinicalReviewRequired
                      ? "border-[#E3D2D2] bg-[#FAF5F5]"
                      : "border-[#D7DDD4] bg-[#F4F6F2]"
                  }`}
                >

                  <div className="flex items-start gap-3">

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ${
                        clinicalReviewRequired
                          ? "text-[#8A6666]"
                          : "text-[#62715D]"
                      }`}
                    >

                      {clinicalReviewRequired ? (
                        <AlertTriangle
                          size={17}
                          strokeWidth={1.8}
                        />
                      ) : (
                        <ShieldCheck
                          size={17}
                          strokeWidth={1.8}
                        />
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-xs font-semibold">
                        Clinical review
                      </p>

                      {!latestConsultation ? (

                        <>

                          <p className="mt-2 text-xs leading-5 text-[#667068]">
                            No consultation is
                            currently recorded for
                            this patient. The
                            practitioner must
                            review this before
                            saving or booking the
                            treatment plan.
                          </p>

                          <button
                            type="button"
                            onClick={
                              openConsultation
                            }
                            className="mt-3 flex items-center gap-2 text-xs font-medium underline underline-offset-4"
                          >
                            <FileText
                              size={14}
                            />
                            Open patient consultation
                          </button>

                        </>

                      ) : (

                        <>

                          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                            <ReviewItem
                              label="Consultation"
                              value={
                                latestConsultation.date
                              }
                            />

                            <ReviewItem
                              label="Consent"
                              value={
                                latestConsultation.consentGiven
                                  ? "Recorded"
                                  : "Not recorded"
                              }
                            />

                            <ReviewItem
                              label="Allergies"
                              value={
                                latestConsultation.allergies ||
                                "None recorded"
                              }
                            />

                            <ReviewItem
                              label="Medications"
                              value={
                                latestConsultation.medications ||
                                "None recorded"
                              }
                            />

                            <ReviewItem
                              label="Contraindications"
                              value={
                                latestConsultation.contraindications ||
                                "None recorded"
                              }
                            />

                            <ReviewItem
                              label="Pregnancy / breastfeeding"
                              value={
                                latestConsultation.pregnancyStatus ||
                                "Not recorded"
                              }
                            />

                          </div>

                          {hasRecordedValue(
                            latestConsultation.medicalHistory
                          ) && (

                            <div className="mt-3 rounded-lg bg-white p-4">

                              <p className="text-[9px] uppercase tracking-[0.12em] text-[#929A93]">
                                Relevant medical history
                              </p>

                              <p className="mt-2 text-xs leading-5">
                                {
                                  latestConsultation.medicalHistory
                                }
                              </p>

                            </div>

                          )}

                          {hasRecordedValue(
                            latestConsultation.practitionerNotes
                          ) && (

                            <div className="mt-3 rounded-lg bg-white p-4">

                              <p className="text-[9px] uppercase tracking-[0.12em] text-[#929A93]">
                                Consultation notes
                              </p>

                              <p className="mt-2 text-xs leading-5">
                                {
                                  latestConsultation.practitionerNotes
                                }
                              </p>

                            </div>

                          )}

                        </>

                      )}

                    </div>

                  </div>

                  {clinicalReviewRequired && (

                    <label className="mt-5 flex cursor-pointer items-start gap-3 border-t border-[#E8DDDD] pt-5">

                      <input
                        type="checkbox"
                        checked={
                          clinicalReviewAcknowledged
                        }
                        onChange={(event) => {
                          setClinicalReviewAcknowledged(
                            event.target.checked
                          );

                          setPlanSaved(
                            false
                          );

                          setSaveMessage(
                            ""
                          );
                        }}
                        className="mt-0.5 h-4 w-4"
                      />

                      <div>

                        <p className="text-xs font-semibold">
                          Practitioner acknowledgement
                        </p>

                        <p className="mt-1 max-w-3xl text-xs leading-5 text-[#667068]">
                          I have reviewed the
                          patient&apos;s recorded
                          consultation and clinical
                          information and will use
                          my professional judgement
                          before proceeding with
                          treatment.
                        </p>

                      </div>

                    </label>

                  )}

                </div>

                {clinicalProfile &&
                  clinicalProfile.score >
                    0 && (

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">

                    <div className="rounded-xl bg-[#F5F8F4] p-4">

                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#929A93]">
                        Skin score
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        {
                          clinicalProfile.score
                        }
                        /100
                      </p>

                    </div>

                    <div className="rounded-xl bg-[#F5F8F4] p-4">

                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#929A93]">
                        Skin type
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {
                          clinicalProfile.skinType
                        }
                      </p>

                    </div>

                    <div className="rounded-xl bg-[#F5F8F4] p-4">

                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#929A93]">
                        Priority
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {primaryMetric?.label ||
                          patient.concern}
                      </p>

                    </div>

                  </div>

                )}

                <div className="mt-5">

                  <label className="text-xs font-medium text-[#667068]">
                    Treatment plan notes
                  </label>

                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(event) => {
                      setNotes(
                        event.target.value
                      );

                      setPlanSaved(
                        false
                      );

                      setSaveMessage(
                        ""
                      );
                    }}
                    className="mt-2 w-full resize-none rounded-[13px] border border-[#DEE5DD] bg-[#F7FAF7] px-4 py-3 text-sm outline-none focus:border-[#99978F]"
                  />

                </div>

                {/* MESSAGE */}
                {saveMessage && (

                  <div
                    className={`mt-5 flex items-start gap-3 rounded-xl p-4 ${
                      planSaved
                        ? "bg-[#F0F3EE] text-[#62715D]"
                        : "bg-[#F8F1F1] text-[#8A6666]"
                    }`}
                  >

                    {planSaved ? (
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0"
                      />
                    ) : (
                      <AlertTriangle
                        size={17}
                        className="mt-0.5 shrink-0"
                      />
                    )}

                    <p className="text-xs leading-5">
                      {saveMessage}
                    </p>

                  </div>

                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() => {
                      setSelected(
                        null
                      );

                      setShowPlan(
                        false
                      );

                      setNotes("");

                      setPlanSaved(
                        false
                      );

                      setClinicalReviewAcknowledged(
                        false
                      );

                      setSaveMessage(
                        ""
                      );
                    }}
                    className="rounded-xl border border-[#DEE5DD] px-5 py-3 text-sm font-medium hover:bg-[#F5F8F4]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      saveTreatmentPlan
                    }
                    className="flex items-center justify-center gap-2 rounded-[12px] border border-[#DEE5DD] bg-white px-5 py-3 text-sm font-medium hover:bg-[#F5F8F4]"
                  >

                    {planSaved && (
                      <Check
                        size={15}
                        strokeWidth={2}
                      />
                    )}

                    {planSaved
                      ? "Plan saved"
                      : "Save plan"}

                  </button>

                  <button
                    type="button"
                    onClick={
                      continueToAppointment
                    }
                    className={`rounded-xl px-5 py-3 text-sm font-medium text-white transition ${
                      clinicalReviewRequired &&
                      !clinicalReviewAcknowledged
                        ? "cursor-not-allowed bg-[#A7A69F]"
                        : "bg-[#171717] hover:bg-[#333]"
                    }`}
                  >
                    Book appointment →
                  </button>

                </div>

                {clinicalReviewRequired &&
                  !clinicalReviewAcknowledged && (

                  <p className="mt-3 text-right text-[10px] text-[#929A93]">
                    Practitioner acknowledgement
                    is required before continuing.
                  </p>

                )}

              </div>

            )}

          </div>

        </section>

      </div>

      {/* ADD / EDIT TREATMENT MODAL */}
      {showTreatmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-[#DEE5DD] bg-[#FEFFFD] shadow-[0_12px_36px_rgba(26,42,31,0.04)] shadow-xl">

            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#ECEBE6] bg-white px-6 py-5">
              <div>
                <p className="text-xs text-[#71806C]">
                  Treatment catalogue
                </p>
                <h3 className="mt-1 text-xl font-semibold">
                  {editingTreatmentId
                    ? "Edit treatment"
                    : "Add treatment"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeTreatmentModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DEE5DD] hover:bg-[#F5F8F4]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <CatalogueField
                  label="Treatment name"
                  value={treatmentForm.name}
                  onChange={(value) =>
                    updateTreatmentForm("name", value)
                  }
                  placeholder="e.g. Microneedling"
                />

                <CatalogueField
                  label="Category"
                  value={treatmentForm.category}
                  onChange={(value) =>
                    updateTreatmentForm("category", value)
                  }
                  placeholder="e.g. Advanced"
                />

                <CatalogueField
                  label="Duration"
                  value={treatmentForm.duration}
                  onChange={(value) =>
                    updateTreatmentForm("duration", value)
                  }
                  placeholder="e.g. 60 min"
                />

                <CatalogueField
                  label="Price (£)"
                  value={treatmentForm.price}
                  onChange={(value) =>
                    updateTreatmentForm("price", value)
                  }
                  placeholder="e.g. 175"
                />

                <CatalogueField
                  label="Recommendation match (%)"
                  value={treatmentForm.match}
                  onChange={(value) =>
                    updateTreatmentForm("match", value)
                  }
                  placeholder="e.g. 88"
                />

                <CatalogueField
                  label="AI matching keywords"
                  value={treatmentForm.keywords}
                  onChange={(value) =>
                    updateTreatmentForm("keywords", value)
                  }
                  placeholder="acne, texture, scarring"
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-[#667068]">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={treatmentForm.description}
                  onChange={(event) =>
                    updateTreatmentForm(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe what the treatment is designed to address..."
                  className="mt-2 w-full resize-none rounded-[13px] border border-[#DEE5DD] bg-[#F7FAF7] px-4 py-3 text-sm outline-none focus:border-[#99978F]"
                />
              </div>

              <div className="mt-4 rounded-xl bg-[#F5F8F4] p-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#929A93]">
                  AI matching keywords
                </p>
                <p className="mt-2 text-xs leading-5 text-[#667068]">
                  Separate keywords with commas. These keywords help the prototype rank treatments against a patient&apos;s recorded concern. They do not determine clinical suitability.
                </p>
              </div>

              {catalogueMessage && (
                <div className="mt-4 rounded-xl bg-[#F8F3EC] px-4 py-3 text-xs text-[#746555]">
                  {catalogueMessage}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeTreatmentModal}
                  className="rounded-xl border border-[#DEE5DD] px-5 py-3 text-sm font-medium hover:bg-[#F5F8F4]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveCatalogueTreatment}
                  className="rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white hover:bg-[#333]"
                >
                  {editingTreatmentId
                    ? "Save changes"
                    : "Add treatment"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}

function CatalogueField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[#667068]">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-[13px] border border-[#DEE5DD] bg-[#F7FAF7] px-4 py-3 text-sm outline-none focus:border-[#99978F]"
      />
    </div>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-white p-4">

      <p className="text-[9px] uppercase tracking-[0.12em] text-[#929A93]">
        {label}
      </p>

      <p className="mt-2 break-words text-xs font-medium leading-5">
        {value}
      </p>

    </div>
  );
}
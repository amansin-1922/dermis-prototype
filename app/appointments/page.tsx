"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Pencil,
  RotateCcw,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import Sidebar from "../components/sidebar";
import { createClient } from "../lib/supabase-browser";

type Patient = {
  id: string | number;
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

type ClinicSettings = {
  clinicName: string;
  practitionerName: string;
  email: string;
  phone: string;
  initials: string;
  location: string;
  practitioners: Practitioner[];
};

type AppointmentStatus =
  | "Confirmed"
  | "Upcoming"
  | "Completed"
  | "Cancelled";

type Appointment = {
  id: string | number;
  supabaseId?: string;
  patient: string;
  patientId?: string | number;
  initials: string;
  treatment: string;
  treatmentId?: string | number;
  treatmentPlanItemId?: string | number;
  date: string;
  rawDate: string;
  time: string;
  rawTime: string;
  duration: string;
  practitioner: string;
  practitionerId?: string | number;
  notes: string;
  status: AppointmentStatus;
};

type TreatmentPlan = {
  patient: string;
  patientId?: string | number;
  treatment: string;
  treatmentId?: string | number;
  treatmentPlanId?: string | number;
  treatmentPlanItemId?: string | number;
  duration: string;
  price: string;
  status: string;
  notes?: string;
};

type TreatmentHistoryEntry = {
  id: number;
  appointmentId: string | number;
  patientId?: string | number;
  patient: string;
  treatment: string;
  date: string;
  rawDate: string;
  time: string;
  duration: string;
  practitioner: string;
  practitionerId?: string | number;
  notes: string;
  completedAt: string;
};

type FollowUpStatus =
  | "Due"
  | "Scheduled"
  | "Analysis started"
  | "Completed";

type FollowUpRecord = {
  id: number;
  appointmentId: string | number;
  patientId?: string | number;
  patient: string;
  treatment: string;
  completedDate: string;
  completedRawDate: string;
  practitioner: string;
  practitionerId?: string | number;
  status: FollowUpStatus;
  createdAt: string;
  followUpAppointmentId?: string | number;
};

type FollowUpBookingHandoff = {
  followUpId: number;
  appointmentId: string | number;
  patientId?: string | number;
  patient: string;
  treatment: string;
  practitioner?: string;
  practitionerId?: string | number;
  completedDate: string;
  completedRawDate: string;
};


const defaultPractitioners: Practitioner[] = [
  {
    id: 1,
    name: "Sarah Williams",
    role: "Lead Practitioner",
    email: "sarah@skinhouseclinic.co.uk",
    phone: "+44 20 7946 0958",
    speciality: "Skin health & facial aesthetics",
    qualifications: "BSc, Level 7 Aesthetic Practice",
    registrationNumber: "SKN-1001",
    experience: "8 years",
    workingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ],
    startTime: "09:00",
    endTime: "17:00",
    notes: "",
    active: true,
  },
  {
    id: 2,
    name: "Emma Thompson",
    role: "Aesthetic Practitioner",
    email: "emma@skinhouseclinic.co.uk",
    phone: "+44 20 7946 0959",
    speciality: "Acne, pigmentation & skin rejuvenation",
    qualifications: "Level 5 Aesthetic Practice",
    registrationNumber: "SKN-1002",
    experience: "5 years",
    workingDays: [
      "Monday",
      "Wednesday",
      "Thursday",
      "Friday",
    ],
    startTime: "10:00",
    endTime: "18:00",
    notes: "",
    active: true,
  },
];

const defaultClinicSettings: ClinicSettings = {
  clinicName: "Skinhouse Clinic",
  practitionerName: "Sarah Williams",
  email: "sarah@skinhouseclinic.co.uk",
  phone: "+44 20 7946 0958",
  initials: "SW",
  location: "London, United Kingdom",
  practitioners: defaultPractitioners,
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

const initialAppointments: Appointment[] = [
  {
    id: 1,
    patient: "Emily Johnson",
    patientId: 1,
    initials: "EJ",
    treatment: "Hydration Facial",
    date: "25 Aug 2026",
    rawDate: "2026-08-25",
    time: "10:30 AM",
    rawTime: "10:30",
    duration: "60 min",
    practitioner: "Sarah Williams",
    practitionerId: 1,
    notes: "",
    status: "Confirmed",
  },
  {
    id: 2,
    patient: "Olivia Smith",
    patientId: 2,
    initials: "OS",
    treatment: "Skin consultation",
    date: "25 Aug 2026",
    rawDate: "2026-08-25",
    time: "12:15 PM",
    rawTime: "12:15",
    duration: "30 min",
    practitioner: "Sarah Williams",
    practitionerId: 1,
    notes: "",
    status: "Confirmed",
  },
  {
    id: 3,
    patient: "Amelia Brown",
    patientId: 3,
    initials: "AB",
    treatment: "Pigmentation Peel",
    date: "25 Aug 2026",
    rawDate: "2026-08-25",
    time: "2:00 PM",
    rawTime: "14:00",
    duration: "60 min",
    practitioner: "Emma Thompson",
    practitionerId: 2,
    notes: "",
    status: "Upcoming",
  },
];

const treatmentOptions = [
  {
    name: "Hydration Facial",
    duration: "60 min",
  },
  {
    name: "Skin consultation",
    duration: "30 min",
  },
  {
    name: "Pigmentation Peel",
    duration: "45 min",
  },
  {
    name: "Acne Clarifying Treatment",
    duration: "50 min",
  },
  {
    name: "Skin Renewal Treatment",
    duration: "75 min",
  },
  {
    name: "Skin analysis",
    duration: "45 min",
  },
];

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:15",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];


function toIsoDate(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
}

function formatLongDate(dateValue: string) {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T12:00:00`);

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function buildCalendarDays(year: number, monthIndex: number) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const mondayFirstOffset = (firstDay + 6) % 7;

  const cells: Array<number | null> = [
    ...Array.from({ length: mondayFirstOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function addDaysToIsoDate(dateValue: string, days: number) {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);

  return toIsoDate(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function getNextWorkingDate(
  startDate: string,
  practitioners: Practitioner[]
) {
  let candidate = startDate;

  for (let offset = 0; offset < 31; offset += 1) {
    const weekday = getWeekday(candidate);

    const hasAvailablePractitioner =
      practitioners.some(
        (practitioner) =>
          practitioner.active &&
          (practitioner.workingDays.length === 0 ||
            practitioner.workingDays.includes(weekday))
      );

    if (hasAvailablePractitioner) {
      return candidate;
    }

    candidate = addDaysToIsoDate(candidate, 1);
  }

  return startDate;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateValue: string) {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T12:00:00`);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeValue: string) {
  if (!timeValue) return "";

  const [hours, minutes] = timeValue
    .split(":")
    .map(Number);

  const suffix =
    hours >= 12 ? "PM" : "AM";

  const displayHour =
    hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHour}:${minutes
    .toString()
    .padStart(2, "0")} ${suffix}`;
}

function getWeekday(dateValue: string) {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T12:00:00`);

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
  });
}

function timeToMinutes(value: string) {
  if (!value) return 0;

  const [hours, minutes] = value
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function durationToMinutes(duration: string) {
  const match = duration.match(/\d+/);

  return match ? Number(match[0]) : 0;
}

function appointmentMatchesPractitioner(
  appointment: Appointment,
  practitioner: Practitioner
) {
  if (appointment.practitionerId !== undefined) {
    return practitionerMatchesId(
      practitioner,
      appointment.practitionerId
    );
  }

  return (
    appointment.practitioner ===
    practitioner.name
  );
}


function isUuid(value: string | number | undefined) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function patientMatchesId(
  patient: Patient,
  value: string | number | undefined
) {
  if (value === undefined || value === null) return false;
  return (
    String(patient.id) === String(value) ||
    (patient.legacyId !== undefined &&
      String(patient.legacyId) === String(value))
  );
}

function practitionerMatchesId(
  practitioner: Practitioner,
  value: string | number | undefined
) {
  if (value === undefined || value === null) return false;
  return (
    String(practitioner.id) === String(value) ||
    (practitioner.legacyId !== undefined &&
      String(practitioner.legacyId) === String(value))
  );
}

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return 0;
  const birth = new Date(`${dateOfBirth}T12:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(age, 0);
}

function mapDatabaseStatus(value: string): AppointmentStatus {
  switch (value.toLowerCase()) {
    case "upcoming":
      return "Upcoming";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Confirmed";
  }
}

function toDatabaseStatus(value: AppointmentStatus) {
  return value.toLowerCase();
}

function getZonedDateTimeParts(isoValue: string, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date(isoValue));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
}

function zonedDateTimeToUtcIso(
  dateValue: string,
  timeValue: string,
  timeZone: string
) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  let guess = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  for (let index = 0; index < 3; index += 1) {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    const parts = formatter.formatToParts(new Date(guess));
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value || 0);

    const represented = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute")
    );
    const target = Date.UTC(year, month - 1, day, hour, minute);
    guess += target - represented;
  }

  return new Date(guess).toISOString();
}

function addMinutesToIso(isoValue: string, minutes: number) {
  return new Date(new Date(isoValue).getTime() + minutes * 60_000).toISOString();
}

export default function AppointmentsPage() {
  const [
    clinicSettings,
    setClinicSettings,
  ] = useState<ClinicSettings>(
    defaultClinicSettings
  );

  const [patients, setPatients] =
    useState<Patient[]>(defaultPatients);

  const [appointments, setAppointments] =
    useState<Appointment[]>(
      initialAppointments
    );

  const [clinicId, setClinicId] =
    useState<string | null>(null);

  const [clinicTimeZone, setClinicTimeZone] =
    useState("Europe/London");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingAppointmentId,
    setEditingAppointmentId,
  ] = useState<string | number | null>(null);

  const [
    bookingConfirmed,
    setBookingConfirmed,
  ] = useState(false);

  const [
    updateConfirmed,
    setUpdateConfirmed,
  ] = useState("");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState("2026-08-27");

  const [
    calendarMonth,
    setCalendarMonth,
  ] = useState(
    () => new Date(2026, 7, 1)
  );

  const [
    treatmentPlan,
    setTreatmentPlan,
  ] = useState<TreatmentPlan | null>(
    null
  );

  const [
    formPatient,
    setFormPatient,
  ] = useState("Emily Johnson");

  const [
    formTreatment,
    setFormTreatment,
  ] = useState("Hydration Facial");

  const [
    formDate,
    setFormDate,
  ] = useState("2026-08-27");

  const [
    formTime,
    setFormTime,
  ] = useState("10:30");

  const [
    formDuration,
    setFormDuration,
  ] = useState("60 min");

  const [
    formPractitionerId,
    setFormPractitionerId,
  ] = useState<string | number | null>(null);

  const [formNotes, setFormNotes] =
    useState("");

  const [
    conflictMessage,
    setConflictMessage,
  ] = useState("");

  const [followUps, setFollowUps] =
    useState<FollowUpRecord[]>([]);

  const [
    schedulingFollowUpId,
    setSchedulingFollowUpId,
  ] = useState<number | null>(null);

  /*
   * LOAD DATA
   */
  useEffect(() => {
    const storedClinicSettings =
      localStorage.getItem(
        "dermisClinicSettings"
      );

    let loadedSettings =
      defaultClinicSettings;

    if (storedClinicSettings) {
      try {
        const parsedSettings =
          JSON.parse(
            storedClinicSettings
          );

        loadedSettings = {
          ...defaultClinicSettings,
          ...parsedSettings,
          practitioners:
            Array.isArray(
              parsedSettings.practitioners
            ) &&
            parsedSettings.practitioners
              .length > 0
              ? parsedSettings.practitioners
              : defaultPractitioners,
        };
      } catch (error) {
        console.error(
          "Could not load clinic settings:",
          error
        );
      }
    }

    setClinicSettings(
      loadedSettings
    );

    const primaryPractitioner =
      loadedSettings.practitioners.find(
        (practitioner) =>
          practitioner.name ===
            loadedSettings.practitionerName &&
          practitioner.active
      ) ||
      loadedSettings.practitioners.find(
        (practitioner) =>
          practitioner.active
      ) ||
      null;

    setFormPractitionerId(
      primaryPractitioner?.id ?? null
    );

    const savedPatients =
      localStorage.getItem(
        "dermisPatients"
      );

    if (savedPatients) {
      try {
        const parsedPatients: Patient[] =
          JSON.parse(
            savedPatients
          );

        if (parsedPatients.length > 0) {
          setPatients(
            parsedPatients
          );

          setFormPatient(
            parsedPatients[0].name
          );
        }
      } catch (error) {
        console.error(
          "Could not load patients:",
          error
        );
      }
    }

    const savedAppointments =
      localStorage.getItem(
        "dermisAppointments"
      );

    if (savedAppointments) {
      try {
        const parsedAppointments: Appointment[] =
          JSON.parse(
            savedAppointments
          );

        setAppointments(
          parsedAppointments
        );
      } catch (error) {
        console.error(
          "Could not load appointments:",
          error
        );
      }
    }

    const savedPlan =
      localStorage.getItem(
        "dermisTreatmentPlan"
      );

    if (savedPlan) {
      try {
        const plan: TreatmentPlan =
          JSON.parse(
            savedPlan
          );

        setTreatmentPlan(
          plan
        );

        setFormPatient(
          plan.patient
        );

        setFormTreatment(
          plan.treatment
        );

        setFormDuration(
          plan.duration
        );

        setFormNotes(
          plan.notes || ""
        );

        const params =
          new URLSearchParams(
            window.location.search
          );

        if (
          params.get("from") ===
          "treatment"
        ) {
          setShowForm(true);
        }
      } catch (error) {
        console.error(
          "Could not load treatment plan:",
          error
        );
      }
    }

    const storedFollowUps =
      localStorage.getItem("dermisFollowUps");

    if (storedFollowUps) {
      try {
        const parsedFollowUps =
          JSON.parse(storedFollowUps);

        if (Array.isArray(parsedFollowUps)) {
          setFollowUps(parsedFollowUps);
        }
      } catch (error) {
        console.error(
          "Could not load follow-up records:",
          error
        );
      }
    }
  }, []);

  /*
   * SUPABASE SYNC
   *
   * Supabase is authoritative for patients and persisted appointments.
   * localStorage remains a compatibility cache while the remaining
   * clinical modules are migrated.
   */
  useEffect(() => {
    let cancelled = false;

    const loadSupabaseData = async () => {
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
          .limit(1)
          .maybeSingle();

        if (membershipError || !membership?.clinic_id || cancelled) {
          if (membershipError) {
            console.error("Could not resolve clinic membership:", membershipError);
          }
          return;
        }

        const resolvedClinicId = membership.clinic_id as string;
        setClinicId(resolvedClinicId);

        const { data: clinicRow } = await supabase
          .from("clinics")
          .select("timezone")
          .eq("id", resolvedClinicId)
          .maybeSingle();

        const resolvedTimeZone =
          (clinicRow?.timezone as string | null) || "Europe/London";
        setClinicTimeZone(resolvedTimeZone);

        const { data: patientRows, error: patientError } = await supabase
          .from("patients")
          .select(
            "id, legacy_id, first_name, last_name, email, phone, date_of_birth, status, primary_concern, last_visit_at"
          )
          .eq("clinic_id", resolvedClinicId)
          .order("created_at", { ascending: true });

        let resolvedPatients: Patient[] = patients;

        if (!patientError && Array.isArray(patientRows)) {
          const cachedPatientsRaw = localStorage.getItem("dermisPatients");
          let cachedPatients: Patient[] = [];
          try {
            cachedPatients = cachedPatientsRaw ? JSON.parse(cachedPatientsRaw) : [];
          } catch {
            cachedPatients = [];
          }

          resolvedPatients = patientRows.map((row) => {
            const cached = cachedPatients.find(
              (item) => String(item.id) === String(row.id)
            );
            const name = `${row.first_name || ""} ${row.last_name || ""}`.trim();
            return {
              id: row.id,
              legacyId: row.legacy_id ?? undefined,
              name,
              email: row.email || "",
              phone: row.phone || "",
              age: calculateAge(row.date_of_birth),
              lastVisit: row.last_visit_at
                ? new Date(row.last_visit_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: resolvedTimeZone,
                  })
                : cached?.lastVisit || "No visits yet",
              status:
                String(row.status || "active").toLowerCase() === "inactive"
                  ? "Inactive"
                  : "Active",
              concern: row.primary_concern || "",
              analyses: cached?.analyses ?? 0,
            } as Patient;
          });

          if (!cancelled) {
            setPatients(resolvedPatients);
            localStorage.setItem(
              "dermisPatients",
              JSON.stringify(resolvedPatients)
            );
            if (resolvedPatients.length > 0) {
              setFormPatient((current) =>
                resolvedPatients.some((patient) => patient.name === current)
                  ? current
                  : resolvedPatients[0].name
              );
            }
          }
        } else if (patientError) {
          console.error("Could not load Supabase patients:", patientError);
        }

        const { data: appointmentRows, error: appointmentError } = await supabase
          .from("appointments")
          .select(
            "id, patient_id, practitioner_id, treatment_id, treatment_plan_item_id, title, starts_at, ends_at, status, notes"
          )
          .eq("clinic_id", resolvedClinicId)
          .order("starts_at", { ascending: true });

        if (appointmentError) {
          console.error("Could not load Supabase appointments:", appointmentError);
          return;
        }

        if (!Array.isArray(appointmentRows) || cancelled) return;

        const cachedAppointmentsRaw = localStorage.getItem("dermisAppointments");
        let cachedAppointments: Appointment[] = [];
        try {
          cachedAppointments = cachedAppointmentsRaw
            ? JSON.parse(cachedAppointmentsRaw)
            : [];
        } catch {
          cachedAppointments = [];
        }

        const mappedAppointments: Appointment[] = appointmentRows.map((row) => {
          const cached = cachedAppointments.find(
            (item) =>
              String(item.supabaseId || item.id) === String(row.id)
          );
          const patient = resolvedPatients.find((item) =>
            patientMatchesId(item, row.patient_id)
          );
          const practitioner = clinicSettings.practitioners.find((item) =>
            practitionerMatchesId(item, row.practitioner_id)
          );
          const start = getZonedDateTimeParts(row.starts_at, resolvedTimeZone);
          const endMs = new Date(row.ends_at).getTime();
          const startMs = new Date(row.starts_at).getTime();
          const durationMinutes = Math.max(
            1,
            Math.round((endMs - startMs) / 60_000)
          );
          const localId = cached?.id ?? row.id;

          return {
            id: localId,
            supabaseId: row.id,
            patient: patient?.name || cached?.patient || "Unknown patient",
            patientId: patient?.id || row.patient_id,
            initials: getInitials(
              patient?.name || cached?.patient || "Unknown patient"
            ),
            treatment: row.title || cached?.treatment || "Appointment",
            treatmentId: row.treatment_id || cached?.treatmentId || undefined,
            treatmentPlanItemId:
              row.treatment_plan_item_id || cached?.treatmentPlanItemId || undefined,
            date: formatDate(start.date),
            rawDate: start.date,
            time: formatTime(start.time),
            rawTime: start.time,
            duration: `${durationMinutes} min`,
            practitioner:
              practitioner?.name || cached?.practitioner || "Practitioner",
            practitionerId: practitioner?.id || row.practitioner_id || undefined,
            notes: row.notes || "",
            status: mapDatabaseStatus(row.status || "confirmed"),
          };
        });

        if (mappedAppointments.length > 0) {
          setAppointments(mappedAppointments);
          localStorage.setItem(
            "dermisAppointments",
            JSON.stringify(mappedAppointments)
          );
        }
      } catch (error) {
        console.error("Could not sync appointments with Supabase:", error);
      }
    };

    void loadSupabaseData();

    return () => {
      cancelled = true;
    };
  }, []);

  const activePractitioners =
    useMemo(() => {
      return clinicSettings.practitioners.filter(
        (practitioner) =>
          practitioner.active
      );
    }, [
      clinicSettings.practitioners,
    ]);

  const practitionersAvailableOnDate =
    useMemo(() => {
      const weekday =
        getWeekday(
          formDate
        );

      return activePractitioners.filter(
        (practitioner) =>
          practitioner.workingDays.length === 0 ||
          practitioner.workingDays.includes(
            weekday
          )
      );
    }, [
      activePractitioners,
      formDate,
    ]);

  const selectedPractitioner =
    useMemo(() => {
      return (
        practitionersAvailableOnDate.find(
          (practitioner) =>
            practitioner.id ===
            formPractitionerId
        ) || null
      );
    }, [
      practitionersAvailableOnDate,
      formPractitionerId,
    ]);

  /*
   * DASHBOARD / PATIENT -> FOLLOW-UP BOOKING HANDOFF
   *
   * We prefill the appointment form here, but the follow-up remains Due
   * until the user actually saves the appointment.
   */
  useEffect(() => {
    const storedFollowUpBooking =
      localStorage.getItem(
        "dermisFollowUpBooking"
      );

    if (!storedFollowUpBooking) {
      return;
    }

    try {
      const handoff =
        JSON.parse(
          storedFollowUpBooking
        ) as FollowUpBookingHandoff;

      const matchingPatient =
        patients.find(
          (patient) =>
            patientMatchesId(patient, handoff.patientId) ||
            patient.name === handoff.patient
        );

      if (!matchingPatient) {
        localStorage.removeItem(
          "dermisFollowUpBooking"
        );
        return;
      }

      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(
          matchingPatient
        )
      );

      setFormPatient(
        matchingPatient.name
      );

      setFormTreatment(
        "Skin analysis"
      );

      setFormDuration(
        "45 min"
      );

      setFormNotes(
        `Follow-up after ${handoff.treatment} completed on ${handoff.completedDate}.`
      );

      const firstFollowUpDate =
        getNextWorkingDate(
          addDaysToIsoDate(
            handoff.completedRawDate,
            1
          ),
          activePractitioners
        );

      if (firstFollowUpDate) {
        setFormDate(
          firstFollowUpDate
        );

        setSelectedDate(
          firstFollowUpDate
        );

        const followUpDate =
          new Date(
            `${firstFollowUpDate}T12:00:00`
          );

        setCalendarMonth(
          new Date(
            followUpDate.getFullYear(),
            followUpDate.getMonth(),
            1
          )
        );
      }

      const preferredPractitioner =
        practitionersAvailableOnDate.find(
          (practitioner) =>
            practitioner.id ===
              handoff.practitionerId ||
            practitioner.name ===
              handoff.practitioner
        ) ||
        practitionersAvailableOnDate[0];

      setFormPractitionerId(
        preferredPractitioner?.id ??
          null
      );

      setSchedulingFollowUpId(
        handoff.followUpId
      );

      setBookingConfirmed(false);
      setUpdateConfirmed("");
      setEditingAppointmentId(null);
      setConflictMessage("");
      setTreatmentPlan(null);
      setShowForm(true);

      /*
       * Consume this one-shot handoff now. If the form is cancelled,
       * the follow-up stays Due because we have not changed its status.
       */
      localStorage.removeItem(
        "dermisFollowUpBooking"
      );

      window.setTimeout(
        () => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        },
        50
      );
    } catch (error) {
      console.error(
        "Could not load follow-up booking handoff:",
        error
      );

      localStorage.removeItem(
        "dermisFollowUpBooking"
      );
    }
  }, [
    patients,
    practitionersAvailableOnDate,
    activePractitioners,
  ]);

  /*
   * CONFLICT CHECK
   *
   * When editing, the appointment being edited
   * does not conflict with itself.
   */
  const slotHasConflict = (
    slot: string,
    practitioner: Practitioner
  ) => {
    const newStart =
      timeToMinutes(
        slot
      );

    const newDuration =
      durationToMinutes(
        formDuration
      );

    const newEnd =
      newStart +
      newDuration;

    return appointments.some(
      (appointment) => {
        if (
          editingAppointmentId !== null &&
          appointment.id ===
            editingAppointmentId
        ) {
          return false;
        }

        if (
          appointment.rawDate !==
          formDate
        ) {
          return false;
        }

        if (
          appointment.status ===
          "Cancelled"
        ) {
          return false;
        }

        if (
          !appointmentMatchesPractitioner(
            appointment,
            practitioner
          )
        ) {
          return false;
        }

        const existingStart =
          timeToMinutes(
            appointment.rawTime
          );

        const existingDuration =
          durationToMinutes(
            appointment.duration
          );

        const existingEnd =
          existingStart +
          existingDuration;

        return (
          newStart < existingEnd &&
          newEnd > existingStart
        );
      }
    );
  };

  const availableTimeSlots =
    useMemo(() => {
      if (!selectedPractitioner) {
        return [];
      }

      const shiftStart =
        timeToMinutes(
          selectedPractitioner.startTime
        );

      const shiftEnd =
        timeToMinutes(
          selectedPractitioner.endTime
        );

      const duration =
        durationToMinutes(
          formDuration
        );

      return timeSlots.filter(
        (slot) => {
          const slotStart =
            timeToMinutes(
              slot
            );

          const slotEnd =
            slotStart +
            duration;

          if (
            slotStart <
              shiftStart ||
            slotEnd >
              shiftEnd
          ) {
            return false;
          }

          return !slotHasConflict(
            slot,
            selectedPractitioner
          );
        }
      );
    }, [
      selectedPractitioner,
      formDate,
      formDuration,
      appointments,
      editingAppointmentId,
    ]);

  /*
   * AUTO SELECT PRACTITIONER
   */
  useEffect(() => {
    if (
      practitionersAvailableOnDate.length ===
      0
    ) {
      setFormPractitionerId(
        null
      );

      return;
    }

    const currentExists =
      practitionersAvailableOnDate.some(
        (practitioner) =>
          practitioner.id ===
          formPractitionerId
      );

    if (currentExists) {
      return;
    }

    const primary =
      practitionersAvailableOnDate.find(
        (practitioner) =>
          practitioner.name ===
          clinicSettings.practitionerName
      );

    setFormPractitionerId(
      primary?.id ??
        practitionersAvailableOnDate[0].id
    );
  }, [
    practitionersAvailableOnDate,
    formPractitionerId,
    clinicSettings.practitionerName,
  ]);

  /*
   * AUTO SELECT AVAILABLE TIME
   */
  useEffect(() => {
    if (
      availableTimeSlots.length ===
      0
    ) {
      setConflictMessage(
        selectedPractitioner
          ? `No available time slots remain for ${selectedPractitioner.name} on ${formatDate(
              formDate
            )}.`
          : ""
      );

      return;
    }

    setConflictMessage("");

    if (
      !availableTimeSlots.includes(
        formTime
      )
    ) {
      setFormTime(
        availableTimeSlots[0]
      );
    }
  }, [
    availableTimeSlots,
    formTime,
    selectedPractitioner,
    formDate,
  ]);

  /*
   * SEARCH
   */
  const filteredAppointments =
    appointments.filter(
      (appointment) => {
        const searchText =
          search
            .toLowerCase()
            .trim();

        const matchesSearch =
          searchText === "" ||
          appointment.patient
            .toLowerCase()
            .includes(
              searchText
            ) ||
          appointment.treatment
            .toLowerCase()
            .includes(
              searchText
            ) ||
          appointment.practitioner
            .toLowerCase()
            .includes(
              searchText
            );

        const matchesFilter =
          filter === "All" ||
          appointment.status ===
            filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );

  /*
   * SAVE APPOINTMENTS
   */
  const saveAppointments = (
    updatedAppointments: Appointment[]
  ) => {
    setAppointments(
      updatedAppointments
    );

    localStorage.setItem(
      "dermisAppointments",
      JSON.stringify(
        updatedAppointments
      )
    );
  };

  /*
   * RESET FORM
   */
  const resetAppointmentForm = () => {
    setEditingAppointmentId(
      null
    );

    setFormTreatment(
      "Hydration Facial"
    );

    setFormDuration(
      "60 min"
    );

    setFormNotes("");

    setConflictMessage("");
  };

  /*
   * NEW APPOINTMENT
   */
  const openNewAppointment = () => {
    setBookingConfirmed(
      false
    );

    setUpdateConfirmed("");

    setEditingAppointmentId(
      null
    );

    setConflictMessage("");

    if (!treatmentPlan) {
      const storedSelectedPatient =
        localStorage.getItem(
          "dermisSelectedPatient"
        );

      if (storedSelectedPatient) {
        try {
          const selectedPatient: Patient =
            JSON.parse(
              storedSelectedPatient
            );

          setFormPatient(
            selectedPatient.name
          );
        } catch {
          setFormPatient(
            patients[0]?.name ||
              "Emily Johnson"
          );
        }
      } else {
        setFormPatient(
          patients[0]?.name ||
            "Emily Johnson"
        );
      }

      setFormTreatment(
        "Hydration Facial"
      );

      setFormDuration(
        "60 min"
      );

      setFormNotes("");
    }

    const primary =
      practitionersAvailableOnDate.find(
        (practitioner) =>
          practitioner.name ===
          clinicSettings.practitionerName
      ) ||
      practitionersAvailableOnDate[0];

    setFormPractitionerId(
      primary?.id ?? null
    );

    setShowForm(
      true
    );
  };

  /*
   * EDIT APPOINTMENT
   */
  const editAppointment = (
    appointment: Appointment
  ) => {
    setBookingConfirmed(
      false
    );

    setUpdateConfirmed("");

    setEditingAppointmentId(
      appointment.id
    );

    setFormPatient(
      appointment.patient
    );

    setFormTreatment(
      appointment.treatment
    );

    setFormDate(
      appointment.rawDate
    );

    setFormTime(
      appointment.rawTime
    );

    setFormDuration(
      appointment.duration
    );

    setFormNotes(
      appointment.notes || ""
    );

    let practitionerId =
      appointment.practitionerId;

    if (!practitionerId) {
      practitionerId =
        clinicSettings.practitioners.find(
          (practitioner) =>
            practitioner.name ===
            appointment.practitioner
        )?.id;
    }

    setFormPractitionerId(
      practitionerId ??
        null
    );

    setConflictMessage("");

    setShowForm(
      true
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * CHANGE TREATMENT
   */
  const changeTreatment = (
    treatmentName: string
  ) => {
    setFormTreatment(
      treatmentName
    );

    const treatment =
      treatmentOptions.find(
        (item) =>
          item.name ===
          treatmentName
      );

    if (treatment) {
      setFormDuration(
        treatment.duration
      );
    }
  };

  const bookingHasConflict =
    useMemo(() => {
      if (
        !selectedPractitioner ||
        !formTime
      ) {
        return false;
      }

      return slotHasConflict(
        formTime,
        selectedPractitioner
      );
    }, [
      selectedPractitioner,
      formTime,
      formDate,
      formDuration,
      appointments,
      editingAppointmentId,
    ]);

  /*
   * CREATE OR UPDATE
   */
  const saveAppointment = async () => {
    if (
      !formPatient ||
      !formTreatment ||
      !formDate ||
      !formTime ||
      !selectedPractitioner
    ) {
      return;
    }

    if (
      slotHasConflict(
        formTime,
        selectedPractitioner
      )
    ) {
      setConflictMessage(
        `${selectedPractitioner.name} already has another appointment that overlaps this time.`
      );
      return;
    }

    const selectedPatient = patients.find(
      (patient) => patient.name === formPatient
    );

    if (!selectedPatient || !isUuid(selectedPatient.id)) {
      setConflictMessage(
        "This patient is not yet linked to Supabase. Open the patient record once, then try again."
      );
      return;
    }

    if (!clinicId) {
      setConflictMessage(
        "Clinic connection is still loading. Please wait a moment and try again."
      );
      return;
    }

    const startsAt = zonedDateTimeToUtcIso(
      formDate,
      formTime,
      clinicTimeZone
    );
    const endsAt = addMinutesToIso(
      startsAt,
      durationToMinutes(formDuration)
    );

    const practitionerUuid = isUuid(selectedPractitioner.id)
      ? String(selectedPractitioner.id)
      : undefined;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setConflictMessage("Your session has expired. Please sign in again.");
      return;
    }

    /*
     * Resolve treatment-plan links before saving.
     *
     * The Treatments page sends these IDs through dermisTreatmentPlan, but
     * Supabase is authoritative. If a stale browser state drops one of the
     * IDs, resolve the latest matching active plan/item for this patient so a
     * completed appointment can always complete the exact plan item.
     */
    let resolvedTreatmentId =
      treatmentPlan && isUuid(treatmentPlan.treatmentId)
        ? String(treatmentPlan.treatmentId)
        : null;

    let resolvedTreatmentPlanId =
      treatmentPlan && isUuid(treatmentPlan.treatmentPlanId)
        ? String(treatmentPlan.treatmentPlanId)
        : null;

    let resolvedTreatmentPlanItemId =
      treatmentPlan && isUuid(treatmentPlan.treatmentPlanItemId)
        ? String(treatmentPlan.treatmentPlanItemId)
        : null;

    if (!resolvedTreatmentId) {
      const { data: matchingTreatment, error: treatmentLookupError } = await supabase
        .from("treatments")
        .select("id")
        .eq("clinic_id", clinicId)
        .eq("name", formTreatment)
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      if (treatmentLookupError) {
        console.error("Could not resolve treatment link:", treatmentLookupError);
      } else if (matchingTreatment?.id) {
        resolvedTreatmentId = String(matchingTreatment.id);
      }
    }

    if (!resolvedTreatmentPlanId) {
      const { data: matchingPlan, error: planLookupError } = await supabase
        .from("treatment_plans")
        .select("id")
        .eq("clinic_id", clinicId)
        .eq("patient_id", String(selectedPatient.id))
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planLookupError) {
        console.error("Could not resolve treatment plan link:", planLookupError);
      } else if (matchingPlan?.id) {
        resolvedTreatmentPlanId = String(matchingPlan.id);
      }
    }

    if (!resolvedTreatmentPlanItemId && resolvedTreatmentPlanId) {
      let itemQuery = supabase
        .from("treatment_plan_items")
        .select("id, treatment_id")
        .eq("clinic_id", clinicId)
        .eq("treatment_plan_id", resolvedTreatmentPlanId)
        .eq("treatment_name", formTreatment)
        .in("status", ["planned", "scheduled"])
        .order("sequence_number", { ascending: true })
        .limit(1);

      if (resolvedTreatmentId) {
        itemQuery = itemQuery.eq("treatment_id", resolvedTreatmentId);
      }

      const { data: matchingPlanItem, error: itemLookupError } =
        await itemQuery.maybeSingle();

      if (itemLookupError) {
        console.error("Could not resolve treatment plan item link:", itemLookupError);
      } else if (matchingPlanItem?.id) {
        resolvedTreatmentPlanItemId = String(matchingPlanItem.id);
        if (!resolvedTreatmentId && matchingPlanItem.treatment_id) {
          resolvedTreatmentId = String(matchingPlanItem.treatment_id);
        }
      }
    }

    if (treatmentPlan && !resolvedTreatmentPlanItemId) {
      setConflictMessage(
        "This treatment plan could not be linked to its Supabase plan item. Return to Treatments, save the plan again, then continue to appointment."
      );
      return;
    }

    const payload = {
      clinic_id: clinicId,
      patient_id: String(selectedPatient.id),
      practitioner_id: practitionerUuid || null,
      treatment_id: resolvedTreatmentId,
      treatment_plan_item_id: resolvedTreatmentPlanItemId,
      title: formTreatment,
      starts_at: startsAt,
      ends_at: endsAt,
      status: "confirmed",
      notes: formNotes || null,
      created_by: user.id,
    };

    /* EDIT EXISTING */
    if (editingAppointmentId !== null) {
      const existingAppointment = appointments.find(
        (appointment) => appointment.id === editingAppointmentId
      );
      const existingSupabaseId = existingAppointment?.supabaseId ||
        (isUuid(existingAppointment?.id) ? String(existingAppointment?.id) : null);

      let persistedSupabaseId = existingSupabaseId;

      if (existingSupabaseId) {
        const { error } = await supabase
          .from("appointments")
          .update({
            patient_id: payload.patient_id,
            practitioner_id: payload.practitioner_id,
            title: payload.title,
            starts_at: payload.starts_at,
            ends_at: payload.ends_at,
            notes: payload.notes,
          })
          .eq("id", existingSupabaseId)
          .eq("clinic_id", clinicId);

        if (error) {
          console.error("Could not update appointment in Supabase:", error);
          setConflictMessage(`Could not save appointment: ${error.message}`);
          return;
        }
      } else {
        const { data, error } = await supabase
          .from("appointments")
          .insert(payload)
          .select("id")
          .single();

        if (error || !data?.id) {
          console.error("Could not migrate appointment to Supabase:", error);
          setConflictMessage(
            `Could not save appointment: ${error?.message || "Unknown database error"}`
          );
          return;
        }
        persistedSupabaseId = data.id;
      }

      const updatedAppointments = appointments.map((appointment) => {
        if (appointment.id !== editingAppointmentId) return appointment;
        return {
          ...appointment,
          supabaseId: persistedSupabaseId || undefined,
          patient: formPatient,
          patientId: selectedPatient.id,
          initials: getInitials(formPatient),
          treatment: formTreatment,
          treatmentId: resolvedTreatmentId || undefined,
          treatmentPlanItemId: resolvedTreatmentPlanItemId || undefined,
          date: formatDate(formDate),
          rawDate: formDate,
          time: formatTime(formTime),
          rawTime: formTime,
          duration: formDuration,
          practitioner: selectedPractitioner.name,
          practitionerId: selectedPractitioner.id,
          notes: formNotes,
        };
      });

      saveAppointments(updatedAppointments);
      setShowForm(false);
      setUpdateConfirmed("Appointment updated successfully.");
      setEditingAppointmentId(null);
      return;
    }

    /* CREATE NEW */
    const { data: insertedAppointment, error: insertError } = await supabase
      .from("appointments")
      .insert(payload)
      .select("id")
      .single();

    if (insertError || !insertedAppointment?.id) {
      console.error("Could not create appointment in Supabase:", insertError);
      setConflictMessage(
        `Could not save appointment: ${insertError?.message || "Unknown database error"}`
      );
      return;
    }

    const newAppointment: Appointment = {
      id: insertedAppointment.id,
      supabaseId: insertedAppointment.id,
      patient: formPatient,
      patientId: selectedPatient.id,
      initials: getInitials(formPatient),
      treatment: formTreatment,
      treatmentId: resolvedTreatmentId || undefined,
      treatmentPlanItemId: resolvedTreatmentPlanItemId || undefined,
      date: formatDate(formDate),
      rawDate: formDate,
      time: formatTime(formTime),
      rawTime: formTime,
      duration: formDuration,
      practitioner: selectedPractitioner.name,
      practitionerId: selectedPractitioner.id,
      notes: formNotes,
      status: "Confirmed",
    };

    const updatedAppointments = [newAppointment, ...appointments];
    saveAppointments(updatedAppointments);

    if (schedulingFollowUpId !== null) {
      const updatedFollowUps = followUps.map((record) =>
        record.id === schedulingFollowUpId
          ? {
              ...record,
              status: "Scheduled" as FollowUpStatus,
              followUpAppointmentId: newAppointment.id,
            }
          : record
      );
      saveFollowUps(updatedFollowUps);
      setSchedulingFollowUpId(null);
    }

    localStorage.setItem(
      "dermisSelectedPatient",
      JSON.stringify(selectedPatient)
    );
    localStorage.removeItem("dermisTreatmentPlan");
    localStorage.removeItem("dermisFollowUpBooking");
    setTreatmentPlan(null);
    setShowForm(false);
    setBookingConfirmed(true);
    setConflictMessage("");
    setSelectedDate(formDate);

    const bookedDate = new Date(`${formDate}T12:00:00`);
    setCalendarMonth(
      new Date(bookedDate.getFullYear(), bookedDate.getMonth(), 1)
    );

    window.history.replaceState({}, "", "/appointments");
  };

  const saveFollowUps = (
    records: FollowUpRecord[]
  ) => {
    setFollowUps(records);

    localStorage.setItem(
      "dermisFollowUps",
      JSON.stringify(records)
    );
  };

  const createFollowUpRecord = (
    appointment: Appointment
  ) => {
    /*
     * Prevent recursive follow-up loops.
     *
     * A completed treatment should create a follow-up.
     * A completed follow-up / Skin analysis appointment should NOT create
     * another follow-up record.
     */
    const normalizedTreatment =
      appointment.treatment
        .trim()
        .toLowerCase();

    const isAnalysisAppointment =
      normalizedTreatment ===
        "skin analysis" ||
      normalizedTreatment ===
        "skin analysis follow-up" ||
      normalizedTreatment ===
        "follow-up skin analysis";

    const isExistingFollowUpAppointment =
      followUps.some(
        (record) =>
          record.followUpAppointmentId ===
          appointment.id
      );

    if (
      isAnalysisAppointment ||
      isExistingFollowUpAppointment
    ) {
      return;
    }
    const existing = followUps.find(
      (record) =>
        record.appointmentId ===
        appointment.id
    );

    if (existing) return;

    const patientId =
      appointment.patientId ??
      patients.find(
        (patient) =>
          patient.name === appointment.patient
      )?.id;

    const record: FollowUpRecord = {
      id: Date.now(),
      appointmentId: appointment.id,
      patientId,
      patient: appointment.patient,
      treatment: appointment.treatment,
      completedDate: appointment.date,
      completedRawDate: appointment.rawDate,
      practitioner: appointment.practitioner,
      practitionerId:
        appointment.practitionerId,
      status: "Due",
      createdAt: new Date().toISOString(),
    };

    saveFollowUps([
      record,
      ...followUps,
    ]);
  };

  const getFollowUpForAppointment = (
    appointmentId: string | number
  ) =>
    followUps.find(
      (record) =>
        record.appointmentId ===
        appointmentId
    ) || null;

  const deleteFollowUp = (
    appointment: Appointment
  ) => {
    const followUp =
      getFollowUpForAppointment(
        appointment.id
      );

    if (!followUp) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete the follow-up for ${followUp.patient} after ${followUp.treatment}?\n\nThis removes the follow-up record only. It will not delete any appointment that has already been booked.`
      );

    if (!confirmed) {
      return;
    }

    const updatedFollowUps =
      followUps.filter(
        (record) =>
          record.id !== followUp.id
      );

    saveFollowUps(
      updatedFollowUps
    );

    if (
      schedulingFollowUpId ===
      followUp.id
    ) {
      setSchedulingFollowUpId(
        null
      );
    }

    const storedBooking =
      localStorage.getItem(
        "dermisFollowUpBooking"
      );

    if (storedBooking) {
      try {
        const parsedBooking =
          JSON.parse(storedBooking) as {
            followUpId?: number;
          };

        if (
          parsedBooking.followUpId ===
          followUp.id
        ) {
          localStorage.removeItem(
            "dermisFollowUpBooking"
          );
        }
      } catch {
        localStorage.removeItem(
          "dermisFollowUpBooking"
        );
      }
    }

    const storedSource =
      localStorage.getItem(
        "dermisFollowUpSource"
      );

    if (storedSource) {
      try {
        const parsedSource =
          JSON.parse(storedSource) as {
            followUpId?: number;
          };

        if (
          parsedSource.followUpId ===
          followUp.id
        ) {
          localStorage.removeItem(
            "dermisFollowUpSource"
          );
        }
      } catch {
        // Leave unrelated analysis handoff data untouched if it cannot be parsed.
      }
    }

    setUpdateConfirmed(
      `Follow-up for ${followUp.patient} deleted.`
    );

    window.setTimeout(
      () => {
        setUpdateConfirmed("");
      },
      2200
    );
  };

  const openFollowUpAppointment = (
    appointment: Appointment
  ) => {
    const followUp =
      getFollowUpForAppointment(
        appointment.id
      );

    const patient =
      patients.find(
        (item) =>
          patientMatchesId(item, appointment.patientId) ||
          item.name ===
            appointment.patient
      );

    if (patient) {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(patient)
      );
    }

    setBookingConfirmed(false);
    setUpdateConfirmed("");
    setEditingAppointmentId(null);
    setConflictMessage("");
    setTreatmentPlan(null);

    setFormPatient(
      patient?.name ||
        appointment.patient
    );

    setFormTreatment(
      "Skin analysis"
    );

    setFormDuration(
      "45 min"
    );

    setFormNotes(
      `Follow-up after ${appointment.treatment} completed on ${appointment.date}.`
    );

    /*
     * A follow-up must never default to the treatment date or an earlier date.
     * Start on the first clinic working day after the completed treatment.
     */
    const firstFollowUpDate =
      getNextWorkingDate(
        addDaysToIsoDate(
          appointment.rawDate,
          1
        ),
        activePractitioners
      );

    if (firstFollowUpDate) {
      setFormDate(
        firstFollowUpDate
      );

      setSelectedDate(
        firstFollowUpDate
      );

      const followUpDate =
        new Date(
          `${firstFollowUpDate}T12:00:00`
        );

      setCalendarMonth(
        new Date(
          followUpDate.getFullYear(),
          followUpDate.getMonth(),
          1
        )
      );
    }

    const practitioner =
      practitionersAvailableOnDate.find(
        (item) =>
          item.id ===
          appointment.practitionerId
      ) ||
      practitionersAvailableOnDate[0];

    setFormPractitionerId(
      practitioner?.id ?? null
    );

    /*
     * Do NOT mark Scheduled here.
     * We only do that after saveAppointment successfully creates
     * the actual follow-up appointment.
     */
    setSchedulingFollowUpId(
      followUp?.id ?? null
    );

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openFollowUpAnalysis = (
    appointment: Appointment
  ) => {
    const patient =
      patients.find(
        (item) =>
          patientMatchesId(item, appointment.patientId) ||
          item.name === appointment.patient
      );

    if (patient) {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(patient)
      );
    }

    const followUp =
      getFollowUpForAppointment(
        appointment.id
      );

    if (followUp) {
      const updatedFollowUps =
        followUps.map((record) =>
          record.id === followUp.id
            ? {
                ...record,
                status:
                  "Analysis started" as FollowUpStatus,
              }
            : record
        );

      saveFollowUps(updatedFollowUps);
    }

    localStorage.setItem(
      "dermisFollowUpSource",
      JSON.stringify({
        appointmentId: appointment.id,
        patientId:
          appointment.patientId,
        patient: appointment.patient,
        treatment:
          appointment.treatment,
        completedDate:
          appointment.date,
      })
    );

    window.location.href = "/analysis";
  };

  /*
   * COMPLETE TREATMENT WORKFLOW
   *
   * A completed appointment becomes part of the patient's
   * treatment history, updates their last visit, closes the
   * matching active treatment plan and adds a patient timeline
   * entry. appointmentId is used to prevent duplicate records.
   */
  const recordCompletedTreatment = (appointment: Appointment) => {
    const patientId =
      appointment.patientId ??
      patients.find((item) => item.name === appointment.patient)?.id;

    const historyKey = "dermisTreatmentHistory";
    let history: TreatmentHistoryEntry[] = [];

    const storedHistory = localStorage.getItem(historyKey);
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed)) history = parsed;
      } catch (error) {
        console.error("Could not load treatment history:", error);
      }
    }

    if (!history.some((entry) => entry.appointmentId === appointment.id)) {
      const entry: TreatmentHistoryEntry = {
        id: Date.now(),
        appointmentId: appointment.id,
        patientId,
        patient: appointment.patient,
        treatment: appointment.treatment,
        date: appointment.date,
        rawDate: appointment.rawDate,
        time: appointment.time,
        duration: appointment.duration,
        practitioner: appointment.practitioner,
        practitionerId: appointment.practitionerId,
        notes: appointment.notes || "",
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem(historyKey, JSON.stringify([entry, ...history]));
    }

    if (patientId !== undefined) {
      const updatedPatients = patients.map((item) =>
        patientMatchesId(item, patientId)
          ? { ...item, lastVisit: appointment.date }
          : item
      );

      setPatients(updatedPatients);
      localStorage.setItem("dermisPatients", JSON.stringify(updatedPatients));

      const selectedPatientRaw = localStorage.getItem("dermisSelectedPatient");
      if (selectedPatientRaw) {
        try {
          const selectedPatient: Patient = JSON.parse(selectedPatientRaw);
          if (patientMatchesId(selectedPatient, patientId)) {
            localStorage.setItem(
              "dermisSelectedPatient",
              JSON.stringify({ ...selectedPatient, lastVisit: appointment.date })
            );
          }
        } catch (error) {
          console.error("Could not update selected patient:", error);
        }
      }

      const storedPlans = localStorage.getItem("dermisTreatmentPlans");
      if (storedPlans) {
        try {
          const plansByPatient = JSON.parse(storedPlans);
          if (plansByPatient && !Array.isArray(plansByPatient)) {
            const patientPlans = Array.isArray(plansByPatient[patientId])
              ? plansByPatient[patientId]
              : [];

            let completedOne = false;
            plansByPatient[patientId] = patientPlans.map(
              (plan: { treatment?: string; status?: string }) => {
                if (
                  !completedOne &&
                  plan.treatment === appointment.treatment &&
                  plan.status === "Active"
                ) {
                  completedOne = true;
                  return { ...plan, status: "Completed" };
                }
                return plan;
              }
            );

            localStorage.setItem(
              "dermisTreatmentPlans",
              JSON.stringify(plansByPatient)
            );
          }
        } catch (error) {
          console.error("Could not update treatment plans:", error);
        }
      }

      const storedProfiles = localStorage.getItem("dermisClinicalProfiles");
      if (storedProfiles) {
        try {
          const profiles = JSON.parse(storedProfiles);
          const profile = profiles?.[patientId];

          if (profile) {
            const timeline = Array.isArray(profile.timeline) ? profile.timeline : [];
            const marker = `Appointment #${appointment.id}`;

            if (
              !timeline.some(
                (item: { description?: string }) =>
                  item.description?.includes(marker)
              )
            ) {
              profiles[patientId] = {
                ...profile,
                timeline: [
                  {
                    date: appointment.date,
                    title: `${appointment.treatment} completed`,
                    description: `${marker} · ${appointment.practitioner}${
                      appointment.notes ? ` · ${appointment.notes}` : ""
                    }`,
                    type: "Treatment",
                  },
                  ...timeline,
                ],
              };

              localStorage.setItem(
                "dermisClinicalProfiles",
                JSON.stringify(profiles)
              );
            }
          }
        } catch (error) {
          console.error("Could not update patient timeline:", error);
        }
      }
    }
  };

  /*
   * STATUS UPDATE
   */
  const updateAppointmentStatus = async (
    appointmentId: string | number,
    status: AppointmentStatus
  ) => {
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) return;

    const wasAlreadyCompleted = appointment.status === "Completed";
    const databaseId = appointment.supabaseId ||
      (isUuid(appointment.id) ? String(appointment.id) : null);

    if (databaseId) {
      const supabase = createClient();
      const updatePayload: {
        status: string;
        completed_at?: string | null;
      } = {
        status: toDatabaseStatus(status),
      };

      if (status === "Completed") {
        updatePayload.completed_at = new Date().toISOString();
      } else if (appointment.status === "Completed") {
        updatePayload.completed_at = null;
      }

      const { error } = await supabase
        .from("appointments")
        .update(updatePayload)
        .eq("id", databaseId);

      if (error) {
        console.error("Could not update appointment status in Supabase:", error);
        setUpdateConfirmed(`Could not update appointment: ${error.message}`);
        return;
      }

      /*
       * Keep the linked treatment-plan item in sync with the appointment.
       * The appointment state intentionally stays lightweight, so resolve the
       * relationship from the authoritative Supabase appointment row here.
       */
      if (status === "Completed") {
        const { data: appointmentLink, error: appointmentLinkError } = await supabase
          .from("appointments")
          .select("treatment_plan_item_id")
          .eq("id", databaseId)
          .eq("clinic_id", clinicId)
          .maybeSingle();

        if (appointmentLinkError) {
          console.error(
            "Could not resolve appointment treatment-plan item:",
            appointmentLinkError
          );
          setUpdateConfirmed(
            `The appointment was completed, but its treatment-plan item could not be resolved: ${appointmentLinkError.message}`
          );
          return;
        }

        if (appointmentLink?.treatment_plan_item_id) {
          const { data: completedPlanItem, error: planItemError } = await supabase
            .from("treatment_plan_items")
            .update({ status: "completed" })
            .eq("id", appointmentLink.treatment_plan_item_id)
            .eq("clinic_id", clinicId)
            .select("id, treatment_plan_id, status")
            .maybeSingle();

          if (planItemError) {
            console.error(
              "Could not complete linked treatment-plan item:",
              planItemError
            );
            setUpdateConfirmed(
              `The appointment was completed, but its treatment-plan item could not be completed: ${planItemError.message}`
            );
            return;
          }

          if (!completedPlanItem) {
            console.error(
              "Linked treatment-plan item update matched no Supabase row.",
              {
                treatmentPlanItemId: appointmentLink.treatment_plan_item_id,
                clinicId,
              }
            );
            setUpdateConfirmed(
              "The appointment was completed, but no matching treatment-plan item was found."
            );
            return;
          }

          const { error: planError } = await supabase
            .from("treatment_plans")
            .update({ status: "completed" })
            .eq("id", completedPlanItem.treatment_plan_id)
            .eq("clinic_id", clinicId);

          if (planError) {
            console.error("Could not complete linked treatment plan:", planError);
            setUpdateConfirmed(
              `The appointment and treatment-plan item were completed, but the treatment plan could not be completed: ${planError.message}`
            );
            return;
          }
        }
      }
    }

    const updatedAppointments = appointments.map((item) =>
      item.id === appointmentId ? { ...item, status } : item
    );
    saveAppointments(updatedAppointments);

    if (status === "Completed") {
      if (!wasAlreadyCompleted) {
        recordCompletedTreatment(appointment);
        createFollowUpRecord(appointment);

        if (isUuid(appointment.patientId)) {
          const supabase = createClient();
          const completedAt = zonedDateTimeToUtcIso(
            appointment.rawDate,
            appointment.rawTime,
            clinicTimeZone
          );
          const { data: updatedPatientRow, error: patientUpdateError } = await supabase
            .from("patients")
            .update({ last_visit_at: completedAt })
            .eq("id", String(appointment.patientId))
            .eq("clinic_id", clinicId)
            .select("id, last_visit_at")
            .maybeSingle();

          if (patientUpdateError) {
            console.error(
              "Could not update patient last visit in Supabase:",
              patientUpdateError
            );
            setUpdateConfirmed(
              `${appointment.patient}'s appointment was completed, but the patient last-visit update failed: ${patientUpdateError.message}`
            );
            return;
          }

          if (!updatedPatientRow) {
            console.error(
              "Patient last visit update matched no Supabase row.",
              { patientId: appointment.patientId, clinicId }
            );
            setUpdateConfirmed(
              `${appointment.patient}'s appointment was completed, but no matching patient row was found for the last-visit update.`
            );
            return;
          }
        }
      }

      setUpdateConfirmed(
        `${appointment.patient}'s appointment has been completed, added to treatment history, and marked due for follow-up.`
      );
    }

    if (status === "Cancelled") {
      setUpdateConfirmed(`${appointment.patient}'s appointment has been cancelled.`);
    }

    if (status === "Confirmed") {
      setUpdateConfirmed(`${appointment.patient}'s appointment has been restored.`);
    }
  };

  /*
   * COUNTS
   */
  const appointmentsForSelectedDate =
    appointments.filter(
      (appointment) =>
        appointment.rawDate ===
        selectedDate
    );

  const calendarYear =
    calendarMonth.getFullYear();

  const calendarMonthIndex =
    calendarMonth.getMonth();

  const calendarDays =
    buildCalendarDays(
      calendarYear,
      calendarMonthIndex
    );

  const goToPreviousMonth = () => {
    setCalendarMonth(
      new Date(
        calendarYear,
        calendarMonthIndex - 1,
        1
      )
    );
  };

  const goToNextMonth = () => {
    setCalendarMonth(
      new Date(
        calendarYear,
        calendarMonthIndex + 1,
        1
      )
    );
  };

  const confirmedCount =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Confirmed"
    ).length;

  const completedCount =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Completed"
    ).length;

  const todayAppointments =
    appointments.filter(
      (appointment) =>
        appointment.rawDate ===
          new Date().toISOString().slice(0, 10) &&
        appointment.status !==
          "Cancelled"
    ).length;

  return (
    <main className="min-h-screen bg-[#F2F5F2] text-[#182019]">

      <div className="flex min-h-screen">

        <Sidebar activePage="Appointments" />

        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E1E7E0] bg-[#FDFEFC]/96 px-6 py-4 backdrop-blur-xl lg:px-10">

            <div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[#74887A]">
                Velyquo scheduling
              </p>

              <h1 className="mt-1.5 text-[20px] font-semibold tracking-[-0.045em] text-[#202922]">
                Appointments
              </h1>

            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={
                  openNewAppointment
                }
                className="rounded-[13px] bg-[#173725] px-5 py-3 text-[12px] font-semibold text-white shadow-[0_12px_30px_rgba(23,55,37,0.18)] transition hover:-translate-y-px hover:bg-[#102D1C]"
              >
                + New appointment
              </button>

              <a
                href="/settings"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4DFD4] bg-[#E8F0E8] text-[10px] font-semibold text-[#3F5A47] transition hover:bg-[#E3ECE3]"
              >
                {clinicSettings.initials ||
                  getInitials(
                    clinicSettings.practitionerName
                  )}
              </a>

            </div>

          </header>

          {/* CONTENT */}
          <div className="mx-auto w-full max-w-[1520px] p-6 lg:px-10 lg:py-9">

            {/* TITLE */}
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

              <div>

                <p className="text-sm text-[#626D65]">
                  Clinic schedule
                </p>

                <h2 className="mt-1 text-3xl font-medium tracking-[-0.04em]">
                  Appointments
                </h2>

                <p className="mt-2 max-w-xl text-xs leading-5 text-[#8C978F]">
                  Manage bookings, practitioner availability and patient follow-ups from one schedule.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  openNewAppointment
                }
                className="w-fit rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white hover:bg-[#333]"
              >
                + New appointment
              </button>

            </div>

            {/* SUCCESS */}
            {(bookingConfirmed ||
              updateConfirmed) && (

              <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-[#D7DDD4] bg-[#F0F3EE] p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#62715D]">

                    <Check
                      size={17}
                      strokeWidth={2}
                    />

                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      {bookingConfirmed
                        ? "Booking confirmed"
                        : "Appointment updated"}
                    </p>

                    <p className="mt-1 text-xs text-[#62715D]">
                      {bookingConfirmed
                        ? `${formPatient} has been booked for ${formTreatment} on ${formatDate(
                            formDate
                          )} at ${formatTime(
                            formTime
                          )}.`
                        : updateConfirmed}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setBookingConfirmed(
                      false
                    );
                    setUpdateConfirmed(
                      ""
                    );
                  }}
                >
                  <X
                    size={17}
                    strokeWidth={1.7}
                  />
                </button>

              </div>

            )}

            {/* FORM */}
            {showForm && (

              <div className="mt-6 rounded-[26px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_16px_44px_rgba(27,43,32,0.055)] p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-[#626D65]">
                      Appointment management
                    </p>

                    <h3 className="mt-1 text-xl font-semibold">
                      {editingAppointmentId !==
                      null
                        ? "Edit appointment"
                        : "New appointment"}
                    </h3>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(
                        false
                      );
                      resetAppointmentForm();
                    }}
                    className="rounded-lg border border-[#DDE5DC] px-3 py-2 text-xs text-[#626D65] hover:bg-[#F3F7F3]"
                  >
                    Close
                  </button>

                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">

                  {/* PATIENT */}
                  <div>

                    <label className="text-xs font-medium text-[#626D65]">
                      Patient
                    </label>

                    <select
                      value={
                        formPatient
                      }
                      onChange={(event) =>
                        setFormPatient(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-[14px] border border-[#DDE5DC] bg-[#F7F9F6] px-4 py-3 text-sm outline-none"
                    >

                      {patients.map(
                        (patient) => (
                          <option
                            key={
                              patient.id
                            }
                          >
                            {
                              patient.name
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* TREATMENT */}
                  <div>

                    <label className="text-xs font-medium text-[#626D65]">
                      Treatment
                    </label>

                    <select
                      value={
                        formTreatment
                      }
                      onChange={(event) =>
                        changeTreatment(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-[14px] border border-[#DDE5DC] bg-[#F7F9F6] px-4 py-3 text-sm outline-none"
                    >

                      {treatmentOptions.map(
                        (treatment) => (
                          <option
                            key={
                              treatment.name
                            }
                          >
                            {
                              treatment.name
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* DATE */}
                  <div>

                    <label className="text-xs font-medium text-[#626D65]">
                      Date
                    </label>

                    <input
                      type="date"
                      value={
                        formDate
                      }
                      onChange={(event) =>
                        setFormDate(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-[14px] border border-[#DDE5DC] bg-[#F7F9F6] px-4 py-3 text-sm outline-none"
                    />

                  </div>

                  {/* PRACTITIONER */}
                  <div>

                    <label className="text-xs font-medium text-[#626D65]">
                      Practitioner
                    </label>

                    {practitionersAvailableOnDate.length >
                    0 ? (

                      <select
                        value={
                          formPractitionerId ??
                          ""
                        }
                        onChange={(event) =>
                          setFormPractitionerId(
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="mt-2 w-full rounded-[14px] border border-[#DDE5DC] bg-[#F7F9F6] px-4 py-3 text-sm outline-none"
                      >

                        {practitionersAvailableOnDate.map(
                          (
                            practitioner
                          ) => (
                            <option
                              key={
                                practitioner.id
                              }
                              value={
                                practitioner.id
                              }
                            >
                              {
                                practitioner.name
                              }
                              {" — "}
                              {
                                practitioner.role
                              }
                            </option>
                          )
                        )}

                      </select>

                    ) : (

                      <div className="mt-2 rounded-xl bg-[#F7EEEE] px-4 py-3 text-sm text-[#8A6666]">
                        No practitioner available on this day.
                      </div>

                    )}

                  </div>

                  {/* TIME */}
                  <div>

                    <label className="text-xs font-medium text-[#626D65]">
                      Available time
                    </label>

                    {availableTimeSlots.length >
                    0 ? (

                      <select
                        value={
                          formTime
                        }
                        onChange={(event) =>
                          setFormTime(
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-[14px] border border-[#DDE5DC] bg-[#F7F9F6] px-4 py-3 text-sm outline-none"
                      >

                        {availableTimeSlots.map(
                          (time) => (
                            <option
                              key={time}
                              value={time}
                            >
                              {
                                formatTime(
                                  time
                                )
                              }
                            </option>
                          )
                        )}

                      </select>

                    ) : (

                      <div className="mt-2 rounded-xl bg-[#F7EEEE] px-4 py-3 text-sm text-[#8A6666]">
                        No available time slots.
                      </div>

                    )}

                  </div>

                  {/* DURATION */}
                  <div>

                    <label className="text-xs font-medium text-[#626D65]">
                      Duration
                    </label>

                    <select
                      value={
                        formDuration
                      }
                      onChange={(event) =>
                        setFormDuration(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-[14px] border border-[#DDE5DC] bg-[#F7F9F6] px-4 py-3 text-sm outline-none"
                    >
                      <option>
                        30 min
                      </option>
                      <option>
                        45 min
                      </option>
                      <option>
                        50 min
                      </option>
                      <option>
                        60 min
                      </option>
                      <option>
                        75 min
                      </option>
                      <option>
                        90 min
                      </option>
                    </select>

                  </div>

                </div>

                {/* AVAILABILITY */}
                {selectedPractitioner && (

                  <div className="mt-5 rounded-xl bg-[#F5F8F4] p-5">

                    <div className="flex items-start justify-between">

                      <div>

                        <p className="text-[10px] uppercase tracking-[0.12em] text-[#8C978F]">
                          Practitioner availability
                        </p>

                        <p className="mt-2 text-sm font-semibold">
                          {
                            selectedPractitioner.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#626D65]">
                          {
                            selectedPractitioner.role
                          }
                        </p>

                      </div>

                      <span className="rounded-full bg-[#E8EEE5] px-3 py-1 text-[9px] font-medium text-[#62715D]">
                        {
                          availableTimeSlots.length
                        }{" "}
                        slots available
                      </span>

                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">

                      <SummaryItem
                        label="Day"
                        value={
                          getWeekday(
                            formDate
                          )
                        }
                      />

                      <SummaryItem
                        label="Working hours"
                        value={`${selectedPractitioner.startTime} – ${selectedPractitioner.endTime}`}
                      />

                      <SummaryItem
                        label="Duration"
                        value={
                          formDuration
                        }
                      />

                    </div>

                  </div>

                )}

                {/* CONFLICT */}
                {(conflictMessage ||
                  bookingHasConflict) && (

                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#E4D4D4] bg-[#F7EEEE] p-4">

                    <AlertTriangle
                      size={18}
                      className="shrink-0 text-[#8A6666]"
                    />

                    <div>

                      <p className="text-sm font-semibold text-[#755555]">
                        Appointment conflict
                      </p>

                      <p className="mt-1 text-xs text-[#8A6666]">
                        {conflictMessage ||
                          "The selected appointment overlaps another booking."}
                      </p>

                    </div>

                  </div>

                )}

                {/* NOTES */}
                <div className="mt-5">

                  <label className="text-xs font-medium text-[#626D65]">
                    Notes
                  </label>

                  <textarea
                    rows={3}
                    value={
                      formNotes
                    }
                    onChange={(event) =>
                      setFormNotes(
                        event.target.value
                      )
                    }
                    className="mt-2 w-full resize-none rounded-[14px] border border-[#DDE5DC] bg-[#F7F9F6] px-4 py-3 text-sm outline-none"
                  />

                </div>

                {/* SUMMARY */}
                <div className="mt-6 rounded-xl bg-[#F5F8F4] p-5">

                  <div className="flex items-center gap-2">

                    <CalendarDays
                      size={16}
                      className="text-[#626D65]"
                    />

                    <p className="text-xs font-medium text-[#626D65]">
                      Appointment summary
                    </p>

                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <SummaryItem
                      label="Patient"
                      value={
                        formPatient
                      }
                    />

                    <SummaryItem
                      label="Treatment"
                      value={
                        formTreatment
                      }
                    />

                    <SummaryItem
                      label="Date"
                      value={
                        formatDate(
                          formDate
                        )
                      }
                    />

                    <SummaryItem
                      label="Time"
                      value={
                        formatTime(
                          formTime
                        )
                      }
                    />

                  </div>

                </div>

                {/* ACTIONS */}
                <div className="mt-6 flex justify-end gap-3">

                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(
                        false
                      );
                      resetAppointmentForm();
                    }}
                    className="rounded-xl border border-[#DDE5DC] px-5 py-3 text-sm font-medium hover:bg-[#F3F7F3]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      !selectedPractitioner ||
                      availableTimeSlots.length ===
                        0 ||
                      bookingHasConflict
                    }
                    onClick={
                      saveAppointment
                    }
                    className={`rounded-xl px-5 py-3 text-sm font-medium ${
                      selectedPractitioner &&
                      availableTimeSlots.length >
                        0 &&
                      !bookingHasConflict
                        ? "bg-[#173725] text-white shadow-[0_9px_24px_rgba(31,58,43,0.14)] transition hover:-translate-y-px hover:bg-[#102D1C]"
                        : "cursor-not-allowed bg-[#DDDCD6] text-[#8C978F]"
                    }`}
                  >
                    {editingAppointmentId !==
                    null
                      ? "Save changes"
                      : "Confirm appointment"}
                  </button>

                </div>

              </div>

            )}

            {/* STATS */}
            <div className="mt-8 grid gap-4 sm:grid-cols-4">

              <StatBox
                label="Today's appointments"
                value={String(
                  todayAppointments
                )}
                detail="Current schedule"
              />

              <StatBox
                label="Confirmed"
                value={String(
                  confirmedCount
                )}
                detail="Confirmed bookings"
              />

              <StatBox
                label="Completed"
                value={String(
                  completedCount
                )}
                detail="Finished appointments"
              />

              <StatBox
                label="Total appointments"
                value={String(
                  appointments.length
                )}
                detail="Saved clinic bookings"
              />

            </div>

            {/* CALENDAR */}
            <div className="mt-8 rounded-[26px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_16px_44px_rgba(27,43,32,0.055)] p-5">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                  <p className="text-xs text-[#8C978F]">
                    Selected date
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    {formatLongDate(
                      selectedDate
                    )}
                  </h3>

                </div>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={
                      goToPreviousMonth
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DDE5DC] text-lg text-[#626D65] transition hover:-translate-y-px hover:bg-[#F3F7F3] hover:text-[#171717]"
                    aria-label="Previous month"
                  >
                    ‹
                  </button>

                  <div className="min-w-[150px] text-center text-sm font-semibold">
                    {formatMonthYear(
                      calendarMonth
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={
                      goToNextMonth
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DDE5DC] text-lg text-[#626D65] transition hover:-translate-y-px hover:bg-[#F3F7F3] hover:text-[#171717]"
                    aria-label="Next month"
                  >
                    ›
                  </button>

                </div>

              </div>

              <div className="mt-6 grid grid-cols-7 gap-2">

                {[
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                  "Sun",
                ].map((day) => (

                  <div
                    key={day}
                    className="px-1 pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8C978F]"
                  >
                    {day}
                  </div>

                ))}

                {calendarDays.map(
                  (day, index) => {
                    if (day === null) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="min-h-[72px] rounded-xl"
                        />
                      );
                    }

                    const isoDate =
                      toIsoDate(
                        calendarYear,
                        calendarMonthIndex,
                        day
                      );

                    const dayAppointments =
                      appointments.filter(
                        (appointment) =>
                          appointment.rawDate ===
                            isoDate &&
                          appointment.status !==
                            "Cancelled"
                      );

                    const isSelected =
                      selectedDate ===
                      isoDate;

                    return (

                      <button
                        key={isoDate}
                        type="button"
                        onClick={() =>
                          setSelectedDate(
                            isoDate
                          )
                        }
                        className={`min-h-[72px] rounded-xl border px-2 py-2 text-left transition ${
                          isSelected
                            ? "border-[#171717] bg-[#171717] text-white"
                            : "border-transparent bg-[#F5F8F4] text-[#626D65] hover:border-[#DDE5DC] hover:bg-[#F2F1EC]"
                        }`}
                      >

                        <div className="flex items-start justify-between gap-1">

                          <span className="text-sm font-semibold">
                            {day}
                          </span>

                          {dayAppointments.length >
                            0 && (

                            <span
                              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px] font-semibold ${
                                isSelected
                                  ? "bg-white text-[#171717]"
                                  : "bg-[#E8F0E8] text-[#5F5E58]"
                              }`}
                            >
                              {
                                dayAppointments.length
                              }
                            </span>

                          )}

                        </div>

                        {dayAppointments.length >
                          0 && (

                          <p
                            className={`mt-3 truncate text-[9px] ${
                              isSelected
                                ? "text-[#D8D8D3]"
                                : "text-[#8C978F]"
                            }`}
                          >
                            {
                              dayAppointments[0]
                                .time
                            }
                          </p>

                        )}

                      </button>

                    );
                  }
                )}

              </div>

              <div className="mt-5 border-t border-[#ECEBE6] pt-5">

                <div className="flex items-center justify-between gap-3">

                  <p className="text-xs font-medium text-[#626D65]">
                    Appointments on{" "}
                    {formatLongDate(
                      selectedDate
                    )}
                  </p>

                  <span className="text-[10px] text-[#8C978F]">
                    {
                      appointmentsForSelectedDate.length
                    }{" "}
                    booking
                    {appointmentsForSelectedDate.length ===
                    1
                      ? ""
                      : "s"}
                  </span>

                </div>

                {appointmentsForSelectedDate.length >
                0 ? (

                  <div className="mt-4 space-y-3">

                    {appointmentsForSelectedDate.map(
                      (appointment) => (

                        <div
                          key={
                            appointment.id
                          }
                          className="flex items-center gap-3 rounded-xl bg-[#F5F8F4] p-4"
                        >

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[10px] font-medium">
                            {
                              appointment.initials
                            }
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-medium">
                              {
                                appointment.patient
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-[#8C978F]">
                              {
                                appointment.treatment
                              }{" "}
                              ·{" "}
                              {
                                appointment.time
                              }{" "}
                              ·{" "}
                              {
                                appointment.practitioner
                              }
                            </p>

                          </div>

                          <span className="rounded-full bg-white px-3 py-1 text-[10px] text-[#626D65]">
                            {
                              appointment.status
                            }
                          </span>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="mt-4 rounded-xl bg-[#F5F8F4] px-4 py-5 text-center">

                    <p className="text-sm font-medium text-[#626D65]">
                      No appointments on this date
                    </p>

                    <p className="mt-1 text-xs text-[#8C978F]">
                      Select another date or create a new appointment.
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* SEARCH */}
            <div className="mt-6 rounded-[26px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_16px_44px_rgba(27,43,32,0.055)] p-4">

              <div className="flex flex-col gap-3 md:flex-row">

                <input
                  value={
                    search
                  }
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search appointments..."
                  className="flex-1 rounded-[14px] border border-[#DDE5DC] bg-[#F7F9F6] px-4 py-3 text-sm outline-none"
                />

                <select
                  value={
                    filter
                  }
                  onChange={(event) =>
                    setFilter(
                      event.target.value
                    )
                  }
                  className="rounded-[14px] border border-[#DDE5DC] bg-[#F7F9F6] px-4 py-3 text-sm outline-none"
                >
                  <option>
                    All
                  </option>
                  <option>
                    Confirmed
                  </option>
                  <option>
                    Upcoming
                  </option>
                  <option>
                    Completed
                  </option>
                  <option>
                    Cancelled
                  </option>
                </select>

              </div>

            </div>

            {/* APPOINTMENT LIST */}
            <div className="mt-4 overflow-hidden rounded-[26px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_16px_44px_rgba(27,43,32,0.055)]">

              <div className="border-b border-[#ECEBE6] px-6 py-5">

                <p className="text-sm text-[#626D65]">
                  Schedule
                </p>

                <h3 className="mt-1 text-lg font-semibold">
                  All Appointments
                </h3>

              </div>

              <div className="divide-y divide-[#F0EFEA]">

                {filteredAppointments.map(
                  (appointment) => (

                    <div
                      key={
                        appointment.id
                      }
                      className={`p-6 ${
                        appointment.status ===
                        "Cancelled"
                          ? "opacity-60"
                          : ""
                      }`}
                    >

                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">

                        {/* PATIENT */}
                        <div className="flex min-w-0 flex-1 items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8E5DD] text-xs font-medium">
                            {
                              appointment.initials
                            }
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium">
                              {
                                appointment.patient
                              }
                            </p>

                            <p className="mt-1 text-xs text-[#96958E]">
                              {
                                appointment.treatment
                              }
                            </p>

                          </div>

                        </div>

                        <InfoColumn
                          label="Date"
                          value={
                            appointment.date
                          }
                        />

                        <InfoColumn
                          label="Time"
                          value={
                            appointment.time
                          }
                        />

                        <InfoColumn
                          label="Duration"
                          value={
                            appointment.duration
                          }
                        />

                        <InfoColumn
                          label="Practitioner"
                          value={
                            appointment.practitioner
                          }
                        />

                        <StatusBadge
                          status={
                            appointment.status
                          }
                        />

                      </div>

                      {/* ACTIONS */}
                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#ECEBE6] pt-4">

                        {appointment.status !==
                          "Cancelled" &&
                          appointment.status !==
                            "Completed" && (

                          <button
                            type="button"
                            onClick={() =>
                              editAppointment(
                                appointment
                              )
                            }
                            className="flex items-center gap-2 rounded-lg border border-[#DDE5DC] px-3 py-2 text-xs font-medium hover:bg-[#F3F7F3]"
                          >
                            <Pencil
                              size={13}
                            />
                            Edit / reschedule
                          </button>

                        )}

                        {appointment.status !==
                          "Completed" &&
                          appointment.status !==
                            "Cancelled" && (

                          <button
                            type="button"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "Completed"
                              )
                            }
                            className="flex items-center gap-2 rounded-lg border border-[#D7DDD4] bg-[#F0F3EE] px-3 py-2 text-xs font-medium text-[#62715D]"
                          >
                            <CheckCircle2
                              size={13}
                            />
                            Mark completed
                          </button>

                        )}

                        {appointment.status !==
                          "Cancelled" &&
                          appointment.status !==
                            "Completed" && (

                          <button
                            type="button"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "Cancelled"
                              )
                            }
                            className="flex items-center gap-2 rounded-lg border border-[#E5D7D7] px-3 py-2 text-xs font-medium text-[#8A6666] hover:bg-[#F7EEEE]"
                          >
                            <XCircle
                              size={13}
                            />
                            Cancel
                          </button>

                        )}

                        {appointment.status ===
                          "Cancelled" && (

                          <button
                            type="button"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "Confirmed"
                              )
                            }
                            className="flex items-center gap-2 rounded-lg border border-[#DDE5DC] px-3 py-2 text-xs font-medium hover:bg-[#F3F7F3]"
                          >
                            <RotateCcw
                              size={13}
                            />
                            Restore booking
                          </button>

                        )}

                        {appointment.status ===
                          "Completed" && (

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="flex items-center gap-2 text-xs font-medium text-[#62715D]">
                              <CheckCircle2
                                size={14}
                              />
                              Appointment completed
                            </span>

                            {getFollowUpForAppointment(
                              appointment.id
                            ) && (
                              <>
                                <span className="rounded-full bg-[#F5F0E7] px-3 py-1 text-[10px] font-medium text-[#806E52]">
                                  Follow-up{" "}
                                  {getFollowUpForAppointment(
                                    appointment.id
                                  )?.status.toLowerCase()}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteFollowUp(
                                      appointment
                                    )
                                  }
                                  className="flex items-center gap-2 rounded-lg border border-[#E5D7D7] bg-white px-3 py-2 text-xs font-medium text-[#8A6666] hover:bg-[#F7EEEE]"
                                  title="Delete follow-up"
                                >
                                  <Trash2
                                    size={13}
                                  />
                                  Delete follow-up
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openFollowUpAppointment(
                                      appointment
                                    )
                                  }
                                  className="flex items-center gap-2 rounded-lg border border-[#DDE5DC] bg-white px-3 py-2 text-xs font-medium hover:bg-[#F3F7F3]"
                                >
                                  <CalendarDays
                                    size={13}
                                  />
                                  Book follow-up
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openFollowUpAnalysis(
                                      appointment
                                    )
                                  }
                                  className="flex items-center gap-2 rounded-lg border border-[#D7DDD4] bg-[#F0F3EE] px-3 py-2 text-xs font-medium text-[#62715D]"
                                >
                                  <CheckCircle2
                                    size={13}
                                  />
                                  New skin analysis
                                </button>
                              </>
                            )}

                          </div>

                        )}

                      </div>

                    </div>

                  )
                )}

                {filteredAppointments.length ===
                  0 && (

                  <div className="px-6 py-12 text-center">

                    <p className="text-sm font-medium">
                      No appointments found
                    </p>

                    <p className="mt-2 text-xs text-[#8C978F]">
                      Try changing the search or status filter.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[10px] uppercase tracking-[0.1em] text-[#8C978F]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium">
        {value}
      </p>

    </div>
  );
}

function InfoColumn({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[110px]">

      <p className="text-[10px] text-[#8C978F]">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value}
      </p>

    </div>
  );
}

function StatBox({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[26px] border border-[#DDE5DC] bg-[#FFFFFE] shadow-[0_16px_44px_rgba(27,43,32,0.055)] p-5">

      <p className="text-xs text-[#626D65]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#71806C]">
        {detail}
      </p>

    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  let classes =
    "bg-[#F1F0EB] text-[#626D65]";

  if (
    status === "Confirmed"
  ) {
    classes =
      "bg-[#E8EEE5] text-[#62715D]";
  }

  if (
    status === "Completed"
  ) {
    classes =
      "bg-[#E8EEE5] text-[#51614C]";
  }

  if (
    status === "Cancelled"
  ) {
    classes =
      "bg-[#F3EAEA] text-[#8A6666]";
  }

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-medium ${classes}`}
    >
      {status}
    </span>
  );
}
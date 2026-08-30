"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  UsersRound,
} from "lucide-react";

import Sidebar from "../components/sidebar";
import { createClient } from "../lib/supabase-browser";

const supabase = createClient();

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

type Practitioner = {
  id: number;
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

type Appointment = {
  id: number;
  patient: string;
  patientId?: number;
  initials: string;
  treatment: string;
  date: string;
  rawDate?: string;
  time: string;
  rawTime?: string;
  duration: string;
  practitioner?: string;
  practitionerId?: number;
  notes?: string;
  status: string;
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

type ProgressReport = {
  id?: number | string;
  patient?: string;
  patientId?: number;
  beforeDate?: string;
  afterDate?: string;
  baselineDate?: string;
  comparisonDate?: string;
  baselineScore?: number;
  comparisonScore?: number;
  scoreChange?: number;
  treatmentProgramme?: string;
  generatedAt?: string;
  date?: string;
};

type TreatmentPlan = {
  id?: number;
  patient?: string;
  patientId?: number;
  treatment?: string;
  duration?: string;
  price?: string;
  status?: string;
  createdAt?: string;
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
  completedRawDate: string;
  practitioner: string;
  practitionerId?: number;
  status: FollowUpStatus;
  createdAt: string;
  followUpAppointmentId?: number;
};

type RecentActivity = {
  id: string;
  name: string;
  type: string;
  date: string;
  status: string;
  patientId?: number;
  timestamp: number;
};

type ChartPoint = {
  label: string;
  count: number;
  height: number;
};

const defaultPractitioners: Practitioner[] = [
  {
    id: 1,
    name: "Sarah Williams",
    role: "Lead Practitioner",
    email: "sarah@skinhouseclinic.co.uk",
    phone: "+44 20 7946 0958",
    speciality: "Skin Health & Facial Aesthetics",
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
    speciality: "Acne, Pigmentation & Skin Rejuvenation",
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

const fallbackPatients: Patient[] = [
  {
    id: 1,
    name: "Emily Johnson",
    email: "emily.johnson@email.com",
    phone: "+44 7700 900123",
    age: 29,
    lastVisit: "25 Aug 2026",
    status: "Active",
    concern: "Acne & Pigmentation",
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
];

const fallbackAppointments: Appointment[] = [
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

function parseClinicDate(value?: string) {
  if (!value) return 0;

  const direct = new Date(value);

  if (!Number.isNaN(direct.getTime())) {
    return direct.getTime();
  }

  const cleaned = value
    .replace(",", "")
    .trim();

  const match = cleaned.match(
    /(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/
  );

  if (match) {
    const parsed = new Date(
      `${match[2]} ${match[1]}, ${match[3]}`
    );

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
  }

  return 0;
}

function formatActivityDate(value?: string) {
  if (!value) {
    return "Saved";
  }

  const trimmedValue = value.trim();

  const isIsoDate =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(
      trimmedValue
    );

  if (!isIsoDate) {
    return value;
  }

  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  const formattedDate =
    parsedDate.toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  const formattedTime =
    parsedDate.toLocaleTimeString(
      "en-GB",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );

  return `${formattedDate}, ${formattedTime}`;
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

function getFirstName(name: string) {
  const firstName = name
    .trim()
    .split(" ")
    .filter(Boolean)[0];

  return firstName || "Practitioner";
}

function getCurrentWeekday() {
  return new Date().toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
    }
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getAppointmentTimestamp(
  appointment: Appointment
) {
  const dateValue =
    appointment.rawDate ||
    appointment.date;

  const dateTimestamp =
    parseClinicDate(dateValue);

  if (!dateTimestamp) {
    return Number.MAX_SAFE_INTEGER;
  }

  const date = new Date(dateTimestamp);

  if (
    appointment.rawTime &&
    /^\d{2}:\d{2}$/.test(
      appointment.rawTime
    )
  ) {
    const [hours, minutes] =
      appointment.rawTime
        .split(":")
        .map(Number);

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return date.getTime();
  }

  return date.getTime();
}

export default function Dashboard() {
  const router = useRouter();

  const [checkingAccess, setCheckingAccess] =
    useState(true);

  const [
    clinicSettings,
    setClinicSettings,
  ] = useState<ClinicSettings>(
    defaultClinicSettings
  );

  const [patients, setPatients] =
    useState<Patient[]>(
      fallbackPatients
    );

  const [
    appointments,
    setAppointments,
  ] = useState<Appointment[]>(
    fallbackAppointments
  );

  const [
    analysisHistory,
    setAnalysisHistory,
  ] = useState<
    Record<number, AnalysisRecord[]>
  >({});

  const [reports, setReports] =
    useState<ProgressReport[]>([]);

  const [
    treatmentPlans,
    setTreatmentPlans,
  ] = useState<TreatmentPlan[]>([]);

  const [followUps, setFollowUps] =
    useState<FollowUpRecord[]>([]);

  const [period, setPeriod] =
    useState("30");

  const [dataLoaded, setDataLoaded] =
    useState(false);

  /*
   * AUTH + CLINIC ACCESS
   */
  useEffect(() => {
    let active = true;

    const verifyAccess = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const {
        data: memberships,
        error: membershipError,
      } = await supabase
        .from("clinic_memberships")
        .select("clinic_id, role, active")
        .eq("user_id", user.id)
        .eq("active", true)
        .limit(1);

      if (!active) return;

      if (
        membershipError ||
        !memberships ||
        memberships.length === 0
      ) {
        await supabase.auth.signOut();

        if (!active) return;

        localStorage.removeItem(
          "dermisDemoLoggedIn"
        );

        localStorage.removeItem(
          "dermisRememberLogin"
        );

        router.replace("/login");
        return;
      }

      setCheckingAccess(false);
    };

    verifyAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "SIGNED_OUT" ||
          !session
        ) {
          router.replace("/login");
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  /*
   * LOAD DATA
   */
  useEffect(() => {
    const loadClinicSettings = () => {
      const storedSettings =
        localStorage.getItem(
          "dermisClinicSettings"
        );

      if (!storedSettings) {
        setClinicSettings(
          defaultClinicSettings
        );

        return;
      }

      try {
        const parsedSettings =
          JSON.parse(
            storedSettings
          );

        setClinicSettings({
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
        });
      } catch (error) {
        console.error(
          "Could not load clinic settings:",
          error
        );

        setClinicSettings(
          defaultClinicSettings
        );
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

    /*
     * PATIENTS
     */
    const storedPatients =
      localStorage.getItem(
        "dermisPatients"
      );

    if (storedPatients) {
      try {
        const parsedPatients: Patient[] =
          JSON.parse(
            storedPatients
          );

        setPatients(
          parsedPatients
        );
      } catch (error) {
        console.error(
          "Could not load patients:",
          error
        );
      }
    }

    /*
     * APPOINTMENTS
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

    /*
     * ANALYSES
     */
    const storedAnalysisHistory =
      localStorage.getItem(
        "dermisAnalysisHistory"
      );

    if (storedAnalysisHistory) {
      try {
        const parsedHistory =
          JSON.parse(
            storedAnalysisHistory
          );

        setAnalysisHistory(
          parsedHistory
        );
      } catch (error) {
        console.error(
          "Could not load analysis history:",
          error
        );
      }
    }

    /*
     * REPORTS
     */
    const storedReports =
      localStorage.getItem(
        "dermisProgressReports"
      );

    if (storedReports) {
      try {
        const parsed =
          JSON.parse(storedReports);

        let reportArray: ProgressReport[] =
          [];

        if (Array.isArray(parsed)) {
          reportArray = parsed;
        } else if (
          parsed &&
          typeof parsed === "object"
        ) {
          reportArray =
            Object.values(
              parsed
            ).flatMap((value) =>
              Array.isArray(value)
                ? value
                : [value]
            ) as ProgressReport[];
        }

        setReports(
          reportArray
        );
      } catch (error) {
        console.error(
          "Could not load reports:",
          error
        );
      }
    }

    /*
     * TREATMENT PLANS
     */
    const storedTreatmentPlans =
      localStorage.getItem(
        "dermisTreatmentPlans"
      );

    if (storedTreatmentPlans) {
      try {
        const parsed =
          JSON.parse(
            storedTreatmentPlans
          );

        let planArray: TreatmentPlan[] =
          [];

        if (Array.isArray(parsed)) {
          planArray = parsed;
        } else if (
          parsed &&
          typeof parsed === "object"
        ) {
          planArray =
            Object.values(
              parsed
            ).flatMap((value) =>
              Array.isArray(value)
                ? value
                : [value]
            ) as TreatmentPlan[];
        }

        setTreatmentPlans(
          planArray
        );
      } catch (error) {
        console.error(
          "Could not load treatment plans:",
          error
        );
      }
    }

    /*
     * FOLLOW-UPS
     */
    const storedFollowUps =
      localStorage.getItem(
        "dermisFollowUps"
      );

    if (storedFollowUps) {
      try {
        const parsedFollowUps =
          JSON.parse(
            storedFollowUps
          );

        if (Array.isArray(parsedFollowUps)) {
          setFollowUps(
            parsedFollowUps
          );
        }
      } catch (error) {
        console.error(
          "Could not load follow-ups:",
          error
        );
      }
    }

    setDataLoaded(true);

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

  /*
   * PRACTITIONERS
   */
  const activePractitioners =
    useMemo(() => {
      return clinicSettings.practitioners.filter(
        (practitioner) =>
          practitioner.active
      );
    }, [
      clinicSettings.practitioners,
    ]);

  const todayWeekday =
    getCurrentWeekday();

  const practitionersWorkingToday =
    useMemo(() => {
      return activePractitioners.filter(
        (practitioner) =>
          practitioner.workingDays.length ===
            0 ||
          practitioner.workingDays.includes(
            todayWeekday
          )
      );
    }, [
      activePractitioners,
      todayWeekday,
    ]);

  /*
   * CORE STATS
   */
  const totalAnalyses =
    useMemo(() => {
      return Object.values(
        analysisHistory
      ).reduce(
        (total, records) =>
          total +
          records.length,
        0
      );
    }, [analysisHistory]);

  const activePatients =
    useMemo(() => {
      return patients.filter(
        (patient) =>
          patient.status ===
          "Active"
      ).length;
    }, [patients]);

  const confirmedAppointments =
    useMemo(() => {
      return appointments.filter(
        (appointment) =>
          appointment.status ===
          "Confirmed"
      ).length;
    }, [appointments]);

  const activeTreatmentPlans =
    useMemo(() => {
      return treatmentPlans.filter(
        (plan) =>
          plan.status ===
          "Active"
      ).length;
    }, [treatmentPlans]);

  /*
   * RECENT PATIENTS
   */
  const recentPatients =
    useMemo(() => {
      return [...patients]
        .sort(
          (a, b) =>
            parseClinicDate(
              b.lastVisit
            ) -
            parseClinicDate(
              a.lastVisit
            )
        )
        .slice(0, 5);
    }, [patients]);

  /*
   * UPCOMING APPOINTMENTS
   */
  const upcomingAppointments =
    useMemo(() => {
      return [...appointments]
        .filter(
          (appointment) =>
            appointment.status ===
              "Confirmed" ||
            appointment.status ===
              "Upcoming"
        )
        .sort(
          (a, b) =>
            getAppointmentTimestamp(a) -
            getAppointmentTimestamp(b)
        )
        .slice(0, 4);
    }, [appointments]);

  const actionableFollowUps =
    useMemo(() => {
      return [...followUps]
        .filter(
          (followUp) =>
            followUp.status === "Due" ||
            followUp.status ===
              "Scheduled" ||
            followUp.status ===
              "Analysis started"
        )
        .sort(
          (a, b) =>
            parseClinicDate(
              b.completedDate
            ) -
            parseClinicDate(
              a.completedDate
            )
        )
        .slice(0, 6);
    }, [followUps]);

  const followUpDueCount =
    useMemo(() => {
      return followUps.filter(
        (followUp) =>
          followUp.status === "Due"
      ).length;
    }, [followUps]);

  const openFollowUpAppointment = (
    followUp: FollowUpRecord
  ) => {
    const patient =
      patients.find(
        (item) =>
          item.id ===
            followUp.patientId ||
          item.name ===
            followUp.patient
      );

    if (patient) {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(patient)
      );
    }

    localStorage.setItem(
      "dermisFollowUpBooking",
      JSON.stringify({
        followUpId: followUp.id,
        appointmentId:
          followUp.appointmentId,
        patientId:
          followUp.patientId,
        patient: followUp.patient,
        treatment: followUp.treatment,
        practitioner:
          followUp.practitioner,
        practitionerId:
          followUp.practitionerId,
        completedDate:
          followUp.completedDate,
      })
    );

    window.location.href =
      "/appointments?from=follow-up";
  };

  const openFollowUpAnalysis = (
    followUp: FollowUpRecord
  ) => {
    const patient =
      patients.find(
        (item) =>
          item.id ===
            followUp.patientId ||
          item.name ===
            followUp.patient
      );

    if (patient) {
      localStorage.setItem(
        "dermisSelectedPatient",
        JSON.stringify(patient)
      );
    }

    const updatedFollowUps =
      followUps.map(
        (record) =>
          record.id === followUp.id
            ? {
                ...record,
                status:
                  "Analysis started" as FollowUpStatus,
              }
            : record
      );

    setFollowUps(
      updatedFollowUps
    );

    localStorage.setItem(
      "dermisFollowUps",
      JSON.stringify(
        updatedFollowUps
      )
    );

    localStorage.setItem(
      "dermisFollowUpSource",
      JSON.stringify({
        followUpId: followUp.id,
        appointmentId:
          followUp.appointmentId,
        patientId:
          followUp.patientId,
        patient:
          followUp.patient,
        treatment:
          followUp.treatment,
        completedDate:
          followUp.completedDate,
      })
    );

    window.location.href = "/analysis";
  };

  /*
   * PRACTITIONER APPOINTMENT COUNTS
   */
  const practitionerBookingCounts =
    useMemo(() => {
      const counts: Record<
        number,
        number
      > = {};

      activePractitioners.forEach(
        (practitioner) => {
          counts[
            practitioner.id
          ] = 0;
        }
      );

      appointments.forEach(
        (appointment) => {
          if (
            appointment.practitionerId &&
            counts[
              appointment.practitionerId
            ] !== undefined
          ) {
            counts[
              appointment.practitionerId
            ] += 1;

            return;
          }

          const matchingPractitioner =
            activePractitioners.find(
              (practitioner) =>
                practitioner.name ===
                appointment.practitioner
            );

          if (
            matchingPractitioner
          ) {
            counts[
              matchingPractitioner.id
            ] += 1;
          }
        }
      );

      return counts;
    }, [
      appointments,
      activePractitioners,
    ]);

  /*
   * RECENT ACTIVITY
   */
  const allActivities =
    useMemo<RecentActivity[]>(
      () => {
        const activities: RecentActivity[] =
          [];

        Object.entries(
          analysisHistory
        ).forEach(
          ([
            patientId,
            records,
          ]) => {
            const patient =
              patients.find(
                (item) =>
                  item.id ===
                  Number(patientId)
              );

            if (!patient) {
              return;
            }

            records.forEach(
              (analysis) => {
                activities.push({
                  id: `analysis-${patientId}-${analysis.id}`,
                  name:
                    patient.name,
                  type:
                    "Skin Analysis",
                  date:
                    analysis.date,
                  status:
                    "Completed",
                  patientId:
                    patient.id,
                  timestamp:
                    parseClinicDate(
                      analysis.date
                    ),
                });
              }
            );
          }
        );

        appointments.forEach(
          (appointment) => {
            const patient =
              patients.find(
                (item) =>
                  item.name ===
                  appointment.patient
              );

            activities.push({
              id: `appointment-${appointment.id}`,
              name:
                appointment.patient,
              type:
                appointment.treatment,
              date: `${appointment.date}, ${appointment.time}`,
              status:
                appointment.status,
              patientId:
                patient?.id,
              timestamp:
                parseClinicDate(
                  appointment.date
                ),
            });
          }
        );

        reports.forEach(
          (report, index) => {
            if (!report.patient) {
              return;
            }

            const patient =
              patients.find(
                (item) =>
                  item.name ===
                  report.patient
              );

            const reportDate =
              report.generatedAt ||
              report.date ||
              report.comparisonDate ||
              report.afterDate ||
              "Saved";

            activities.push({
              id: `report-${report.id ?? index}`,
              name:
                report.patient,
              type:
                "Progress report",
              date:
                reportDate,
              status:
                "Completed",
              patientId:
                patient?.id,
              timestamp:
                parseClinicDate(
                  reportDate
                ),
            });
          }
        );

        treatmentPlans.forEach(
          (plan, index) => {
            if (!plan.patient) {
              return;
            }

            activities.push({
              id: `treatment-${plan.id ?? index}`,
              name:
                plan.patient,
              type:
                plan.treatment ||
                "Treatment plan",
              date:
                plan.createdAt ||
                "Saved",
              status:
                plan.status ||
                "Active",
              patientId:
                plan.patientId,
              timestamp:
                parseClinicDate(
                  plan.createdAt
                ),
            });
          }
        );

        return activities.sort(
          (a, b) =>
            b.timestamp -
            a.timestamp
        );
      },
      [
        analysisHistory,
        appointments,
        reports,
        treatmentPlans,
        patients,
      ]
    );

  const recentActivity =
    useMemo(() => {
      return allActivities.slice(
        0,
        7
      );
    }, [allActivities]);

  /*
   * CHART
   */
  const chartData =
    useMemo<ChartPoint[]>(() => {
      const days =
        Number(period);

      const bucketCount = 12;

      const now = new Date();

      const endDate =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59
        );

      const startDate =
        new Date(endDate);

      startDate.setDate(
        startDate.getDate() -
          days +
          1
      );

      const bucketSize =
        days / bucketCount;

      const buckets =
        Array.from(
          {
            length:
              bucketCount,
          },
          () => ({
            count: 0,
          })
        );

      allActivities.forEach(
        (activity) => {
          if (!activity.timestamp) {
            return;
          }

          if (
            activity.timestamp <
              startDate.getTime() ||
            activity.timestamp >
              endDate.getTime()
          ) {
            return;
          }

          const elapsedDays =
            (activity.timestamp -
              startDate.getTime()) /
            (1000 *
              60 *
              60 *
              24);

          const bucketIndex =
            Math.min(
              Math.floor(
                elapsedDays /
                  bucketSize
              ),
              bucketCount -
                1
            );

          if (
            bucketIndex >= 0 &&
            bucketIndex <
              bucketCount
          ) {
            buckets[
              bucketIndex
            ].count += 1;
          }
        }
      );

      const maxCount =
        Math.max(
          ...buckets.map(
            (item) =>
              item.count
          ),
          1
        );

      return buckets.map(
        (bucket, index) => {
          const bucketDate =
            new Date(
              startDate
            );

          bucketDate.setDate(
            startDate.getDate() +
              Math.floor(
                index *
                  bucketSize
              )
          );

          const label =
            bucketDate.toLocaleDateString(
              "en-GB",
              {
                day: "numeric",
                month: "short",
              }
            );

          const height =
            bucket.count === 0
              ? 8
              : Math.max(
                  20,
                  Math.round(
                    (bucket.count /
                      maxCount) *
                      100
                  )
                );

          return {
            label,
            count:
              bucket.count,
            height,
          };
        }
      );
    }, [
      allActivities,
      period,
    ]);

  const periodActivityCount =
    useMemo(() => {
      const days =
        Number(period);

      const cutoff =
        Date.now() -
        days *
          24 *
          60 *
          60 *
          1000;

      return allActivities.filter(
        (activity) =>
          activity.timestamp >=
          cutoff
      ).length;
    }, [
      allActivities,
      period,
    ]);

  const patientActivity =
    totalAnalyses +
    appointments.length +
    reports.length +
    treatmentPlans.length +
    followUps.length;

  const currentDate =
    new Date().toLocaleDateString(
      "en-GB",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );

  const greeting =
    getGreeting();

  const practitionerFirstName =
    getFirstName(
      clinicSettings.practitionerName
    );

  const practitionerInitials =
    clinicSettings.initials
      ?.trim()
      .toUpperCase() ||
    getInitials(
      clinicSettings.practitionerName
    ) ||
    "SW";

  if (checkingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F5F1] px-6 text-[#181A18]">
        <div className="text-center">
          <div className="text-xl font-semibold tracking-[-0.04em]">
            velyquo
            <span className="text-[#5F7563]">
              .
            </span>
          </div>

          <p className="mt-3 text-[11px] text-[#8B918B]">
            Verifying secure clinic access...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F5F1] text-[#181A18]">

      <div className="flex min-h-screen">

        <Sidebar activePage="Overview" />

        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E4E2DC] bg-white/90 px-6 py-4 backdrop-blur-xl lg:px-10">

            <div>

              <p className="text-xs text-[#96958E]">
                {currentDate}
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                {greeting}, {practitionerFirstName}
              </h1>

              <p className="mt-1 text-[10px] text-[#999890]">
                {clinicSettings.clinicName}
              </p>

            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() => {
                  window.location.href =
                    "/patients";
                }}
                className="hidden rounded-xl border border-[#DDDCD6] bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:border-[#CFCFC8] hover:bg-[#F7F7F4] sm:block"
              >
                + Add Patient
              </button>

              <a
                href="/settings"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E2D9] text-xs font-medium transition hover:bg-[#DCD8CE]"
                title="Clinic settings"
              >
                {practitionerInitials}
              </a>

            </div>

          </header>

          {/* CONTENT */}
          <div className="mx-auto w-full max-w-[1600px] p-6 lg:p-10 xl:p-12">

            {/* HEADING */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div>

                <p className="text-sm text-[#77766F]">
                  Velyquo workspace
                </p>

                <h2 className="mt-1 text-3xl font-semibold tracking-[-0.045em] lg:text-[34px]">
                  Overview
                </h2>

              </div>

              <button
                type="button"
                onClick={() => {
                  window.location.href =
                    "/analysis";
                }}
                className="w-fit rounded-xl bg-[#1F2A23] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2B3930] hover:shadow-md"
              >
                + New Analysis
              </button>

            </div>

            {/* MAIN STATS */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                label="Total Patients"
                value={String(
                  patients.length
                )}
                change={`${activePatients} active`}
                description="clinic records"
              />

              <StatCard
                label="Skin Analyses"
                value={String(
                  totalAnalyses
                )}
                change={`${reports.length} reports`}
                description="saved analyses"
              />

              <StatCard
                label="Appointments"
                value={String(
                  appointments.length
                )}
                change={`${confirmedAppointments} confirmed`}
                description="scheduled bookings"
              />

              <StatCard
                label="Treatment Plans"
                value={String(
                  treatmentPlans.length
                )}
                change={`${activeTreatmentPlans} active`}
                description="saved plans"
              />

            </div>

            {/* MAIN GRID */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">

              {/* ACTIVITY */}
              <div className="rounded-[22px] border border-[#E2E0DA] bg-white p-6 shadow-[0_1px_2px_rgba(24,26,24,0.025)]">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-sm text-[#77766F]">
                      Clinic Activity
                    </p>

                    <div className="mt-2 flex flex-wrap items-baseline gap-3">

                      <h3 className="text-3xl font-semibold tracking-[-0.04em]">
                        {periodActivityCount}
                      </h3>

                      <span className="text-xs font-medium text-[#71806C]">
                        events in period
                      </span>

                    </div>

                    <p className="mt-2 text-[10px] text-[#999890]">
                      {patientActivity} saved events across your clinic
                    </p>

                  </div>

                  <select
                    value={period}
                    onChange={(event) =>
                      setPeriod(
                        event.target.value
                      )
                    }
                    className="rounded-lg border border-[#E0DFD9] bg-white px-3 py-2 text-xs outline-none"
                  >
                    <option value="7">
                      Last 7 Days
                    </option>

                    <option value="30">
                      Last 30 Days
                    </option>

                    <option value="90">
                      Last 90 Days
                    </option>
                  </select>

                </div>

                <div className="mt-10">

                  <div className="flex h-[230px] items-end gap-2 border-b border-[#ECEBE6]">

                    {chartData.map(
                      (
                        point,
                        index
                      ) => (

                        <div
                          key={`${point.label}-${index}`}
                          title={`${point.label}: ${point.count} activities`}
                          className="group relative flex h-full flex-1 items-end"
                        >

                          <div
                            className="w-full rounded-t-lg bg-[#AEB9AE] transition-all duration-300 group-hover:bg-[#738477]"
                            style={{
                              height: `${point.height}%`,
                            }}
                          />

                          <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#171717] px-2 py-1 text-[9px] text-white group-hover:block">
                            {point.count} activities
                          </div>

                        </div>

                      )
                    )}

                  </div>

                  <div className="mt-3 flex justify-between text-[10px] text-[#A1A099]">

                    <span>
                      {chartData[0]?.label}
                    </span>

                    <span>
                      {chartData[2]?.label}
                    </span>

                    <span>
                      {chartData[4]?.label}
                    </span>

                    <span>
                      {chartData[6]?.label}
                    </span>

                    <span>
                      {chartData[8]?.label}
                    </span>

                    <span>
                      {chartData[11]?.label}
                    </span>

                  </div>

                </div>

              </div>

              {/* UPCOMING */}
              <div className="rounded-[22px] border border-[#E2E0DA] bg-white p-6 shadow-[0_1px_2px_rgba(24,26,24,0.025)]">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-[#77766F]">
                      Schedule
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      Upcoming Appointments
                    </h3>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "/appointments";
                    }}
                    className="text-xs font-medium text-[#77766F] hover:text-black"
                  >
                    View all →
                  </button>

                </div>

                {upcomingAppointments.length >
                0 ? (

                  <div className="mt-6 space-y-3">

                    {upcomingAppointments.map(
                      (appointment) => (

                        <div
                          key={appointment.id}
                          className="flex items-center gap-3 rounded-xl border border-[#ECEAE4] bg-[#FCFCFA] p-3 transition hover:border-[#DAD7CF] hover:bg-white"
                        >

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E9EEE8] text-[10px] font-semibold text-[#536456]">
                            {appointment.initials ||
                              getInitials(
                                appointment.patient
                              )}
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-medium">
                              {appointment.patient}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-[#96958E]">
                              {appointment.treatment}
                            </p>

                            {appointment.practitioner && (
                              <p className="mt-1 truncate text-[10px] text-[#AAA89F]">
                                {appointment.practitioner}
                              </p>
                            )}

                          </div>

                          <div className="text-right">

                            <p className="whitespace-nowrap text-[10px] text-[#96958E]">
                              {appointment.date}
                            </p>

                            <p className="mt-1 whitespace-nowrap text-[10px] font-medium text-[#77766F]">
                              {appointment.time}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="mt-6 rounded-xl border border-[#EFEEE9] bg-[#F8F7F3] p-5 text-center">

                    <p className="text-sm font-medium">
                      No appointments
                    </p>

                    <p className="mt-2 text-xs text-[#999890]">
                      Create a booking to populate the schedule.
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* PRACTITIONER STATS */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              <MiniCard
                label="Active Practitioners"
                value={String(
                  activePractitioners.length
                )}
                description={`${clinicSettings.practitioners.length} total practitioners`}
                onClick={() => {
                  window.location.href =
                    "/settings";
                }}
              />

              <MiniCard
                label="Working Today"
                value={String(
                  practitionersWorkingToday.length
                )}
                description={todayWeekday}
                onClick={() => {
                  window.location.href =
                    "/settings";
                }}
              />

              <MiniCard
                label="Progress Reports"
                value={String(
                  reports.length
                )}
                description="generated reports"
                onClick={() => {
                  window.location.href =
                    "/reports";
                }}
              />

            </div>

            {/* FOLLOW-UPS DUE */}
            <div className="mt-6 overflow-hidden rounded-[22px] border border-[#E2E0DA] bg-white shadow-[0_1px_2px_rgba(24,26,24,0.025)]">

              <div className="flex flex-col justify-between gap-4 border-b border-[#ECEBE6] px-6 py-5 sm:flex-row sm:items-center">

                <div>

                  <p className="text-sm text-[#77766F]">
                    Continuity of care
                  </p>

                  <div className="mt-1 flex items-center gap-3">

                    <h3 className="text-lg font-semibold">
                      Follow-ups Due
                    </h3>

                    <span className="rounded-full bg-[#F5F0E7] px-3 py-1 text-[10px] font-medium text-[#806E52]">
                      {followUpDueCount} due
                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      "/appointments";
                  }}
                  className="text-xs font-medium text-[#77766F] hover:text-black"
                >
                  View appointments →
                </button>

              </div>

              {actionableFollowUps.length >
              0 ? (

                <div className="divide-y divide-[#F0EFEA]">

                  {actionableFollowUps.map(
                    (followUp) => (

                      <div
                        key={followUp.id}
                        className="flex flex-col gap-4 px-6 py-5 xl:flex-row xl:items-center"
                      >

                        <div className="flex min-w-0 flex-1 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E9EEE8] text-[10px] font-semibold text-[#536456]">
                            {getInitials(
                              followUp.patient
                            )}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold">
                              {followUp.patient}
                            </p>

                            <p className="mt-1 truncate text-xs text-[#77766F]">
                              Follow-up after{" "}
                              {followUp.treatment}
                            </p>

                            <p className="mt-1 text-[10px] text-[#AAA89F]">
                              Completed{" "}
                              {followUp.completedDate}
                              {followUp.practitioner
                                ? ` · ${followUp.practitioner}`
                                : ""}
                            </p>

                          </div>

                        </div>

                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-medium ${
                              followUp.status ===
                              "Due"
                                ? "bg-[#F5F0E7] text-[#806E52]"
                                : "bg-[#E8EEE5] text-[#62715D]"
                            }`}
                          >
                            {followUp.status}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              openFollowUpAppointment(
                                followUp
                              )
                            }
                            className="flex items-center gap-2 rounded-lg border border-[#DDDCD6] bg-white px-3 py-2 text-xs font-medium transition hover:bg-[#F7F6F2]"
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
                                followUp
                              )
                            }
                            className="rounded-lg border border-[#D7DDD4] bg-[#F0F3EE] px-3 py-2 text-xs font-medium text-[#62715D]"
                          >
                            Start analysis
                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="px-6 py-10 text-center">

                  <p className="text-sm font-medium">
                    No follow-ups due
                  </p>

                  <p className="mt-2 text-xs text-[#999890]">
                    Completed treatments that need follow-up will appear here.
                  </p>

                </div>

              )}

            </div>

{/* CLINIC TEAM */}
<div className="mt-6 overflow-hidden rounded-[22px] border border-[#E2E0DA] bg-white shadow-[0_1px_2px_rgba(24,26,24,0.025)]">

  {/* TEAM HEADER */}
  <div className="flex flex-col justify-between gap-4 border-b border-[#ECEBE6] px-6 py-5 sm:flex-row sm:items-center">

    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EFEA]">
        <UsersRound
          size={18}
          strokeWidth={1.7}
        />
      </div>

      <div>
        <p className="text-sm text-[#77766F]">
          Your team
        </p>

        <h3 className="mt-1 text-lg font-semibold">
          Active Practitioners
        </h3>
      </div>

    </div>

    <button
      type="button"
      onClick={() => {
        window.location.href =
          "/settings";
      }}
      className="text-xs font-medium text-[#77766F] hover:text-black"
    >
      Manage team →
    </button>

  </div>

  {/* PRACTITIONER GRID */}
  {activePractitioners.length > 0 ? (

    <div className="grid md:grid-cols-2 xl:grid-cols-3">

      {activePractitioners.map(
        (practitioner) => {

          const isWorkingToday =
            practitioner.workingDays.length === 0 ||
            practitioner.workingDays.includes(
              todayWeekday
            );

          const bookingCount =
            practitionerBookingCounts[
              practitioner.id
            ] || 0;

          const isPrimary =
            clinicSettings.practitionerName ===
            practitioner.name;

          return (

            <div
              key={practitioner.id}
              className="flex min-h-[310px] flex-col border-b border-[#ECEBE6] p-6 md:border-r"
            >

              {/* TOP PROFILE AREA */}
              <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-start gap-4">

                {/* AVATAR */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E9EEE8] text-xs font-semibold text-[#536456]">
                  {getInitials(
                    practitioner.name
                  )}
                </div>

                {/* NAME + ROLE */}
                <div className="min-w-0">

                  {/* FIXED NAME ROW */}
                  <div className="min-h-[44px]">

                    <p
                      className="truncate text-sm font-semibold"
                      title={
                        practitioner.name
                      }
                    >
                      {practitioner.name}
                    </p>

                    <div className="mt-1 h-[22px]">

                      {isPrimary && (
                        <span className="inline-flex rounded-full bg-[#F0F3EE] px-2.5 py-1 text-[9px] font-medium leading-none text-[#62715D]">
                          Primary
                        </span>
                      )}

                    </div>

                  </div>

                  {/* FIXED ROLE AREA */}
                  <p className="mt-2 min-h-[40px] text-sm leading-5 text-[#77766F]">
                    {practitioner.role ||
                      "Practitioner"}
                  </p>

                </div>

                {/* WORK STATUS */}
                <span
                  className={`shrink-0 rounded-full px-3 py-2 text-center text-[9px] font-medium leading-4 ${
                    isWorkingToday
                      ? "bg-[#E8EEE5] text-[#62715D]"
                      : "bg-[#F1F0EB] text-[#77766F]"
                  }`}
                >
                  {isWorkingToday ? (
                    <>
                      Working
                      <br />
                      Today
                    </>
                  ) : (
                    <>
                      Off
                      <br />
                      today
                    </>
                  )}
                </span>

              </div>

              {/* SPECIALITY */}
              <div className="mt-5 min-h-[50px]">

                <p className="text-xs leading-5 text-[#77766F]">
                  {practitioner.speciality ||
                    "No speciality added"}
                </p>

              </div>

              {/* PUSH STATS TO BOTTOM */}
              <div className="mt-auto pt-5">

                <div className="grid grid-cols-2 gap-4">

                  {/* BOOKINGS */}
                  <div className="flex min-h-[90px] flex-col justify-center rounded-xl border border-[#EFEEE9] bg-[#F8F7F3] px-4 py-4">

                    <p className="text-[9px] uppercase tracking-[0.12em] text-[#999890]">
                      Bookings
                    </p>

                    <p className="mt-2 text-xl font-semibold">
                      {bookingCount}
                    </p>

                  </div>

                  {/* HOURS */}
                  <div className="flex min-h-[90px] flex-col justify-center rounded-xl border border-[#EFEEE9] bg-[#F8F7F3] px-4 py-4">

                    <p className="text-[9px] uppercase tracking-[0.12em] text-[#999890]">
                      Hours
                    </p>

                    <p className="mt-2 whitespace-nowrap text-xs font-semibold">
                      {practitioner.startTime}
                      {" – "}
                      {practitioner.endTime}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          );
        }
      )}

    </div>

  ) : (

    <div className="px-6 py-12 text-center">

      <p className="text-sm font-medium">
        No active practitioners
      </p>

      <p className="mt-2 text-xs text-[#999890]">
        Add or activate practitioners in Settings.
      </p>

    </div>

  )}

</div>

            {/* RECENT PATIENTS */}
            <div className="mt-6 rounded-[22px] border border-[#E2E0DA] bg-white shadow-[0_1px_2px_rgba(24,26,24,0.025)]">

              <div className="flex items-center justify-between border-b border-[#ECEBE6] px-6 py-5">

                <div>

                  <p className="text-sm text-[#77766F]">
                    Patient care
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Recent Patients
                  </h3>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      "/patients";
                  }}
                  className="text-xs font-medium text-[#77766F] hover:text-black"
                >
                  View all →
                </button>

              </div>

              {recentPatients.length >
              0 ? (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[700px]">

                    <thead>

                      <tr className="border-b border-[#ECEBE6] text-left text-[10px] uppercase tracking-[0.12em] text-[#9A9992]">

                        <th className="px-6 py-4 font-medium">
                          Patient
                        </th>

                        <th className="px-6 py-4 font-medium">
                          Concern
                        </th>

                        <th className="px-6 py-4 font-medium">
                          Last visit
                        </th>

                        <th className="px-6 py-4 font-medium">
                          Analyses
                        </th>

                        <th className="px-6 py-4 font-medium">
                          Status
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {recentPatients.map(
                        (patient) => (

                          <tr
                            key={patient.id}
                            onClick={() => {
                              localStorage.setItem(
                                "dermisSelectedPatient",
                                JSON.stringify(
                                  patient
                                )
                              );

                              window.location.href =
                                "/patient";
                            }}
                            className="cursor-pointer border-b border-[#F0EFEA] transition hover:bg-[#FAF9F6] last:border-0"
                          >

                            <td className="px-6 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E9EEE8] text-[10px] font-semibold text-[#536456]">
                                  {getInitials(
                                    patient.name
                                  )}
                                </div>

                                <div>

                                  <p className="text-sm font-medium">
                                    {patient.name}
                                  </p>

                                  <p className="mt-0.5 text-[10px] text-[#999890]">
                                    {patient.email}
                                  </p>

                                </div>

                              </div>

                            </td>

                            <td className="px-6 py-4 text-sm text-[#77766F]">
                              {patient.concern}
                            </td>

                            <td className="px-6 py-4 text-sm text-[#77766F]">
                              {patient.lastVisit}
                            </td>

                            <td className="px-6 py-4 text-sm text-[#77766F]">
                              {patient.analyses}
                            </td>

                            <td className="px-6 py-4">

                              <span
                                className={`rounded-full px-3 py-1 text-[10px] font-medium ${
                                  patient.status ===
                                  "Active"
                                    ? "bg-[#E8EEE5] text-[#62715D]"
                                    : "bg-[#F1F0EB] text-[#77766F]"
                                }`}
                              >
                                {patient.status}
                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              ) : (

                <div className="px-6 py-12 text-center">

                  <p className="text-sm font-medium">
                    No patients yet
                  </p>

                </div>

              )}

            </div>

            {/* RECENT ACTIVITY */}
            <div className="mt-6 rounded-[22px] border border-[#E2E0DA] bg-white shadow-[0_1px_2px_rgba(24,26,24,0.025)]">

              <div className="border-b border-[#ECEBE6] px-6 py-5">

                <p className="text-sm text-[#77766F]">
                  Latest updates
                </p>

                <h3 className="mt-1 text-lg font-semibold">
                  Recent activity
                </h3>

              </div>

              {recentActivity.length >
              0 ? (

                <div className="divide-y divide-[#F0EFEA]">

                  {recentActivity.map(
                    (activity) => (

                      <div
                        key={activity.id}
                        className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center"
                      >

                        <div className="flex min-w-0 flex-1 items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E9EEE8] text-[10px] font-semibold text-[#536456]">
                            {getInitials(
                              activity.name
                            )}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium">
                              {activity.name}
                            </p>

                            <p className="mt-1 text-xs text-[#999890]">
                              {activity.type}
                            </p>

                          </div>

                        </div>

                        <p className="text-xs text-[#999890]">
                          {formatActivityDate(
                            activity.date
                          )}
                        </p>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-[10px] font-medium ${
                            activity.status ===
                              "Completed" ||
                            activity.status ===
                              "Confirmed" ||
                            activity.status ===
                              "Active"
                              ? "bg-[#E8EEE5] text-[#62715D]"
                              : "bg-[#F1F0EB] text-[#77766F]"
                          }`}
                        >
                          {activity.status}
                        </span>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="px-6 py-12 text-center">

                  <p className="text-sm font-medium">
                    No activity yet
                  </p>

                </div>

              )}

            </div>

            {!dataLoaded && (
              <p className="mt-6 text-center text-xs text-[#999890]">
                Loading clinic data...
              </p>
            )}

          </div>

        </section>

      </div>

    </main>
  );
}

function StatCard({
  label,
  value,
  change,
  description,
}: {
  label: string;
  value: string;
  change: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#E2E0DA] bg-white shadow-[0_1px_2px_rgba(24,26,24,0.025)] p-5">

      <p className="text-xs text-[#77766F]">
        {label}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">

        <p className="text-2xl font-semibold tracking-[-0.04em]">
          {value}
        </p>

        <span className="rounded-full border border-[#DCE5DA] bg-[#EEF3EC] px-2.5 py-1 text-[10px] font-semibold text-[#5C705F]">
          {change}
        </span>

      </div>

      <p className="mt-2 text-[10px] text-[#9A9992]">
        {description}
      </p>

    </div>
  );
}

function MiniCard({
  label,
  value,
  description,
  onClick,
}: {
  label: string;
  value: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[22px] border border-[#E2E0DA] bg-white shadow-[0_1px_2px_rgba(24,26,24,0.025)] p-5 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
    >

      <p className="text-xs text-[#77766F]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-2 text-[10px] text-[#999890]">
        {description}
      </p>

    </button>
  );
}
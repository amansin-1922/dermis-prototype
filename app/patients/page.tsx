"use client";

import { useEffect, useState } from "react";
import { Check, Search, X } from "lucide-react";
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

type ClinicSettings = {
  clinicName?: string;
  practitionerName?: string;
  initials?: string;
};

const initialPatients: Patient[] = [
  {
    id: "70583d4d-770f-4d73-9c4a-3a7f627a36fd",
    legacyId: 1,
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
    concern: "Skin ageing",
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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatSupabaseLastVisit(value: string | null) {
  if (!value) return "New patient";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return 0;

  const birthDate = new Date(`${dateOfBirth}T12:00:00`);
  const today = new Date();
  let calculatedAge = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    calculatedAge -= 1;
  }

  return calculatedAge;
}

function dateOfBirthFromAge(age: number) {
  const today = new Date();
  const year = today.getFullYear() - age;

  return `${year}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
}

export default function PatientsPage() {
  const [patients, setPatients] =
    useState<Patient[]>(initialPatients);

  const [clinicSettings, setClinicSettings] =
    useState<ClinicSettings>({
      clinicName: "Skinhouse Clinic",
      practitionerName: "Sarah Williams",
      initials: "SW",
    });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [patientAdded, setPatientAdded] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [concern, setConcern] = useState("");
  const [status, setStatus] =
    useState<"Active" | "Inactive">("Active");

  useEffect(() => {
    let cancelled = false;

    const loadPatients = async () => {
      const savedPatients = localStorage.getItem("dermisPatients");
      let legacyPatients: Array<Patient & { id: string | number }> = [];

      if (savedPatients) {
        try {
          const parsed = JSON.parse(savedPatients);
          if (Array.isArray(parsed)) {
            legacyPatients = parsed;
          }
        } catch (error) {
          console.error("Could not load compatibility patient cache:", error);
        }
      }

      const loadClinicSettings = () => {
        const storedSettings = localStorage.getItem("dermisClinicSettings");

        if (!storedSettings) return;

        try {
          const parsedSettings: ClinicSettings = JSON.parse(storedSettings);

          setClinicSettings((current) => ({
            ...current,
            ...parsedSettings,
          }));
        } catch (error) {
          console.error("Could not load clinic settings:", error);
        }
      };

      loadClinicSettings();

      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Could not resolve authenticated user:", userError);
        return;
      }

      const { data: membership, error: membershipError } = await supabase
        .from("clinic_memberships")
        .select("clinic_id")
        .eq("user_id", user.id)
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      if (membershipError || !membership) {
        console.error("Could not resolve active clinic membership:", membershipError);
        return;
      }

      const { data: rows, error: patientsError } = await supabase
        .from("patients")
        .select(
          "id, legacy_id, first_name, last_name, email, phone, date_of_birth, status, primary_concern, last_visit_at"
        )
        .eq("clinic_id", membership.clinic_id)
        .order("created_at", { ascending: true });

      if (patientsError) {
        console.error("Could not load Supabase patients:", patientsError);
        return;
      }

      const mappedPatients: Patient[] = (rows ?? []).map((row) => {
        const fullName = `${row.first_name} ${row.last_name}`.trim();

        const legacyMatch = legacyPatients.find((patient) => {
          const patientEmail =
            typeof patient.email === "string" ? patient.email.toLowerCase() : "";
          const rowEmail =
            typeof row.email === "string" ? row.email.toLowerCase() : "";

          return (
            (rowEmail && patientEmail === rowEmail) ||
            patient.name === fullName
          );
        });

        const matchedLegacyId =
          typeof row.legacy_id === "number"
            ? row.legacy_id
            : legacyMatch?.legacyId ??
              (typeof legacyMatch?.id === "number" ? legacyMatch.id : undefined);

        return {
          id: row.id,
          legacyId: matchedLegacyId,
          name: fullName,
          email: row.email ?? "",
          phone: row.phone ?? "",
          age:
            calculateAge(row.date_of_birth) ||
            (legacyMatch?.age ?? 0),
          lastVisit: formatSupabaseLastVisit(row.last_visit_at),
          status:
            row.status === "inactive" ? "Inactive" : "Active",
          concern: row.primary_concern ?? "",
          analyses: legacyMatch?.analyses ?? 0,
        };
      });

      if (cancelled) return;

      setPatients(mappedPatients);

      localStorage.setItem(
        "dermisPatients",
        JSON.stringify(mappedPatients)
      );
    };

    const loadClinicSettings = () => {
      const storedSettings = localStorage.getItem("dermisClinicSettings");

      if (!storedSettings) return;

      try {
        const parsedSettings: ClinicSettings = JSON.parse(storedSettings);

        setClinicSettings((current) => ({
          ...current,
          ...parsedSettings,
        }));
      } catch (error) {
        console.error("Could not load clinic settings:", error);
      }
    };

    void loadPatients();

    window.addEventListener(
      "dermisClinicSettingsUpdated",
      loadClinicSettings
    );

    window.addEventListener("storage", loadClinicSettings);

    return () => {
      cancelled = true;

      window.removeEventListener(
        "dermisClinicSettingsUpdated",
        loadClinicSettings
      );

      window.removeEventListener("storage", loadClinicSettings);
    };
  }, []);

  const filteredPatients = patients.filter(
    (patient) => {
      const searchText = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        patient.name
          .toLowerCase()
          .includes(searchText) ||
        patient.email
          .toLowerCase()
          .includes(searchText) ||
        patient.phone
          .toLowerCase()
          .includes(searchText) ||
        patient.concern
          .toLowerCase()
          .includes(searchText);

      const matchesFilter =
        filter === "All" ||
        patient.status === filter;

      return matchesSearch && matchesFilter;
    }
  );

  const activePatients = patients.filter(
    (patient) => patient.status === "Active"
  ).length;

  const totalAnalyses = patients.reduce(
    (total, patient) =>
      total + patient.analyses,
    0
  );

  const practitionerInitials =
    clinicSettings.initials?.trim().toUpperCase() ||
    getInitials(
      clinicSettings.practitionerName ||
        "Sarah Williams"
    ) ||
    "SW";

  const openAddPatient = () => {
    setPatientAdded(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAge("");
    setConcern("");
    setStatus("Active");
  };

  const addPatient = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !age.trim() ||
      !concern.trim()
    ) {
      return;
    }

    const numericAge = Number(age);

    if (
      !Number.isFinite(numericAge) ||
      numericAge < 1 ||
      numericAge > 120
    ) {
      return;
    }

    const trimmedName = name.trim();
    const nameParts = trimmedName.split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "-";

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Could not resolve authenticated user:", userError);
      return;
    }

    const { data: membership, error: membershipError } = await supabase
      .from("clinic_memberships")
      .select("clinic_id")
      .eq("user_id", user.id)
      .eq("active", true)
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership) {
      console.error("Could not resolve active clinic membership:", membershipError);
      return;
    }

    const { data: insertedPatient, error: insertError } = await supabase
      .from("patients")
      .insert({
        clinic_id: membership.clinic_id,
        first_name: firstName,
        last_name: lastName,
        email: email.trim(),
        phone: phone.trim(),
        date_of_birth: dateOfBirthFromAge(numericAge),
        status: status.toLowerCase(),
        primary_concern: concern.trim(),
        created_by: user.id,
      })
      .select(
        "id, legacy_id, first_name, last_name, email, phone, date_of_birth, status, primary_concern, last_visit_at"
      )
      .single();

    if (insertError || !insertedPatient) {
      console.error("Could not add patient to Supabase:", insertError);
      return;
    }

    const newPatient: Patient = {
      id: insertedPatient.id,
      legacyId:
        typeof insertedPatient.legacy_id === "number"
          ? insertedPatient.legacy_id
          : undefined,
      name: `${insertedPatient.first_name} ${insertedPatient.last_name}`.trim(),
      email: insertedPatient.email ?? "",
      phone: insertedPatient.phone ?? "",
      age:
        calculateAge(insertedPatient.date_of_birth) ||
        numericAge,
      lastVisit: formatSupabaseLastVisit(insertedPatient.last_visit_at),
      status:
        insertedPatient.status === "inactive" ? "Inactive" : "Active",
      concern: insertedPatient.primary_concern ?? "",
      analyses: 0,
    };

    const updatedPatients = [
      newPatient,
      ...patients,
    ];

    setPatients(updatedPatients);

    localStorage.setItem(
      "dermisPatients",
      JSON.stringify(updatedPatients)
    );

    resetForm();
    setShowForm(false);
    setPatientAdded(true);
  };

  const formIsValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    phone.trim() !== "" &&
    age.trim() !== "" &&
    concern.trim() !== "";

  return (
    <main className="min-h-screen bg-[#F7F7F4] text-[#1C211D]">

      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <Sidebar activePage="Patients" />

        {/* MAIN */}
        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E8E8E2] bg-[#FDFDFC]/95 px-6 py-4 backdrop-blur-xl lg:px-10">

            <div>

              <p className="text-xs text-[#96958E]">
                Clinic management
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                Patients
              </h1>

              <p className="mt-1 text-[10px] text-[#999890]">
                {clinicSettings.clinicName ||
                  "Skinhouse Clinic"}
              </p>

            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={openAddPatient}
                className="hidden rounded-[11px] bg-[#263A2D] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_8px_24px_rgba(38,58,45,0.14)] transition hover:-translate-y-px hover:bg-[#1E3025] sm:block"
              >
                + Add patient
              </button>

              <a
                href="/settings"
                title="Clinic settings"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDE5DC] bg-[#EEF3ED] text-[10px] font-semibold text-[#526658] transition hover:bg-[#E6EDE5]"
              >
                {practitionerInitials}
              </a>

            </div>

          </header>

          {/* CONTENT */}
          <div className="mx-auto w-full max-w-[1480px] p-6 lg:px-10 lg:py-9">

            {/* HEADING */}
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#7C8D80]">
                  Patient intelligence
                </p>

                <h2 className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#1E241F]">
                  All patients
                </h2>

                <p className="mt-3 max-w-2xl text-[12px] leading-5 text-[#8B918A]">
                  A unified clinical view of every patient, their skin journey, analysis history and ongoing care.
                </p>

              </div>

              <button
                type="button"
                onClick={openAddPatient}
                className="w-fit rounded-[12px] bg-[#263A2D] px-5 py-3 text-[12px] font-semibold text-white shadow-[0_10px_28px_rgba(38,58,45,0.14)] transition hover:-translate-y-px hover:bg-[#1E3025]"
              >
                + Add patient
              </button>

            </div>

            {/* SUCCESS MESSAGE */}
            {patientAdded && (
              <div className="mt-6 flex items-start justify-between gap-4 rounded-[18px] border border-[#D8E2D7] bg-[#F0F5EF] p-5 shadow-[0_8px_30px_rgba(37,51,40,0.035)]">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DFE7DE] bg-white text-[#526A57] shadow-[0_4px_12px_rgba(37,51,40,0.05)]">

                    <Check
                      size={17}
                      strokeWidth={2}
                    />

                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      Patient added successfully
                    </p>

                    <p className="mt-1 text-xs text-[#62715D]">
                      The patient has been added to your clinic records.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  aria-label="Dismiss success message"
                  onClick={() =>
                    setPatientAdded(false)
                  }
                  className="text-[#77766F] transition hover:text-black"
                >
                  <X
                    size={17}
                    strokeWidth={1.7}
                  />
                </button>

              </div>
            )}

            {/* ADD PATIENT FORM */}
            {showForm && (
              <div className="mt-6 rounded-[22px] border border-[#E4E4DE] bg-[#FEFEFC] p-6 shadow-[0_12px_38px_rgba(29,34,30,0.045)]">

                {/* FORM HEADER */}
                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#879087]">
                      New clinical record
                    </p>

                    <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.035em] text-[#222822]">
                      Add new patient
                    </h3>

                    <p className="mt-2 text-xs text-[#999890]">
                      Create a new patient record for your clinic.
                    </p>

                  </div>

                  <button
                    type="button"
                    aria-label="Close patient form"
                    onClick={closeForm}
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E3E3DD] bg-white text-[#7F857F] transition hover:bg-[#F5F6F2] hover:text-[#263A2D]"
                  >
                    <X
                      size={16}
                      strokeWidth={1.7}
                    />
                  </button>

                </div>

                {/* FORM FIELDS */}
                <div className="mt-6 grid gap-5 md:grid-cols-2">

                  {/* NAME */}
                  <div>

                    <label className="text-xs font-medium text-[#77766F]">
                      Full name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="e.g. Charlotte Wilson"
                      className="mt-2 w-full rounded-[12px] border border-[#E4E4DE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#272D28] outline-none transition focus:border-[#879A8A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,108,0.07)]"
                    />

                  </div>

                  {/* EMAIL */}
                  <div>

                    <label className="text-xs font-medium text-[#77766F]">
                      Email address
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="patient@email.com"
                      className="mt-2 w-full rounded-[12px] border border-[#E4E4DE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#272D28] outline-none transition focus:border-[#879A8A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,108,0.07)]"
                    />

                  </div>

                  {/* PHONE */}
                  <div>

                    <label className="text-xs font-medium text-[#77766F]">
                      Phone number
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      placeholder="+44 7700 900000"
                      className="mt-2 w-full rounded-[12px] border border-[#E4E4DE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#272D28] outline-none transition focus:border-[#879A8A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,108,0.07)]"
                    />

                  </div>

                  {/* AGE */}
                  <div>

                    <label className="text-xs font-medium text-[#77766F]">
                      Age
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) =>
                        setAge(e.target.value)
                      }
                      placeholder="Age"
                      className="mt-2 w-full rounded-[12px] border border-[#E4E4DE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#272D28] outline-none transition focus:border-[#879A8A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,108,0.07)]"
                    />

                  </div>

                  {/* CONCERN */}
                  <div>

                    <label className="text-xs font-medium text-[#77766F]">
                      Primary skin concern
                    </label>

                    <select
                      value={concern}
                      onChange={(e) =>
                        setConcern(e.target.value)
                      }
                      className="mt-2 w-full rounded-[12px] border border-[#E4E4DE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#272D28] outline-none transition focus:border-[#879A8A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,108,0.07)]"
                    >

                      <option value="">
                        Select concern
                      </option>

                      <option value="Acne">
                        Acne
                      </option>

                      <option value="Acne & pigmentation">
                        Acne & pigmentation
                      </option>

                      <option value="Hyperpigmentation">
                        Hyperpigmentation
                      </option>

                      <option value="Fine lines">
                        Fine lines
                      </option>

                      <option value="Skin ageing">
                        Skin ageing
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

                    </select>

                  </div>

                  {/* STATUS */}
                  <div>

                    <label className="text-xs font-medium text-[#77766F]">
                      Patient status
                    </label>

                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(
                          e.target.value as
                            | "Active"
                            | "Inactive"
                        )
                      }
                      className="mt-2 w-full rounded-[12px] border border-[#E4E4DE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#272D28] outline-none transition focus:border-[#879A8A] focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,108,0.07)]"
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

                {/* PATIENT PREVIEW */}
                {name.trim() && (
                  <div className="mt-6 rounded-[16px] border border-[#E8E8E2] bg-[#F8F9F6] p-5">

                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#999890]">
                      Patient preview
                    </p>

                    <div className="mt-4 flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#DCE5DB] bg-[#EAF0E9] text-[10px] font-semibold text-[#536657]">

                        {getInitials(name)}

                      </div>

                      <div>

                        <p className="text-sm font-semibold">
                          {name}
                        </p>

                        <p className="mt-1 text-xs text-[#77766F]">
                          {concern ||
                            "No concern selected"}
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* ACTIONS */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-[12px] border border-[#E0E1DB] bg-white px-5 py-3 text-[12px] font-semibold text-[#5E645E] transition hover:bg-[#F6F7F3]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={!formIsValid}
                    onClick={addPatient}
                    className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                      formIsValid
                        ? "bg-[#263A2D] text-white shadow-[0_8px_22px_rgba(38,58,45,0.12)] hover:bg-[#1E3025]"
                        : "cursor-not-allowed bg-[#E7E7E2] text-[#A3A6A0]"
                    }`}
                  >
                    Add patient
                  </button>

                </div>

              </div>
            )}

            {/* STATS */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">

              <div className="rounded-[20px] border border-[#E5E5DF] bg-[#FEFEFC] p-5 shadow-[0_8px_28px_rgba(29,34,30,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(29,34,30,0.05)]">

                <p className="text-xs text-[#77766F]">
                  Total patients
                </p>

                <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-[#202620]">
                  {patients.length}
                </p>

                <p className="mt-2 text-[10px] font-medium text-[#71806C]">
                  Clinic records
                </p>

              </div>

              <div className="rounded-[20px] border border-[#E5E5DF] bg-[#FEFEFC] p-5 shadow-[0_8px_28px_rgba(29,34,30,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(29,34,30,0.05)]">

                <p className="text-xs text-[#77766F]">
                  Active patients
                </p>

                <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-[#202620]">
                  {activePatients}
                </p>

                <p className="mt-2 text-[10px] font-medium text-[#71806C]">
                  Currently active
                </p>

              </div>

              <div className="rounded-[20px] border border-[#E5E5DF] bg-[#FEFEFC] p-5 shadow-[0_8px_28px_rgba(29,34,30,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(29,34,30,0.05)]">

                <p className="text-xs text-[#77766F]">
                  Skin analyses
                </p>

                <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-[#202620]">
                  {totalAnalyses}
                </p>

                <p className="mt-2 text-[10px] font-medium text-[#71806C]">
                  Across all patients
                </p>

              </div>

            </div>

            {/* SEARCH */}
            <div className="mt-8 rounded-2xl border border-[#DDDCD6] bg-white p-4">

              <div className="flex flex-col gap-3 md:flex-row">

                <div className="relative flex-1">

                  <Search
                    size={16}
                    strokeWidth={1.8}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9992]"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search patients by name, email, phone or concern"
                    className="w-full rounded-[12px] border border-transparent bg-[#F5F6F2] py-3 pl-10 pr-4 text-[12px] text-[#303630] outline-none transition placeholder:text-[#A2A69F] focus:border-[#CBD6CB] focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,108,0.06)]"
                  />

                </div>

                <select
                  aria-label="Filter patients by status"
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value)
                  }
                  className="rounded-[12px] border border-transparent bg-[#F5F6F2] px-4 py-3 text-[12px] font-medium text-[#555C56] outline-none transition focus:border-[#CBD6CB] focus:bg-white"
                >

                  <option value="All">
                    All patients
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                </select>

              </div>

            </div>

            {/* PATIENT TABLE */}
            <div className="mt-4 overflow-hidden rounded-[22px] border border-[#E5E5DF] bg-[#FEFEFC] shadow-[0_10px_34px_rgba(29,34,30,0.035)]">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px]">

                  <thead>

                    <tr className="border-b border-[#ECEDE8] bg-[#F8F9F6] text-left text-[9px] uppercase tracking-[0.16em] text-[#999E98]">

                      <th className="px-6 py-4 font-medium">
                        Patient
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Primary concern
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

                    {filteredPatients.map(
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
                              `/patient?id=${encodeURIComponent(patient.id)}`;
                          }}
                          className="group cursor-pointer border-b border-[#F0F1EC] transition duration-200 hover:bg-[#F7FAF6] last:border-0"
                        >

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DCE5DB] bg-[#ECF1EB] text-[10px] font-semibold text-[#536657] transition group-hover:bg-white">

                                {getInitials(
                                  patient.name
                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-[13px] font-semibold tracking-[-0.015em] text-[#282E29]">
                                  {patient.name}
                                </p>

                                <p className="mt-1 truncate text-[10px] text-[#969B95]">
                                  {patient.email}
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="px-6 py-5 text-[12px] text-[#686F69]">
                            {patient.concern}
                          </td>

                          <td className="px-6 py-5 text-[12px] text-[#686F69]">
                            {patient.lastVisit}
                          </td>

                          <td className="px-6 py-5 text-[12px] text-[#686F69]">
                            {patient.analyses}
                          </td>

                          <td className="px-6 py-5">

                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-medium ${
                                patient.status ===
                                "Active"
                                  ? "border border-[#DCE6DA] bg-[#EDF3EB] text-[#536A57]"
                                  : "border border-[#E5E5DF] bg-[#F3F3EF] text-[#777C77]"
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

              {/* NO RESULTS */}
              {filteredPatients.length === 0 && (
                <div className="border-t border-[#ECEBE6] px-6 py-12 text-center">

                  <p className="text-sm font-medium">
                    No patients found
                  </p>

                  <p className="mt-2 text-xs text-[#999890]">
                    Try changing your search or status filter.
                  </p>

                </div>
              )}

              {/* FOOTER */}
              <div className="flex items-center justify-between border-t border-[#ECEBE6] px-6 py-4">

                <p className="text-xs text-[#96958E]">
                  Showing{" "}
                  {filteredPatients.length} of{" "}
                  {patients.length} patients
                </p>

                {(search || filter !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setFilter("All");
                    }}
                    className="text-xs font-medium text-[#77766F] transition hover:text-black"
                  >
                    Clear filters
                  </button>
                )}

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

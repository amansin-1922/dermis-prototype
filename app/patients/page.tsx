"use client";

import { useEffect, useState } from "react";
import { Check, Search, X } from "lucide-react";
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

type ClinicSettings = {
  clinicName?: string;
  practitionerName?: string;
  initials?: string;
};

const initialPatients: Patient[] = [
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
    const savedPatients = localStorage.getItem(
      "dermisPatients"
    );

    if (savedPatients) {
      try {
        const parsedPatients: Patient[] =
          JSON.parse(savedPatients);

        setPatients(parsedPatients);
      } catch (error) {
        console.error(
          "Could not load patients:",
          error
        );
      }
    }

    const loadClinicSettings = () => {
      const storedSettings = localStorage.getItem(
        "dermisClinicSettings"
      );

      if (!storedSettings) {
        return;
      }

      try {
        const parsedSettings: ClinicSettings =
          JSON.parse(storedSettings);

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

  const addPatient = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !age.trim() ||
      !concern.trim()
    ) {
      return;
    }

    const newPatient: Patient = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      age: Number(age),
      lastVisit: "New patient",
      status,
      concern: concern.trim(),
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
    <main className="min-h-screen bg-[#F5F4F0] text-[#171717]">

      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <Sidebar activePage="Patients" />

        {/* MAIN */}
        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="flex items-center justify-between border-b border-[#DDDCD6] bg-white px-6 py-5 lg:px-10">

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
                className="hidden rounded-xl bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#333] sm:block"
              >
                + Add patient
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

            {/* HEADING */}
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

              <div>

                <p className="text-sm text-[#77766F]">
                  Patient management
                </p>

                <h2 className="mt-1 text-3xl font-medium tracking-[-0.04em]">
                  All patients
                </h2>

                <p className="mt-2 max-w-xl text-xs leading-5 text-[#999890]">
                  View patient records, skin concerns and analysis history from one place.
                </p>

              </div>

              <button
                type="button"
                onClick={openAddPatient}
                className="w-fit rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#333]"
              >
                + Add patient
              </button>

            </div>

            {/* SUCCESS MESSAGE */}
            {patientAdded && (
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
              <div className="mt-6 rounded-2xl border border-[#DDDCD6] bg-white p-6">

                {/* FORM HEADER */}
                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-sm text-[#77766F]">
                      Patient management
                    </p>

                    <h3 className="mt-1 text-xl font-semibold">
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDDCD6] text-[#77766F] transition hover:bg-[#F7F6F2]"
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
                      className="mt-2 w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm outline-none transition focus:border-[#99978F]"
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
                      className="mt-2 w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm outline-none transition focus:border-[#99978F]"
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
                      className="mt-2 w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm outline-none transition focus:border-[#99978F]"
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
                      className="mt-2 w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm outline-none transition focus:border-[#99978F]"
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
                      className="mt-2 w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm outline-none transition focus:border-[#99978F]"
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
                      className="mt-2 w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm outline-none transition focus:border-[#99978F]"
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
                  <div className="mt-6 rounded-xl bg-[#F7F6F2] p-5">

                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#999890]">
                      Patient preview
                    </p>

                    <div className="mt-4 flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E5E2D9] text-xs font-medium">

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
                    className="rounded-xl border border-[#DDDCD6] px-5 py-3 text-sm font-medium transition hover:bg-[#F7F6F2]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={!formIsValid}
                    onClick={addPatient}
                    className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                      formIsValid
                        ? "bg-[#171717] text-white hover:bg-[#333]"
                        : "cursor-not-allowed bg-[#DDDCD6] text-[#999890]"
                    }`}
                  >
                    Add patient
                  </button>

                </div>

              </div>
            )}

            {/* STATS */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-[#DDDCD6] bg-white p-5">

                <p className="text-xs text-[#77766F]">
                  Total patients
                </p>

                <p className="mt-3 text-2xl font-semibold">
                  {patients.length}
                </p>

                <p className="mt-2 text-xs text-[#71806C]">
                  Clinic records
                </p>

              </div>

              <div className="rounded-2xl border border-[#DDDCD6] bg-white p-5">

                <p className="text-xs text-[#77766F]">
                  Active patients
                </p>

                <p className="mt-3 text-2xl font-semibold">
                  {activePatients}
                </p>

                <p className="mt-2 text-xs text-[#71806C]">
                  Currently active
                </p>

              </div>

              <div className="rounded-2xl border border-[#DDDCD6] bg-white p-5">

                <p className="text-xs text-[#77766F]">
                  Skin analyses
                </p>

                <p className="mt-3 text-2xl font-semibold">
                  {totalAnalyses}
                </p>

                <p className="mt-2 text-xs text-[#71806C]">
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
                    className="w-full rounded-xl border border-[#E1E0DA] bg-[#FAF9F6] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#99978F]"
                  />

                </div>

                <select
                  aria-label="Filter patients by status"
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value)
                  }
                  className="rounded-xl border border-[#E1E0DA] bg-[#FAF9F6] px-4 py-3 text-sm outline-none"
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
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#DDDCD6] bg-white">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px]">

                  <thead>

                    <tr className="border-b border-[#ECEBE6] bg-[#FAF9F6] text-left text-[10px] uppercase tracking-[0.12em] text-[#9A9992]">

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
                              "/patient";
                          }}
                          className="cursor-pointer border-b border-[#F0EFEA] transition hover:bg-[#FAF9F6] last:border-0"
                        >

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8E5DD] text-xs font-medium">

                                {getInitials(
                                  patient.name
                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-medium">
                                  {patient.name}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-[#96958E]">
                                  {patient.email}
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="px-6 py-5 text-sm text-[#77766F]">
                            {patient.concern}
                          </td>

                          <td className="px-6 py-5 text-sm text-[#77766F]">
                            {patient.lastVisit}
                          </td>

                          <td className="px-6 py-5 text-sm text-[#77766F]">
                            {patient.analyses}
                          </td>

                          <td className="px-6 py-5">

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

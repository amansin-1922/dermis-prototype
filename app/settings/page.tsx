"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Building2,
  Check,
  Clock3,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import Sidebar from "../components/sidebar";
import {
  dermisDemoData,
  resetDermisDemoData,
} from "../lib/demo-data";

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
    notes:
      "Lead practitioner responsible for consultations, treatment planning and skin analysis.",
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
    notes:
      "Focuses on acne management, pigmentation treatments and skin rejuvenation programmes.",
    active: true,
  },
];

const defaultSettings: ClinicSettings = {
  clinicName: "Skinhouse Clinic",
  practitionerName: "Sarah Williams",
  email: "sarah@skinhouseclinic.co.uk",
  phone: "+44 20 7946 0958",
  initials: "SW",
  location: "London, United Kingdom",
  practitioners: defaultPractitioners,
};

const emptyPractitioner: Practitioner = {
  id: 0,
  name: "",
  role: "",
  email: "",
  phone: "",
  speciality: "",
  qualifications: "",
  registrationNumber: "",
  experience: "",
  workingDays: [],
  startTime: "09:00",
  endTime: "17:00",
  notes: "",
  active: true,
};

const workingDayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function generateInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<ClinicSettings>(
      defaultSettings
    );

  const [saved, setSaved] =
    useState(false);

  const [hasChanges, setHasChanges] =
    useState(false);

  const [
    showPractitionerForm,
    setShowPractitionerForm,
  ] = useState(false);

  const [
    editingPractitionerId,
    setEditingPractitionerId,
  ] = useState<number | null>(null);

  const [
    practitionerForm,
    setPractitionerForm,
  ] = useState<Practitioner>(
    emptyPractitioner
  );

  /*
   * LOAD SETTINGS
   */
  useEffect(() => {
    const storedSettings =
      localStorage.getItem(
        "dermisClinicSettings"
      );

    if (!storedSettings) {
      setSettings(
        defaultSettings
      );
      return;
    }

    try {
      const parsedSettings =
        JSON.parse(
          storedSettings
        );

      setSettings({
        ...defaultSettings,
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
    }
  }, []);

  /*
   * CLINIC FIELD
   */
  const updateField = (
    field:
      | "clinicName"
      | "email"
      | "phone"
      | "location",
    value: string
  ) => {
    setSettings(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setHasChanges(true);
    setSaved(false);
  };

  /*
   * PRIMARY PRACTITIONER
   */
  const setPrimaryPractitioner = (
    practitionerName: string
  ) => {
    const practitioner =
      settings.practitioners.find(
        (item) =>
          item.name ===
          practitionerName
      );

    setSettings(
      (current) => ({
        ...current,
        practitionerName,
        initials:
          generateInitials(
            practitionerName
          ),
        email:
          practitioner?.email ||
          current.email,
        phone:
          practitioner?.phone ||
          current.phone,
      })
    );

    setHasChanges(true);
    setSaved(false);
  };

  /*
   * OPEN ADD
   */
  const openAddPractitioner = () => {
    setEditingPractitionerId(
      null
    );

    setPractitionerForm({
      ...emptyPractitioner,
      id: Date.now(),
    });

    setShowPractitionerForm(
      true
    );
  };

  /*
   * OPEN EDIT
   */
  const openEditPractitioner = (
    practitioner: Practitioner
  ) => {
    setEditingPractitionerId(
      practitioner.id
    );

    setPractitionerForm({
      ...practitioner,
      workingDays: [
        ...practitioner.workingDays,
      ],
    });

    setShowPractitionerForm(
      true
    );
  };

  /*
   * CLOSE FORM
   */
  const closePractitionerForm =
    () => {
      setShowPractitionerForm(
        false
      );

      setEditingPractitionerId(
        null
      );

      setPractitionerForm(
        emptyPractitioner
      );
    };

  /*
   * UPDATE PRACTITIONER FIELD
   */
  const updatePractitionerField = <
    K extends keyof Practitioner
  >(
    field: K,
    value: Practitioner[K]
  ) => {
    setPractitionerForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  /*
   * WORKING DAY
   */
  const toggleWorkingDay = (
    day: string
  ) => {
    setPractitionerForm(
      (current) => {
        const exists =
          current.workingDays.includes(
            day
          );

        return {
          ...current,
          workingDays: exists
            ? current.workingDays.filter(
                (item) =>
                  item !== day
              )
            : [
                ...current.workingDays,
                day,
              ],
        };
      }
    );
  };

  /*
   * SAVE PRACTITIONER
   */
  const savePractitioner = () => {
    if (
      !practitionerForm.name.trim() ||
      !practitionerForm.role.trim()
    ) {
      return;
    }

    const practitionerBeingEdited =
      editingPractitionerId
        ? settings.practitioners.find(
            (item) =>
              item.id === editingPractitionerId
          )
        : undefined;

    if (
      practitionerBeingEdited?.name ===
        settings.practitionerName &&
      !practitionerForm.active
    ) {
      window.alert(
        "This practitioner is currently the Primary practitioner. Make another active practitioner Primary before deactivating them."
      );
      return;
    }

    if (
      practitionerForm.startTime &&
      practitionerForm.endTime &&
      practitionerForm.startTime >=
        practitionerForm.endTime
    ) {
      window.alert(
        "End time must be later than start time."
      );
      return;
    }

    const cleanPractitioner: Practitioner =
      {
        ...practitionerForm,
        name:
          practitionerForm.name.trim(),
        role:
          practitionerForm.role.trim(),
        email:
          practitionerForm.email.trim(),
        phone:
          practitionerForm.phone.trim(),
        speciality:
          practitionerForm.speciality.trim(),
        qualifications:
          practitionerForm.qualifications.trim(),
        registrationNumber:
          practitionerForm.registrationNumber.trim(),
        experience:
          practitionerForm.experience.trim(),
        notes:
          practitionerForm.notes.trim(),
      };

    setSettings(
      (current) => {
        const updatedPractitioners =
          editingPractitionerId
            ? current.practitioners.map(
                (practitioner) =>
                  practitioner.id ===
                  editingPractitionerId
                    ? cleanPractitioner
                    : practitioner
              )
            : [
                cleanPractitioner,
                ...current.practitioners,
              ];

        let updatedPrimaryName =
          current.practitionerName;

        let updatedInitials =
          current.initials;

        if (
          editingPractitionerId
        ) {
          const oldPractitioner =
            current.practitioners.find(
              (item) =>
                item.id ===
                editingPractitionerId
            );

          if (
            oldPractitioner?.name ===
            current.practitionerName
          ) {
            updatedPrimaryName =
              cleanPractitioner.name;

            updatedInitials =
              generateInitials(
                cleanPractitioner.name
              );
          }
        }

        return {
          ...current,
          practitionerName:
            updatedPrimaryName,
          initials:
            updatedInitials,
          practitioners:
            updatedPractitioners,
        };
      }
    );

    setHasChanges(true);
    setSaved(false);

    closePractitionerForm();
  };

  /*
   * ACTIVATE / DEACTIVATE
   */
  const togglePractitionerStatus = (
    practitionerId: number
  ) => {
    const practitioner =
      settings.practitioners.find(
        (item) =>
          item.id === practitionerId
      );

    if (!practitioner) {
      return;
    }

    /*
     * Keep the workspace primary practitioner valid.
     * A primary practitioner must stay active until
     * another active practitioner is made primary.
     */
    if (
      practitioner.active &&
      practitioner.name ===
        settings.practitionerName
    ) {
      window.alert(
        "This practitioner is currently the Primary practitioner. Make another active practitioner Primary before deactivating them."
      );

      return;
    }

    setSettings(
      (current) => ({
        ...current,
        practitioners:
          current.practitioners.map(
            (item) =>
              item.id ===
              practitionerId
                ? {
                    ...item,
                    active:
                      !item.active,
                  }
                : item
          ),
      })
    );

    setHasChanges(true);
    setSaved(false);
  };

  /*
   * DELETE PRACTITIONER
   */
  const deletePractitioner = (
    practitionerId: number
  ) => {
    const practitionerToDelete =
      settings.practitioners.find(
        (item) =>
          item.id === practitionerId
      );

    if (!practitionerToDelete) {
      return;
    }

    /*
     * Protect the current Primary practitioner.
     * The user must make someone else Primary first.
     */
    if (
      practitionerToDelete.name ===
      settings.practitionerName
    ) {
      window.alert(
        "This practitioner is currently the Primary practitioner. Make another active practitioner Primary before deleting them."
      );

      return;
    }

    /*
     * Historical appointments must keep their
     * practitioner attribution. If this practitioner
     * is already referenced by an appointment, keep
     * the practitioner record and deactivate instead.
     */
    let practitionerHasAppointments =
      false;

    const storedAppointments =
      localStorage.getItem(
        "dermisAppointments"
      );

    if (storedAppointments) {
      try {
        const parsedAppointments =
          JSON.parse(
            storedAppointments
          );

        if (
          Array.isArray(
            parsedAppointments
          )
        ) {
          practitionerHasAppointments =
            parsedAppointments.some(
              (appointment) =>
                appointment?.practitionerId ===
                  practitionerToDelete.id ||
                (
                  typeof appointment?.practitioner ===
                    "string" &&
                  appointment.practitioner
                    .trim()
                    .toLowerCase() ===
                    practitionerToDelete.name
                      .trim()
                      .toLowerCase()
                )
            );
        }
      } catch (error) {
        console.error(
          "Could not inspect appointments before deleting practitioner:",
          error
        );
      }
    }

    if (
      practitionerHasAppointments
    ) {
      window.alert(
        `${practitionerToDelete.name} is linked to existing appointments and cannot be permanently deleted. Deactivate this practitioner instead so historical appointment records remain intact.`
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${practitionerToDelete.name}?\n\nThis will permanently remove the practitioner from the clinic team.`
      );

    if (!confirmed) {
      return;
    }

    setSettings(
      (current) => ({
        ...current,
        practitioners:
          current.practitioners.filter(
            (item) =>
              item.id !==
              practitionerId
          ),
      })
    );

    setHasChanges(true);
    setSaved(false);
  };

  /*
   * SAVE SETTINGS
   */
  const saveSettings = () => {
    const primaryPractitioner =
      settings.practitioners.find(
        (item) =>
          item.name ===
          settings.practitionerName
      );

    const finalSettings: ClinicSettings =
      {
        ...settings,
        initials:
          generateInitials(
            settings.practitionerName
          ) ||
          settings.initials ||
          "SW",
        email:
          primaryPractitioner?.email ||
          settings.email,
        phone:
          primaryPractitioner?.phone ||
          settings.phone,
      };

    setSettings(
      finalSettings
    );

    localStorage.setItem(
      "dermisClinicSettings",
      JSON.stringify(
        finalSettings
      )
    );

    window.dispatchEvent(
      new Event(
        "dermisClinicSettingsUpdated"
      )
    );

    setSaved(true);
    setHasChanges(false);

    window.setTimeout(
      () => {
        setSaved(false);
      },
      3000
    );
  };

  /*
   * RESET DEMO DATA
   *
   * Restores one coherent master dataset across the whole prototype.
   * This replaces page-by-page fallback data with a predictable
   * presentation-ready clinic story.
   */
  const resetDemoData = () => {
    const confirmed = window.confirm(
      "Restore the Velyquo master demo dataset?\n\nThis will replace patients, analyses, appointments, treatment plans, completed treatments, follow-ups and reports currently saved in this browser. This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    resetDermisDemoData();

    const restoredSettings = JSON.parse(
      JSON.stringify(
        dermisDemoData.clinicSettings
      )
    ) as ClinicSettings;

    setSettings(restoredSettings);
    setSaved(false);
    setHasChanges(false);

    window.alert(
      "Demo data restored. The prototype is ready with the master clinic dataset."
    );

    window.location.href =
      "/dashboard";
  };

  /*
   * RESET
   */
  const resetSettings = () => {
    setSettings(
      defaultSettings
    );

    localStorage.setItem(
      "dermisClinicSettings",
      JSON.stringify(
        defaultSettings
      )
    );

    window.dispatchEvent(
      new Event(
        "dermisClinicSettingsUpdated"
      )
    );

    setSaved(true);
    setHasChanges(false);

    window.setTimeout(
      () => {
        setSaved(false);
      },
      3000
    );
  };

  const displayInitials =
    generateInitials(
      settings.practitionerName
    ) ||
    settings.initials ||
    "SW";

  const activePractitioners =
    useMemo(
      () =>
        settings.practitioners.filter(
          (practitioner) =>
            practitioner.active
        ),
      [settings.practitioners]
    );

  const practitionerFormValid =
    practitionerForm.name.trim() !==
      "" &&
    practitionerForm.role.trim() !==
      "";

  return (
    <main className="min-h-screen bg-[#F5F4F0] text-[#171717]">

      <div className="flex min-h-screen">

        <Sidebar activePage="Settings" />

        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="flex items-center justify-between border-b border-[#DDDCD6] bg-white px-6 py-5 lg:px-10">

            <div>

              <p className="text-xs text-[#96958E]">
                Workspace
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                Settings
              </h1>

            </div>

            <div className="flex items-center gap-3">

              {hasChanges && (
                <span className="hidden text-xs text-[#999890] sm:block">
                  Unsaved changes
                </span>
              )}

              <button
                type="button"
                onClick={
                  saveSettings
                }
                className="flex items-center gap-2 rounded-xl bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#333]"
              >

                {saved ? (
                  <Check
                    size={16}
                    strokeWidth={2}
                  />
                ) : (
                  <Save
                    size={16}
                    strokeWidth={1.8}
                  />
                )}

                {saved
                  ? "Saved"
                  : "Save changes"}

              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E2D9] text-xs font-medium">
                {displayInitials}
              </div>

            </div>

          </header>

          {/* CONTENT */}
          <div className="p-6 lg:p-10">

            {/* TITLE */}
            <div>

              <p className="text-sm text-[#71806C]">
                Clinic configuration
              </p>

              <h2 className="mt-1 text-3xl font-medium tracking-[-0.04em]">
                Workspace settings
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#77766F]">
                Manage clinic identity, the primary practitioner and the team available for appointments and treatments.
              </p>

            </div>

            {/* SAVED */}
            {saved && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#D7DDD4] bg-[#F0F3EE] p-5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#62715D]">

                  <Check
                    size={17}
                    strokeWidth={2}
                  />

                </div>

                <div>

                  <p className="text-sm font-semibold">
                    Settings saved
                  </p>

                  <p className="mt-1 text-xs text-[#62715D]">
                    Clinic and practitioner
                    information has been
                    updated across the
                    prototype.
                  </p>

                </div>

              </div>
            )}

            {/* OVERVIEW */}
            <div className="mt-8 rounded-2xl border border-[#DDDCD6] bg-white p-6">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div className="flex items-center gap-4">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E5E2D9] text-lg font-semibold">
                    {displayInitials}
                  </div>

                  <div>

                    <p className="text-xs text-[#999890]">
                      Primary practitioner
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      {settings.practitionerName ||
                        "No Primary practitioner"}
                    </h3>

                    <p className="mt-1 text-sm text-[#77766F]">
                      {settings.clinicName}
                    </p>

                  </div>

                </div>

                <div className="flex flex-wrap gap-2">

                  <span className="rounded-full bg-[#E8EEE5] px-3 py-1.5 text-[10px] font-medium text-[#62715D]">
                    {
                      activePractitioners.length
                    }{" "}
                    active
                  </span>

                  <span className="rounded-full bg-[#F1F0EB] px-3 py-1.5 text-[10px] text-[#77766F]">
                    {
                      settings.practitioners
                        .length
                    }{" "}
                    total practitioners
                  </span>

                </div>

              </div>

            </div>

            {/* MAIN GRID */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

              {/* LEFT */}
              <div className="space-y-6">

                {/* CLINIC DETAILS */}
                <div className="rounded-2xl border border-[#DDDCD6] bg-white p-6">

                  <div className="flex items-start gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EFEA]">

                      <Building2
                        size={18}
                        strokeWidth={1.7}
                      />

                    </div>

                    <div>

                      <p className="text-sm text-[#77766F]">
                        Organisation
                      </p>

                      <h3 className="mt-1 text-lg font-semibold">
                        Clinic details
                      </h3>

                    </div>

                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">

                    <div className="md:col-span-2">

                      <label className="text-xs font-medium text-[#77766F]">
                        Clinic name
                      </label>

                      <div className="relative mt-2">

                        <Building2
                          size={16}
                          strokeWidth={1.7}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999890]"
                        />

                        <input
                          type="text"
                          value={
                            settings.clinicName
                          }
                          onChange={(e) =>
                            updateField(
                              "clinicName",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#99978F]"
                        />

                      </div>

                    </div>

                    <div>

                      <label className="text-xs font-medium text-[#77766F]">
                        Clinic email
                      </label>

                      <div className="relative mt-2">

                        <Mail
                          size={16}
                          strokeWidth={1.7}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999890]"
                        />

                        <input
                          type="email"
                          value={
                            settings.email
                          }
                          onChange={(e) =>
                            updateField(
                              "email",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#99978F]"
                        />

                      </div>

                    </div>

                    <div>

                      <label className="text-xs font-medium text-[#77766F]">
                        Phone
                      </label>

                      <div className="relative mt-2">

                        <Phone
                          size={16}
                          strokeWidth={1.7}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999890]"
                        />

                        <input
                          type="text"
                          value={
                            settings.phone
                          }
                          onChange={(e) =>
                            updateField(
                              "phone",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#99978F]"
                        />

                      </div>

                    </div>

                    <div className="md:col-span-2">

                      <label className="text-xs font-medium text-[#77766F]">
                        Location
                      </label>

                      <div className="relative mt-2">

                        <MapPin
                          size={16}
                          strokeWidth={1.7}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999890]"
                        />

                        <input
                          type="text"
                          value={
                            settings.location
                          }
                          onChange={(e) =>
                            updateField(
                              "location",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#99978F]"
                        />

                      </div>

                    </div>

                  </div>

                </div>

                {/* PRACTITIONERS */}
                <div className="rounded-2xl border border-[#DDDCD6] bg-white">

                  <div className="flex flex-col justify-between gap-4 border-b border-[#ECEBE6] px-6 py-5 sm:flex-row sm:items-center">

                    <div>

                      <p className="text-sm text-[#77766F]">
                        Clinic team
                      </p>

                      <h3 className="mt-1 text-lg font-semibold">
                        Practitioners
                      </h3>

                      <p className="mt-1 text-xs text-[#999890]">
                        Add and manage
                        practitioners available
                        for bookings.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        openAddPractitioner
                      }
                      className="flex w-fit items-center gap-2 rounded-xl bg-[#171717] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#333]"
                    >

                      <Plus
                        size={15}
                        strokeWidth={1.8}
                      />

                      Add practitioner

                    </button>

                  </div>

                  {settings.practitioners
                    .length > 0 ? (

                    <div className="divide-y divide-[#F0EFEA]">

                      {settings.practitioners.map(
                        (practitioner) => (

                          <div
                            key={
                              practitioner.id
                            }
                            className="p-6"
                          >

                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">

                              <div className="flex min-w-0 gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8E5DD] text-xs font-medium">
                                  {generateInitials(
                                    practitioner.name
                                  )}
                                </div>

                                <div className="min-w-0">

                                  <div className="flex flex-wrap items-center gap-2">

                                    <p className="text-sm font-semibold">
                                      {
                                        practitioner.name
                                      }
                                    </p>

                                    {settings.practitionerName ===
                                      practitioner.name && (
                                      <span className="rounded-full bg-[#F0F3EE] px-2.5 py-1 text-[9px] font-medium text-[#62715D]">
                                        Primary
                                      </span>
                                    )}

                                    <span
                                      className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${
                                        practitioner.active
                                          ? "bg-[#E8EEE5] text-[#62715D]"
                                          : "bg-[#F1F0EB] text-[#77766F]"
                                      }`}
                                    >
                                      {practitioner.active
                                        ? "Active"
                                        : "Inactive"}
                                    </span>

                                  </div>

                                  <p className="mt-1 text-xs text-[#77766F]">
                                    {
                                      practitioner.role
                                    }
                                  </p>

                                  <p className="mt-2 text-xs text-[#999890]">
                                    {practitioner.speciality ||
                                      "No speciality added"}
                                  </p>

                                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-[#999890]">

                                    {practitioner.email && (
                                      <span>
                                        {
                                          practitioner.email
                                        }
                                      </span>
                                    )}

                                    {practitioner.phone && (
                                      <span>
                                        {
                                          practitioner.phone
                                        }
                                      </span>
                                    )}

                                    {practitioner.experience && (
                                      <span>
                                        {
                                          practitioner.experience
                                        }{" "}
                                        experience
                                      </span>
                                    )}

                                  </div>

                                  {practitioner.workingDays
                                    .length > 0 && (

                                    <div className="mt-4 flex flex-wrap gap-2">

                                      {practitioner.workingDays.map(
                                        (day) => (

                                          <span
                                            key={
                                              day
                                            }
                                            className="rounded-lg bg-[#F7F6F2] px-2.5 py-1 text-[9px] text-[#77766F]"
                                          >
                                            {
                                              day.slice(
                                                0,
                                                3
                                              )
                                            }
                                          </span>

                                        )
                                      )}

                                      <span className="flex items-center gap-1 rounded-lg bg-[#F7F6F2] px-2.5 py-1 text-[9px] text-[#77766F]">

                                        <Clock3
                                          size={10}
                                          strokeWidth={1.7}
                                        />

                                        {
                                          practitioner.startTime
                                        }
                                        {" – "}
                                        {
                                          practitioner.endTime
                                        }

                                      </span>

                                    </div>

                                  )}

                                </div>

                              </div>

                              <div className="flex flex-wrap gap-2">

                                {settings.practitionerName !==
                                  practitioner.name &&
                                  practitioner.active && (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPrimaryPractitioner(
                                        practitioner.name
                                      )
                                    }
                                    className="rounded-lg border border-[#DDDCD6] px-3 py-2 text-[10px] font-medium hover:bg-[#F7F6F2]"
                                  >
                                    Make primary
                                  </button>

                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    togglePractitionerStatus(
                                      practitioner.id
                                    )
                                  }
                                  className="rounded-lg border border-[#DDDCD6] px-3 py-2 text-[10px] font-medium hover:bg-[#F7F6F2]"
                                >
                                  {practitioner.active
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditPractitioner(
                                      practitioner
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDDCD6] hover:bg-[#F7F6F2]"
                                >
                                  <Pencil
                                    size={14}
                                    strokeWidth={1.7}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deletePractitioner(
                                      practitioner.id
                                    )
                                  }
                                  title="Delete practitioner"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E6D7D7] text-[#8A6666] hover:bg-[#F7EEEE]"
                                >
                                  <Trash2
                                    size={14}
                                    strokeWidth={1.7}
                                  />
                                </button>

                              </div>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="px-6 py-12 text-center">

                      <UserRound
                        size={24}
                        strokeWidth={1.6}
                        className="mx-auto text-[#999890]"
                      />

                      <p className="mt-4 text-sm font-medium">
                        No practitioners
                      </p>

                      <p className="mt-2 text-xs text-[#999890]">
                        Add your first
                        practitioner to begin
                        assigning appointments.
                      </p>

                    </div>

                  )}

                </div>

              </div>

              {/* RIGHT */}
              <div className="space-y-6">

                {/* PRIMARY */}
                <div className="rounded-2xl border border-[#DDDCD6] bg-white p-6">

                  <p className="text-sm text-[#77766F]">
                    Workspace identity
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Primary practitioner
                  </h3>

                  <div className="mt-5">

                    <label className="text-xs font-medium text-[#77766F]">
                      Primary practitioner
                    </label>

                    <select
                      value={
                        settings.practitionerName
                      }
                      onChange={(e) =>
                        setPrimaryPractitioner(
                          e.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm outline-none"
                    >

                      {settings.practitioners
                        .filter(
                          (practitioner) =>
                            practitioner.active
                        )
                        .map(
                          (practitioner) => (

                            <option
                              key={
                                practitioner.id
                              }
                              value={
                                practitioner.name
                              }
                            >
                              {
                                practitioner.name
                              }{" "}
                              —{" "}
                              {
                                practitioner.role
                              }
                            </option>

                          )
                        )}

                    </select>

                  </div>

                  <div className="mt-6 rounded-xl bg-[#F7F6F2] p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E5E2D9] text-xs font-semibold">
                        {displayInitials}
                      </div>

                      <div>

                        <p className="text-sm font-semibold">
                          {
                            settings.practitionerName
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#77766F]">
                          {
                            settings.clinicName
                          }
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                {/* DEMO MODE */}
                <div className="rounded-2xl border border-[#DDDCD6] bg-white p-6">

                  <p className="text-sm text-[#77766F]">
                    Demo mode
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Restore demo data
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#77766F]">
                    Restore the complete presentation-ready clinic dataset before a demo. This replaces browser-saved patients, analyses, appointments, treatment plans, completed treatments, follow-ups and reports with the connected master demo story.
                  </p>

                  <div className="mt-5 rounded-xl bg-[#F7F6F2] p-4">
                    <p className="text-xs font-medium">
                      What this restores
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#999890]">
                      Only Velyquo prototype data is replaced. Your clinic team, patients, appointments, analyses, treatments, follow-ups and reports are restored together, while unrelated browser storage is left untouched.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      resetDemoData
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8CACA] bg-[#FFF9F8] px-4 py-3 text-sm font-medium text-[#7A5E5E] transition hover:bg-[#F8EEEE]"
                  >
                    <RotateCcw
                      size={15}
                      strokeWidth={1.8}
                    />

                    Restore demo data
                  </button>

                </div>

                {/* STORAGE */}
                <div className="rounded-2xl border border-[#D7DDD4] bg-[#F0F3EE] p-6">

                  <p className="text-xs font-medium text-[#62715D]">
                    Prototype storage
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Prototype data is saved locally
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#5F685A]">
                    Clinic and practitioner changes are stored in this browser using localStorage. A production SaaS would move this workspace data into a secure database and authenticated account.
                  </p>

                </div>

                {/* RESET */}
                <div className="rounded-2xl border border-[#DDDCD6] bg-white p-6">

                  <p className="text-sm font-semibold">
                    Reset settings
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#77766F]">
                    Restore Skinhouse Clinic,
                    Sarah Williams and Emma
                    Thompson as the original
                    demo configuration.
                  </p>

                  <button
                    type="button"
                    onClick={
                      resetSettings
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#DDDCD6] px-4 py-3 text-sm font-medium transition hover:bg-[#F7F6F2]"
                  >

                    <RotateCcw
                      size={15}
                      strokeWidth={1.8}
                    />

                    Reset to default

                  </button>

                </div>

              </div>

            </div>

            {/* SAVE */}
            <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#DDDCD6] bg-white p-5 sm:flex-row sm:items-center">

              <div>

                <p className="text-sm font-medium">
                  Workspace configuration
                </p>

                <p className="mt-1 text-xs text-[#999890]">
                  Save changes to make
                  practitioner updates
                  available across the
                  prototype.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  saveSettings
                }
                className="flex w-fit items-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white hover:bg-[#333]"
              >

                {saved ? (
                  <Check
                    size={16}
                    strokeWidth={2}
                  />
                ) : (
                  <Save
                    size={16}
                    strokeWidth={1.8}
                  />
                )}

                {saved
                  ? "Changes saved"
                  : "Save changes"}

              </button>

            </div>

          </div>

        </section>

      </div>

      {/* PRACTITIONER FORM MODAL */}
      {showPractitionerForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">

          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-xl">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#ECEBE6] bg-white px-6 py-5">

              <div>

                <p className="text-xs text-[#71806C]">
                  Practitioner management
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  {editingPractitionerId
                    ? "Edit practitioner"
                    : "Add practitioner"}
                </h3>

              </div>

              <button
                type="button"
                onClick={
                  closePractitionerForm
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDDCD6] hover:bg-[#F7F6F2]"
              >
                <X
                  size={16}
                  strokeWidth={1.7}
                />
              </button>

            </div>

            {/* FORM */}
            <div className="p-6">

              <div className="grid gap-5 md:grid-cols-2">

                <FormField
                  label="Full name"
                  value={
                    practitionerForm.name
                  }
                  onChange={(value) =>
                    updatePractitionerField(
                      "name",
                      value
                    )
                  }
                  placeholder="e.g. Dr Jessica Brown"
                />

                <FormField
                  label="Role / job title"
                  value={
                    practitionerForm.role
                  }
                  onChange={(value) =>
                    updatePractitionerField(
                      "role",
                      value
                    )
                  }
                  placeholder="Aesthetic Practitioner"
                />

                <FormField
                  label="Email"
                  value={
                    practitionerForm.email
                  }
                  onChange={(value) =>
                    updatePractitionerField(
                      "email",
                      value
                    )
                  }
                  placeholder="practitioner@clinic.com"
                  type="email"
                />

                <FormField
                  label="Phone"
                  value={
                    practitionerForm.phone
                  }
                  onChange={(value) =>
                    updatePractitionerField(
                      "phone",
                      value
                    )
                  }
                  placeholder="+44 20 7946 0958"
                />

                <FormField
                  label="Speciality"
                  value={
                    practitionerForm.speciality
                  }
                  onChange={(value) =>
                    updatePractitionerField(
                      "speciality",
                      value
                    )
                  }
                  placeholder="Acne, Pigmentation, Rejuvenation"
                />

                <FormField
                  label="Experience"
                  value={
                    practitionerForm.experience
                  }
                  onChange={(value) =>
                    updatePractitionerField(
                      "experience",
                      value
                    )
                  }
                  placeholder="5 years"
                />

                <FormField
                  label="Qualifications"
                  value={
                    practitionerForm.qualifications
                  }
                  onChange={(value) =>
                    updatePractitionerField(
                      "qualifications",
                      value
                    )
                  }
                  placeholder="Level 7 Aesthetic Practice"
                />

                <FormField
                  label="Registration number"
                  value={
                    practitionerForm.registrationNumber
                  }
                  onChange={(value) =>
                    updatePractitionerField(
                      "registrationNumber",
                      value
                    )
                  }
                  placeholder="Registration number"
                />

              </div>

              {/* DAYS */}
              <div className="mt-6">

                <label className="text-xs font-medium text-[#77766F]">
                  Working days
                </label>

                <div className="mt-3 flex flex-wrap gap-2">

                  {workingDayOptions.map(
                    (day) => {

                      const selected =
                        practitionerForm.workingDays.includes(
                          day
                        );

                      return (

                        <button
                          key={day}
                          type="button"
                          onClick={() =>
                            toggleWorkingDay(
                              day
                            )
                          }
                          className={`rounded-xl border px-3 py-2 text-xs transition ${
                            selected
                              ? "border-[#171717] bg-[#171717] text-white"
                              : "border-[#DDDCD6] bg-white text-[#77766F] hover:bg-[#F7F6F2]"
                          }`}
                        >
                          {day}
                        </button>

                      );
                    }
                  )}

                </div>

              </div>

              {/* HOURS */}
              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="text-xs font-medium text-[#77766F]">
                    Start time
                  </label>

                  <input
                    type="time"
                    value={
                      practitionerForm.startTime
                    }
                    onChange={(e) =>
                      updatePractitionerField(
                        "startTime",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm outline-none"
                  />

                </div>

                <div>

                  <label className="text-xs font-medium text-[#77766F]">
                    End time
                  </label>

                  <input
                    type="time"
                    value={
                      practitionerForm.endTime
                    }
                    onChange={(e) =>
                      updatePractitionerField(
                        "endTime",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm outline-none"
                  />

                </div>

              </div>

              {/* NOTES */}
              <div className="mt-6">

                <label className="text-xs font-medium text-[#77766F]">
                  Practitioner notes
                </label>

                <textarea
                  rows={4}
                  value={
                    practitionerForm.notes
                  }
                  onChange={(e) =>
                    updatePractitionerField(
                      "notes",
                      e.target.value
                    )
                  }
                  placeholder="Add internal notes about this practitioner..."
                  className="mt-2 w-full resize-none rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm outline-none"
                />

              </div>

              {/* ACTIVE */}
              <div className="mt-6 flex items-center justify-between rounded-xl bg-[#F7F6F2] p-4">

                <div>

                  <p className="text-sm font-medium">
                    Active practitioner
                  </p>

                  <p className="mt-1 text-xs text-[#999890]">
                    Active practitioners can
                    be selected for new
                    appointments.
                  </p>

                </div>

                <button
                  type="button"
                  disabled={
                    Boolean(
                      editingPractitionerId &&
                        settings.practitioners.find(
                          (item) =>
                            item.id ===
                            editingPractitionerId
                        )?.name ===
                          settings.practitionerName
                    )
                  }
                  onClick={() =>
                    updatePractitionerField(
                      "active",
                      !practitionerForm.active
                    )
                  }
                  title={
                    editingPractitionerId &&
                    settings.practitioners.find(
                      (item) =>
                        item.id ===
                        editingPractitionerId
                    )?.name ===
                      settings.practitionerName
                      ? "Make another active practitioner Primary before deactivating this practitioner."
                      : undefined
                  }
                  className={`relative h-7 w-12 rounded-full transition ${
                    practitionerForm.active
                      ? "bg-[#62715D]"
                      : "bg-[#D8D6CE]"
                  } ${
                    editingPractitionerId &&
                    settings.practitioners.find(
                      (item) =>
                        item.id ===
                        editingPractitionerId
                    )?.name ===
                      settings.practitionerName
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >

                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      practitionerForm.active
                        ? "left-6"
                        : "left-1"
                    }`}
                  />

                </button>

              </div>

              {/* ACTIONS */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closePractitionerForm
                  }
                  className="rounded-xl border border-[#DDDCD6] px-5 py-3 text-sm font-medium hover:bg-[#F7F6F2]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    !practitionerFormValid
                  }
                  onClick={
                    savePractitioner
                  }
                  className={`rounded-xl px-5 py-3 text-sm font-medium ${
                    practitionerFormValid
                      ? "bg-[#171717] text-white hover:bg-[#333]"
                      : "cursor-not-allowed bg-[#DDDCD6] text-[#999890]"
                  }`}
                >
                  {editingPractitionerId
                    ? "Save practitioner"
                    : "Add practitioner"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

function FormField({
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
  type?: string;
}) {
  return (
    <div>

      <label className="text-xs font-medium text-[#77766F]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[#DDDCD6] bg-[#FAF9F6] px-4 py-3 text-sm outline-none transition focus:border-[#99978F]"
      />

    </div>
  );
}
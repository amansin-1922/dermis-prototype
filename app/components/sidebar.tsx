"use client";

import { useEffect, useState } from "react";

import {
  House,
  Users,
  Sparkles,
  BriefcaseMedical,
  CalendarDays,
  FileText,
  Settings,
  Images,
} from "lucide-react";

type SidebarProps = {
  activePage:
    | "Overview"
    | "Patients"
    | "Skin Analysis"
    | "Treatments"
    | "Appointments"
    | "Before & After"
    | "Reports"
    | "Settings";
};

type ClinicSettings = {
  clinicName: string;
  practitionerName: string;
  email?: string;
  phone?: string;
  initials: string;
  location?: string;
};

const defaultSettings: ClinicSettings = {
  clinicName: "Skinhouse Clinic",
  practitionerName: "Sarah Williams",
  initials: "SW",
};

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: House,
  },
  {
    name: "Patients",
    href: "/patients",
    icon: Users,
  },
  {
    name: "Skin Analysis",
    href: "/analysis",
    icon: Sparkles,
  },
  {
    name: "Treatments",
    href: "/treatments",
    icon: BriefcaseMedical,
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: CalendarDays,
  },
  {
    name: "Before & After",
    href: "/before-after",
    icon: Images,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
] as const;

export default function Sidebar({
  activePage,
}: SidebarProps) {
  const [clinicSettings, setClinicSettings] =
    useState<ClinicSettings>(defaultSettings);

  useEffect(() => {
    const loadSettings = () => {
      const storedSettings = localStorage.getItem(
        "dermisClinicSettings"
      );

      if (!storedSettings) {
        setClinicSettings(defaultSettings);
        return;
      }

      try {
        const parsedSettings = JSON.parse(
          storedSettings
        );

        setClinicSettings({
          ...defaultSettings,
          ...parsedSettings,
        });
      } catch (error) {
        console.error(
          "Could not load clinic settings:",
          error
        );

        setClinicSettings(defaultSettings);
      }
    };

    loadSettings();

    window.addEventListener(
      "dermisClinicSettingsUpdated",
      loadSettings
    );

    window.addEventListener(
      "storage",
      loadSettings
    );

    return () => {
      window.removeEventListener(
        "dermisClinicSettingsUpdated",
        loadSettings
      );

      window.removeEventListener(
        "storage",
        loadSettings
      );
    };
  }, []);

  const generatedInitials =
    clinicSettings.practitionerName
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const initials =
    clinicSettings.initials?.trim().toUpperCase() ||
    generatedInitials ||
    "SW";

  return (
    <aside className="hidden w-[250px] shrink-0 border-r border-[#DDDCD6] bg-white lg:flex lg:flex-col">
      {/* BRAND */}
      <div className="px-7 py-7">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2"
        >
          <span className="text-xl font-semibold tracking-[-0.04em] text-[#171717]">
            velyquo
            <span className="text-[#8A8A84]">.</span>
          </span>

          <span className="rounded-full border border-[#DDDCD6] bg-[#F8F7F4] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8A8982]">
            Clinic
          </span>
        </a>

        <p className="mt-2 text-[11px] leading-4 text-[#9A9992]">
          Intelligent aesthetic clinic platform
        </p>
      </div>

      {/* NAVIGATION */}
      <nav className="px-4">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A9992]">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              activePage === item.name;

            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  isActive
                    ? "bg-[#F0EFEA] font-medium text-[#171717]"
                    : "text-[#77766F] hover:bg-[#F7F6F2] hover:text-[#171717]"
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                  <Icon
                    size={18}
                    strokeWidth={1.7}
                  />
                </span>

                <span className="truncate">
                  {item.name}
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* CLINIC ACCOUNT */}
      <div className="mt-auto border-t border-[#ECEBE6] p-5">
        <a
          href="/settings"
          className={`flex w-full items-center gap-3 rounded-xl p-2 transition ${
            activePage === "Settings"
              ? "bg-[#F0EFEA]"
              : "hover:bg-[#F7F6F2]"
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5E2D9] text-xs font-medium text-[#171717]">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#171717]">
              {clinicSettings.practitionerName}
            </p>

            <p className="truncate text-xs text-[#96958E]">
              {clinicSettings.clinicName}
            </p>
          </div>
        </a>

        <p className="mt-3 px-2 text-[10px] leading-4 text-[#AAA9A2]">
          Powered by Velyquo
        </p>
      </div>
    </aside>
  );
}
"use client";

import { useEffect, useState } from "react";

import {
  BriefcaseMedical,
  CalendarDays,
  FileText,
  House,
  Images,
  Settings,
  Sparkles,
  Users,
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

const workspaceNavigation = [
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
] as const;

const clinicalNavigation = [
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
] as const;

export default function Sidebar({
  activePage,
}: SidebarProps) {
  const [clinicSettings, setClinicSettings] =
    useState<ClinicSettings>(defaultSettings);

  useEffect(() => {
    const loadSettings = () => {
      const storedSettings =
        localStorage.getItem(
          "dermisClinicSettings"
        );

      if (!storedSettings) {
        setClinicSettings(defaultSettings);
        return;
      }

      try {
        const parsedSettings =
          JSON.parse(storedSettings);

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
    clinicSettings.initials
      ?.trim()
      .toUpperCase() ||
    generatedInitials ||
    "SW";

  const renderNavigationItem = (
    item:
      | (typeof workspaceNavigation)[number]
      | (typeof clinicalNavigation)[number]
  ) => {
    const Icon = item.icon;
    const isActive =
      activePage === item.name;

    return (
      <a
        key={item.name}
        href={item.href}
        aria-current={
          isActive ? "page" : undefined
        }
        className={`group relative flex h-[42px] items-center gap-3 rounded-[12px] px-3 transition-all duration-200 ${
          isActive
            ? "bg-[#E9EEE8] text-[#243127]"
            : "text-[#6F746F] hover:bg-[#F2F3EF] hover:text-[#242A25]"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-[#526A57]" />
        )}

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] transition-all ${
            isActive
              ? "bg-white text-[#526A57] shadow-[0_2px_8px_rgba(28,38,30,0.05)]"
              : "text-[#8A8E88] group-hover:text-[#5D655E]"
          }`}
        >
          <Icon
            size={16}
            strokeWidth={
              isActive ? 1.8 : 1.55
            }
          />
        </span>

        <span
          className={`text-[12.5px] tracking-[-0.01em] ${
            isActive
              ? "font-semibold"
              : "font-medium"
          }`}
        >
          {item.name}
        </span>
      </a>
    );
  };

  return (
    <aside className="hidden w-[264px] shrink-0 overflow-hidden border-r border-[#E7E6E0] bg-[#FBFBF8] lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start lg:flex-col">
      {/* BRAND */}
      <div className="shrink-0 px-7 pb-4 pt-6">
        <a
          href="/dashboard"
          className="inline-block"
        >
          <div className="flex items-baseline">
            <span className="text-[26px] font-semibold tracking-[-0.065em] text-[#1D211E]">
              velyquo
            </span>

            <span className="text-[26px] font-semibold text-[#5F7563]">
              .
            </span>
          </div>
        </a>

        <p className="mt-2 max-w-[188px] text-[10px] leading-[16px] text-[#979A94]">
          Intelligence for modern aesthetic
          clinics.
        </p>
      </div>

      <div className="mx-7 h-px shrink-0 bg-[#ECEBE6]" />

      {/* SCROLL-SAFE NAVIGATION AREA */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div>
          <p className="px-3 text-[7.5px] font-semibold uppercase tracking-[0.22em] text-[#ABADA7]">
            Workspace
          </p>

          <div className="mt-2 space-y-0.5">
            {workspaceNavigation.map(
              renderNavigationItem
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="px-3 text-[7.5px] font-semibold uppercase tracking-[0.22em] text-[#ABADA7]">
            Clinical
          </p>

          <div className="mt-2 space-y-0.5">
            {clinicalNavigation.map(
              renderNavigationItem
            )}
          </div>
        </div>

        <div className="mt-3 border-t border-[#EEEDE8] pt-3">
          <a
            href="/settings"
            aria-current={
              activePage === "Settings"
                ? "page"
                : undefined
            }
            className={`group relative flex h-[42px] items-center gap-3 rounded-[12px] px-3 transition-all duration-200 ${
              activePage === "Settings"
                ? "bg-[#E9EEE8] text-[#243127]"
                : "text-[#6F746F] hover:bg-[#F2F3EF] hover:text-[#242A25]"
            }`}
          >
            {activePage ===
              "Settings" && (
              <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-[#526A57]" />
            )}

            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] transition-all ${
                activePage ===
                "Settings"
                  ? "bg-white text-[#526A57] shadow-[0_2px_8px_rgba(28,38,30,0.05)]"
                  : "text-[#8A8E88] group-hover:text-[#5D655E]"
              }`}
            >
              <Settings
                size={16}
                strokeWidth={
                  activePage ===
                  "Settings"
                    ? 1.8
                    : 1.55
                }
              />
            </span>

            <span
              className={`text-[12.5px] tracking-[-0.01em] ${
                activePage ===
                "Settings"
                  ? "font-semibold"
                  : "font-medium"
              }`}
            >
              Settings
            </span>
          </a>
        </div>
      </nav>

      {/* ACCOUNT FOOTER */}
      <div className="shrink-0 bg-[#FBFBF8] px-5 pb-4 pt-2">
        <div className="border-t border-[#E9E8E3] pt-3">
          <div className="mb-2.5 flex items-center gap-2 px-2">
            <span className="h-[6px] w-[6px] rounded-full bg-[#718574]" />

            <span className="text-[8px] font-medium uppercase tracking-[0.13em] text-[#9FA19B]">
              AI workspace
            </span>
          </div>

          <a
            href="/settings"
            className="group flex min-h-[52px] items-center gap-3 rounded-[14px] px-2 py-1.5 transition-all duration-200 hover:bg-white hover:shadow-[0_5px_18px_rgba(27,32,27,0.035)]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DAE2D8] bg-[#E8EEE7] text-[9px] font-semibold tracking-[0.05em] text-[#506355]">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold tracking-[-0.015em] text-[#252A26]">
                {
                  clinicSettings.practitionerName
                }
              </p>

              <p className="mt-0.5 truncate text-[8.5px] text-[#989B95]">
                {clinicSettings.clinicName}
              </p>
            </div>

            <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#7B907E]" />
          </a>

          <div className="mt-2 flex items-center justify-between px-2">
            <span className="text-[7px] uppercase tracking-[0.12em] text-[#B2B4AE]">
              Clinic workspace
            </span>

            <span className="text-[7px] font-semibold tracking-[0.04em] text-[#8E918B]">
              Velyquo
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

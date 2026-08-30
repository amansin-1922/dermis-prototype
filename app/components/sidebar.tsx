"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  BriefcaseMedical,
  CalendarDays,
  ChevronRight,
  FileText,
  House,
  Images,
  LogOut,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

import { createClient } from "../lib/supabase-browser";

const supabase = createClient();

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
  const router = useRouter();

  const [clinicSettings, setClinicSettings] =
    useState<ClinicSettings>(defaultSettings);

  const [signingOut, setSigningOut] =
    useState(false);

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

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Could not sign out:",
          error
        );

        setSigningOut(false);
        return;
      }

      /*
       * Temporary compatibility keys.
       * These can be removed once the remaining
       * prototype authentication logic has been
       * completely migrated to Supabase.
       */
      localStorage.removeItem(
        "dermisDemoLoggedIn"
      );

      localStorage.removeItem(
        "dermisRememberLogin"
      );

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Could not sign out:",
        error
      );

      setSigningOut(false);
    }
  };

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
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] transition-all duration-200 ${
            isActive
              ? "bg-white text-[#526A57] shadow-[0_2px_8px_rgba(28,38,30,0.05)]"
              : "text-[#8A8E88] group-hover:bg-white group-hover:text-[#5D655E]"
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

      {/* NAVIGATION */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* WORKSPACE */}
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

        {/* CLINICAL */}
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

        {/* SETTINGS */}
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
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] transition-all duration-200 ${
                activePage ===
                "Settings"
                  ? "bg-white text-[#526A57] shadow-[0_2px_8px_rgba(28,38,30,0.05)]"
                  : "text-[#8A8E88] group-hover:bg-white group-hover:text-[#5D655E]"
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
      <div className="shrink-0 bg-[#FBFBF8] px-4 pb-4 pt-2">
        <div className="border-t border-[#E9E8E3] pt-3">
          {/* WORKSPACE STATUS */}
          <div className="mb-2.5 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-[7px] w-[7px]">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#9BAA9D] opacity-40" />

                <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-[#718574]" />
              </span>

              <span className="text-[7.5px] font-semibold uppercase tracking-[0.16em] text-[#9FA19B]">
                Clinic workspace
              </span>
            </div>

            <span className="rounded-full border border-[#E2E7E1] bg-[#F4F7F3] px-2 py-0.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-[#708074]">
              Active
            </span>
          </div>

          {/* ACCOUNT CARD */}
          <a
            href="/settings"
            className="group block rounded-[16px] border border-[#E6E8E3] bg-white p-2.5 shadow-[0_5px_20px_rgba(31,38,33,0.035)] transition-all duration-200 hover:border-[#DDE3DC] hover:shadow-[0_7px_22px_rgba(31,38,33,0.055)]"
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#D8E1D7] bg-[#EAF0E9] text-[10px] font-semibold tracking-[0.04em] text-[#4E6253]">
                  {initials}
                </div>

                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[2px] border-white bg-[#718574]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold tracking-[-0.015em] text-[#252A26]">
                  {
                    clinicSettings.practitionerName
                  }
                </p>

                <p className="mt-0.5 truncate text-[8.5px] text-[#929891]">
                  {clinicSettings.clinicName}
                </p>
              </div>

              <ChevronRight
                size={14}
                strokeWidth={1.5}
                className="shrink-0 text-[#B2B6B0] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#778078]"
              />
            </div>
          </a>

          {/* SIGN OUT */}
          <div className="mt-2">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="group flex w-full items-center justify-between rounded-[13px] border border-transparent px-2.5 py-2 transition-all duration-200 hover:border-[#E9E3DF] hover:bg-[#F8F5F3] disabled:cursor-wait disabled:opacity-60"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#EBE7E3] bg-[#FAF8F6] text-[#8B6A62] transition-all duration-200 group-hover:border-[#E5D9D4] group-hover:bg-[#F6EEEB] group-hover:text-[#765048]">
                  <LogOut
                    size={14}
                    strokeWidth={1.65}
                  />
                </span>

                <div className="text-left">
                  <p className="text-[10px] font-semibold tracking-[-0.01em] text-[#656A65] transition-colors group-hover:text-[#714F48]">
                    {signingOut
                      ? "Signing out..."
                      : "Sign out"}
                  </p>

                  <p className="mt-0.5 text-[7.5px] text-[#AAACA7]">
                    End secure session
                  </p>
                </div>
              </div>

              <ChevronRight
                size={13}
                strokeWidth={1.5}
                className="text-[#C1C2BE] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#9C817B]"
              />
            </button>
          </div>

          {/* FOOTER */}
          <div className="mt-2.5 flex items-center justify-between border-t border-[#EEEDE9] px-2 pt-2.5">
            <span className="text-[6.5px] uppercase tracking-[0.13em] text-[#B1B3AD]">
              Secure workspace
            </span>

            <div className="flex items-center gap-1">
              <span className="text-[7px] font-semibold tracking-[0.04em] text-[#858C86]">
                Velyquo
              </span>

              <span className="text-[8px] font-semibold text-[#647568]">
                .
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
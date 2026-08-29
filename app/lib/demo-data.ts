/*
 * Velyquo prototype — coherent master demo dataset.
 *
 * Keep demo records here instead of maintaining different fallback data on
 * every page. The dates intentionally sit around 28 Aug 2026 because the
 * current Appointments calendar is the 25–31 Aug 2026 week.
 */

export const DEMO_DATA_VERSION = "2026-08-28-v1";

const clinicSettings = {
  clinicName: "Skinhouse Clinic",
  practitionerName: "Sarah Williams",
  email: "sarah@skinhouseclinic.co.uk",
  phone: "+44 20 7946 0958",
  initials: "SW",
  location: "London, United Kingdom",
  practitioners: [
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
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
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
      workingDays: ["Monday", "Wednesday", "Thursday", "Friday"],
      startTime: "10:00",
      endTime: "18:00",
      notes: "",
      active: true,
    },
  ],
};

const patients = [
  { id: 1, name: "Emily Johnson", email: "emily.johnson@email.com", phone: "+44 7700 900123", age: 29, lastVisit: "27 Aug 2026", status: "Active", concern: "Acne & pigmentation", analyses: 4 },
  { id: 2, name: "Olivia Smith", email: "olivia.smith@email.com", phone: "+44 7700 900124", age: 34, lastVisit: "28 Aug 2026", status: "Active", concern: "Fine lines", analyses: 3 },
  { id: 3, name: "Amelia Brown", email: "amelia.brown@email.com", phone: "+44 7700 900125", age: 27, lastVisit: "26 Aug 2026", status: "Active", concern: "Hyperpigmentation", analyses: 3 },
  { id: 4, name: "Sophia Williams", email: "sophia.williams@email.com", phone: "+44 7700 900126", age: 41, lastVisit: "21 Aug 2026", status: "Inactive", concern: "Skin ageing", analyses: 2 },
  { id: 5, name: "Isabella Taylor", email: "isabella.taylor@email.com", phone: "+44 7700 900127", age: 31, lastVisit: "24 Aug 2026", status: "Active", concern: "Rosacea", analyses: 2 },
  { id: 6, name: "Mia Anderson", email: "mia.anderson@email.com", phone: "+44 7700 900128", age: 26, lastVisit: "20 Aug 2026", status: "Active", concern: "Acne", analyses: 2 },
] as const;

const appointments = [
  {
    id: 1001, patient: "Emily Johnson", patientId: 1, initials: "EJ",
    treatment: "Hydration Facial", date: "27 Aug 2026", rawDate: "2026-08-27",
    time: "10:30 AM", rawTime: "10:30", duration: "60 min",
    practitioner: "Sarah Williams", practitionerId: 1,
    notes: "Hydration-focused treatment following baseline skin analysis.", status: "Completed",
  },
  {
    id: 1002, patient: "Olivia Smith", patientId: 2, initials: "OS",
    treatment: "Skin consultation", date: "28 Aug 2026", rawDate: "2026-08-28",
    time: "10:00 AM", rawTime: "10:00", duration: "30 min",
    practitioner: "Sarah Williams", practitionerId: 1,
    notes: "Review fine lines, hydration and treatment goals.", status: "Confirmed",
  },
  {
    id: 1003, patient: "Amelia Brown", patientId: 3, initials: "AB",
    treatment: "Pigmentation Peel", date: "28 Aug 2026", rawDate: "2026-08-28",
    time: "11:30 AM", rawTime: "11:30", duration: "45 min",
    practitioner: "Emma Thompson", practitionerId: 2,
    notes: "Target uneven tone and post-inflammatory pigmentation.", status: "Confirmed",
  },
  {
    id: 1004, patient: "Emily Johnson", patientId: 1, initials: "EJ",
    treatment: "Skin analysis", date: "31 Aug 2026", rawDate: "2026-08-31",
    time: "10:00 AM", rawTime: "10:00", duration: "45 min",
    practitioner: "Sarah Williams", practitionerId: 1,
    notes: "Follow-up after Hydration Facial completed on 27 Aug 2026.", status: "Confirmed",
  },
  {
    id: 1005, patient: "Isabella Taylor", patientId: 5, initials: "IT",
    treatment: "Skin Renewal Treatment", date: "31 Aug 2026", rawDate: "2026-08-31",
    time: "11:30 AM", rawTime: "11:30", duration: "75 min",
    practitioner: "Emma Thompson", practitionerId: 2,
    notes: "Barrier-supportive rejuvenation programme.", status: "Upcoming",
  },
  {
    id: 1006, patient: "Mia Anderson", patientId: 6, initials: "MA",
    treatment: "Acne Clarifying Treatment", date: "26 Aug 2026", rawDate: "2026-08-26",
    time: "2:00 PM", rawTime: "14:00", duration: "50 min",
    practitioner: "Emma Thompson", practitionerId: 2,
    notes: "Appointment cancelled by patient.", status: "Cancelled",
  },
];

const metric = (label: string, value: number, status: string) => ({ label, value, status });

// Remote demo photography keeps localStorage small. Replace these URLs with
// your own licensed/local demo assets later if you want a fully offline demo.
const emilyBaselinePhoto = "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=900&q=80";
const emilyFollowUpPhoto = "https://images.unsplash.com/photo-1619895862022-09114b41f16f?auto=format&fit=crop&w=900&q=80";
const genericPhoto = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80";

const analysisHistory = {
  1: [
    { id: 101, date: "10 Aug 2026", score: 68, image: emilyBaselinePhoto, metrics: [metric("Hydration", 58, "Moderate"), metric("Texture", 64, "Moderate"), metric("Pigmentation", 61, "Moderate"), metric("Clarity", 66, "Moderate")] },
    { id: 102, date: "18 Aug 2026", score: 72, image: emilyFollowUpPhoto, metrics: [metric("Hydration", 65, "Moderate"), metric("Texture", 68, "Moderate"), metric("Pigmentation", 64, "Moderate"), metric("Clarity", 71, "Good")] },
    { id: 103, date: "24 Aug 2026", score: 76, image: emilyFollowUpPhoto, metrics: [metric("Hydration", 72, "Good"), metric("Texture", 73, "Good"), metric("Pigmentation", 68, "Moderate"), metric("Clarity", 76, "Good")] },
    { id: 104, date: "27 Aug 2026", score: 81, image: emilyFollowUpPhoto, metrics: [metric("Hydration", 80, "Good"), metric("Texture", 78, "Good"), metric("Pigmentation", 72, "Good"), metric("Clarity", 82, "Good")] },
  ],
  2: [
    { id: 201, date: "04 Aug 2026", score: 70, image: genericPhoto, metrics: [metric("Hydration", 62, "Moderate"), metric("Texture", 68, "Moderate"), metric("Fine lines", 60, "Moderate")] },
    { id: 202, date: "17 Aug 2026", score: 74, image: genericPhoto, metrics: [metric("Hydration", 68, "Moderate"), metric("Texture", 72, "Good"), metric("Fine lines", 64, "Moderate")] },
    { id: 203, date: "28 Aug 2026", score: 77, image: genericPhoto, metrics: [metric("Hydration", 73, "Good"), metric("Texture", 75, "Good"), metric("Fine lines", 67, "Moderate")] },
  ],
  3: [
    { id: 301, date: "05 Aug 2026", score: 63, image: genericPhoto, metrics: [metric("Pigmentation", 52, "High"), metric("Texture", 65, "Moderate"), metric("Clarity", 61, "Moderate")] },
    { id: 302, date: "16 Aug 2026", score: 67, image: genericPhoto, metrics: [metric("Pigmentation", 57, "Moderate"), metric("Texture", 68, "Moderate"), metric("Clarity", 65, "Moderate")] },
    { id: 303, date: "26 Aug 2026", score: 71, image: genericPhoto, metrics: [metric("Pigmentation", 63, "Moderate"), metric("Texture", 72, "Good"), metric("Clarity", 70, "Good")] },
  ],
  4: [
    { id: 401, date: "02 Aug 2026", score: 69, image: genericPhoto, metrics: [metric("Hydration", 61, "Moderate"), metric("Texture", 67, "Moderate"), metric("Fine lines", 58, "Moderate")] },
    { id: 402, date: "21 Aug 2026", score: 72, image: genericPhoto, metrics: [metric("Hydration", 66, "Moderate"), metric("Texture", 70, "Good"), metric("Fine lines", 61, "Moderate")] },
  ],
  5: [
    { id: 501, date: "07 Aug 2026", score: 65, image: genericPhoto, metrics: [metric("Redness", 54, "High"), metric("Hydration", 64, "Moderate"), metric("Texture", 68, "Moderate")] },
    { id: 502, date: "24 Aug 2026", score: 70, image: genericPhoto, metrics: [metric("Redness", 61, "Moderate"), metric("Hydration", 70, "Good"), metric("Texture", 72, "Good")] },
  ],
  6: [
    { id: 601, date: "06 Aug 2026", score: 62, image: genericPhoto, metrics: [metric("Breakouts", 51, "High"), metric("Texture", 61, "Moderate"), metric("Clarity", 58, "Moderate")] },
    { id: 602, date: "20 Aug 2026", score: 67, image: genericPhoto, metrics: [metric("Breakouts", 58, "Moderate"), metric("Texture", 66, "Moderate"), metric("Clarity", 64, "Moderate")] },
  ],
};

const clinicalProfiles = {
  1: {
    score: 81, change: "+13", skinType: "Combination / acne-prone",
    metrics: analysisHistory[1][3].metrics,
    timeline: [
      { date: "27 Aug 2026", title: "Hydration Facial completed", description: "Appointment #1001 · Sarah Williams · Hydration-focused treatment following baseline skin analysis.", type: "Treatment" },
      { date: "27 Aug 2026", title: "Skin analysis saved", description: "Skin score improved to 81 with stronger hydration and clarity.", type: "Analysis" },
      { date: "10 Aug 2026", title: "Baseline analysis", description: "Initial assessment for acne, pigmentation and dehydration concerns.", type: "Analysis" },
    ],
    treatments: [
      { name: "Hydration Facial", reason: "Support hydration and barrier recovery", price: "£120" },
      { name: "Acne Clarifying Treatment", reason: "Target congestion and recurring breakouts", price: "£135" },
    ],
  },
  2: { score: 77, change: "+7", skinType: "Normal / dehydrated", metrics: analysisHistory[2][2].metrics, timeline: [{ date: "28 Aug 2026", title: "Skin analysis saved", description: "Improved hydration with fine lines remaining the primary concern.", type: "Analysis" }], treatments: [{ name: "Skin Renewal Treatment", reason: "Support texture and visible signs of ageing", price: "£165" }] },
  3: { score: 71, change: "+8", skinType: "Combination", metrics: analysisHistory[3][2].metrics, timeline: [{ date: "26 Aug 2026", title: "Skin analysis saved", description: "Pigmentation remains the main treatment priority.", type: "Analysis" }], treatments: [{ name: "Pigmentation Peel", reason: "Target uneven tone and pigmentation", price: "£145" }] },
  4: { score: 72, change: "+3", skinType: "Dry / mature", metrics: analysisHistory[4][1].metrics, timeline: [], treatments: [{ name: "Skin Renewal Treatment", reason: "Support texture, hydration and skin renewal", price: "£165" }] },
  5: { score: 70, change: "+5", skinType: "Sensitive", metrics: analysisHistory[5][1].metrics, timeline: [], treatments: [{ name: "Hydration Facial", reason: "Barrier-supportive hydration", price: "£120" }] },
  6: { score: 67, change: "+5", skinType: "Oily / acne-prone", metrics: analysisHistory[6][1].metrics, timeline: [], treatments: [{ name: "Acne Clarifying Treatment", reason: "Target congestion and breakouts", price: "£135" }] },
};

const consultations = {
  1: [{ id: 9001, patientId: 1, date: "10 Aug 2026", allergies: "None reported", medications: "None", pregnancyStatus: "Not applicable", previousTreatments: "Hydrating facials", contraindications: "None identified", medicalHistory: "No relevant history reported", consentGiven: true, practitionerNotes: "Suitable for a progressive hydration and acne-support programme.", practitioner: "Sarah Williams", practitionerId: 1 }],
  2: [{ id: 9002, patientId: 2, date: "28 Aug 2026", allergies: "None reported", medications: "None", pregnancyStatus: "Not pregnant", previousTreatments: "Occasional facials", contraindications: "None identified", medicalHistory: "No relevant history reported", consentGiven: true, practitionerNotes: "Focus on hydration, texture and conservative rejuvenation.", practitioner: "Sarah Williams", practitionerId: 1 }],
  3: [{ id: 9003, patientId: 3, date: "26 Aug 2026", allergies: "None reported", medications: "None", pregnancyStatus: "Not pregnant", previousTreatments: "Superficial peel", contraindications: "None identified", medicalHistory: "No relevant history reported", consentGiven: true, practitionerNotes: "Suitable for pigmentation-focused peel programme with SPF compliance.", practitioner: "Emma Thompson", practitionerId: 2 }],
};

const treatmentPlans = {
  1: [
    { id: 7001, patient: "Emily Johnson", patientId: 1, treatment: "Hydration Facial", duration: "60 min", price: "£120", status: "Completed", notes: "Initial hydration treatment.", createdAt: "2026-08-10T10:30:00.000Z", clinicalReviewRequired: false, clinicalReviewAcknowledged: true },
    { id: 7002, patient: "Emily Johnson", patientId: 1, treatment: "Acne Clarifying Treatment", duration: "50 min", price: "£135", status: "Active", notes: "Continue after follow-up analysis.", createdAt: "2026-08-27T11:45:00.000Z", clinicalReviewRequired: false, clinicalReviewAcknowledged: true },
  ],
  2: [{ id: 7101, patient: "Olivia Smith", patientId: 2, treatment: "Skin Renewal Treatment", duration: "75 min", price: "£165", status: "Active", notes: "Hydration and texture programme.", createdAt: "2026-08-28T10:30:00.000Z", clinicalReviewRequired: false, clinicalReviewAcknowledged: true }],
  3: [{ id: 7201, patient: "Amelia Brown", patientId: 3, treatment: "Pigmentation Peel", duration: "45 min", price: "£145", status: "Active", notes: "Pigmentation-focused treatment plan.", createdAt: "2026-08-26T14:30:00.000Z", clinicalReviewRequired: false, clinicalReviewAcknowledged: true }],
  5: [{ id: 7401, patient: "Isabella Taylor", patientId: 5, treatment: "Skin Renewal Treatment", duration: "75 min", price: "£165", status: "Active", notes: "Gentle barrier-conscious renewal.", createdAt: "2026-08-24T12:00:00.000Z", clinicalReviewRequired: true, clinicalReviewAcknowledged: true }],
};

const treatmentHistory = [
  { id: 8001, appointmentId: 1001, patientId: 1, patient: "Emily Johnson", treatment: "Hydration Facial", date: "27 Aug 2026", rawDate: "2026-08-27", time: "10:30 AM", duration: "60 min", practitioner: "Sarah Williams", practitionerId: 1, notes: "Hydration-focused treatment following baseline skin analysis.", completedAt: "2026-08-27T10:30:00.000Z" },
  { id: 8002, appointmentId: 9901, patientId: 1, patient: "Emily Johnson", treatment: "Acne Clarifying Treatment", date: "18 Aug 2026", rawDate: "2026-08-18", time: "11:00 AM", duration: "50 min", practitioner: "Sarah Williams", practitionerId: 1, notes: "Targeted congestion and texture.", completedAt: "2026-08-18T11:00:00.000Z" },
];

const followUps = [
  { id: 6001, appointmentId: 1001, patientId: 1, patient: "Emily Johnson", treatment: "Hydration Facial", completedDate: "27 Aug 2026", completedRawDate: "2026-08-27", practitioner: "Sarah Williams", practitionerId: 1, status: "Scheduled", createdAt: "2026-08-27T11:30:00.000Z", followUpAppointmentId: 1004 },
  { id: 6002, appointmentId: 9902, patientId: 3, patient: "Amelia Brown", treatment: "Pigmentation Peel", completedDate: "20 Aug 2026", completedRawDate: "2026-08-20", practitioner: "Emma Thompson", practitionerId: 2, status: "Due", createdAt: "2026-08-20T15:00:00.000Z" },
];

const progressReports = [
  {
    id: 5001, patientId: 1, patient: "Emily Johnson",
    baselineDate: "10 Aug 2026", comparisonDate: "27 Aug 2026",
    baselineScore: 68, comparisonScore: 81, scoreChange: 13,
    metrics: [
      { label: "Hydration", before: 58, after: 80, change: 22 },
      { label: "Texture", before: 64, after: 78, change: 14 },
      { label: "Pigmentation", before: 61, after: 72, change: 11 },
      { label: "Clarity", before: 66, after: 82, change: 16 },
    ],
    treatmentProgramme: "Hydration Facial + acne-support programme",
    completedTreatments: treatmentHistory.filter((item) => item.patientId === 1),
    summary: "Emily's overall skin score improved by 13 points, led by stronger hydration, clarity and texture. Pigmentation has also improved and remains part of the ongoing programme.",
    createdAt: "2026-08-27T12:15:00.000Z",
  },
];

const latestAnalysis = {
  patientId: 2,
  patient: "Olivia Smith",
  id: 203,
  date: "28 Aug 2026",
  score: 77,
  metrics: analysisHistory[2][2].metrics,
};

export const dermisDemoData = {
  clinicSettings,
  patients,
  appointments,
  analysisHistory,
  clinicalProfiles,
  consultations,
  treatmentPlans,
  treatmentHistory,
  followUps,
  progressReports,
  latestAnalysis,
};

export const DERMIS_DEMO_STORAGE_KEYS = [
  "dermisPatients",
  "dermisSelectedPatient",
  "dermisAppointments",
  "dermisTreatmentPlan",
  "dermisTreatmentPlans",
  "dermisTreatments",
  "dermisTreatmentHistory",
  "dermisLatestAnalysis",
  "dermisSelectedAnalysis",
  "dermisAnalysisHistory",
  "dermisClinicalProfiles",
  "dermisConsultations",
  "dermisProgressReports",
  "dermisSelectedProgressReport",
  "dermisProgressReportPatientId",
  "dermisReportClinicSettings",
  "dermisPatientTab",
  "dermisFollowUps",
  "dermisFollowUpSource",
  "dermisFollowUpBooking",
] as const;

export function seedDermisDemoData() {
  if (typeof window === "undefined") return;

  localStorage.setItem("dermisClinicSettings", JSON.stringify(clinicSettings));
  localStorage.setItem("dermisPatients", JSON.stringify(patients));
  localStorage.setItem("dermisAppointments", JSON.stringify(appointments));
  localStorage.setItem("dermisAnalysisHistory", JSON.stringify(analysisHistory));
  localStorage.setItem("dermisClinicalProfiles", JSON.stringify(clinicalProfiles));
  localStorage.setItem("dermisConsultations", JSON.stringify(consultations));
  localStorage.setItem("dermisTreatmentPlans", JSON.stringify(treatmentPlans));
  localStorage.setItem("dermisTreatmentHistory", JSON.stringify(treatmentHistory));
  localStorage.setItem("dermisFollowUps", JSON.stringify(followUps));
  localStorage.setItem("dermisProgressReports", JSON.stringify(progressReports));
  localStorage.setItem("dermisLatestAnalysis", JSON.stringify(latestAnalysis));

  // Start every reset from a clean, predictable navigation state.
  localStorage.setItem("dermisSelectedPatient", JSON.stringify(patients[0]));
  localStorage.removeItem("dermisTreatmentPlan");
  localStorage.removeItem("dermisSelectedAnalysis");
  localStorage.removeItem("dermisSelectedProgressReport");
  localStorage.removeItem("dermisProgressReportPatientId");
  localStorage.removeItem("dermisReportClinicSettings");
  localStorage.removeItem("dermisPatientTab");
  localStorage.removeItem("dermisFollowUpSource");
  localStorage.removeItem("dermisFollowUpBooking");

  localStorage.setItem("dermisDemoDataVersion", DEMO_DATA_VERSION);

  window.dispatchEvent(new Event("dermisClinicSettingsUpdated"));
  window.dispatchEvent(new Event("storage"));
}

export function clearDermisDemoData() {
  if (typeof window === "undefined") return;

  DERMIS_DEMO_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("dermisClinicSettings");
  localStorage.removeItem("dermisDemoDataVersion");
}

export function resetDermisDemoData() {
  if (typeof window === "undefined") return;

  clearDermisDemoData();
  seedDermisDemoData();
}

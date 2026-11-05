import {
  ApiError,
  getToken,
  setToken,
  Domain,
  Stage,
  User,
  AppSummary,
  RecruitmentInfo,
  DomainInfo,
  Question,
  FormApplication,
  StatusResponse,
  CalendarDay,
  DaySlot,
  Booking,
} from "./api";

const STORAGE_KEY = "tam_times_mock_db_v2";
const DEMO_OTP = "123456";

interface StoredUser extends User {
  password: string;
}

interface StoredApplication {
  domain: Domain;
  stage: Stage;
  submitted: boolean;
  answers: Record<string, { text: string; savedAt: string }>;
  bookingId: string | null;
}

interface StoredBooking {
  id: string;
  userId: string;
  domain: Domain;
  slotId: string;
  startTime: string;
  endTime: string;
  meetingLink: string;
}

interface MockDB {
  deadline: string;
  users: Record<string, StoredUser>;
  userTokens: Record<string, string>; // token -> email
  applications: Record<string, Record<Domain, StoredApplication>>; // email -> domain -> app
  bookings: StoredBooking[];
}

export const DOMAIN_DETAILS: DomainInfo[] = [
  {
    domain: "DESIGN",
    label: "Design",
    subsections: [
      { id: "ui-ux", name: "UI/UX & Product Design" },
      { id: "brand", name: "Brand & Graphic Art" },
    ],
  },
  {
    domain: "MARKETING",
    label: "Marketing",
    subsections: [
      { id: "growth", name: "Social & Digital Growth" },
      { id: "campaigns", name: "Campaigns & Copy" },
    ],
  },
  {
    domain: "R_AND_D",
    label: "Research",
    subsections: [
      { id: "ml-theory", name: "Machine Learning Theory" },
      { id: "nlp-cv", name: "Computer Vision & NLP" },
    ],
  },
  {
    domain: "MANAGEMENT",
    label: "Management",
    subsections: [
      { id: "operations", name: "Event Logistics & Ops" },
      { id: "outreach", name: "Public Relations & Outreach" },
    ],
  },
  {
    domain: "EDITORIAL",
    label: "Editorial",
    subsections: [
      { id: "writing", name: "Technical Journalism" },
      { id: "print", name: "Print & Dispatch Production" },
    ],
  },
  {
    domain: "TECHNICAL",
    label: "Tech",
    subsections: [
      { id: "dev", name: "Systems & Web Engineering" },
      { id: "mlops", name: "Applied AI & MLOps" },
    ],
  },
];

const SEED_QUESTIONS: Record<Domain, { id: string; subsectionId: string | null; text: string; maxLength: number; required: boolean }[]> = {
  DESIGN: [
    {
      id: "q-design-1",
      subsectionId: null,
      text: "Why do you seek appointment at The TAM Times design desk, and what visual perspective do you bring?",
      maxLength: 2000,
      required: true,
    },
    {
      id: "q-design-2",
      subsectionId: "ui-ux",
      text: "Walk us through an interface or interaction you redesigned to solve a stubborn user dilemma.",
      maxLength: 2000,
      required: true,
    },
    {
      id: "q-design-3",
      subsectionId: "brand",
      text: "Critique the retro newspaper aesthetic of this portal. What would you amplify or alter?",
      maxLength: 2000,
      required: true,
    },
  ],
  MARKETING: [
    {
      id: "q-marketing-1",
      subsectionId: null,
      text: "Why do you wish to steer marketing and publicity for The AI & ML Club?",
      maxLength: 2000,
      required: true,
    },
    {
      id: "q-marketing-2",
      subsectionId: "growth",
      text: "Draft a viral print headline and social dispatch strategy for a flagship technical symposium.",
      maxLength: 2000,
      required: true,
    },
    {
      id: "q-marketing-3",
      subsectionId: "campaigns",
      text: "How would you engage non-technical students who find artificial intelligence intimidating?",
      maxLength: 2000,
      required: true,
    },
  ],
  R_AND_D: [
    {
      id: "q-rnd-1",
      subsectionId: null,
      text: "What drives your interest in joining the Research & Development bureau at TAM?",
      maxLength: 2000,
      required: true,
    },
    {
      id: "q-rnd-2",
      subsectionId: "ml-theory",
      text: "Explain a recent breakthrough paper (2024-2026) that genuinely altered how you think about intelligence.",
      maxLength: 2000,
      required: true,
    },
    {
      id: "q-rnd-3",
      subsectionId: "nlp-cv",
      text: "Outline a novel multimodal architecture or benchmark you would love to build with the team.",
      maxLength: 2000,
      required: true,
    },
  ],
  MANAGEMENT: [
    {
      id: "q-mgmt-1",
      subsectionId: null,
      text: "Why is TAM Management your chosen post, and what leadership philosophy guides you under pressure?",
      maxLength: 2000,
      required: true,
    },
    {
      id: "q-mgmt-2",
      subsectionId: "operations",
      text: "Describe an emergency scenario during a 500-attendee hackathon and your step-by-step mitigation plan.",
      maxLength: 2000,
      required: true,
    },
    {
      id: "q-mgmt-3",
      subsectionId: "outreach",
      text: "How would you pitch industry sponsors for an exclusive recruitment round or compute-grant sponsorship?",
      maxLength: 2000,
      required: true,
    },
  ],
  EDITORIAL: [
    {
      id: "q-edit-1",
      subsectionId: null,
      text: "Why do you want to write and edit for The TAM Times gazette?",
      maxLength: 2000,
      required: true,
    },
    {
      id: "q-edit-2",
      subsectionId: "writing",
      text: "Explain 'Attention is All You Need' in 150 words as if writing a morning front-page column.",
      maxLength: 2000,
      required: true,
    },
    {
      id: "q-edit-3",
      subsectionId: "print",
      text: "Edit the following sentence for rhythm and punch: 'The neural network was trained by researchers very thoroughly to do tasks.'",
      maxLength: 2000,
      required: true,
    },
  ],
  TECHNICAL: [
    {
      id: "q-tech-1",
      subsectionId: null,
      text: "Why do you seek induction into TAM's Technical cadre, and what systems have you built?",
      maxLength: 2000,
      required: true,
    },
    {
      id: "q-tech-2",
      subsectionId: "dev",
      text: "Describe a distributed systems or state-management bug that kept you awake, and how you resolved it.",
      maxLength: 2000,
      required: true,
    },
    {
      id: "q-tech-3",
      subsectionId: "mlops",
      text: "How would you design low-latency model serving for thousands of concurrent campus queries?",
      maxLength: 2000,
      required: true,
    },
  ],
};

function getInitialDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 59, 0);
  return d.toISOString();
}

function loadDB(): MockDB {
  if (typeof window === "undefined") {
    return {
      deadline: getInitialDeadline(),
      users: {},
      userTokens: {},
      applications: {},
      bookings: [],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.deadline && parsed.users) return parsed;
    }
  } catch {
    // fallback
  }

  const initial: MockDB = {
    deadline: getInitialDeadline(),
    users: {},
    userTokens: {},
    applications: {},
    bookings: [],
  };
  saveDB(initial);
  return initial;
}

function saveDB(db: MockDB) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // ignore
  }
}

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

function getActiveUser(db: MockDB): { user: StoredUser; email: string } {
  const token = getToken();
  if (!token) {
    throw new ApiError("Authentication required", 401, "UNAUTHORIZED");
  }
  const email = db.userTokens[token];
  if (!email || !db.users[email]) {
    throw new ApiError("Session invalid or expired", 401, "UNAUTHORIZED");
  }
  return { user: db.users[email], email };
}

// Generate 15-minute interview slots: 10:00 to 13:00 and 15:00 to 18:00 IST for 7 days starting tomorrow
export function getMockInterviewDays(): string[] {
  const days: string[] = [];
  const now = new Date();
  // IST offset is UTC+5:30
  const istNow = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
  for (let i = 1; i <= 7; i++) {
    const d = new Date(istNow);
    d.setDate(istNow.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    days.push(`${yyyy}-${mm}-${dd}`);
  }
  return days;
}

export function isSlotTakenDeterministic(domain: string, dateStr: string, idx: number): boolean {
  let hash = 0;
  const key = `${domain}-${dateStr}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) & 0xffffffff;
  }
  const val = Math.abs((hash * 17 + idx * 37) % 100);
  return val < 30; // ~30% taken by others
}

function generateSlotsForDay(domain: Domain | string, dateStr: string): DaySlot[] {
  const slots: DaySlot[] = [];
  const timePairs: [string, string][] = [
    // 10:00 to 13:00 (15 min each, 12 slots)
    ["10:00", "10:15"],
    ["10:15", "10:30"],
    ["10:30", "10:45"],
    ["10:45", "11:00"],
    ["11:00", "11:15"],
    ["11:15", "11:30"],
    ["11:30", "11:45"],
    ["11:45", "12:00"],
    ["12:00", "12:15"],
    ["12:15", "12:30"],
    ["12:30", "12:45"],
    ["12:45", "13:00"],
    // 15:00 to 18:00 (15 min each, 12 slots)
    ["15:00", "15:15"],
    ["15:15", "15:30"],
    ["15:30", "15:45"],
    ["15:45", "16:00"],
    ["16:00", "16:15"],
    ["16:15", "16:30"],
    ["16:30", "16:45"],
    ["16:45", "17:00"],
    ["17:00", "17:15"],
    ["17:15", "17:30"],
    ["17:30", "17:45"],
    ["17:45", "18:00"],
  ];

  timePairs.forEach(([start, end], idx) => {
    const isTaken = isSlotTakenDeterministic(domain, dateStr, idx);
    slots.push({
      id: `slot-${domain}-${dateStr}-${idx}`,
      startTime: `${dateStr}T${start}:00+05:30`,
      endTime: `${dateStr}T${end}:00+05:30`,
      remaining: isTaken ? 0 : 1,
      bookedByMe: false,
    });
  });

  return slots;
}

export const mockApi = {
  config: async () => {
    await delay();
    const db = loadDB();
    const now = new Date();
    const deadline = new Date(db.deadline);
    const msRemaining = Math.max(0, deadline.getTime() - now.getTime());
    return {
      isOpen: msRemaining > 0,
      formDeadline: db.deadline,
      serverTime: now.toISOString(),
      msRemaining,
      testTools: true,
    };
  },

  domains: async () => {
    await delay();
    return { domains: DOMAIN_DETAILS };
  },

  requestOtp: async (email: string, purpose: "signup" | "reset") => {
    await delay();
    const db = loadDB();
    const cleanEmail = email.trim().toLowerCase();

    if (purpose === "signup" && db.users[cleanEmail]) {
      throw new ApiError("This address is already registered at the Subscriber's Desk.", 400, "ALREADY_REGISTERED");
    }
    if (purpose === "reset" && !db.users[cleanEmail]) {
      throw new ApiError("No subscriber account found for this address.", 404, "NOT_FOUND");
    }

    return {
      sent: true,
      otpToken: `otp-tok-${cleanEmail}-${Date.now()}`,
      testCode: DEMO_OTP,
    };
  },

  signup: async (body: {
    email: string;
    otpToken: string;
    otp: string;
    password: string;
    name: string;
    phone: string;
    regNumber: string;
    domains: Domain[];
  }) => {
    await delay();
    const db = loadDB();
    const cleanEmail = body.email.trim().toLowerCase();

    if (body.otp.trim() !== DEMO_OTP) {
      throw new ApiError("The six-digit verification code is invalid.", 400, "OTP_INVALID");
    }
    if (db.users[cleanEmail]) {
      throw new ApiError("Candidate is already registered.", 400, "ALREADY_REGISTERED");
    }
    if (!body.domains || body.domains.length === 0) {
      throw new ApiError("Select at least one department domain.", 400, "VALIDATION_ERROR", {
        domains: ["Please select at least one domain."],
      });
    }

    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      name: body.name.trim(),
      email: cleanEmail,
      phone: body.phone.trim(),
      regNumber: body.regNumber.trim().toUpperCase(),
      password: body.password,
    };

    db.users[cleanEmail] = newUser;
    const token = `tok-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    db.userTokens[token] = cleanEmail;

    db.applications[cleanEmail] = {} as Record<Domain, StoredApplication>;
    body.domains.forEach((dom) => {
      db.applications[cleanEmail][dom] = {
        domain: dom,
        stage: "FORM_FILLING",
        submitted: false,
        answers: {},
        bookingId: null,
      };
    });

    saveDB(db);
    setToken(token);

    return {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        regNumber: newUser.regNumber,
      },
    };
  },

  login: async (email: string, password: string) => {
    await delay();
    const db = loadDB();
    const cleanEmail = email.trim().toLowerCase();
    const user = db.users[cleanEmail];

    if (!user || user.password !== password) {
      throw new ApiError("Incorrect credentials provided.", 401, "INVALID_CREDENTIALS");
    }

    const token = `tok-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    db.userTokens[token] = cleanEmail;
    saveDB(db);
    setToken(token);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        regNumber: user.regNumber,
      },
    };
  },

  resetPassword: async (email: string, _otpToken: string, otp: string, password: string) => {
    await delay();
    const db = loadDB();
    const cleanEmail = email.trim().toLowerCase();

    if (otp.trim() !== DEMO_OTP) {
      throw new ApiError("The six-digit verification code is invalid.", 400, "OTP_INVALID");
    }
    const user = db.users[cleanEmail];
    if (!user) {
      throw new ApiError("Account does not exist.", 404, "NOT_FOUND");
    }

    user.password = password;
    saveDB(db);
    return { reset: true };
  },

  me: async () => {
    await delay();
    const token = getToken();
    if (!token) return { registered: false };

    const db = loadDB();
    const email = db.userTokens[token];
    if (!email || !db.users[email]) {
      return { registered: false };
    }

    const user = db.users[email];
    const userApps = db.applications[email] || {};
    const applications: AppSummary[] = Object.values(userApps).map((app) => {
      const info = DOMAIN_DETAILS.find((d) => d.domain === app.domain);
      return {
        domain: app.domain,
        label: info?.label ?? app.domain,
        stage: app.stage,
        submitted: app.submitted,
      };
    });

    return {
      registered: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        regNumber: user.regNumber,
      },
      applications,
    };
  },

  updateMe: async (body: Partial<{ name: string; phone: string; regNumber: string; domains: Domain[] }>) => {
    await delay();
    const db = loadDB();
    const { user, email } = getActiveUser(db);

    if (body.name) user.name = body.name.trim();
    if (body.phone) user.phone = body.phone.trim();
    if (body.regNumber) user.regNumber = body.regNumber.trim().toUpperCase();

    const userApps = db.applications[email] || {};
    if (body.domains) {
      // Check if trying to remove any submitted domain
      for (const [dom, app] of Object.entries(userApps) as [Domain, StoredApplication][]) {
        if (app.submitted && !body.domains.includes(dom)) {
          throw new ApiError(`Cannot remove domain ${dom} as application is already submitted.`, 400, "ALREADY_SUBMITTED");
        }
      }

      // Add newly selected domains
      body.domains.forEach((dom) => {
        if (!userApps[dom]) {
          userApps[dom] = {
            domain: dom,
            stage: "FORM_FILLING",
            submitted: false,
            answers: {},
            bookingId: null,
          };
        }
      });

      // Remove unsubmitted domains not in body.domains
      (Object.keys(userApps) as Domain[]).forEach((dom) => {
        if (!body.domains!.includes(dom) && !userApps[dom].submitted) {
          delete userApps[dom];
        }
      });
      db.applications[email] = userApps;
    }

    saveDB(db);

    const applications: AppSummary[] = Object.values(userApps).map((app) => {
      const info = DOMAIN_DETAILS.find((d) => d.domain === app.domain);
      return {
        domain: app.domain,
        label: info?.label ?? app.domain,
        stage: app.stage,
        submitted: app.submitted,
      };
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        regNumber: user.regNumber,
      },
      applications,
    };
  },

  form: async () => {
    await delay();
    const db = loadDB();
    const { email } = getActiveUser(db);

    const deadline = new Date(db.deadline);
    const deadlinePassed = Date.now() > deadline.getTime();
    const userApps = db.applications[email] || {};

    const applications: FormApplication[] = Object.values(userApps).map((app) => {
      const info = DOMAIN_DETAILS.find((d) => d.domain === app.domain)!;
      const questionsSeed = SEED_QUESTIONS[app.domain] || [];

      let requiredAnswered = 0;
      let requiredTotal = 0;

      const questions: Question[] = questionsSeed.map((q) => {
        const saved = app.answers[q.id];
        const answer = saved?.text ?? "";
        if (q.required) {
          requiredTotal++;
          if (answer.trim().length > 0) requiredAnswered++;
        }
        return {
          id: q.id,
          subsectionId: q.subsectionId,
          text: q.text,
          required: q.required,
          maxLength: q.maxLength,
          answer,
          savedAt: saved?.savedAt ?? null,
        };
      });

      return {
        domain: app.domain,
        label: info.label,
        stage: app.stage,
        submitted: app.submitted,
        deadlinePassed,
        editable: !app.submitted && !deadlinePassed,
        progress: { requiredAnswered, requiredTotal },
        subsections: info.subsections,
        questions,
      };
    });

    return {
      isOpen: !deadlinePassed,
      formDeadline: db.deadline,
      applications,
    };
  },

  saveAnswer: async (questionId: string, text: string) => {
    await delay(300);
    const db = loadDB();
    const { email } = getActiveUser(db);

    const deadline = new Date(db.deadline);
    if (Date.now() > deadline.getTime()) {
      throw new ApiError("The submission deadline has lapsed.", 400, "DEADLINE_PASSED");
    }

    const userApps = db.applications[email] || {};
    let targetDomain: Domain | null = null;
    let targetQ: { id: string; maxLength: number } | null = null;

    for (const [dom, qList] of Object.entries(SEED_QUESTIONS) as [Domain, typeof SEED_QUESTIONS[Domain]][]) {
      const found = qList.find((q) => q.id === questionId);
      if (found) {
        targetDomain = dom;
        targetQ = found;
        break;
      }
    }

    if (!targetDomain || !userApps[targetDomain]) {
      throw new ApiError("Question or domain application not found.", 404, "NOT_FOUND");
    }

    if (userApps[targetDomain].submitted) {
      throw new ApiError("Application has already been sealed and submitted.", 400, "ALREADY_SUBMITTED");
    }

    if (text.length > (targetQ?.maxLength ?? 2000)) {
      throw new ApiError("Character limit exceeded.", 400, "VALIDATION_ERROR");
    }

    const savedAt = new Date().toISOString();
    userApps[targetDomain].answers[questionId] = { text, savedAt };
    saveDB(db);

    return { questionId, savedAt };
  },

  submit: async (domain: Domain) => {
    await delay();
    const db = loadDB();
    const { email } = getActiveUser(db);

    const deadline = new Date(db.deadline);
    if (Date.now() > deadline.getTime()) {
      throw new ApiError("The recruitment deadline has expired.", 400, "DEADLINE_PASSED");
    }

    const userApps = db.applications[email] || {};
    const app = userApps[domain];
    if (!app) {
      throw new ApiError("Application not found for domain.", 404, "NOT_FOUND");
    }
    if (app.submitted) {
      throw new ApiError("Application is already submitted.", 400, "ALREADY_SUBMITTED");
    }

    // Check required questions
    const qList = SEED_QUESTIONS[domain] || [];
    const missing: { text: string }[] = [];
    qList.forEach((q) => {
      if (q.required) {
        const ans = app.answers[q.id]?.text?.trim();
        if (!ans) {
          missing.push({ text: q.text });
        }
      }
    });

    if (missing.length > 0) {
      throw new ApiError("All required dispatches must be answered before sealing.", 400, "INCOMPLETE_FORM", {
        missing,
      });
    }

    app.submitted = true;
    saveDB(db);

    return { submitted: true };
  },

  status: async () => {
    await delay();
    const db = loadDB();
    const { email, user } = getActiveUser(db);
    const deadline = new Date(db.deadline);
    const deadlinePassed = Date.now() > deadline.getTime();

    const stageOrder: Stage[] = ["FORM_FILLING", "SHORTLISTED", "SLOT_CHOOSING", "INTERVIEW", "SELECTED"];

    const userApps = db.applications[email] || {};
    const applications = Object.values(userApps).map((app) => {
      const info = DOMAIN_DETAILS.find((d) => d.domain === app.domain)!;
      const isRejected = app.stage === "REJECTED";
      const currentIndex = isRejected ? null : stageOrder.indexOf(app.stage);

      const canChooseSlots = app.stage === "SHORTLISTED" || app.stage === "SLOT_CHOOSING" || app.stage === "INTERVIEW";

      const booking = db.bookings.find((b) => b.userId === user.id && b.domain === app.domain);

      return {
        domain: app.domain,
        label: info.label,
        stage: app.stage,
        currentIndex: currentIndex !== -1 ? currentIndex : null,
        rejected: isRejected,
        submitted: app.submitted,
        deadlinePassed,
        editable: !app.submitted && !deadlinePassed,
        canChooseSlots,
        booking: booking
          ? {
              id: booking.id,
              slot: {
                startTime: booking.startTime,
                endTime: booking.endTime,
                meetingLink: booking.meetingLink,
              },
            }
          : null,
      };
    });

    return {
      stages: [
        { key: "FORM_FILLING" as Stage, label: "Form filling", order: 0 },
        { key: "SHORTLISTED" as Stage, label: "Shortlisted", order: 1 },
        { key: "SLOT_CHOOSING" as Stage, label: "Slot choosing", order: 2 },
        { key: "INTERVIEW" as Stage, label: "Interview", order: 3 },
        { key: "SELECTED" as Stage, label: "Selected", order: 4 },
      ],
      formDeadline: db.deadline,
      applications,
    };
  },

  calendar: async (domain: Domain, month: string) => {
    await delay();
    const db = loadDB();
    const { user } = getActiveUser(db);
    const mockDays = getMockInterviewDays();
    const days: CalendarDay[] = [];

    for (const dateStr of mockDays) {
      if (dateStr.startsWith(month)) {
        const slots = generateSlotsForDay(domain, dateStr);
        const userBooking = db.bookings.find((b) => b.userId === user?.id && b.domain === domain);
        let availableCount = 0;
        slots.forEach((s) => {
          const bookedByMe = userBooking ? userBooking.slotId === s.id : false;
          if (bookedByMe || s.remaining > 0) {
            availableCount++;
          }
        });
        days.push({
          date: dateStr,
          totalSlots: slots.length,
          availableSlots: availableCount,
        });
      }
    }

    return { month, days };
  },

  daySlots: async (domain: Domain, date: string) => {
    await delay();
    const db = loadDB();
    const { user } = getActiveUser(db);
    const slots = generateSlotsForDay(domain, date);

    // mark booked slots
    const userBooking = db.bookings.find((b) => b.userId === user.id && b.domain === domain);

    return {
      date,
      slots: slots.map((s) => {
        const bookedByMe = userBooking ? userBooking.slotId === s.id : false;
        return {
          ...s,
          bookedByMe,
          remaining: bookedByMe ? 1 : s.remaining,
        };
      }),
    };
  },

  bookings: async () => {
    await delay();
    const db = loadDB();
    const { user } = getActiveUser(db);

    const userBookings = db.bookings.filter((b) => b.userId === user.id);
    return {
      bookings: userBookings.map((b) => ({
        id: b.id,
        slot: {
          startTime: b.startTime,
          endTime: b.endTime,
          meetingLink: b.meetingLink,
          domain: b.domain,
        },
      })),
    };
  },

  book: async (slotId: string) => {
    await delay();
    const db = loadDB();
    const { user, email } = getActiveUser(db);

    // slotId format: slot-<domain>-<YYYY-MM-DD>-<idx>
    const parts = slotId.split("-");
    const domainFromSlot = parts[1] as Domain;
    const dateStr = `${parts[2]}-${parts[3]}-${parts[4]}`;
    const slotIdx = parseInt(parts[5], 10);

    const userApps = db.applications[email] || {};
    let targetDomain = domainFromSlot;
    if (!userApps[targetDomain]) {
      const eligible = Object.values(userApps).find(
        (a) => a.stage === "SHORTLISTED" || a.stage === "SLOT_CHOOSING" || a.stage === "INTERVIEW"
      );
      if (eligible) targetDomain = eligible.domain;
    }

    const app = userApps[targetDomain];
    if (!app) {
      throw new ApiError("Application not found for domain.", 404, "NOT_FOUND");
    }

    // Check if slot already booked by me
    const already = db.bookings.find((b) => b.userId === user.id && b.slotId === slotId);
    if (already) {
      throw new ApiError("You have already reserved this slot.", 409, "ALREADY_BOOKED");
    }

    // Check if slot is taken by another
    if (isSlotTakenDeterministic(targetDomain, dateStr, slotIdx)) {
      throw new ApiError("This interview slot has already reached capacity.", 400, "SLOT_FULL");
    }

    // Check if slot is in past
    const slots = generateSlotsForDay(targetDomain, dateStr);
    const target = slots.find((s) => s.id === slotId) || {
      startTime: `${dateStr}T11:00:00+05:30`,
      endTime: `${dateStr}T11:15:00+05:30`,
    };

    if (new Date(target.startTime).getTime() <= Date.now()) {
      throw new ApiError("This interview slot has already passed.", 400, "SLOT_PAST");
    }

    const meetingLink = `https://meet.google.com/tam-${targetDomain.toLowerCase().replace(/_/g, "")}-interview`;

    const newBooking: StoredBooking = {
      id: `bk-${Date.now()}`,
      userId: user.id,
      domain: targetDomain,
      slotId,
      startTime: target.startTime,
      endTime: target.endTime,
      meetingLink,
    };

    // Remove any previous booking for this domain
    db.bookings = db.bookings.filter((b) => !(b.userId === user.id && b.domain === targetDomain));
    db.bookings.push(newBooking);

    // Progress stage to INTERVIEW
    app.stage = "INTERVIEW";
    app.bookingId = newBooking.id;

    saveDB(db);

    return { meetingLink };
  },

  cancel: async (bookingId: string) => {
    await delay();
    const db = loadDB();
    const { user, email } = getActiveUser(db);

    const booking = db.bookings.find((b) => b.id === bookingId && b.userId === user.id);
    if (!booking) {
      throw new ApiError("Booking record not found.", 404, "NOT_FOUND");
    }

    // 12-hour cancel rule
    const slotStartMs = new Date(booking.startTime).getTime();
    if (slotStartMs - Date.now() < 12 * 60 * 60 * 1000) {
      throw new ApiError("Cancellations close 12 hours before your slot.", 400, "CANCEL_TOO_LATE");
    }

    db.bookings = db.bookings.filter((b) => b.id !== bookingId);

    const userApps = db.applications[email] || {};
    if (userApps[booking.domain]) {
      userApps[booking.domain].stage = "SLOT_CHOOSING";
      userApps[booking.domain].bookingId = null;
    }

    saveDB(db);
    return { cancelled: true };
  },

  // DEMO CONTROLS HELPER: only used in demo mode to test status & slot progression!
  setDemoStage: (domain: Domain, stage: Stage, submitted?: boolean) => {
    const db = loadDB();
    const token = getToken();
    if (!token) return;
    const email = db.userTokens[token];
    if (!email) return;

    if (!db.applications[email]) db.applications[email] = {} as Record<Domain, StoredApplication>;
    const isSub = submitted !== undefined ? submitted : (stage !== "FORM_FILLING");
    if (!db.applications[email][domain]) {
      db.applications[email][domain] = {
        domain,
        stage,
        submitted: isSub,
        answers: {},
        bookingId: null,
      };
    } else {
      db.applications[email][domain].stage = stage;
      db.applications[email][domain].submitted = isSub;
    }

    if (stage === "INTERVIEW" && !db.applications[email][domain].bookingId) {
      const dummyBooking: StoredBooking = {
        id: `book-demo-${domain}`,
        userId: db.users[email]?.id || "usr_demo",
        domain,
        slotId: `slot-demo-${domain}`,
        startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 2 + 15 * 60000).toISOString(),
        meetingLink: "https://meet.google.com/tam-interview-demo",
      };
      db.bookings = db.bookings.filter((b) => !(b.domain === domain && b.userId === dummyBooking.userId));
      db.bookings.push(dummyBooking);
      db.applications[email][domain].bookingId = dummyBooking.id;
    } else if (stage !== "INTERVIEW") {
      if (db.applications[email][domain].bookingId?.startsWith("book-demo-")) {
        db.bookings = db.bookings.filter((b) => b.id !== db.applications[email][domain].bookingId);
        db.applications[email][domain].bookingId = null;
      }
    }

    saveDB(db);
  },
};

import { api as realApi } from "./api";
import { mockApi } from "./mock";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const api = useMock ? mockApi : realApi;
export const isMockMode = useMock;

export {
  ApiError,
  getToken,
  setToken,
  fmtDateTime,
  fmtTime,
  istToday,
  STAGE_LABELS,
  errorText,
  isStudentEmail,
  STUDENT_EMAIL_DOMAIN,
  ALL_STAGES,
} from "./api";

export type {
  Domain,
  Stage,
  User,
  AppSummary,
  RecruitmentInfo,
  DomainInfo,
  Question,
  FormApplication,
  SlotTime,
  StatusApplication,
  StatusResponse,
  CalendarDay,
  DaySlot,
  Booking,
} from "./api";

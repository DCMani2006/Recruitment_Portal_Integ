import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env variable: ${name}`);
  return v;
}

// test-only helpers (e.g. setting a stage without the admin backend). Never on in production
const testTools = process.env.ENABLE_TEST_TOOLS === "true" && process.env.NODE_ENV !== "production";

export const config = {
  port: Number(process.env.PORT ?? 5000),
  jwtSecret: required("JWT_SECRET"),
  otpSecret: required("OTP_SECRET"),
  // a bare host is treated as https://, and a bare Render service name (no dot, as render.yaml's
  // fromService passes it) gets .onrender.com
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.includes("://") ? s : `https://${s.includes(".") ? s : `${s}.onrender.com`}`)),
  testTools,
  // test-only: send the login code back in the response so a test deployment works without email
  showOtpCodes: testTools && process.env.SHOW_OTP_CODES === "true",
};

// Only VIT student emails matching firstName.SurnameYear@vitstudent.ac.in can sign up or log in
export const STUDENT_EMAIL_DOMAIN = "vitstudent.ac.in";
export const COLLEGE_EMAIL_REGEX = /^[a-zA-Z]+\.[a-zA-Z]+[0-9]{4}@vitstudent\.ac\.in$/i;

export const isStudentEmail = (email: string) =>
  typeof email === "string" && COLLEGE_EMAIL_REGEX.test(email.trim());
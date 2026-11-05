/**
 * ============================================================================
 * OTP Verification Emailer - Deliverability Batch Tester
 * ============================================================================
 *
 * PURPOSE:
 *   This script is intended for manual, controlled testing of real OTP
 *   verification email delivery across a small set of developer test recipients.
 *   It allows inspecting template rendering, formatting, and inbox placement.
 *   It is NOT intended for bulk marketing, mass messaging, or spam-limit evasion.
 *
 * ⚠️ WARNING:
 *   Running this script CAN SEND REAL EMAILS.
 *
 * HOW TO USE:
 *   1. Edit the `candidates` array below with your test recipient addresses and 6-digit OTPs.
 *   2. Ensure `.env` at the project root contains your email credentials:
 *        EMAIL_USER=your_email@gmail.com
 *        EMAIL_APP_PASSWORD=your_16_char_app_password
 *   3. Run the script:
 *        node src/emailer/batchTestOtp.js
 *   4. Review the candidate preview and type "SEND" when prompted to proceed.
 * ============================================================================
 */

// 1. EDITABLE CANDIDATES LIST
// Populate with developer test email addresses before running
const candidates = [
  {
    name: "Test Candidate 1",
    email: "ark.maheshwari2025@vitstudent.ac.in", // Fill in manually (e.g. "firstName.SurnameYear@vitstudent.ac.in")
    otp: "004821" // Exactly 6-digit numeric string
  },
  {
    name: "Test Candidate 2",
    email: "", // Fill in manually (e.g. "firstName.SurnameYear@vitstudent.ac.in")
    otp: "589214" // Exactly 6-digit numeric string
  }
];

// 2. CONFIGURABLE BATCHING & DELAY SETTINGS
const BATCH_SIZE = 2; // Number of emails per batch
const DELAY_BETWEEN_EMAILS_MS = 1500; // Delay between consecutive sends in a batch (ms)
const DELAY_BETWEEN_BATCHES_MS = 3000; // Delay between batches (ms)

// Load environment configuration
const path = require("path");
require("dotenv").config();
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const readline = require("readline");
const { sentOTP, validateOTPDetails } = require("./index");

/**
 * Helper delay function.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalizes email address for consistent comparison and deduplication.
 * @param {string} email
 * @returns {string}
 */
function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

/**
 * Prompts the developer in terminal to type "SEND" before any emails are dispatched.
 * @returns {Promise<boolean>}
 */
function confirmSendInteractive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(
      "\n⚠️  Type 'SEND' to proceed with sending real OTP emails to the list above: ",
      (answer) => {
        rl.close();
        resolve(answer.trim() === "SEND");
      }
    );
  });
}

/**
 * Executes batch deliverability testing for OTP verification emails.
 */
async function runBatchTest() {
  console.log("\n==================================================");
  console.log("   TAM Recruitment Portal - OTP Batch Tester");
  console.log("==================================================\n");

  // Filter out entries with empty emails
  const configuredCandidates = candidates.filter(
    (c) => c.email && c.email.trim() !== ""
  );

  if (configuredCandidates.length === 0) {
    console.log("ℹ️  No test recipients specified in the 'candidates' array.");
    console.log("   Please edit 'candidates' in batchTestOtp.js with valid recipient details.\n");
    return;
  }

  // Pre-validate all candidates and deduplicate
  const validCandidates = [];
  const invalidCandidates = [];
  const seenEmails = new Set();
  const skippedDuplicates = [];

  for (const c of configuredCandidates) {
    const normalized = normalizeEmail(c.email);
    if (seenEmails.has(normalized)) {
      skippedDuplicates.push(c);
      continue;
    }
    seenEmails.add(normalized);

    const validation = validateOTPDetails(c);
    if (validation.isValid) {
      validCandidates.push(c);
    } else {
      invalidCandidates.push({ candidate: c, error: validation.error });
    }
  }

  // Display validation summary without exposing sensitive OTP values
  console.log(`Recipients to process: ${validCandidates.length}`);
  if (invalidCandidates.length > 0) {
    console.log(`⚠️  Invalid recipients detected (${invalidCandidates.length}):`);
    invalidCandidates.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.candidate.name || "Unknown"} (${item.candidate.email || "No email"}): ${item.error}`);
    });
  }

  if (skippedDuplicates.length > 0) {
    console.log(`ℹ️  Skipped duplicate emails (${skippedDuplicates.length}):`);
    skippedDuplicates.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.name} (${item.email})`);
    });
  }

  if (validCandidates.length === 0) {
    console.log("\n❌ No valid candidate records to send. Aborting.\n");
    return;
  }

  // Display preview table (OTP values are masked for security)
  console.log("\nRecipient Preview (OTP values masked for security):");
  validCandidates.forEach((c, idx) => {
    console.log(`  [${idx + 1}] ${c.name} <${c.email}> | OTP: ******`);
  });

  // Interactive safety confirmation
  const confirmed = await confirmSendInteractive();
  if (!confirmed) {
    console.log("\n🚫 Send cancelled by user. No emails were sent.\n");
    return;
  }

  console.log("\n🚀 Starting batch delivery...\n");

  const results = {
    total: validCandidates.length,
    sent: 0,
    failed: 0,
    failures: []
  };

  // Chunk candidates into batches
  for (let i = 0; i < validCandidates.length; i += BATCH_SIZE) {
    const batch = validCandidates.slice(i, i + BATCH_SIZE);
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(validCandidates.length / BATCH_SIZE);

    console.log(`--- Processing Batch ${batchIndex}/${totalBatches} (${batch.length} recipients) ---`);

    for (let j = 0; j < batch.length; j++) {
      const candidate = batch[j];
      const overallIndex = i + j + 1;

      try {
        const result = await sentOTP(candidate);
        results.sent++;
        console.log(
          `  ✓ [${overallIndex}/${results.total}] Sent to ${result.recipient} (MsgID: ${result.messageId})`
        );
      } catch (err) {
        results.failed++;
        const errMsg = err?.message || String(err);
        results.failures.push({ email: candidate.email, error: errMsg });
        console.error(
          `  ✗ [${overallIndex}/${results.total}] Failed for ${candidate.email}: ${errMsg}`
        );
      }

      // Delay between emails in the same batch
      if (j < batch.length - 1 && DELAY_BETWEEN_EMAILS_MS > 0) {
        await sleep(DELAY_BETWEEN_EMAILS_MS);
      }
    }

    // Delay between batches
    if (i + BATCH_SIZE < validCandidates.length && DELAY_BETWEEN_BATCHES_MS > 0) {
      console.log(`  ⏳ Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000}s before next batch...`);
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  // Final Summary Report
  console.log("\n==================================================");
  console.log("            Batch Delivery Summary");
  console.log("==================================================");
  console.log(`Total Recipients: ${results.total}`);
  console.log(`Successfully Sent: ${results.sent}`);
  console.log(`Failed:            ${results.failed}`);

  if (results.failures.length > 0) {
    console.log("\nFailed Recipients:");
    results.failures.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.email}: ${f.error}`);
    });
  }

  console.log("==================================================\n");
}

// Ensure execution only when invoked directly
if (require.main === module) {
  runBatchTest().catch((err) => {
    console.error("Fatal error during batch test:", err?.message || err);
    process.exit(1);
  });
}

module.exports = {
  candidates,
  BATCH_SIZE,
  DELAY_BETWEEN_EMAILS_MS,
  DELAY_BETWEEN_BATCHES_MS,
  normalizeEmail,
  runBatchTest
};

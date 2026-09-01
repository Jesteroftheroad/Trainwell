import type { Config } from "@netlify/functions";

// Netlify's scheduled-function equivalent of the old vercel.json cron entry.
// It just pokes the existing Next.js route (which still owns the actual
// reminder logic and the CRON_SECRET check) once an hour.
async function dailyReminderCron() {
  const secret = process.env.CRON_SECRET;
  const siteUrl = process.env.URL;
  if (!secret || !siteUrl) {
    console.error("daily-reminder-cron: missing CRON_SECRET or URL env var");
    return;
  }

  const res = await fetch(`${siteUrl}/api/cron/daily-reminder`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!res.ok) {
    console.error(`daily-reminder-cron: route responded ${res.status}`);
  }
}

export default dailyReminderCron;

export const config: Config = {
  schedule: "0 * * * *",
};

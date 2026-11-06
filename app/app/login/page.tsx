import { AppLoginRedirect } from "@/components/portal/AppLoginRedirect";

export const metadata = { title: "Inloggen in de app", robots: { index: false, follow: false } };

/**
 * End of the Discord login that started in the Android app. Normally Android opens the app straight
 * away (App Link). If it does not, this page sends the code to the app, with a button as backup.
 */
export default async function AppLoginPage({ searchParams }: { searchParams: Promise<{ code?: string; error?: string }> }) {
  const { code, error } = await searchParams;
  const safeCode = typeof code === "string" && /^[A-Za-z0-9_.-]{20,3000}$/.test(code) ? code : null;
  const safeError = typeof error === "string" && /^[a-z_]{1,40}$/.test(error) ? error : null;
  return <AppLoginRedirect code={safeCode} error={safeError} />;
}

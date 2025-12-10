export { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "PlanIT";

export const APP_LOGO = "/favicon.png";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = (
  _type: "signIn" | "signUp" = "signIn",
  email?: string,
  name?: string
) => {
  const isDevAuth = import.meta.env.VITE_DEV_AUTH === "true";

  if (isDevAuth) {
    const redirectAfterLogin = `${window.location.origin}/dashboard`;
    const devUrl = new URL("/api/oauth/dev-login", window.location.origin);
    devUrl.searchParams.set("email", email || "dev@example.com");
    devUrl.searchParams.set("name", name || "Dev User");
    devUrl.searchParams.set("redirectUri", redirectAfterLogin);
    return devUrl.toString();
  }

  // Default: use backend Google OAuth starter route
  const url = new URL("/api/auth/google", window.location.origin);
  url.searchParams.set("redirectUri", `${window.location.origin}/dashboard`);
  if (email) url.searchParams.set("emailHint", email);
  if (name) url.searchParams.set("nameHint", name);
  return url.toString();
};

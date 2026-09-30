// Shared Sentry privacy settings. Sentry 11 collects cookies, headers and HTTP bodies by
// default; for an app with auth cookies and user data we send none of that.
export const SENTRY_DATA_COLLECTION: { userInfo: boolean; cookies: boolean; httpHeaders: boolean; httpBodies: never[]; urlQueryParams: boolean } = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: true,
};

export const SENTRY_TRACES_SAMPLE_RATE = process.env.NODE_ENV === "production" ? 0.1 : 1.0;

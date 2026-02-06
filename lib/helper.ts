export const isOnline = (lastActiveAt?: string) => {
  if (!lastActiveAt) return false;

  const last = new Date(lastActiveAt).getTime();
  const now = Date.now();

  // online if active within last 2 minutes
  return now - last < 2 * 60 * 1000;
};

export const formatDate = (input?: string | Date | null) => {
  if (!input) return "";

  const d = typeof input === "string" ? new Date(input) : input;

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const daysSince = (input?: string | Date | null) => {
  if (!input) return 0;

  const d = typeof input === "string" ? new Date(input) : input;

  const now = new Date();
  const diff = now.getTime() - d.getTime();

  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const isAnniversary = (date?: string | null) => {
  if (!date) return false;

  const d = new Date(date);
  const now = new Date();

  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth()
  );
};

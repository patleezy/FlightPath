export function formatTime(iso?: string): string {
  if (!iso) return "N/A";
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric"
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function relativeTime(iso?: string): string {
  if (!iso) return "unknown";
  const then = new Date(iso).getTime();
  const diffMinutes = Math.round((then - Date.now()) / 60000);
  if (Math.abs(diffMinutes) < 1) return "now";
  if (diffMinutes > 0) return `in ${diffMinutes}m`;
  return `${Math.abs(diffMinutes)}m ago`;
}

import type { TicketPriority } from "@/generated/prisma";

export function calculateSlaDeadline(priority: TicketPriority, baseDate = new Date()): Date {
  const result = new Date(baseDate);
  switch (priority) {
    case "CRITICAL":
      // 2 hours
      result.setHours(result.getHours() + 2);
      break;
    case "HIGH":
      // 24 hours (1 day)
      result.setHours(result.getHours() + 24);
      break;
    case "MEDIUM":
      // 72 hours (3 days)
      result.setHours(result.getHours() + 72);
      break;
    case "LOW":
    default:
      // 168 hours (7 days)
      result.setHours(result.getHours() + 168);
      break;
  }
  return result;
}

export function isSlaBreached(deadline: Date | null, resolvedAt: Date | null): boolean {
  if (!deadline) return false;
  const compareDate = resolvedAt || new Date();
  return compareDate.getTime() > deadline.getTime();
}

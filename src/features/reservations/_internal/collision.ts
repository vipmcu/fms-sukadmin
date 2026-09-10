import type { PrismaClient } from "@/generated/prisma";

export const BUFFER_MINUTES = 30;
export const BUFFER_MS = BUFFER_MINUTES * 60 * 1000;

/**
 * Pure function สำหรับตรวจสอบว่าสองช่วงเวลาทับซ้อนกันหรือไม่ (รวม Buffer Time 30 นาที)
 */
export function isTimeOverlappingWithBuffer(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
  bufferMinutes: number = BUFFER_MINUTES
): boolean {
  const buffer = bufferMinutes * 60 * 1000;
  // startA < (endB + buffer) && endA > (startB - buffer)
  return startA.getTime() < endB.getTime() + buffer && endA.getTime() > startB.getTime() - buffer;
}

export interface CheckCollisionParams {
  tenantId: string;
  resourceId: string;
  startTime: Date;
  endTime: Date;
  excludeReservationId?: string;
}

export interface CollisionCheckResult {
  hasCollision: boolean;
  conflictType?: "RESERVATION" | "BLACKOUT";
  conflictDetail?: string;
}

/**
 * ตรวจสอบในฐานข้อมูลว่าช่วงเวลาที่ต้องการจองทับซ้อนกับรายการจองเดิมหรือช่วงปิดปรับปรุงหรือไม่
 */
export async function checkReservationCollision(
  db: PrismaClient,
  params: CheckCollisionParams
): Promise<CollisionCheckResult> {
  const { tenantId, resourceId, startTime, endTime, excludeReservationId } = params;

  // 1. ตรวจสอบกับช่วงเวลาปิดปรับปรุง (ResourceBlackout)
  const blackoutConflict = await db.resourceBlackout.findFirst({
    where: {
      tenantId,
      resourceId,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  if (blackoutConflict) {
    return {
      hasCollision: true,
      conflictType: "BLACKOUT",
      conflictDetail: blackoutConflict.title,
    };
  }

  // 2. ตรวจสอบกับคำขอจองที่มีอยู่ (สถานะ PENDING หรือ APPROVED) พร้อมบวก Buffer 30 นาที
  const bufferedStart = new Date(startTime.getTime() - BUFFER_MS);
  const bufferedEnd = new Date(endTime.getTime() + BUFFER_MS);

  const reservationConflict = await db.reservation.findFirst({
    where: {
      tenantId,
      resourceId,
      status: { in: ["PENDING", "APPROVED"] },
      id: excludeReservationId ? { not: excludeReservationId } : undefined,
      startTime: { lt: bufferedEnd },
      endTime: { gt: bufferedStart },
    },
    select: {
      id: true,
      bookingNo: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  });

  if (reservationConflict) {
    return {
      hasCollision: true,
      conflictType: "RESERVATION",
      conflictDetail: `${reservationConflict.bookingNo}: ${reservationConflict.title}`,
    };
  }

  return { hasCollision: false };
}

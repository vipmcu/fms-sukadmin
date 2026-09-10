import { describe, it, expect } from "vitest";
import { prisma } from "@/shared/lib/infra/prisma";
import { seedCore, seedUser } from "../../../../prisma/lib/seed-core";
import {
  createResource,
  createReservation,
  approveReservation,
  cancelReservation,
  listResources,
} from "./services";

describe("reservations services (integration)", () => {
  it("สามารถสร้างทรัพยากรห้องประชุมและยานพาหนะ และดึงรายการได้", async () => {
    const core = await seedCore(prisma, { tenantCode: "RES_T1", nameTh: "คณะทดสอบ", nameEn: "Test Faculty" });

    const room = await createResource(core.tenantId, {
      type: "ROOM",
      code: "TEST-RM1",
      nameTh: "ห้องประชุมทดสอบ",
      nameEn: "Test Room 1",
      capacity: 20,
      locationOrPlate: "อาคาร 1 ชั้น 3",
      amenities: {},
      isActive: true,
    });

    expect(room.id).toBeDefined();
    expect(room.code).toBe("TEST-RM1");

    const resources = await listResources(core.tenantId);
    expect(resources).toHaveLength(1);
    expect(resources[0].nameTh).toBe("ห้องประชุมทดสอบ");
  });

  it("สามารถสร้างคำขอจอง อนุมัติ และตรวจจับการชนเวลา (Collision)", async () => {
    const core = await seedCore(prisma, { tenantCode: "RES_T2", nameTh: "คณะทดสอบ 2", nameEn: "Test Faculty 2" });
    const userId = await seedUser(prisma, core.tenantId, {
      email: "user@res.test",
      name: "Staff User",
      passwordHash: "hash",
      roleIds: [core.roleIds.STAFF],
    });
    const adminId = await seedUser(prisma, core.tenantId, {
      email: "admin@res.test",
      name: "Admin User",
      passwordHash: "hash",
      roleIds: [core.roleIds.SUPER_ADMIN],
    });

    const room = await createResource(core.tenantId, {
      type: "ROOM",
      code: "TEST-RM2",
      nameTh: "ห้องประชุม 2",
      nameEn: "Test Room 2",
      capacity: 10,
      locationOrPlate: "ชั้น 2",
      amenities: {},
      isActive: true,
    });

    // จองวันพรุ่งนี้ 09:00 - 11:00 น.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start1 = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0, 0);
    const end1 = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0, 0);

    const booking1 = await createReservation(core.tenantId, userId, {
      resourceId: room.id,
      title: "ประชุมทีมบริหาร",
      purpose: "ปรึกษาหารือประจำสัปดาห์",
      startTime: start1.toISOString(),
      endTime: end1.toISOString(),
      attendeesCount: 5,
    });

    expect(booking1.bookingNo).toMatch(/^BK-/);
    expect(booking1.status).toBe("PENDING");

    // พยายามจองเวลาชนกัน (10:30 - 12:00 น.) -> ต้อง throw collision error
    const startCollision = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 30, 0);
    const endCollision = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 12, 0, 0);

    await expect(
      createReservation(core.tenantId, userId, {
        resourceId: room.id,
        title: "ประชุมซ้อน",
        purpose: "ควรชน",
        startTime: startCollision.toISOString(),
        endTime: endCollision.toISOString(),
        attendeesCount: 3,
      })
    ).rejects.toThrow("ช่วงเวลาดังกล่าวมีผู้จองแล้ว หรือติดระยะเวลาเตรียมความพร้อม 30 นาที");

    // อนุมัติคำขอแรก
    const approved = await approveReservation(core.tenantId, adminId, {
      id: booking1.id,
    });
    expect(approved.status).toBe("APPROVED");
    expect(approved.approverId).toBe(adminId);

    // ผู้จองยกเลิกคำขอล่วงหน้า (มากกว่า 2 ชม.)
    const cancelled = await cancelReservation(core.tenantId, userId, false, {
      id: booking1.id,
      cancellationReason: "ยกเลิกการประชุมเนื่องจากมีภารกิจด่วน",
    });
    expect(cancelled.status).toBe("CANCELLED");
    expect(cancelled.cancellationReason).toBe("ยกเลิกการประชุมเนื่องจากมีภารกิจด่วน");
  });
});

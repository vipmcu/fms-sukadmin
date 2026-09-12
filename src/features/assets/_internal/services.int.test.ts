import { describe, it, expect } from "vitest";
import { prisma } from "@/shared/lib/infra/prisma";
import { seedCore, seedUser } from "../../../../prisma/lib/seed-core";
import {
  createSupplyItem,
  createSupplyRequisition,
  approveSupplyRequisition,
  dispatchSupplyRequisition,
  listSupplyItems,
} from "./services";

describe("supply requisition services (integration)", () => {
  it("creates, approves, and dispatches a requisition while deducting stock", async () => {
    const core = await seedCore(prisma, {
      tenantCode: "REQ_T1",
      nameTh: "คณะทดสอบเบิกวัสดุ",
      nameEn: "Requisition Test Faculty",
    });
    const requesterId = await seedUser(prisma, core.tenantId, {
      email: "req-user@req.test",
      name: "Requester",
      passwordHash: "hash",
      roleIds: [core.roleIds.STAFF],
    });
    const approverId = await seedUser(prisma, core.tenantId, {
      email: "req-approver@req.test",
      name: "Approver",
      passwordHash: "hash",
      roleIds: [core.roleIds.ADMIN],
    });

    const supply = await createSupplyItem(
      core.tenantId,
      {
        code: "PAPER-A4",
        nameTh: "กระดาษ A4",
        unit: "รีม",
        currentStock: 20,
        minStock: 5,
        unitCost: 100,
      },
      requesterId
    );

    const req = await createSupplyRequisition(core.tenantId, requesterId, {
      purpose: "ใช้ในห้องประชุม",
      items: [{ supplyItemId: supply.id, quantity: 3 }],
    });
    expect(req.status).toBe("PENDING");
    expect(req.requisitionNo).toMatch(/^REQ-\d{6}-\d{4}$/);

    const approved = await approveSupplyRequisition(core.tenantId, approverId, req.id);
    expect(approved.status).toBe("APPROVED");

    const dispatched = await dispatchSupplyRequisition(core.tenantId, approverId, req.id);
    expect(dispatched.status).toBe("DISPATCHED");

    const supplies = await listSupplyItems(core.tenantId);
    const paper = supplies.find((s) => s.id === supply.id);
    expect(paper?.currentStock).toBe(17);
  });

  it("refuses dispatch when stock is insufficient", async () => {
    const core = await seedCore(prisma, {
      tenantCode: "REQ_T2",
      nameTh: "คณะทดสอบสต็อกไม่พอ",
      nameEn: "Low Stock Faculty",
    });
    const userId = await seedUser(prisma, core.tenantId, {
      email: "req-low@req.test",
      name: "Staff",
      passwordHash: "hash",
      roleIds: [core.roleIds.STAFF],
    });

    const supply = await createSupplyItem(
      core.tenantId,
      {
        code: "PEN-01",
        nameTh: "ปากกา",
        unit: "ด้าม",
        currentStock: 2,
        minStock: 1,
        unitCost: null,
      },
      userId
    );

    const req = await createSupplyRequisition(core.tenantId, userId, {
      items: [{ supplyItemId: supply.id, quantity: 5 }],
    });
    await approveSupplyRequisition(core.tenantId, userId, req.id);

    await expect(dispatchSupplyRequisition(core.tenantId, userId, req.id)).rejects.toThrow(
      /สต็อกไม่เพียงพอ/
    );

    const still = await prisma.supplyRequisition.findUnique({ where: { id: req.id } });
    expect(still?.status).toBe("APPROVED");
  });
});

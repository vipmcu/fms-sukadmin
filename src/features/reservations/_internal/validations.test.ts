import { describe, it, expect } from "vitest";
import {
  createReservationSchema,
  approveReservationSchema,
  rejectReservationSchema,
  cancelReservationSchema,
  createResourceSchema,
} from "./validations";

describe("Reservations Validations", () => {
  const futureStart = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const futureEnd = new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString();
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  describe("createReservationSchema", () => {
    it("ผ่านการตรวจสอบเมื่อข้อมูลถูกต้องและจองล่วงหน้ามากกว่า 24 ชั่วโมง", () => {
      const valid = {
        resourceId: validUUID,
        title: "ประชุมคณะกรรมการประจำคณะ",
        purpose: "พิจารณาอนุมัติหลักสูตรปรับปรุง",
        attendeesCount: 15,
        startTime: futureStart,
        endTime: futureEnd,
      };
      expect(createReservationSchema.parse(valid)).toMatchObject({
        title: "ประชุมคณะกรรมการประจำคณะ",
        attendeesCount: 15,
      });
    });

    it("ไม่ผ่านเมื่อเวลาสิ้นสุดอยู่ก่อนหรือเท่ากับเวลาเริ่มต้น", () => {
      const invalid = {
        resourceId: validUUID,
        title: "ประชุม",
        purpose: "วัตถุประสงค์",
        attendeesCount: 5,
        startTime: futureEnd,
        endTime: futureStart,
      };
      expect(() => createReservationSchema.parse(invalid)).toThrow();
    });

    it("ไม่ผ่านเมื่อจองล่วงหน้าน้อยกว่า 24 ชั่วโมง", () => {
      const soonStart = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const soonEnd = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
      const invalid = {
        resourceId: validUUID,
        title: "ประชุมด่วน",
        purpose: "เรื่องด่วนมาก",
        attendeesCount: 5,
        startTime: soonStart,
        endTime: soonEnd,
      };
      expect(() => createReservationSchema.parse(invalid)).toThrow();
    });

    it("ไม่ผ่านเมื่อจำนวนผู้เข้าร่วม < 1", () => {
      const invalid = {
        resourceId: validUUID,
        title: "ประชุม",
        purpose: "วัตถุประสงค์",
        attendeesCount: 0,
        startTime: futureStart,
        endTime: futureEnd,
      };
      expect(() => createReservationSchema.parse(invalid)).toThrow();
    });
  });

  describe("approveReservationSchema", () => {
    it("ผ่านเมื่อรหัส id ถูกต้องตามรูปแบบ UUID", () => {
      const valid = {
        id: validUUID,
        approvalNote: "อนุมัติเรียบร้อย",
        driverName: "สมชาย ขับดี",
        driverPhone: "0812345678",
      };
      expect(approveReservationSchema.parse(valid).id).toBe(validUUID);
    });

    it("ไม่ผ่านเมื่อรหัส id ไม่ใช่ UUID", () => {
      expect(() => approveReservationSchema.parse({ id: "invalid-id" })).toThrow();
    });
  });

  describe("rejectReservationSchema", () => {
    it("ผ่านเมื่อระบุเหตุผลอย่างน้อย 5 ตัวอักษร", () => {
      const valid = { id: validUUID, rejectionReason: "ห้องปิดปรับปรุงระบบแอร์" };
      expect(rejectReservationSchema.parse(valid).rejectionReason).toBe("ห้องปิดปรับปรุงระบบแอร์");
    });

    it("ไม่ผ่านเมื่อเหตุผลสั้นเกินไป", () => {
      expect(() => rejectReservationSchema.parse({ id: validUUID, rejectionReason: "สั้น" })).toThrow();
    });
  });

  describe("cancelReservationSchema", () => {
    it("ผ่านเมื่อรหัส id ถูกต้อง", () => {
      const valid = { id: validUUID, cancellationReason: "ติดภารกิจด่วนอื่น" };
      expect(cancelReservationSchema.parse(valid).id).toBe(validUUID);
    });
  });

  describe("createResourceSchema", () => {
    it("สร้างข้อมูลห้องประชุมสำเร็จ", () => {
      const room = {
        type: "ROOM",
        code: "RM-301",
        nameTh: "ห้องประชุมสารภี 1",
        nameEn: "Sarapee Room 1",
        capacity: 30,
        locationOrPlate: "อาคาร 3 ชั้น 3",
      };
      expect(createResourceSchema.parse(room)).toMatchObject({
        type: "ROOM",
        code: "RM-301",
      });
    });

    it("สร้างข้อมูลยานพาหนะสำเร็จ", () => {
      const vehicle = {
        type: "VEHICLE",
        code: "VAN-01",
        nameTh: "รถตู้โตโยต้า คอมมิวเตอร์",
        nameEn: "Toyota Commuter Van",
        capacity: 12,
        locationOrPlate: "ฮข-1234 กทม.",
      };
      expect(createResourceSchema.parse(vehicle)).toMatchObject({
        type: "VEHICLE",
        code: "VAN-01",
      });
    });
  });
});

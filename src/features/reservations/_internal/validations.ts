import { z } from "zod";

export const createReservationSchema = z
  .object({
    resourceId: z.string().uuid("กรุณาระบุรหัสทรัพยากรที่ถูกต้อง"),
    title: z.string().min(3, "หัวข้อต้องมีความยาวอย่างน้อย 3 ตัวอักษร").max(255),
    purpose: z.string().min(5, "วัตถุประสงค์ต้องมีความยาวอย่างน้อย 5 ตัวอักษร"),
    attendeesCount: z.coerce.number().int().min(1, "จำนวนผู้เข้าร่วมต้องอย่างน้อย 1 คน"),
    startTime: z.string().datetime("รูปแบบวันเวลาเริ่มต้นไม่ถูกต้อง"),
    endTime: z.string().datetime("รูปแบบวันเวลาสิ้นสุดไม่ถูกต้อง"),
    destination: z.string().max(255).optional().nullable(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น",
    path: ["endTime"],
  })
  .refine(
    (data) => {
      const minStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
      return new Date(data.startTime) >= minStart;
    },
    {
      message: "ต้องจองล่วงหน้าอย่างน้อย 24 ชั่วโมง",
      path: ["startTime"],
    }
  );

export const approveReservationSchema = z.object({
  id: z.string().uuid("รหัสการจองไม่ถูกต้อง"),
  approvalNote: z.string().max(500).optional().nullable(),
  driverName: z.string().max(150).optional().nullable(),
  driverPhone: z.string().max(50).optional().nullable(),
  assignedVehiclePlate: z.string().max(50).optional().nullable(),
});

export const rejectReservationSchema = z.object({
  id: z.string().uuid("รหัสการจองไม่ถูกต้อง"),
  rejectionReason: z.string().min(5, "กรุณาระบุเหตุผลในการปฏิเสธอย่างน้อย 5 ตัวอักษร"),
});

export const cancelReservationSchema = z.object({
  id: z.string().uuid("รหัสการจองไม่ถูกต้อง"),
  cancellationReason: z.string().max(500).optional().nullable(),
});

export const createResourceSchema = z.object({
  type: z.enum(["ROOM", "VEHICLE"]),
  code: z.string().min(2, "รหัสต้องมีความยาวอย่างน้อย 2 ตัวอักษร").max(50),
  nameTh: z.string().min(2, "ชื่อภาษาไทยต้องมีความยาวอย่างน้อย 2 ตัวอักษร").max(255),
  nameEn: z.string().min(2, "ชื่อภาษาอังกฤษต้องมีความยาวอย่างน้อย 2 ตัวอักษร").max(255),
  capacity: z.coerce.number().int().min(1, "ความจุต้องอย่างน้อย 1"),
  locationOrPlate: z.string().min(1, "กรุณาระบุสถานที่หรือทะเบียนรถ").max(150),
  amenities: z.record(z.string(), z.unknown()).optional().default({}),
  imageUrl: z.string().url("รูปแบบ URL ไม่ถูกต้อง").optional().nullable().or(z.literal("")),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateResourceSchema = createResourceSchema.extend({
  id: z.string().uuid("รหัสทรัพยากรไม่ถูกต้อง"),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type ApproveReservationInput = z.infer<typeof approveReservationSchema>;
export type RejectReservationInput = z.infer<typeof rejectReservationSchema>;
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

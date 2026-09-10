import { z } from "zod";

export const ticketPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const ticketStatusEnum = z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "WAITING_PARTS", "RESOLVED", "CANCELLED"]);

export const createServiceTicketSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(3).max(255),
  description: z.string().min(5),
  location: z.string().min(2).max(255),
  resourceId: z.string().uuid().optional().nullable(),
  assetId: z.string().uuid().optional().nullable(),
  priority: ticketPriorityEnum.default("MEDIUM"),
  photos: z.array(z.string()).optional().default([]),
  requesterName: z.string().min(2).max(255),
  requesterEmail: z.string().email(),
  requesterPhone: z.string().min(9).max(50),
});

export const assignTicketSchema = z.object({
  id: z.string().uuid(),
  assignedTechnicianId: z.string().uuid(),
  priority: ticketPriorityEnum.optional(),
});

export const updateTicketProgressSchema = z.object({
  id: z.string().uuid(),
  status: ticketStatusEnum,
  comment: z.string().optional().nullable(),
});

export const resolveTicketSchema = z.object({
  id: z.string().uuid(),
  resolutionNotes: z.string().min(5, "ต้องระบุแนวทางและผลการแก้ไขอย่างน้อย 5 ตัวอักษร"),
  partsCost: z.number().nonnegative().optional().nullable(),
  completionPhotos: z.array(z.string()).optional().default([]),
});

export const rateTicketSchema = z.object({
  ticketId: z.string().uuid(),
  score: z.number().int().min(1).max(5),
  feedback: z.string().optional().nullable(),
});

export type CreateServiceTicketInput = z.infer<typeof createServiceTicketSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type UpdateTicketProgressInput = z.infer<typeof updateTicketProgressSchema>;
export type ResolveTicketInput = z.infer<typeof resolveTicketSchema>;
export type RateTicketInput = z.infer<typeof rateTicketSchema>;

import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Navigation & Page Titles
  "reservations.nav": { th: "ระบบจองห้องและยานพาหนะ", en: "Facility & Fleet Reservations" },
  "reservations.title": { th: "ระบบจองห้องประชุมและยานพาหนะ", en: "Facility & Fleet Reservations" },
  "reservations.subtitle": { th: "บริหารจัดการการจองห้องประชุมและยานพาหนะส่วนกลางของคณะอย่างมีประสิทธิภาพ", en: "Manage faculty meeting rooms and vehicle reservations efficiently" },
  "reservations.tab.calendar": { th: "ปฏิทินการจอง", en: "Calendar" },
  "reservations.tab.my": { th: "รายการจองของฉัน", en: "My Bookings" },
  "reservations.tab.inbox": { th: "คิวงานรออนุมัติ", en: "Approval Inbox" },
  "reservations.tab.resources": { th: "จัดการห้องและยานพาหนะ", en: "Manage Resources" },

  // Statuses
  "reservations.status.pending": { th: "รออนุมัติ", en: "Pending" },
  "reservations.status.approved": { th: "อนุมัติแล้ว", en: "Approved" },
  "reservations.status.rejected": { th: "ปฏิเสธ", en: "Rejected" },
  "reservations.status.cancelled": { th: "ยกเลิกแล้ว", en: "Cancelled" },

  // Resource Types
  "reservations.type.room": { th: "ห้องประชุม", en: "Meeting Room" },
  "reservations.type.vehicle": { th: "ยานพาหนะ", en: "Vehicle" },

  // Form Fields & Labels
  "reservations.field.resource": { th: "ทรัพยากร", en: "Resource" },
  "reservations.field.title": { th: "หัวข้อการใช้งาน", en: "Title" },
  "reservations.field.purpose": { th: "วัตถุประสงค์", en: "Purpose" },
  "reservations.field.attendees": { th: "จำนวนผู้เข้าร่วม (คน)", en: "Attendees Count" },
  "reservations.field.destination": { th: "สถานที่ปลายทาง (กรณีรถยนต์)", en: "Destination" },
  "reservations.field.startTime": { th: "วันเวลาเริ่มต้น", en: "Start Time" },
  "reservations.field.endTime": { th: "วันเวลาสิ้นสุด", en: "End Time" },
  "reservations.field.driverName": { th: "ชื่อพนักงานขับรถ", en: "Driver Name" },
  "reservations.field.driverPhone": { th: "เบอร์โทรพนักงานขับรถ", en: "Driver Phone" },
  "reservations.field.assignedVehiclePlate": { th: "ทะเบียนรถที่จัดสรร", en: "Assigned License Plate" },
  "reservations.field.approvalNote": { th: "หมายเหตุการอนุมัติ", en: "Approval Note" },
  "reservations.field.rejectionReason": { th: "เหตุผลที่ปฏิเสธ", en: "Rejection Reason" },
  "reservations.field.cancellationReason": { th: "เหตุผลที่ยกเลิก", en: "Cancellation Reason" },
  "reservations.field.capacity": { th: "ความจุ (คน)", en: "Capacity" },
  "reservations.field.locationOrPlate": { th: "สถานที่ / ทะเบียนรถ", en: "Location / Plate" },
  "reservations.field.amenities": { th: "สิ่งอำนวยความสะดวก", en: "Amenities" },
  "reservations.field.status": { th: "สถานะ", en: "Status" },
  "reservations.field.requester": { th: "ผู้ขอจอง", en: "Requester" },
  "reservations.field.bookingNo": { th: "เลขที่การจอง", en: "Booking No." },

  // Actions & Buttons
  "reservations.btn.create": { th: "สร้างคำขอจอง", en: "New Booking" },
  "reservations.btn.approve": { th: "อนุมัติคำขอ", en: "Approve" },
  "reservations.btn.reject": { th: "ปฏิเสธคำขอ", en: "Reject" },
  "reservations.btn.cancel": { th: "ยกเลิกการจอง", en: "Cancel Booking" },
  "reservations.btn.details": { th: "ดูรายละเอียด", en: "View Details" },
  "reservations.btn.save": { th: "บันทึก", en: "Save" },
  "reservations.btn.close": { th: "ปิด", en: "Close" },

  // Dialogs & Confirmations
  "reservations.dialog.createTitle": { th: "ยื่นคำขอจองห้องประชุมหรือยานพาหนะ", en: "New Reservation Request" },
  "reservations.dialog.approveTitle": { th: "ยืนยันการอนุมัติคำขอจอง", en: "Confirm Booking Approval" },
  "reservations.dialog.rejectTitle": { th: "ปฏิเสธคำขอจอง", en: "Reject Booking Request" },
  "reservations.dialog.cancelTitle": { th: "ยกเลิกการจอง", en: "Cancel Booking" },
  "reservations.dialog.cancelConfirm": { th: "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้? การกระทำนี้ไม่สามารถย้อนกลับได้", en: "Are you sure you want to cancel this booking? This action cannot be undone." },

  // Notifications & Messages
  "reservations.msg.createSuccess": { th: "ส่งคำขอจองเรียบร้อยแล้ว อยู่ระหว่างรอการอนุมัติ", en: "Booking request submitted successfully. Awaiting approval." },
  "reservations.msg.approveSuccess": { th: "อนุมัติคำขอจองเรียบร้อยแล้ว", en: "Booking request approved successfully." },
  "reservations.msg.rejectSuccess": { th: "ปฏิเสธคำขอจองเรียบร้อยแล้ว", en: "Booking request rejected." },
  "reservations.msg.cancelSuccess": { th: "ยกเลิกการจองเรียบร้อยแล้ว", en: "Booking cancelled successfully." },
  "reservations.msg.resourceCreated": { th: "เพิ่มข้อมูลทรัพยากรเรียบร้อยแล้ว", en: "Resource created successfully." },
  "reservations.msg.resourceUpdated": { th: "บันทึกการแก้ไขทรัพยากรเรียบร้อยแล้ว", en: "Resource updated successfully." },
  "reservations.msg.empty": { th: "ไม่พบรายการจอง", en: "No reservations found." },
  "reservations.msg.emptyResources": { th: "ยังไม่มีรายการห้องประชุมหรือยานพาหนะ", en: "No resources found." },

  // Errors & Validations
  "reservations.err.collision": { th: "ช่วงเวลาดังกล่าวมีผู้จองแล้ว หรือติดระยะเวลาเตรียมความพร้อม 30 นาที กรุณาเลือกช่วงเวลาอื่น", en: "Selected time slot or its 30-min buffer conflicts with an existing booking." },
  "reservations.err.advanceRequired": { th: "ต้องจองล่วงหน้าอย่างน้อย 24 ชั่วโมง", en: "Reservations must be made at least 24 hours in advance." },
  "reservations.err.cancelTooLate": { th: "ไม่สามารถยกเลิกได้ เนื่องจากต้องยกเลิกล่วงหน้าอย่างน้อย 2 ชั่วโมง", en: "Cannot cancel: cancellation must be made at least 2 hours in advance." },
  "reservations.err.invalidTimeRange": { th: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น", en: "End time must be after start time." },
  "reservations.err.capacityExceeded": { th: "จำนวนผู้เข้าร่วมเกินความจุสูงสุดที่รองรับได้", en: "Number of attendees exceeds resource capacity." },
  "reservations.err.driverRequired": { th: "กรุณาระบุชื่อพนักงานขับรถสำหรับการจองยานพาหนะ", en: "Driver name is required for vehicle reservations." },
  "reservations.err.notAllowed": { th: "คุณไม่มีสิทธิ์ดำเนินการกับรายการจองนี้", en: "You are not authorized to perform this action." },

  // RBAC & Permissions Dictionary
  "roles.module.reservations": { th: "ระบบจองห้องและยานพาหนะ", en: "Facility & Fleet Reservations" },
  "perm.reservations:read": { th: "ดูรายการจองและปฏิทิน", en: "View reservations and calendar" },
  "perm.reservations:create": { th: "ส่งคำขอจองห้องประชุมและยานพาหนะ", en: "Create reservation requests" },
  "perm.reservations:cancel": { th: "ยกเลิกคำขอจองของตนเอง", en: "Cancel own reservations" },
  "perm.reservations:approve": { th: "อนุมัติหรือปฏิเสธคำขอจอง", en: "Approve or reject reservations" },
  "perm.reservations:manage": { th: "จัดการข้อมูลห้อง ยานพาหนะ และเวลาปิดปรับปรุง", en: "Manage resources and blackout periods" },
};

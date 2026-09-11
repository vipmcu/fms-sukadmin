/** ตรวจสอบว่าช่วงเวลาปัจจุบันอยู่ในกำหนดการรับสมัครของรอบหรือไม่ */
export function isRoundOpen(startDate: Date, endDate: Date, now = new Date()): boolean {
  return now >= startDate && now <= endDate;
}

/** สร้างรหัสใบสมัครตามรูปแบบทางการ ADM-YY-XXXX (เช่น ADM-69-0001) */
export function formatApplicationNo(academicYearBE: number, sequenceNumber: number): string {
  if (sequenceNumber <= 0) {
    throw new Error("ลำดับใบสมัครต้องมากกว่า 0");
  }
  const yearSuffix = (academicYearBE % 100).toString().padStart(2, "0");
  const seq = sequenceNumber.toString().padStart(4, "0");
  return `ADM-${yearSuffix}-${seq}`;
}

/** ตรวจสอบความถูกต้องของเกรดเฉลี่ยสะสม GPAX (0.00 - 4.00) */
export function isValidGpax(gpax: number | null | undefined): boolean {
  if (gpax === null || gpax === undefined || Number.isNaN(gpax)) return false;
  return gpax >= 0.0 && gpax <= 4.0;
}

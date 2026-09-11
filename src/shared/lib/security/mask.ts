/**
 * เครื่องมือช่วยปกปิดข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA Masking)
 * สำหรับการแสดงผลผ่าน Public Endpoints หรือหน้าติดตามสถานะที่ไม่ต้องล็อกอิน
 */

const graphemeSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
  ? new Intl.Segmenter("th", { granularity: "grapheme" })
  : null;

function getGraphemes(text: string): string[] {
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/**
 * ปกปิดชื่อ-นามสกุล เช่น "สมชาย ใจดี" -> "ส***ย ใ***ดี" หรือ "John Doe" -> "J***n D***e"
 */
export function maskName(fullName: string | null | undefined): string {
  if (!fullName || typeof fullName !== "string") return "—";
  const trimmed = fullName.trim();
  if (!trimmed) return "—";

  const parts = trimmed.split(/\s+/);
  return parts
    .map((part) => {
      const chars = getGraphemes(part);
      if (chars.length <= 2) {
        return `${chars[0]}*`;
      }
      return `${chars[0]}***${chars[chars.length - 1]}`;
    })
    .join(" ");
}

/**
 * ปกปิดหมายเลขโทรศัพท์ เช่น "0812345678" หรือ "081-234-5678" -> "081-***-5678"
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || typeof phone !== "string") return "—";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 9) return "—";

  if (cleaned.length === 10) {
    const prefix = cleaned.slice(0, 3);
    const suffix = cleaned.slice(6);
    return `${prefix}-***-${suffix}`;
  }

  // เบอร์บ้าน 9 หลัก เช่น 02-xxx-xxxx
  const prefix = cleaned.slice(0, 2);
  const suffix = cleaned.slice(5);
  return `${prefix}-***-${suffix}`;
}

/**
 * ปกปิดอีเมล เช่น "somchai@gmail.com" -> "s***i@gmail.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || typeof email !== "string") return "—";
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0) return "—";

  const localPart = trimmed.slice(0, atIndex);
  const domainPart = trimmed.slice(atIndex);

  if (localPart.length <= 2) {
    return `${localPart[0]}*${domainPart}`;
  }

  return `${localPart[0]}***${localPart[localPart.length - 1]}${domainPart}`;
}

/**
 * ปกปิดเลขบัตรประชาชน 13 หลัก เช่น "1234567890123" -> "1-****-*****-12-3"
 */
export function maskNationalId(id: string | null | undefined): string {
  if (!id || typeof id !== "string") return "—";
  const cleaned = id.replace(/\D/g, "");
  if (cleaned.length !== 13) return "—";

  const first = cleaned[0];
  const last3 = cleaned.slice(10, 12);
  const last1 = cleaned[12];
  return `${first}-****-*****-${last3}-${last1}`;
}

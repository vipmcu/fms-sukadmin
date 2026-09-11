/** ตรวจสอบว่าสต็อกอยู่ในเกณฑ์เตือนใกล้หมดหรือไม่ (current <= min) */
export function isLowStock(currentStock: number, minStock: number): boolean {
  return currentStock <= minStock;
}

/** คำนวณยอดสต็อกใหม่ และป้องกันไม่ให้สต็อกติดลบ */
export function calculateNewStock(currentStock: number, quantityChange: number): number {
  const newStock = currentStock + quantityChange;
  if (newStock < 0) {
    throw new Error(`สต็อกไม่เพียงพอ (คงเหลือ ${currentStock} แต่ต้องการตัดจ่าย ${Math.abs(quantityChange)})`);
  }
  return newStock;
}

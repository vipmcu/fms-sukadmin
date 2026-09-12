ALTER TABLE "supply_requisition_items" DROP CONSTRAINT "supply_requisition_items_supply_item_id_fkey";
ALTER TABLE "supply_requisition_items" ADD CONSTRAINT "supply_requisition_items_supply_item_id_fkey" FOREIGN KEY ("supply_item_id") REFERENCES "supply_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

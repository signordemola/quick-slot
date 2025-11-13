/*
  Warnings:

  - A unique constraint covering the columns `[business_id,staff_id,name]` on the table `services` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "services_business_id_staff_id_name_key" ON "services"("business_id", "staff_id", "name");

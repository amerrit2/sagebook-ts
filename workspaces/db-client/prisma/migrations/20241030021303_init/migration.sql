/*
  Warnings:

  - You are about to alter the column `passwordHash` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(64)`.
  - You are about to alter the column `passwordSalt` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Char(16)`.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('tsp', 'tbsp', 'cup', 'pint', 'gallon', 'floz', 'oz', 'ml', 'l');

-- CreateEnum
CREATE TYPE "ActionKind" AS ENUM ('shop', 'cook', 'eatLeftovers', 'eatOut', 'orderIn');

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userEmail_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "passwordSalt" SET DATA TYPE CHAR(16);

-- DropTable
DROP TABLE "Profile";

-- CreateTable
CREATE TABLE "Instruction" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "kind" VARCHAR(40) NOT NULL,

    CONSTRAINT "Instruction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "name" TEXT NOT NULL,
    "amount" SMALLINT NOT NULL,
    "unit" "Unit" NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Frequency" (
    "id" SERIAL NOT NULL,
    "kind" "ActionKind" NOT NULL,
    "value" INTEGER NOT NULL,
    "rotationId" INTEGER NOT NULL,

    CONSTRAINT "Frequency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rotation" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Rotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_InstructionToRecipe" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_IngredientToRecipe" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_MealToRecipe" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_MealToRotation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_InstructionToRecipe_AB_unique" ON "_InstructionToRecipe"("A", "B");

-- CreateIndex
CREATE INDEX "_InstructionToRecipe_B_index" ON "_InstructionToRecipe"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_IngredientToRecipe_AB_unique" ON "_IngredientToRecipe"("A", "B");

-- CreateIndex
CREATE INDEX "_IngredientToRecipe_B_index" ON "_IngredientToRecipe"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MealToRecipe_AB_unique" ON "_MealToRecipe"("A", "B");

-- CreateIndex
CREATE INDEX "_MealToRecipe_B_index" ON "_MealToRecipe"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MealToRotation_AB_unique" ON "_MealToRotation"("A", "B");

-- CreateIndex
CREATE INDEX "_MealToRotation_B_index" ON "_MealToRotation"("B");

-- AddForeignKey
ALTER TABLE "Frequency" ADD CONSTRAINT "Frequency_rotationId_fkey" FOREIGN KEY ("rotationId") REFERENCES "Rotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstructionToRecipe" ADD CONSTRAINT "_InstructionToRecipe_A_fkey" FOREIGN KEY ("A") REFERENCES "Instruction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstructionToRecipe" ADD CONSTRAINT "_InstructionToRecipe_B_fkey" FOREIGN KEY ("B") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IngredientToRecipe" ADD CONSTRAINT "_IngredientToRecipe_A_fkey" FOREIGN KEY ("A") REFERENCES "Ingredient"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IngredientToRecipe" ADD CONSTRAINT "_IngredientToRecipe_B_fkey" FOREIGN KEY ("B") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToRecipe" ADD CONSTRAINT "_MealToRecipe_A_fkey" FOREIGN KEY ("A") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToRecipe" ADD CONSTRAINT "_MealToRecipe_B_fkey" FOREIGN KEY ("B") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToRotation" ADD CONSTRAINT "_MealToRotation_A_fkey" FOREIGN KEY ("A") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToRotation" ADD CONSTRAINT "_MealToRotation_B_fkey" FOREIGN KEY ("B") REFERENCES "Rotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

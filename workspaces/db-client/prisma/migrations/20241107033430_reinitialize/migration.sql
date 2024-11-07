-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('tsp', 'tbsp', 'cup', 'pint', 'quart', 'gallon', 'floz', 'oz', 'ml', 'l', 'unit');

-- CreateEnum
CREATE TYPE "DietaryRestrictions" AS ENUM ('gluten', 'nuts', 'dairy', 'keto', 'paleo');

-- CreateEnum
CREATE TYPE "ActionKind" AS ENUM ('cook', 'eatLeftovers', 'eatOut', 'orderIn');

-- CreateTable
CREATE TABLE "Ingredient" (
    "name" TEXT NOT NULL,
    "dietaryRestrictions" "DietaryRestrictions"[],

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "IngredientAmount" (
    "id" SERIAL NOT NULL,
    "amount" SMALLINT NOT NULL,
    "unit" "Unit" NOT NULL,
    "ingredientName" TEXT NOT NULL,
    "recipeId" INTEGER NOT NULL,

    CONSTRAINT "IngredientAmount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "numServings" SMALLINT NOT NULL,
    "instructions" TEXT[],
    "prepTimeSec" INTEGER NOT NULL,
    "cookTimeSec" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

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
    "name" TEXT NOT NULL,
    "servingsPerMeal" INTEGER NOT NULL,
    "ownerId" VARCHAR(230) NOT NULL,

    CONSTRAINT "Rotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(230) NOT NULL,
    "passwordHash" BYTEA NOT NULL,
    "passwordSalt" BYTEA NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserData" (
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserData_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "_RecipeToUserData" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
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

-- CreateTable
CREATE TABLE "_MealToUserData" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_RotationToUserData" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_RecipeToUserData_AB_unique" ON "_RecipeToUserData"("A", "B");

-- CreateIndex
CREATE INDEX "_RecipeToUserData_B_index" ON "_RecipeToUserData"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MealToRecipe_AB_unique" ON "_MealToRecipe"("A", "B");

-- CreateIndex
CREATE INDEX "_MealToRecipe_B_index" ON "_MealToRecipe"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MealToRotation_AB_unique" ON "_MealToRotation"("A", "B");

-- CreateIndex
CREATE INDEX "_MealToRotation_B_index" ON "_MealToRotation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MealToUserData_AB_unique" ON "_MealToUserData"("A", "B");

-- CreateIndex
CREATE INDEX "_MealToUserData_B_index" ON "_MealToUserData"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RotationToUserData_AB_unique" ON "_RotationToUserData"("A", "B");

-- CreateIndex
CREATE INDEX "_RotationToUserData_B_index" ON "_RotationToUserData"("B");

-- AddForeignKey
ALTER TABLE "IngredientAmount" ADD CONSTRAINT "IngredientAmount_ingredientName_fkey" FOREIGN KEY ("ingredientName") REFERENCES "Ingredient"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientAmount" ADD CONSTRAINT "IngredientAmount_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frequency" ADD CONSTRAINT "Frequency_rotationId_fkey" FOREIGN KEY ("rotationId") REFERENCES "Rotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rotation" ADD CONSTRAINT "Rotation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserData" ADD CONSTRAINT "UserData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecipeToUserData" ADD CONSTRAINT "_RecipeToUserData_A_fkey" FOREIGN KEY ("A") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecipeToUserData" ADD CONSTRAINT "_RecipeToUserData_B_fkey" FOREIGN KEY ("B") REFERENCES "UserData"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToRecipe" ADD CONSTRAINT "_MealToRecipe_A_fkey" FOREIGN KEY ("A") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToRecipe" ADD CONSTRAINT "_MealToRecipe_B_fkey" FOREIGN KEY ("B") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToRotation" ADD CONSTRAINT "_MealToRotation_A_fkey" FOREIGN KEY ("A") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToRotation" ADD CONSTRAINT "_MealToRotation_B_fkey" FOREIGN KEY ("B") REFERENCES "Rotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToUserData" ADD CONSTRAINT "_MealToUserData_A_fkey" FOREIGN KEY ("A") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToUserData" ADD CONSTRAINT "_MealToUserData_B_fkey" FOREIGN KEY ("B") REFERENCES "UserData"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RotationToUserData" ADD CONSTRAINT "_RotationToUserData_A_fkey" FOREIGN KEY ("A") REFERENCES "Rotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RotationToUserData" ADD CONSTRAINT "_RotationToUserData_B_fkey" FOREIGN KEY ("B") REFERENCES "UserData"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

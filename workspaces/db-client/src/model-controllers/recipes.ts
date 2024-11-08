import { Ingredient, IngredientAmount, PrismaClient } from '@prisma/client';
import { ModelController } from './model_controller.js';

export type CreateIngredientAmount = Omit<
    IngredientAmount,
    'id' | 'instructionId' | 'ingredientName' | 'recipeId'
> & { ingredient: Ingredient };

export const SelectRecipe = {
    id: true,
    name: true,
    prepTimeSec: true,
    cookTimeSec: true,
    ingredientAmounts: {
        select: {
            amount: true,
            ingredient: true,
            unit: true,
        },
    },
    numServings: true,
    instructions: true,
    ownerId: true,
} satisfies Parameters<PrismaClient['recipe']['findUnique']>[0]['select'];

export type Recipe = Awaited<ReturnType<Recipes['getRecipe']>>;

export class Recipes extends ModelController {
    getAllRecipes() {
        return this.prisma.recipe.findMany({
            select: SelectRecipe,
        });
    }

    getRecipe(id: number) {
        return this.prisma.recipe.findUnique({
            where: {
                id,
            },
            select: SelectRecipe,
        });
    }

    createRecipe({
        name,
        ownerId,
        instructions,
        numServings,
        ingredientAmounts,
        prepTimeSec,
        cookTimeSec,
    }: {
        ownerId: string;
        name: string;
        instructions: string[];
        numServings: number;
        ingredientAmounts: CreateIngredientAmount[];
        prepTimeSec: number;
        cookTimeSec: number;
    }) {
        return this.prisma.$transaction(async () => {
            const recipe = await this.prisma.recipe.create({
                data: {
                    name,
                    numServings,
                    instructions,
                    prepTimeSec,
                    cookTimeSec,
                    owner: {
                        connect: {
                            id: ownerId,
                        },
                    },
                    userDatas: {
                        connect: {
                            userId: ownerId,
                        },
                    },
                },
            });

            await this.prisma.ingredient.createMany({
                data: ingredientAmounts.map((ia) => ia.ingredient),
                skipDuplicates: true,
            });

            await this.prisma.ingredientAmount.createMany({
                data: ingredientAmounts.map((ia) => ({
                    ingredientName: ia.ingredient.name,
                    amount: ia.amount,
                    unit: ia.unit,
                    recipeId: recipe.id,
                })),
            });

            return (await this.getRecipe(recipe.id))!;
        });
    }

    deleteRecipe(recipeId: number) {
        return this.prisma.recipe.delete({
            where: {
                id: recipeId,
            },
        });
    }

    saveRecipe({ recipeId, userId }: { recipeId: number; userId: string }) {
        return this.prisma.userData.update({
            where: {
                userId,
            },
            data: {
                recipes: {
                    connect: {
                        id: recipeId,
                    },
                },
            },
        });
    }
}

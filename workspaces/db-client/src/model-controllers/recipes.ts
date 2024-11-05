import { PrismaClient } from '@prisma/client';
import { CreateInstruction } from '../sbdb.js';
import { ModelController } from './model_controller.js';

export const SelectRecipe = {
    id: true,
    name: true,
    instructions: {
        select: {
            durationSec: true,
            ingredientAmounts: {
                select: {
                    amount: true,
                    ingredient: true,
                    unit: true,
                },
            },
            kind: true,
            text: true,
        },
    },
} satisfies Parameters<PrismaClient['recipe']['findUnique']>[0]['select'];

export class Recipes extends ModelController {
    getAllRecipes() {
        return this.prisma.recipe.findMany({
            include: {
                instructions: {
                    include: {
                        ingredientAmounts: {
                            include: {
                                ingredient: true,
                            },
                        },
                    },
                },
            },
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
        instructions,
        name,
        ownerEmail,
    }: {
        ownerEmail: string;
        name: string;
        instructions: CreateInstruction[];
    }) {
        return this.prisma.$transaction(async () => {
            const recipe = await this.prisma.recipe.create({
                data: {
                    name,
                    owner: {
                        connect: {
                            email: ownerEmail,
                        },
                    },
                    userDatas: {
                        connect: {
                            userEmail: ownerEmail,
                        },
                    },
                },
            });

            await this.prisma.ingredient.createMany({
                data: instructions.flatMap((instr) =>
                    instr.ingredientAmounts.map((ia) => ia.ingredient),
                ),
                skipDuplicates: true,
            });

            const instructionResults =
                await this.prisma.instruction.createManyAndReturn({
                    data: instructions.map((instruction) => ({
                        text: instruction.text,
                        durationSec: instruction.durationSec,
                        kind: instruction.kind,
                        recipeId: recipe.id,
                    })),
                });

            await this.prisma.ingredientAmount.createMany({
                data: instructionResults.flatMap((instr, idx) =>
                    instructions[idx].ingredientAmounts.map((ia) => ({
                        ingredientName: ia.ingredient.name,
                        amount: ia.amount,
                        unit: ia.unit,
                        instructionId: instr.id,
                    })),
                ),
            });

            return (await this.getRecipe(recipe.id))!;
        });
    }
}

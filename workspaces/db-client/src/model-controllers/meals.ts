import { ModelController } from './model_controller.js';
import { SelectRecipe } from './recipes.js';

export class Meals extends ModelController {
    getAllMeals() {
        return this.prisma.meal.findMany({
            select: {
                name: true,
                recipes: { select: SelectRecipe },
            },
        });
    }

    createMeal({
        ownerId,
        name,
        recipeIds,
    }: {
        ownerId: string;
        name: string;
        recipeIds: number[];
    }) {
        return this.prisma.meal.create({
            data: {
                name,
                owner: {
                    connect: {
                        id: ownerId,
                    },
                },
                recipes: {
                    connect: recipeIds.map((id) => ({ id })),
                },
                userDatas: {
                    connect: {
                        userId: ownerId,
                    },
                },
            },
        });
    }

    getMeal(mealId: number) {
        return this.prisma.meal.findUnique({
            where: {
                id: mealId,
            },
            select: {
                name: true,
                recipes: { select: SelectRecipe },
            },
        });
    }
}

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

    createMeal(ownerEmail: string, name: string, recipeIds: number[]) {
        return this.prisma.meal.create({
            data: {
                name,
                owner: {
                    connect: {
                        email: ownerEmail,
                    },
                },
                recipes: {
                    connect: recipeIds.map((id) => ({ id })),
                },
                userDatas: {
                    connect: {
                        userEmail: ownerEmail,
                    },
                },
            },
        });
    }
}

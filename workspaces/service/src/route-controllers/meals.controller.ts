import { SagebookDatabase } from '@sagebook/db-client';
import {
    Route,
    Controller,
    Post,
    Security,
    Body,
    Get,
    Path,
    Request,
    Delete,
    Put,
} from 'tsoa';
import { sagebookDb } from '../db.js';
import { SbRequest } from '../authentication.js';
import { Unpack } from '../helpers.js';

type CreateMealParams = Omit<
    Parameters<SagebookDatabase['meals']['createMeal']>[0],
    'ownerEmail'
>;

@Security('jwt')
@Route('meals')
export class MealController extends Controller {
    @Get()
    async getAllMeals() {
        const meals = await sagebookDb.meals.getAllMeals();
        return meals as Unpack<typeof meals>;
    }

    @Post()
    async createMeal(
        @Request() request: SbRequest,
        @Body() input: CreateMealParams,
    ) {
        const meal = await sagebookDb.meals.createMeal({
            ...input,
            ownerId: request.user.userId,
        });
        return meal as Unpack<typeof meal>;
    }

    @Get('{mealId}')
    async getMeal(@Path() mealId: number) {
        const meal = await sagebookDb.meals.getMeal(mealId);
        return meal as Unpack<typeof meal>;
    }

    @Delete('{mealId}')
    async deleteMeal(@Path() mealId: number, @Request() req: SbRequest) {
        const meal = await sagebookDb.meals.getMeal(mealId);
        if (!meal) {
            this.setStatus(400);
            return 'Invalid mealId';
        }

        if (meal.ownerId !== req.user.userId) {
            this.setStatus(400);
            return 'User not permissioned to delete this meal';
        }

        await sagebookDb.meals.deleteMeal(mealId);
        return 'Successfully deleted meal';
    }

    /**
     * Saves a meal to the user's account
     */
    @Put('{mealId}')
    async saveMeal(@Path() mealId: number, @Request() req: SbRequest) {
        const userData = await sagebookDb.meals.saveMeal({
            mealId,
            userId: req.user.userId,
        });
        return userData as Unpack<typeof userData>;
    }
}

import { SagebookDatabase } from '@sagebook/db-client';
import { JwtPayload } from 'jsonwebtoken';
import {
    Route,
    Controller,
    Post,
    Security,
    Body,
    Get,
    Path,
    Request,
} from 'tsoa';
import { getDb } from '../db.js';

type CreateMealParams = Omit<
    Parameters<SagebookDatabase['meals']['createMeal']>[0],
    'ownerEmail'
>;

@Route('meals')
export class MealController extends Controller {
    @Post()
    @Security('jwt')
    async createMeal(
        @Request() request: { user: JwtPayload },
        @Body() input: CreateMealParams,
    ) {
        const db = await getDb();

        return db.meals.createMeal({
            ...input,
            ownerId: request.user.email,
        });
    }

    @Get()
    async getAllMeals() {
        return (await getDb()).meals.getAllMeals();
    }

    @Get('{mealId}')
    async getMeal(@Path() mealId: number) {
        const db = await getDb();

        return db.meals.getMeal(mealId);
    }
}

import {
    Body,
    Controller,
    Post,
    Route,
    Security,
    Request,
    Get,
    Path,
} from 'tsoa';
import type { SagebookDatabase } from '@sagebook/db-client';
import { getDb } from '../db.js';
import { JwtPayload } from '../authentication.js';

type CreateRecipeParams = Omit<
    Parameters<SagebookDatabase['recipes']['createRecipe']>[0],
    'ownerEmail'
>;

@Route('recipes')
export class RecipeController extends Controller {
    @Post()
    @Security('jwt')
    async createRecipe(
        @Request() request: { user: JwtPayload },
        @Body() input: CreateRecipeParams,
    ) {
        const db = await getDb();

        return db.recipes.createRecipe({
            ...input,
            ownerEmail: request.user.email,
        });
    }

    @Get()
    async getAllRecipes() {
        return (await getDb()).recipes.getAllRecipes();
    }

    @Get('{recipeId}')
    async getRecipe(@Path() recipeId: number) {
        const db = await getDb();

        return db.recipes.getRecipe(recipeId);
    }
}

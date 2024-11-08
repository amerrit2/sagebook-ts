import {
    Body,
    Controller,
    Post,
    Route,
    Security,
    Request,
    Get,
    Path,
    Delete,
    Put,
} from 'tsoa';
import type { SagebookDatabase } from '@sagebook/db-client';
import { sagebookDb } from '../db.js';
import { JwtPayload, SbRequest } from '../authentication.js';
import { Unpack } from '../helpers.js';

type CreateRecipeParams = Omit<
    Parameters<SagebookDatabase['recipes']['createRecipe']>[0],
    'ownerEmail'
>;

@Security('jwt')
@Route('recipes')
export class RecipeController extends Controller {
    @Get()
    async getAllRecipes() {
        const recipes = await sagebookDb.recipes.getAllRecipes();
        return recipes as Unpack<typeof recipes>;
    }

    @Post()
    async createRecipe(
        @Request() request: { user: JwtPayload },
        @Body() input: CreateRecipeParams,
    ) {
        const recipe = await sagebookDb.recipes.createRecipe({
            ...input,
            ownerId: request.user.userId,
        });

        return recipe as Unpack<typeof recipe>;
    }

    @Get('{recipeId}')
    async getRecipe(@Path() recipeId: number) {
        const recipe = await sagebookDb.recipes.getRecipe(recipeId);
        return recipe as Unpack<typeof recipe>;
    }

    @Delete('{recipeId}')
    async deleteRecipe(@Path() recipeId: number, @Request() req: SbRequest) {
        const recipe = await sagebookDb.recipes.getRecipe(recipeId);

        if (!recipe) {
            this.setStatus(400);
            return 'Invalid recipeId';
        }

        if (recipe.ownerId !== req.user.userId) {
            this.setStatus(400);
            return 'User not permissioned to delete recipe';
        }

        await sagebookDb.recipes.deleteRecipe(recipeId);
        return 'Successfully deleted recipe';
    }

    @Put('{recipeId}')
    async saveRecipe(@Path() recipeId: number, @Request() req: SbRequest) {
        const userData = await sagebookDb.recipes.saveRecipe({
            recipeId,
            userId: req.user.userId,
        });

        return userData as Unpack<typeof userData>;
    }
}

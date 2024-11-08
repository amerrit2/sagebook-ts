import { PrismaClient } from '@prisma/client';
import { Recipes } from './model-controllers/recipes.js';
import { Rotations } from './model-controllers/rotations.js';
import { Meals } from './model-controllers/meals.js';
import { Users } from './model-controllers/users.js';

export class SagebookDatabase {
    #prisma = new PrismaClient();

    get prisma() {
        return this.#prisma;
    }

    recipes = new Recipes(this.#prisma);
    meals = new Meals(this.#prisma);
    rotations = new Rotations(this.#prisma);
    users = new Users(this.#prisma);
}

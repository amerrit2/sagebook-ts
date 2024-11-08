import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ChildProcess, spawn } from 'node:child_process';
import { SagebookDatabase } from '../sbdb.js';
import { resolve } from 'node:path';
import { CreateFrequency } from '../model-controllers/rotations.js';
import { $Enums } from '@prisma/client';
import { Recipe } from '../model-controllers/recipes.js';

describe('sbdb', () => {
    let dbContainer: ChildProcess | undefined;
    let db: SagebookDatabase;

    beforeAll(async () => {
        dbContainer = spawn('docker compose up db', {
            cwd: resolve(__dirname, '..', '..'),
            shell: true,
        });

        dbContainer.stdout?.pipe(process.stdout);
        dbContainer.stderr?.pipe(process.stderr);
        db = new SagebookDatabase();

        await db.prisma.ingredientAmount.deleteMany();
        await db.prisma.ingredient.deleteMany();
        await db.prisma.meal.deleteMany();
        await db.prisma.recipe.deleteMany();
        await db.prisma.frequency.deleteMany();
        await db.prisma.rotation.deleteMany();
        await db.prisma.userData.deleteMany();
        await db.prisma.user.deleteMany();
    });

    afterAll(() => {
        dbContainer?.kill();
    });

    it('should create and verify a user', async () => {
        await db.users.createUser('bob@email.com', 'bobsPassword');

        await expect(
            db.users.verifyUser('bob@email.com', 'bobsPassword'),
        ).resolves.toBeTypeOf('string');
    });

    it('should fail to verify a user', async () => {
        await db.users.createUser('alice@email.com', 'alicesPassword');

        await expect(
            db.users.verifyUser('alice@email.com', 'wrong'),
        ).resolves.toBe(null);
    });

    it("should fail when user doesn't exist", async () => {
        await expect(
            db.users.verifyUser('non-existent@whatever.com', 'heyo'),
        ).resolves.toBe(null);
    });

    describe('With Carol', () => {
        let carol: string;
        beforeAll(async () => {
            carol = await db.users.createUser(
                'carol@email.com',
                'carolsPassword',
            );
        });

        it('should create and get a recipe', async () => {
            const instructions = [
                'Fill a large bowl with about 2 cups of ice and 3 cups of water',
                'Bring large pot of water to a boil',
                'Using a slotted spoon or tongs, gently lower eggs, one at a ' +
                    'time, into water. Return to a boil, cover, and reduce heat to ' +
                    'medium-low. Cook for 12 minutes.',
                'Transfer eggs to ice water.  Let sit for about 30 seconds',
            ];

            const ingredientAmounts = [
                {
                    ingredient: {
                        name: 'Ice',
                        dietaryRestrictions: [],
                    },
                    amount: 2,
                    unit: $Enums.Unit.cup,
                },
                {
                    ingredient: {
                        name: 'Water',
                        dietaryRestrictions: [],
                    },
                    amount: 11,
                    unit: $Enums.Unit.cup,
                },
                {
                    ingredient: {
                        name: 'Eggs',
                        dietaryRestrictions: [],
                    },
                    amount: 2,
                    unit: $Enums.Unit.unit,
                },
            ];

            const recipe = await db.recipes.createRecipe({
                ownerId: carol,
                name: "Carol's hard boiled eggs",
                instructions,
                cookTimeSec: 18 * 60,
                prepTimeSec: 5 * 60,
                ingredientAmounts,
                numServings: 1,
            });

            await expect(
                recipe && db.recipes.getRecipe(recipe.id),
            ).resolves.toEqual({
                id: recipe.id,
                name: "Carol's hard boiled eggs",
                instructions,
                cookTimeSec: 18 * 60,
                prepTimeSec: 5 * 60,
                numServings: 1,
                ingredientAmounts,
                ownerId: carol,
            } satisfies Awaited<
                ReturnType<(typeof db)['recipes']['getRecipe']>
            >);

            await expect(db.users.getUserData(carol)).resolves.toEqual({
                meals: [],
                rotations: [],
                recipes: [
                    {
                        id: recipe.id,
                        name: "Carol's hard boiled eggs",
                        instructions,
                        cookTimeSec: 18 * 60,
                        prepTimeSec: 5 * 60,
                        numServings: 1,
                        ingredientAmounts,
                        ownerId: carol,
                    },
                ] satisfies Recipe[],
            });
        });

        it('should fail to create a meal with invalid recipes', async () => {
            await expect(() =>
                db.meals.createMeal({
                    ownerId: carol,
                    name: "Carol's first meal",
                    recipeIds: [1234, 14534],
                }),
            ).rejects.toThrow();
        });

        it('should create a meal with a new recipe', async () => {
            const instructions = ['Just stand around'];
            const fooIngredients = [
                {
                    amount: 2,
                    ingredient: {
                        name: 'Air',
                        dietaryRestrictions: [],
                    },
                    unit: $Enums.Unit.gallon,
                },
            ];

            const foo = await db.recipes.createRecipe({
                ownerId: carol,
                name: 'Foo',
                instructions: instructions,
                cookTimeSec: 10,
                prepTimeSec: 10,
                ingredientAmounts: fooIngredients,
                numServings: 1,
            });

            const bar = await db.recipes.createRecipe({
                ownerId: carol,
                name: 'Bar',
                instructions: instructions,
                cookTimeSec: 10,
                prepTimeSec: 10,
                ingredientAmounts: [],
                numServings: 0,
            });

            await db.meals.createMeal({
                ownerId: carol,
                name: 'Foobar',
                recipeIds: [foo.id, bar.id],
            });

            await expect(db.meals.getAllMeals()).resolves.toEqual([
                {
                    name: 'Foobar',
                    ownerId: carol,
                    recipes: [
                        {
                            id: foo.id,
                            name: 'Foo',
                            instructions,
                            cookTimeSec: 10,
                            prepTimeSec: 10,
                            ingredientAmounts: fooIngredients,
                            numServings: 1,
                            ownerId: carol,
                        },
                        {
                            id: bar.id,
                            name: 'Bar',
                            instructions,
                            cookTimeSec: 10,
                            ingredientAmounts: [],
                            numServings: 0,
                            prepTimeSec: 10,
                            ownerId: carol,
                        },
                    ] satisfies Awaited<
                        ReturnType<typeof db.recipes.getRecipe>
                    >[],
                },
            ]);
        });

        it('should create a rotation with a new meal and recipe', async () => {
            const bazInstructions = ['Just dally about'];

            const baz = await db.recipes.createRecipe({
                ownerId: carol,
                name: 'Baz',
                instructions: bazInstructions,
                cookTimeSec: 1,
                prepTimeSec: 1,
                ingredientAmounts: [],
                numServings: 0,
            });

            const meal = await db.meals.createMeal({
                ownerId: carol,
                name: 'BazMeal',
                recipeIds: [baz.id],
            });

            const rotationFreqs = [
                {
                    kind: 'cook',
                    value: 3,
                },
                {
                    kind: 'eatOut',
                    value: 1,
                },
                {
                    kind: 'eatLeftovers',
                    value: 1,
                },
                {
                    kind: 'orderIn',
                    value: 2,
                },
            ] satisfies CreateFrequency[];

            const rotation = await db.rotations.createRotation({
                ownerId: carol,
                name: "Carol's first rotation",
                mealIds: [meal.id],
                frequencies: rotationFreqs,
                servingsPerMeal: 1,
            });

            await expect(
                db.rotations.getRotation(rotation.id),
            ).resolves.toEqual({
                name: "Carol's first rotation",
                frequencies: rotationFreqs,
                ownerId: carol,
                meals: [
                    {
                        name: 'BazMeal',
                        recipes: [
                            {
                                id: baz.id,
                                name: 'Baz',
                                instructions: bazInstructions,
                                cookTimeSec: 1,
                                prepTimeSec: 1,
                                ingredientAmounts: [],
                                numServings: 0,
                                ownerId: carol,
                            },
                        ] satisfies Recipe[],
                    },
                ],
            });
        });
    });
});

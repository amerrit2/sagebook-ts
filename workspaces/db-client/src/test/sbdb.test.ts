import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ChildProcess, spawn } from 'node:child_process';
import { CreateInstruction, SagebookDatabase } from '../sbdb.js';
import { resolve } from 'node:path';
import { CreateFrequency } from '../model-controllers/rotations.js';

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

        db = await SagebookDatabase.connect();

        await db.prisma.ingredientAmount.deleteMany();
        await db.prisma.ingredient.deleteMany();
        await db.prisma.instruction.deleteMany();
        await db.prisma.meal.deleteMany();
        await db.prisma.recipe.deleteMany();
        await db.prisma.frequency.deleteMany();
        await db.prisma.rotation.deleteMany();
        await db.prisma.userData.deleteMany();
        await db.prisma.user.deleteMany();
    });

    afterAll(async () => {
        await db.close();
        dbContainer?.kill();
    });

    it('should create and verify a user', async () => {
        await db.createUser('bob@email.com', 'bobsPassword');

        expect(await db.verifyUser('bob@email.com', 'bobsPassword')).toBe(true);
    });

    it('should fail to verify a user', async () => {
        await db.createUser('alice@email.com', 'alicesPassword');

        await expect(db.verifyUser('alice@email.com', 'wrong')).resolves.toBe(
            false,
        );
    });

    it("should fail when user doesn't exist", async () => {
        await expect(
            db.verifyUser('non-existent@whatever.com', 'heyo'),
        ).resolves.toBe(false);
    });

    describe('With Carol', () => {
        const carol = 'carol@email.com';
        beforeAll(async () => {
            await db.createUser(carol, 'carolsPassword');
        });

        it('should create and get a recipe', async () => {
            const instructions: CreateInstruction[] = [
                {
                    text: 'Fill a large bowl with about 2 cups of ice and 3 cups of water',
                    kind: 'combine',
                    durationSec: 1 * 60,
                    ingredientAmounts: [
                        {
                            ingredient: { name: 'Ice' },
                            amount: 2,
                            unit: 'cup',
                        },
                        {
                            ingredient: { name: 'Water' },
                            amount: 3,
                            unit: 'cup',
                        },
                    ],
                },
                {
                    text: 'Bring large pot of water to a boil',
                    durationSec: 5 * 60,
                    kind: 'boil',
                    ingredientAmounts: [
                        {
                            ingredient: { name: 'Water' },
                            amount: 2,
                            unit: 'quart',
                        },
                    ],
                },
                {
                    text:
                        'Using a slotted spoon or tongs, gently lower eggs, one at a ' +
                        'time, into water. Return to a boil, cover, and reduce heat to ' +
                        'medium-low. Cook for 12 minutes.',
                    durationSec: 12 * 60,
                    kind: 'boil',
                    ingredientAmounts: [
                        {
                            ingredient: { name: 'Eggs' },
                            amount: 2,
                            unit: 'unit',
                        },
                    ],
                },
                {
                    text: 'Transfer eggs to ice water.  Let sit for about 30 seconds',
                    durationSec: 30,
                    kind: 'combine',
                    ingredientAmounts: [],
                },
            ];

            const recipe = await db.recipes.createRecipe({
                ownerEmail: carol,
                name: "Carol's hard boiled eggs",
                instructions,
            });

            await expect(
                recipe && db.recipes.getRecipe(recipe.id),
            ).resolves.toEqual({
                name: "Carol's hard boiled eggs",
                instructions,
                id: recipe.id,
            });

            await expect(db.getUserData(carol)).resolves.toEqual({
                meals: [],
                rotations: [],
                recipes: [
                    {
                        name: "Carol's hard boiled eggs",
                        instructions,
                        id: recipe.id,
                    },
                ],
            });
        });

        it('should fail to create a meal with invalid recipes', async () => {
            await expect(() =>
                db.meals.createMeal(carol, "Carol's first meal", [1234, 14534]),
            ).rejects.toThrow();
        });

        it('should create a meal with a new recipe', async () => {
            const fooInstructions = [
                {
                    durationSec: 1,
                    kind: 'wait',
                    text: 'Just stand around',
                    ingredientAmounts: [
                        {
                            amount: 2,
                            ingredient: {
                                name: 'Air',
                            },
                            unit: 'gallon',
                        },
                    ],
                },
            ] satisfies CreateInstruction[];

            const foo = await db.recipes.createRecipe({
                ownerEmail: carol,
                name: 'Foo',
                instructions: fooInstructions,
            });

            const barInstructions = [
                {
                    durationSec: 2,
                    kind: 'wait',
                    text: 'Just stand around',
                    ingredientAmounts: [],
                },
            ] satisfies CreateInstruction[];

            const bar = await db.recipes.createRecipe({
                ownerEmail: carol,
                name: 'Bar',
                instructions: barInstructions,
            });

            await db.meals.createMeal(carol, 'Foobar', [foo.id, bar.id]);

            await expect(db.meals.getAllMeals()).resolves.toEqual([
                {
                    name: 'Foobar',
                    recipes: [
                        {
                            id: foo.id,
                            name: 'Foo',
                            instructions: fooInstructions,
                        },
                        {
                            id: bar.id,
                            name: 'Bar',
                            instructions: barInstructions,
                        },
                    ],
                },
            ]);
        });

        it('should create a rotation with a new meal and recipe', async () => {
            const bazInstructions = [
                {
                    durationSec: 1,
                    ingredientAmounts: [],
                    kind: 'dally',
                    text: 'Just dally about',
                },
            ];

            const baz = await db.recipes.createRecipe({
                ownerEmail: carol,
                name: 'Baz',
                instructions: bazInstructions,
            });

            const meal = await db.meals.createMeal(carol, 'BazMeal', [baz.id]);

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

            const rotation = await db.rotations.createRotation(
                carol,
                "Carol's first rotation",
                [meal.id],
                rotationFreqs,
            );

            await expect(
                db.rotations.getRotation(rotation.id),
            ).resolves.toEqual({
                name: "Carol's first rotation",
                frequencies: rotationFreqs,
                meals: [
                    {
                        name: 'BazMeal',
                        recipes: [
                            {
                                id: baz.id,
                                name: 'Baz',
                                instructions: bazInstructions,
                            },
                        ],
                    },
                ],
            });
        });
    });
});

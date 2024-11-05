import {
    Ingredient,
    IngredientAmount,
    Instruction,
    PrismaClient,
} from '@prisma/client';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { validatePassword } from './validation.js';
import { Recipes, SelectRecipe } from './model-controllers/recipes.js';
import { Rotations } from './model-controllers/rotations.js';
import { Meals } from './model-controllers/meals.js';

export type CreateIngredientAmount = Omit<
    IngredientAmount,
    'id' | 'instructionId' | 'ingredientName'
> & { ingredient: Ingredient };
export type CreateInstruction = Omit<Instruction, 'recipeId' | 'id'> & {
    ingredientAmounts: CreateIngredientAmount[];
};

export class SagebookDatabase {
    #prisma = new PrismaClient();

    private constructor() {}

    get prisma() {
        return this.#prisma;
    }

    recipes = new Recipes(this.#prisma);
    meals = new Meals(this.#prisma);
    rotations = new Rotations(this.#prisma);

    static async connect(timeoutMs = 5000) {
        const sbdb = new this();
        const end = Date.now() + timeoutMs;
        while (Date.now() < end) {
            try {
                await sbdb.#prisma.$connect();
                break;
            } catch {
                await new Promise((a) => setTimeout(a, 20));
            }
        }
        return sbdb;
    }

    async close() {
        await this.#prisma.$disconnect();
    }

    async createUser(email: string, password: string) {
        validatePassword(password);

        const passwordSalt = randomBytes(16);
        const passwordHash = await new Promise<Buffer>((a, r) => {
            scrypt(password, passwordSalt, 64, (err, hash) => {
                if (err) {
                    r(err);
                } else {
                    a(hash);
                }
            });
        });

        await this.#prisma.userData.create({
            data: {
                user: {
                    create: {
                        email,
                        passwordHash,
                        passwordSalt,
                    },
                },
            },
        });
    }

    async verifyUser(email: string, password: string) {
        const user = await this.#prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return false;
        }

        const newHash = await new Promise<Buffer>((a, r) => {
            scrypt(password, user.passwordSalt, 64, (err, hash) => {
                if (err) {
                    r(err);
                } else {
                    a(hash);
                }
            });
        });

        if (timingSafeEqual(newHash, user.passwordHash)) {
            return true;
        }
        return false;
    }

    getUsers() {
        return this.#prisma.user.findMany({
            select: {
                _count: true,
                email: true,
            },
        });
    }

    getUser(email: string) {
        return this.#prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                email: true,
            },
        });
    }

    getUserData(email: string) {
        return this.#prisma.userData.findUnique({
            where: {
                userEmail: email,
            },
            select: {
                meals: {
                    select: {
                        id: true,
                        name: true,
                        recipes: true,
                    },
                },
                recipes: {
                    select: SelectRecipe,
                },
                rotations: {
                    select: {
                        name: true,
                        id: true,
                        frequencies: true,
                        meals: true,
                    },
                },
            },
        });
    }
}

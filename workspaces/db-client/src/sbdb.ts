import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { validatePassword } from './validation.js';
import { Recipes, SelectRecipe } from './model-controllers/recipes.js';
import { Rotations } from './model-controllers/rotations.js';
import { Meals } from './model-controllers/meals.js';

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

    /**
     * @returns userId of the newly created user
     */
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

        const user = await this.#prisma.userData.create({
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

        return user.userId;
    }

    /**
     * @returns null if invalid, otherwise userid
     */
    async verifyUser(email: string, password: string) {
        const user = await this.#prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return null;
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
            return user.id;
        }
        return null;
    }

    getUsers() {
        return this.#prisma.user.findMany({
            select: {
                _count: true,
                email: true,
                id: true,
            },
        });
    }

    getUser(id: string) {
        return this.#prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                email: true,
            },
        });
    }

    getUserData(userId: string) {
        return this.#prisma.userData.findUnique({
            where: {
                userId,
            },
            select: {
                meals: {
                    select: {
                        id: true,
                        name: true,
                        recipes: { select: SelectRecipe },
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

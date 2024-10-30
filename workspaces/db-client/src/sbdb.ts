import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { validatePassword } from './validation';

export class SagebookDatabase {
    #prisma = new PrismaClient();

    private constructor() {}

    get prisma() {
        return this.#prisma;
    }

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

        await this.#prisma.user.create({
            data: {
                email,
                passwordHash,
                passwordSalt,
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

    async getUsers() {
        return await this.#prisma.user.findMany();
    }
}

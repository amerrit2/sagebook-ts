import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ChildProcess, spawn } from 'node:child_process';
import { SagebookDatabase } from '../sbdb.js';
import { resolve } from 'node:path';

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
});

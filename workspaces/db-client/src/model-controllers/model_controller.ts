import { PrismaClient } from '@prisma/client';

export abstract class ModelController {
    constructor(protected prisma: PrismaClient) {}
}

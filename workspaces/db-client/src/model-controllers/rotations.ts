import { Frequency } from '@prisma/client';
import { SelectRecipe } from './recipes.js';
import { ModelController } from './model_controller.js';

export type CreateFrequency = Omit<Frequency, 'id' | 'rotationId'>;

export class Rotations extends ModelController {
    getAllRotations() {
        return this.prisma.rotation.findMany({
            select: {
                name: true,
                frequencies: {
                    select: {
                        kind: true,
                        value: true,
                    },
                },
                meals: {
                    select: {
                        name: true,
                        recipes: { select: SelectRecipe },
                    },
                },
            },
        });
    }

    getRotation(rotationId: number) {
        return this.prisma.rotation.findUnique({
            where: {
                id: rotationId,
            },
            select: {
                name: true,
                frequencies: {
                    select: {
                        kind: true,
                        value: true,
                    },
                },
                meals: {
                    select: {
                        name: true,
                        recipes: { select: SelectRecipe },
                    },
                },
            },
        });
    }

    createRotation(
        ownerEmail: string,
        name: string,
        mealIds: number[],
        frequencies: CreateFrequency[],
    ) {
        return this.prisma.rotation.create({
            data: {
                name,
                owner: {
                    connect: {
                        email: ownerEmail,
                    },
                },
                frequencies: {
                    createMany: {
                        data: frequencies.map((freq) => ({
                            kind: freq.kind,
                            value: freq.value,
                        })),
                    },
                },
                meals: {
                    connect: mealIds.map((id) => ({ id })),
                },
                userData: {
                    connect: {
                        userEmail: ownerEmail,
                    },
                },
            },
        });
    }
}

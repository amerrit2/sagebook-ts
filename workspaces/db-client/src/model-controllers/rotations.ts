import { Frequency } from '@prisma/client';
import { SelectRecipe } from './recipes.js';
import { ModelController } from './model_controller.js';

export type CreateFrequency = Omit<Frequency, 'id' | 'rotationId'>;
export interface CreateRotation {
    ownerId: string;
    name: string;
    mealIds: number[];
    frequencies: CreateFrequency[];
    servingsPerMeal: number;
}

export class Rotations extends ModelController {
    getAllRotations() {
        return this.prisma.rotation.findMany({
            select: {
                name: true,
                ownerId: true,
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
                ownerId: true,
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

    createRotation({
        ownerId,
        name,
        mealIds,
        frequencies,
        servingsPerMeal,
    }: CreateRotation) {
        return this.prisma.rotation.create({
            data: {
                name,
                servingsPerMeal,
                owner: {
                    connect: {
                        id: ownerId,
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
                        userId: ownerId,
                    },
                },
            },
        });
    }

    deleteRotation(rotationId: number) {
        return this.prisma.rotation.delete({
            where: {
                id: rotationId,
            },
        });
    }

    saveRotation({
        rotationId,
        userId,
    }: {
        rotationId: number;
        userId: string;
    }) {
        return this.prisma.userData.update({
            where: {
                userId,
            },
            data: {
                rotations: {
                    connect: {
                        id: rotationId,
                    },
                },
            },
        });
    }
}

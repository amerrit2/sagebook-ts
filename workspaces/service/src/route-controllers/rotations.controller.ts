import {
    Request,
    Controller,
    Delete,
    Get,
    Query,
    Route,
    Security,
    Path,
    Post,
    Body,
    Put,
} from 'tsoa';
import { sagebookDb } from '../db.js';
import { SbRequest } from '../authentication.js';
import { CreateRotation } from '@sagebook/db-client';

@Security('jwt')
@Route('rotations')
export class RotationsController extends Controller {
    @Get()
    async getRotation(@Query() id: number) {
        const rotation = await sagebookDb.rotations.getRotation(id);
        return rotation;
    }

    /**
     * Create a rotation
     */
    @Post()
    async createRotation(
        @Body() rotationInput: Omit<CreateRotation, 'ownerId'>,
        @Request() req: SbRequest,
    ) {
        const rotation = await sagebookDb.rotations.createRotation({
            ownerId: req.user.userId,
            ...rotationInput,
        });

        return rotation;
    }

    @Delete('{rotationId}')
    async deleteRotation(
        @Path() rotationId: number,
        @Request() req: SbRequest,
    ) {
        const rotation = await sagebookDb.rotations.getRotation(rotationId);

        if (!rotation) {
            this.setStatus(400);
            return 'Invalid rotationId';
        }

        if (rotation.ownerId !== req.user.userId) {
            this.setStatus(400);
            return 'User not permissioned to delete rotation';
        }

        await sagebookDb.rotations.deleteRotation(rotationId);
        return 'Successfully deleted rotation';
    }

    @Put('{rotationId}')
    async saveRotation(@Path() rotationId: number, @Request() req: SbRequest) {
        const rotation = await sagebookDb.rotations.saveRotation({
            rotationId,
            userId: req.user.userId,
        });

        return rotation;
    }
}

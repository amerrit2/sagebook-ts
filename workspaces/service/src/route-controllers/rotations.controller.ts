import { Rotation } from '@sagebook/db-client';
import { Controller, Get, Query, Route, Security } from 'tsoa';
import { getDb } from '../db.js';

@Route('rotations')
export class RotationsController extends Controller {
    @Security('jwt')
    @Get()
    public async getRotation(@Query() id: number) {
        const db = await getDb();
        return db.rotations.getRotation(id);
    }
}

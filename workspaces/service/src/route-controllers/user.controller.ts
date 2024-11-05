import { getDb } from '../db.js';
import { Body, Controller, Get, Post, Route, Security, Request } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { JwtPayload, signJwt } from '../authentication.js';

@Route('user')
export class UserController extends Controller {
    /**
     * Retreives a user's data
     */
    @Security('jwt')
    @Get()
    public async getUserData(
        @Request() req: ExpressRequest & { user: JwtPayload },
    ) {
        const db = await getDb();
        return db.getUserData(req.user.email);
    }

    /**
     * Creates a new user and creates session jwt
     */
    @Post('create')
    public async createUser(
        @Body() requestBody: { email: string; password: string },
    ) {
        await (
            await getDb()
        ).createUser(requestBody.email, requestBody.password);

        const token = signJwt({
            email: requestBody.email,
        });

        this.setHeader('Set-Cookie', `x-access-token=${token}`);
        return 'Success';
    }
}

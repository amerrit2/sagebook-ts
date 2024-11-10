import { Body, Controller, Get, Post, Route, Security, Request } from 'tsoa';
import { SbRequest, signJwt } from '../authentication.js';
import { sagebookDb } from '../db.js';

@Route('user')
export class UserController extends Controller {
    /**
     * Retreives a user's data
     */
    @Security('jwt')
    @Get()
    async getUserData(@Request() req: SbRequest) {
        const userData = await sagebookDb.users.getUserData(req.user.userId);

        return userData;
    }
    /**
     * Creates a new user and creates session jwt
     */
    @Post('create')
    async createUser(@Body() requestBody: { email: string; password: string }) {
        const userId = await sagebookDb.users.createUser(
            requestBody.email,
            requestBody.password,
        );
        const token = signJwt({
            userId,
        });

        this.setHeader('Set-Cookie', `x-access-token=${token}`);
        return 'Success';
    }
}

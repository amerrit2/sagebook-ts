import {
    Body,
    Controller,
    Get,
    Post,
    Route,
    Security,
    Request,
    Response,
} from 'tsoa';
import { SbRequest, signJwt } from '../authentication.js';
import { sagebookDb } from '../db.js';
import { SagebookError } from '../errors.js';

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
    @Response<SagebookError>(400, 'Invalid Credentials')
    async createUser(
        @Body() requestBody: { email: string; password: string },
    ): Promise<{ token: string }> {
        let userId;
        try {
            userId = await sagebookDb.users.createUser(
                requestBody.email,
                requestBody.password,
            );
        } catch (e: any) {
            throw new SagebookError(400, e.message);
        }

        const token = signJwt({
            userId,
        });

        this.setHeader('Set-Cookie', `x-access-token=${token}`);
        return { token };
    }
}

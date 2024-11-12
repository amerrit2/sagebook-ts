import {
    Body,
    Controller,
    Header,
    Post,
    Route,
    Response,
    SuccessResponse,
    Produces,
    Res,
} from 'tsoa';
import { sagebookDb } from '../db.js';
import { signJwt } from '../authentication.js';
import { Response as ExResponse } from 'express';
import { SagebookError } from '../errors.js';

interface LoginBody {
    email: string;
    password: string;
}

@Route('login')
export class LoginController extends Controller {
    /**
     * Success response will send token in body
     */
    @Post()
    @Response<SagebookError>(401, 'Invalid Credentials')
    public async login(@Body() body: LoginBody): Promise<{ token: string }> {
        console.log('Verifying: ', {
            email: body.email,
            password: body.password,
        });
        let userId: string | null;
        if (
            !(userId = await sagebookDb.users.verifyUser(
                body.email,
                body.password,
            ))
        ) {
            console.log('no go!');
            throw new SagebookError(401, 'Invalid Credentials');
        }

        console.log('Go');
        const token = signJwt({
            userId,
        });

        this.setHeader('Set-Cookie', `x-access-token=${token}`);
        return { token };
    }
}

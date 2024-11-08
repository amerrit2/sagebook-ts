import { Body, Controller, Post, Route } from 'tsoa';
import { sagebookDb } from '../db.js';
import { signJwt } from '../authentication.js';

interface LoginBody {
    email: string;
    password: string;
}

@Route('login')
export class LoginController extends Controller {
    @Post()
    public async login(@Body() body: LoginBody) {
        let userId: string | null;
        if (
            !(userId = await sagebookDb.users.verifyUser(
                body.email,
                body.password,
            ))
        ) {
            this.setStatus(401);
            return 'Invalid login credentials';
        }

        const token = signJwt({
            userId,
        });

        this.setHeader('Set-Cookie', `x-access-token=${token}`);
        return 'Success';
    }
}

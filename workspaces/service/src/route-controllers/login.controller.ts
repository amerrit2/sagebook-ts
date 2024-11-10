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
            this.setStatus(401);
            return 'Invalid login credentials';
        }

        console.log('Go');
        const token = signJwt({
            userId,
        });

        this.setHeader('Set-Cookie', `x-access-token=${token}`);
        return 'Success';
    }
}

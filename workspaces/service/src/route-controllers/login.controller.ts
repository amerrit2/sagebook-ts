import { Body, Controller, Post, Route } from 'tsoa';
import { getDb } from '../db.js';
import jwt from 'jsonwebtoken';
import { signJwt } from '../authentication.js';

interface LoginBody {
    email: string;
    password: string;
}

@Route('login')
export class LoginController extends Controller {
    @Post()
    public async login(@Body() body: LoginBody) {
        const db = await getDb();
        if (!(await db.verifyUser(body.email, body.password))) {
            this.setStatus(401);
            return 'Invalid login credentials';
        }

        const token = signJwt({
            email: body.email,
        });

        this.setHeader('Set-Cookie', `x-access-token=${token}`);
        return 'Success';
    }
}

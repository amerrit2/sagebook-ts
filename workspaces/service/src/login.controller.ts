import { Body, Controller, Post, Route } from 'tsoa';
import { getDb } from './db.js';
import jwt from 'jsonwebtoken';

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

        // TODO put jwt functions in own file, return promises
        const token = jwt.sign(
            {
                email: body.email,
            },
            process.env.TOKEN_SECRET!, // todo - remove non-null
            {
                issuer: 'localhost',
                audience: 'sagebook-app',
            },
        );

        this.setStatus(200);
        this.setHeader('Set-Cookie', `token=${token}`);
        return;
    }
}

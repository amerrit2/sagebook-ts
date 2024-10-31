import { getDb } from './db.js';
import {
    Body,
    Controller,
    Get,
    Path,
    Post,
    Route,
    Security,
    SuccessResponse,
} from 'tsoa';

@Route('users')
export class UsersController extends Controller {
    /**
     * Retreives a user
     */
    @Security('jwt')
    @Get('{email}')
    public async getUser(@Path() email: string) {
        return (await getDb()).getUser(email);
    }

    /**
     * Creates a new user
     */
    @SuccessResponse('201', 'Created')
    @Post()
    public async createUser(
        @Body() requestBody: { email: string; password: string },
    ) {
        this.setStatus(201);
        await (
            await getDb()
        ).createUser(requestBody.email, requestBody.password);
    }
}

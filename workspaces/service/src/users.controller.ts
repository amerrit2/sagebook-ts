import { getDb } from './db.js';
import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Route,
    Security,
    SuccessResponse,
} from 'tsoa';

@Route('users')
export class UsersController extends Controller {
    /**
     * Retreives a user
     */
    // @Security('jwt')ß
    @Get()
    public async getUsers(@Query() email?: string) {
        const db = await getDb();
        return email ? db.getUser(email) : db.getUsers();
    }

    /**
     * Creates a new user
     */
    @SuccessResponse('201', 'Created')    
    @Post('create')
    public async createUser(
        @Body() requestBody: { email: string; password: string },
    ) {
        this.setStatus(201);
        await (
            await getDb()
        ).createUser(requestBody.email, requestBody.password);
    }
}

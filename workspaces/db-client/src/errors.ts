export class InvlaidUsernamePasswordError extends Error {
    constructor() {
        super('Invlaid username or password');
    }
}

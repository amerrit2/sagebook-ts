export class SagebookError extends Error {
    constructor(
        public code: number,
        details: string,
    ) {
        super(details);
    }
}

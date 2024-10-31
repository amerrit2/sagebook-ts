import * as express from 'express';
import * as jwt from 'jsonwebtoken';

export function expressAuthentication(
    request: express.Request,
    _: string,
    scopes?: string[],
) {
    const token =
        request.body.token ||
        request.query.token ||
        request.headers['x-access-token'];

    return new Promise((resolve, reject) => {
        if (!token) {
            reject(new Error('No token provided'));
        }
        jwt.verify(
            token,
            process.env.TOKEN_SECRET!,
            {
                issuer: 'localhost',
                audience: 'sagebook-app',
            },
            function (err: any, decoded: any) {
                if (err) {
                    reject(err);
                } else {
                    // Check if JWT contains all required scopes
                    for (const scope of scopes || []) {
                        if (!decoded.scopes.includes(scope)) {
                            reject(
                                new Error(
                                    'JWT does not contain required scope.',
                                ),
                            );
                        }
                    }
                    resolve(decoded);
                }
            },
        );
    });
}

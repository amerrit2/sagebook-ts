import assert from 'node:assert';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
    userId: string;
}

export type SbRequest = Request & { user: JwtPayload };

export function signJwt(payload: JwtPayload) {
    // todo -  (get from another file that asserts at service startup)
    assert(process.env.TOKEN_SECRET);
    return jwt.sign(payload, process.env.TOKEN_SECRET, {
        issuer: 'sagebook-service',
        audience: 'sagebook-app',
    });
}

/**
 *  See https://tsoa-community.github.io/docs/authentication.html
 *
 *  'expressAuthentication' is a special named export expected by tsoa
 *
 *  The resolved return value of this function is set on request.user for all handlers
 *
 */
export function expressAuthentication(
    request: Request,
    _: string,
    scopes?: string[],
) {
    const token =
        request.headers['x-access-token'] || request.cookies['x-access-token'];

    return new Promise((resolve, reject) => {
        assert(process.env.TOKEN_SECRET);
        if (!token) {
            reject(new Error('No token provided'));
        }
        jwt.verify(
            token,
            process.env.TOKEN_SECRET,
            {
                issuer: 'sagebook-service',
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

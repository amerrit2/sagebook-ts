import { json, urlencoded } from 'express';
import * as express from 'express';
import { RegisterRoutes } from './tsoa/routes.js';
import Spec from './tsoa/openapi.json' with { type: 'json' };
import * as SwaggerUi from 'swagger-ui-express';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { configDotenv } from 'dotenv';
import cookieParser from 'cookie-parser';
import expressWinston from 'express-winston';
import { transports, format } from 'winston';
import { resolve } from 'node:path';

configDotenv({
    path: resolve(import.meta.dirname, '..', '.env'),
});

const app: express.Application = (express as any).default();

app.use(
    expressWinston.logger({
        transports: [new transports.Console()],
        format: format.combine(format.colorize(), format.json()),
        meta: true, // optional: control whether you want to log the meta data about the request (default to true)
        msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
        expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
        colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
        ignoreRoute: function (req, res) {
            return false;
        }, // optional: allows to skip some log messages based on request and/or response
    }),
);
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cookieParser());
app.use('/openapi.json', (req, res) => {
    res.sendFile(resolve(import.meta.dirname, 'tsoa', 'swagger.json'));
});

app.use(
    '/api-docs',
    SwaggerUi.serve,
    SwaggerUi.setup(Spec as SwaggerUi.JsonObject, {
        customCss: new SwaggerTheme().getBuffer(
            SwaggerThemeNameEnum.DARK_MONOKAI,
        ),
    }),
);

RegisterRoutes(app);

app.listen(3000, () => {
    console.log('Listening on port ', 3000);
});

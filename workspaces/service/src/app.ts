import { json, urlencoded } from 'express';
import * as express from 'express';
import { RegisterRoutes } from './tsoa/routes.js';
import Spec from './tsoa/swagger.json' with { type: 'json' };
import * as SwaggerUi from 'swagger-ui-express';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { configDotenv } from 'dotenv';
import cookieParser from 'cookie-parser';
import { resolve } from 'node:path';

configDotenv({
    path: resolve(import.meta.dirname, '..', '.env'),
});

const app: express.Application = (express as any).default();

app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cookieParser());

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

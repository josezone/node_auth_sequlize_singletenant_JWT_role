import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cors from 'cors';
import * as helmet from 'helmet';
import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as morgan from 'morgan';

import { config } from '../config/config';
import { LoggerInterface } from '../config/logger.interface';
import { LOGGER, MIDDLEWARES } from '../const/types';
import { ConfigureMiddlewaresInterface } from './configure.interface';

const swaggerJSDoc = require('swagger-jsdoc');

import swaggerUiExpress = require('swagger-ui-express');

@provide(MIDDLEWARES)
class ConfigureMiddlewares implements ConfigureMiddlewaresInterface {
  @inject(LOGGER) private logger!: LoggerInterface;

  private swaggerDefinition = {
    info: {
      title: `REST API for App`,
      version: 1,
      description: `This is the REST API for App`,
    },
    host: `localhost:${config.PORT}`,
    basePath: '/api/v1',
  };

  private options = {
    swaggerDefinition: this.swaggerDefinition,
    apis: ['./src/modules/**/docs/*.yaml'],
  };

  middleware(server: InversifyExpressServer): void {
    const swaggerSpec = swaggerJSDoc(this.options);
    server.setConfig(app => {
      app.use(helmet());
      app.use(compression());
      app.use(cors());
      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(bodyParser.json());
      app.use(morgan('combined', { stream: this.logger.log }));
      app.use(
        '/docs',
        swaggerUiExpress.serve,
        swaggerUiExpress.setup(swaggerSpec)
      );
    });
  }
}

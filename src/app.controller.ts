import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Application health check',
    description: 'Returns a simple "Hello World!" message to verify the application is running',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is running successfully',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  public getHello(): string {
    return this.appService.getHello();
  }
}

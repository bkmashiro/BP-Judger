import { Catch, ArgumentsHost, Logger } from '@nestjs/common';

@Catch()
export class GlobalErrorFilter {
  catch(error: Error, host: ArgumentsHost) {
    Logger.error(`Global Error: ${error.message}`, error.stack);
    // some other logic
  }
}

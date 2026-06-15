import { Module } from '@nestjs/common'
import { FrontendController } from './frontend.controller.js'
import { FrontendService } from './frontend.service.js'

@Module({
  controllers: [FrontendController],
  providers: [FrontendService],
  exports: [FrontendService],
})
export class FrontendModule {}

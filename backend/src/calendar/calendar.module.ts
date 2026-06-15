import { Module } from '@nestjs/common'
import { CalendarController } from './calendar.controller.js'
import { CalendarService } from './calendar.service.js'
import { CalendarStore } from './calendar.store.js'
import { Clock } from './clock.js'
import { FrontendModule } from '../frontend/frontend.module.js'

@Module({
  imports: [FrontendModule],
  controllers: [CalendarController],
  providers: [CalendarService, CalendarStore, Clock],
})
export class CalendarModule {}

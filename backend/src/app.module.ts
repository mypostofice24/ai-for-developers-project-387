import { Module } from '@nestjs/common'
import { CalendarModule } from './calendar/calendar.module.js'
import { FrontendModule } from './frontend/frontend.module.js'

@Module({
  imports: [CalendarModule, FrontendModule],
})
export class AppModule {}

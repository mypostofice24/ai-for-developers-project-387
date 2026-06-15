import { Body, Controller, Get, Headers, Inject, Param, Post, Res } from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import { getConfig } from '../config.js'
import { FrontendService } from '../frontend/frontend.service.js'
import { CalendarService } from './calendar.service.js'
import type { CreateBookingRequest, CreateEventTypeRequest } from './calendar.types.js'

const acceptsHtml = (accept = '') =>
  accept.includes('text/html') && !accept.includes('application/json')

@Controller()
export class CalendarController {
  constructor(
    @Inject(CalendarService) private readonly calendar: CalendarService,
    @Inject(FrontendService) private readonly frontend: FrontendService,
  ) {}

  @Get('/admin/event-types')
  listAdminEventTypes(
    @Headers('accept') accept: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    if (acceptsHtml(accept)) {
      return this.sendFrontend(reply)
    }

    return this.calendar.listEventTypes()
  }

  @Post('/admin/event-types')
  createEventType(@Body() request: CreateEventTypeRequest) {
    return this.calendar.createEventType(request)
  }

  @Get('/admin/bookings')
  listAdminBookings(
    @Headers('accept') accept: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    if (acceptsHtml(accept)) {
      return this.sendFrontend(reply)
    }

    return this.calendar.listUpcomingBookings()
  }

  @Get('/event-types')
  listPublicEventTypes() {
    return this.calendar.listEventTypes()
  }

  @Get('/event-types/:eventTypeId/slots')
  listSlots(@Param('eventTypeId') eventTypeId: string) {
    return this.calendar.listSlots(eventTypeId)
  }

  @Post('/bookings')
  createBooking(@Body() request: CreateBookingRequest) {
    return this.calendar.createBooking(request)
  }

  private sendFrontend(reply: FastifyReply) {
    const indexHtml = this.frontend.getIndexHtml(getConfig().frontendDistDir)

    if (!indexHtml) {
      return reply.status(404).send({
        code: 'NOT_FOUND',
        message: 'Frontend build was not found.',
      })
    }

    return reply.type('text/html; charset=utf-8').send(indexHtml)
  }
}

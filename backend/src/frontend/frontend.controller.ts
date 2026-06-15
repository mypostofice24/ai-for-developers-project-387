import { Controller, Get, Inject, Res } from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import { getConfig } from '../config.js'
import { FrontendService } from './frontend.service.js'

@Controller()
export class FrontendController {
  constructor(@Inject(FrontendService) private readonly frontend: FrontendService) {}

  @Get(['/', '/event-types/:eventTypeId', '/admin'])
  sendIndex(@Res() reply: FastifyReply) {
    return this.sendFrontend(reply)
  }

  sendFrontend(reply: FastifyReply) {
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

import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common'

export const notFound = (message: string) =>
  new NotFoundException({
    code: 'NOT_FOUND',
    message,
  })

export const validationError = (message: string) =>
  new UnprocessableEntityException({
    code: 'VALIDATION_ERROR',
    message,
  })

export const bookingConflict = (message: string) =>
  new ConflictException({
    code: 'BOOKING_CONFLICT',
    message,
  })

import { IsObject, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { WeeklyScheduleDto } from './create-barber.dto'

/**
 * Update Schedule DTO
 */
export class UpdateScheduleDto {
  @ApiProperty({ description: 'Weekly working schedule', type: WeeklyScheduleDto })
  @IsObject()
  @ValidateNested()
  @Type(() => WeeklyScheduleDto)
  schedule: WeeklyScheduleDto
}

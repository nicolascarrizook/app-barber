import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'

export enum Specialty {
  HAIRCUT = 'HAIRCUT',
  BEARD = 'BEARD',
  COLORING = 'COLORING',
  STYLING = 'STYLING',
  SHAVING = 'SHAVING',
  HAIR_TREATMENT = 'HAIR_TREATMENT',
  KIDS_CUT = 'KIDS_CUT',
  DESIGN = 'DESIGN'
}

interface BarberSpecialtiesProps {
  specialties: Specialty[]
}

export class BarberSpecialties extends ValueObject<BarberSpecialtiesProps> {
  private constructor(props: BarberSpecialtiesProps) {
    super(props)
  }

  public static create(specialties: Specialty[]): Result<BarberSpecialties> {
    if (!specialties || specialties.length === 0) {
      return Result.fail<BarberSpecialties>('Barber must have at least one specialty')
    }

    // Remove duplicates
    const uniqueSpecialties = Array.from(new Set(specialties))

    // Validate all are valid specialties
    const validSpecialties = Object.values(Specialty)
    for (const specialty of uniqueSpecialties) {
      if (!validSpecialties.includes(specialty)) {
        return Result.fail<BarberSpecialties>(`Invalid specialty: ${specialty}`)
      }
    }

    if (uniqueSpecialties.length > 8) {
      return Result.fail<BarberSpecialties>('Barber cannot have more than 8 specialties')
    }

    return Result.ok<BarberSpecialties>(
      new BarberSpecialties({
        specialties: uniqueSpecialties
      })
    )
  }

  public static createFromStrings(specialtyStrings: string[]): Result<BarberSpecialties> {
    const specialties: Specialty[] = []

    for (const str of specialtyStrings) {
      const upperStr = str.toUpperCase()
      if (Object.values(Specialty).includes(upperStr as Specialty)) {
        specialties.push(upperStr as Specialty)
      } else {
        return Result.fail<BarberSpecialties>(`Invalid specialty: ${str}`)
      }
    }

    return BarberSpecialties.create(specialties)
  }

  get specialties(): Specialty[] {
    return [...this.props.specialties]
  }

  get count(): number {
    return this.props.specialties.length
  }

  hasSpecialty(specialty: Specialty): boolean {
    return this.props.specialties.includes(specialty)
  }

  addSpecialty(specialty: Specialty): Result<BarberSpecialties> {
    if (this.hasSpecialty(specialty)) {
      return Result.ok<BarberSpecialties>(this)
    }

    const newSpecialties = [...this.props.specialties, specialty]
    return BarberSpecialties.create(newSpecialties)
  }

  removeSpecialty(specialty: Specialty): Result<BarberSpecialties> {
    if (!this.hasSpecialty(specialty)) {
      return Result.ok<BarberSpecialties>(this)
    }

    const newSpecialties = this.props.specialties.filter(s => s !== specialty)
    return BarberSpecialties.create(newSpecialties)
  }

  toStringArray(): string[] {
    return this.props.specialties.map(s => s.toString())
  }

  /**
   * Compares specialties regardless of order
   */
  equals(vo?: ValueObject<BarberSpecialtiesProps>): boolean {
    if (!vo || !(vo instanceof BarberSpecialties)) {
      return false
    }

    if (this.props.specialties.length !== vo.props.specialties.length) {
      return false
    }

    // Sort both arrays before comparing
    const sorted1 = [...this.props.specialties].sort()
    const sorted2 = [...vo.props.specialties].sort()

    return JSON.stringify(sorted1) === JSON.stringify(sorted2)
  }
}

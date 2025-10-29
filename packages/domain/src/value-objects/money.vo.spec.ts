import { Money } from './money.vo'
import { Currency } from './currency.vo'

describe('Money', () => {
  const ARS = Currency.ARS
  const USD = Currency.USD

  describe('create', () => {
    it('should create valid money', () => {
      const result = Money.create(100, ARS)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(100)
      expect(result.value.currency).toEqual(ARS)
    })

    it('should fail when amount is negative', () => {
      const result = Money.create(-10, ARS)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot be negative')
    })

    it('should fail when amount is not finite', () => {
      const result = Money.create(Infinity, ARS)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('finite number')
    })

    it('should round to 2 decimal places', () => {
      const result = Money.create(10.12345, ARS)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(10.12)
    })

    it('should accept zero amount', () => {
      const result = Money.create(0, ARS)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(0)
    })
  })

  describe('zero', () => {
    it('should create zero money', () => {
      const money = Money.zero(ARS)

      expect(money.amount).toBe(0)
      expect(money.currency).toEqual(ARS)
    })
  })

  describe('add', () => {
    it('should add two money instances with same currency', () => {
      const money1 = Money.create(100, ARS).value
      const money2 = Money.create(50, ARS).value

      const result = money1.add(money2)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(150)
    })

    it('should fail when adding different currencies', () => {
      const money1 = Money.create(100, ARS).value
      const money2 = Money.create(50, USD).value

      const result = money1.add(money2)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('different currencies')
    })

    it('should handle decimal addition correctly', () => {
      const money1 = Money.create(10.50, ARS).value
      const money2 = Money.create(5.25, ARS).value

      const result = money1.add(money2)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(15.75)
    })
  })

  describe('subtract', () => {
    it('should subtract two money instances with same currency', () => {
      const money1 = Money.create(100, ARS).value
      const money2 = Money.create(30, ARS).value

      const result = money1.subtract(money2)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(70)
    })

    it('should fail when subtracting different currencies', () => {
      const money1 = Money.create(100, ARS).value
      const money2 = Money.create(30, USD).value

      const result = money1.subtract(money2)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('different currencies')
    })

    it('should fail when result would be negative', () => {
      const money1 = Money.create(50, ARS).value
      const money2 = Money.create(100, ARS).value

      const result = money1.subtract(money2)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot be negative')
    })
  })

  describe('multiply', () => {
    it('should multiply by a factor', () => {
      const money = Money.create(100, ARS).value

      const result = money.multiply(2)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(200)
    })

    it('should handle decimal multiplication', () => {
      const money = Money.create(100, ARS).value

      const result = money.multiply(0.5)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(50)
    })

    it('should fail when factor is not finite', () => {
      const money = Money.create(100, ARS).value

      const result = money.multiply(Infinity)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('finite number')
    })
  })

  describe('divide', () => {
    it('should divide by a divisor', () => {
      const money = Money.create(100, ARS).value

      const result = money.divide(2)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(50)
    })

    it('should fail when dividing by zero', () => {
      const money = Money.create(100, ARS).value

      const result = money.divide(0)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('divide by zero')
    })

    it('should fail when divisor is not finite', () => {
      const money = Money.create(100, ARS).value

      const result = money.divide(Infinity)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('finite number')
    })
  })

  describe('percentage', () => {
    it('should calculate percentage correctly', () => {
      const money = Money.create(100, ARS).value

      const result = money.percentage(10)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(10)
    })

    it('should calculate 50%', () => {
      const money = Money.create(200, ARS).value

      const result = money.percentage(50)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(100)
    })

    it('should fail when percentage is negative', () => {
      const money = Money.create(100, ARS).value

      const result = money.percentage(-10)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('between 0 and 100')
    })

    it('should fail when percentage is greater than 100', () => {
      const money = Money.create(100, ARS).value

      const result = money.percentage(150)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('between 0 and 100')
    })
  })

  describe('isZero', () => {
    it('should return true for zero amount', () => {
      const money = Money.zero(ARS)

      expect(money.isZero()).toBe(true)
    })

    it('should return false for non-zero amount', () => {
      const money = Money.create(100, ARS).value

      expect(money.isZero()).toBe(false)
    })
  })

  describe('isGreaterThan', () => {
    it('should return true when amount is greater', () => {
      const money1 = Money.create(100, ARS).value
      const money2 = Money.create(50, ARS).value

      expect(money1.isGreaterThan(money2)).toBe(true)
    })

    it('should return false when amount is less', () => {
      const money1 = Money.create(50, ARS).value
      const money2 = Money.create(100, ARS).value

      expect(money1.isGreaterThan(money2)).toBe(false)
    })

    it('should throw when comparing different currencies', () => {
      const money1 = Money.create(100, ARS).value
      const money2 = Money.create(50, USD).value

      expect(() => money1.isGreaterThan(money2)).toThrow('different currencies')
    })
  })

  describe('isLessThan', () => {
    it('should return true when amount is less', () => {
      const money1 = Money.create(50, ARS).value
      const money2 = Money.create(100, ARS).value

      expect(money1.isLessThan(money2)).toBe(true)
    })

    it('should return false when amount is greater', () => {
      const money1 = Money.create(100, ARS).value
      const money2 = Money.create(50, ARS).value

      expect(money1.isLessThan(money2)).toBe(false)
    })
  })

  describe('format', () => {
    it('should format money with currency symbol', () => {
      const money = Money.create(100, ARS).value

      expect(money.format()).toBe('$100.00')
    })

    it('should format with 2 decimal places', () => {
      const money = Money.create(100.5, ARS).value

      expect(money.format()).toBe('$100.50')
    })
  })

  describe('equals', () => {
    it('should be equal when amount and currency are the same', () => {
      const money1 = Money.create(100, ARS).value
      const money2 = Money.create(100, ARS).value

      expect(money1.equals(money2)).toBe(true)
    })

    it('should not be equal when amounts are different', () => {
      const money1 = Money.create(100, ARS).value
      const money2 = Money.create(50, ARS).value

      expect(money1.equals(money2)).toBe(false)
    })

    it('should not be equal when currencies are different', () => {
      const money1 = Money.create(100, ARS).value
      const money2 = Money.create(100, USD).value

      expect(money1.equals(money2)).toBe(false)
    })
  })
})

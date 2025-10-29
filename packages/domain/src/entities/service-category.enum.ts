export enum ServiceCategory {
  HAIRCUT = 'HAIRCUT',
  BEARD = 'BEARD',
  STYLING = 'STYLING',
  COLORING = 'COLORING',
  TREATMENT = 'TREATMENT'
}

export class ServiceCategoryHelper {
  static getDisplayName(category: ServiceCategory): string {
    const names: Record<ServiceCategory, string> = {
      [ServiceCategory.HAIRCUT]: 'Corte de Cabello',
      [ServiceCategory.BEARD]: 'Barba',
      [ServiceCategory.STYLING]: 'Peinado',
      [ServiceCategory.COLORING]: 'Coloración',
      [ServiceCategory.TREATMENT]: 'Tratamiento'
    }
    return names[category]
  }

  static getDisplayNameEN(category: ServiceCategory): string {
    const names: Record<ServiceCategory, string> = {
      [ServiceCategory.HAIRCUT]: 'Haircut',
      [ServiceCategory.BEARD]: 'Beard',
      [ServiceCategory.STYLING]: 'Styling',
      [ServiceCategory.COLORING]: 'Coloring',
      [ServiceCategory.TREATMENT]: 'Treatment'
    }
    return names[category]
  }

  static getAllCategories(): ServiceCategory[] {
    return Object.values(ServiceCategory)
  }

  static isValidCategory(value: string): boolean {
    return Object.values(ServiceCategory).includes(value as ServiceCategory)
  }
}

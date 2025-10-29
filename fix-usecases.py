#!/usr/bin/env python3
"""
Script para corregir automáticamente los errores de compilación TypeScript
en los use cases de la capa de aplicación.
"""

import re
import os
from pathlib import Path

# Directorio base
BASE_DIR = Path("/Users/federiconicolascarrizo/Documents/Repositorios/barberia/packages/application/src/use-cases")

def fix_datetime_imports(content: str) -> str:
    """Corrige los imports de DateTime"""
    # Reemplazar import incorrecto con luxon
    content = re.sub(
        r"import \{ DateTime \} from '@barbershop/domain/value-objects/datetime\.vo'",
        "import { DateTime } from 'luxon'",
        content
    )
    return content

def fix_id_vo_usage(content: str) -> str:
    """Corrige el uso de Value Objects IDs (no son Result)"""
    # AppointmentId
    content = re.sub(
        r"const appointmentIdOrError = AppointmentId\.create\(([^)]+)\)\s*if \(appointmentIdOrError\.isFailure\) \{\s*return Result\.fail<Appointment>\(`Invalid appointment ID: \$\{appointmentIdOrError\.error\}`\)\s*\}\s*const appointmentId = appointmentIdOrError\.getValue\(\)",
        r"const appointmentId = AppointmentId.create(\1)",
        content,
        flags=re.DOTALL
    )

    # BarberId
    content = re.sub(
        r"const barberIdOrError = BarberId\.create\(([^)]+)\)\s*if \(barberIdOrError\.isFailure\) \{\s*return Result\.fail<[^>]+>\(`Invalid barber ID: \$\{barberIdOrError\.error\}`\)\s*\}\s*const barberId = barberIdOrError\.getValue\(\)",
        r"const barberId = BarberId.create(\1)",
        content,
        flags=re.DOTALL
    )

    # ClientId
    content = re.sub(
        r"const clientIdOrError = ClientId\.create\(([^)]+)\)\s*if \(clientIdOrError\.isFailure\) \{\s*return Result\.fail<[^>]+>\(`Invalid client ID: \$\{clientIdOrError\.error\}`\)\s*\}\s*const clientId = clientIdOrError\.getValue\(\)",
        r"const clientId = ClientId.create(\1)",
        content,
        flags=re.DOTALL
    )

    # ServiceId
    content = re.sub(
        r"const serviceIdOrError = ServiceId\.create\(([^)]+)\)\s*if \(serviceIdOrError\.isFailure\) \{\s*return Result\.fail<[^>]+>\(`Invalid service ID: \$\{serviceIdOrError\.error\}`\)\s*\}\s*const serviceId = serviceIdOrError\.getValue\(\)",
        r"const serviceId = ServiceId.create(\1)",
        content,
        flags=re.DOTALL
    )

    return content

def fix_entity_apis(content: str) -> str:
    """Corrige el uso de las APIs de entidades"""
    # Barber.isActive → barber.status.isActive()
    content = re.sub(r"barber\.isActive", "barber.status.isActive()", content)

    # Client.isActive → client.status.isActive()
    content = re.sub(r"client\.isActive", "client.status.isActive()", content)

    # appointment.status.value → appointment.status (enum directo)
    content = re.sub(r"appointment\.status\.value", "appointment.status", content)
    content = re.sub(r"apt\.status\.value", "apt.status", content)

    # Barber.firstName/lastName → barber.name.fullName o barber.getDisplayName()
    # Este es más complejo, por ahora solo agrego el método correcto

    return content

def fix_datetime_methods(content: str) -> str:
    """Corrige métodos de DateTime de luxon"""
    # .toDate() → .toJSDate()
    content = re.sub(r"\.toDate\(\)", ".toJSDate()", content)

    # DateTime.create() → DateTime.fromJSDate()
    content = re.sub(
        r"DateTime\.create\(([^)]+)\)",
        r"DateTime.fromJSDate(\1)",
        content
    )

    # DateTime.now() está correcto en luxon

    return content

def fix_timeslot_create(content: str) -> str:
    """Corrige llamadas a TimeSlot.create()"""
    # TimeSlot.create({ startTime, endTime }) → TimeSlot.create(startTime, endTime)
    content = re.sub(
        r"TimeSlot\.create\(\{\s*startTime,\s*endTime\s*\}\)",
        "TimeSlot.create(startTime, endTime)",
        content
    )
    content = re.sub(
        r"TimeSlot\.create\(\{\s*startTime:\s*([^,]+),\s*endTime:\s*([^}]+)\s*\}\)",
        r"TimeSlot.create(\1, \2)",
        content
    )

    return content

def fix_result_getvalue(content: str) -> str:
    """Corrige .getValue() → .value"""
    content = re.sub(r"\.getValue\(\)", ".value", content)
    return content

def process_file(filepath: Path) -> bool:
    """Procesa un archivo aplicando todas las correcciones"""
    print(f"Procesando: {filepath.name}")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Aplicar correcciones
        content = fix_datetime_imports(content)
        content = fix_id_vo_usage(content)
        content = fix_entity_apis(content)
        content = fix_datetime_methods(content)
        content = fix_timeslot_create(content)
        content = fix_result_getvalue(content)

        # Solo escribir si hubo cambios
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ Corregido: {filepath.name}")
            return True
        else:
            print(f"  ⏭️  Sin cambios: {filepath.name}")
            return False

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    print("🔧 Iniciando corrección de use cases...")
    print("="*60)

    # Buscar todos los archivos .ts en use-cases
    files = list(BASE_DIR.glob("**/*.use-case.ts"))

    print(f"\nArchivos encontrados: {len(files)}")
    print("-"*60)

    corrected = 0
    for filepath in sorted(files):
        if process_file(filepath):
            corrected += 1

    print("-"*60)
    print(f"\n✨ Proceso completado!")
    print(f"   Archivos corregidos: {corrected}/{len(files)}")
    print("\n🔍 Siguiente paso: ejecutar typecheck")

if __name__ == "__main__":
    main()

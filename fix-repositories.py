#!/usr/bin/env python3
"""
Quick fix script for repository Result unwrapping
Corrects mapper.toDomain() calls to handle Result<Entity> properly
"""

import re
from pathlib import Path

def fix_repository_file(file_path: Path):
    """Fix a single repository file"""
    print(f"Processing {file_path.name}...")

    with open(file_path, 'r') as f:
        content = f.read()

    original = content

    # Fix: Remove datetime.vo import
    content = re.sub(
        r"import \{ DateTime \} from '@barbershop/domain/value-objects/datetime\.vo'",
        "import { DateTime } from 'luxon'",
        content
    )

    # Fix: Remove specialty.vo import
    content = re.sub(
        r"import \{ Specialty \} from '@barbershop/domain/value-objects/specialty\.vo'",
        "",
        content
    )

    # Fix: Unwrap Result from mapper.toDomain()
    # Pattern: const entity = Mapper.toDomain(raw)
    # Replace with: const entityResult = Mapper.toDomain(raw); unwrap

    # For assignments that expect Entity | null
    content = re.sub(
        r'(\s+)(const \w+ = )(\w+Mapper\.toDomain\([^)]+\))',
        r'\1\2\3\n\1if (\2.isFailure) return null',
        content
    )

    # Fix version property access (entities don't have .version)
    content = re.sub(
        r'(\w+)\.version',
        r'0 // version managed by repository',
        content
    )

    # Fix Result unwrapping in return statements
    content = re.sub(
        r'return (\w+Mapper\.toDomain\([^)]+\))',
        r'const result = \1\n    return result.isSuccess ? result.value : null',
        content
    )

    # Fix .toDate() → .toJSDate()
    content = re.sub(r'\.toDate\(\)', '.toJSDate()', content)

    if content != original:
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"✓ Fixed {file_path.name}")
        return True
    else:
        print(f"- No changes needed for {file_path.name}")
        return False

def main():
    repo_dir = Path("/Users/federiconicolascarrizo/Documents/Repositorios/barberia/packages/infrastructure/src/repositories")

    if not repo_dir.exists():
        print(f"ERROR: Directory not found: {repo_dir}")
        return

    files = list(repo_dir.glob("prisma-*.repository.ts"))

    print(f"\nFound {len(files)} repository files\n")

    fixed_count = 0
    for file_path in files:
        if fix_repository_file(file_path):
            fixed_count += 1

    print(f"\n✓ Fixed {fixed_count}/{len(files)} files")

if __name__ == "__main__":
    main()

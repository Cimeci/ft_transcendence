#!/usr/bin/env python3

import bcrypt
import re
from pathlib import Path

ENV_FILE = Path("monitoring/.env")

def read_env_file():
    if not ENV_FILE.exists():
        print(f"{ENV_FILE} not found")
        exit(1)
    return ENV_FILE.read_text().splitlines()

def get_password_from_env(lines):
    for line in lines:
        if line.strip().startswith("PROM_PASSWORD=") and not line.strip().startswith("PROM_PASSWORD_HASH="):
            password = line.split("=", 1)[1].strip().strip('"').strip("'")
            return password
    return None

def update_or_add_hash(lines, hashed):
    escaped_hash = hashed.decode().replace("$", "$$")
    new_line = f"PROM_PASSWORD_HASH={escaped_hash}"
    
    hash_pattern = re.compile(r'^PROM_PASSWORD_HASH=')
    updated = False
    
    for i, line in enumerate(lines):
        if hash_pattern.match(line.strip()):
            lines[i] = new_line
            updated = True
            break
    
    if not updated:
        lines.append(new_line)
    
    return lines

def main():
    lines = read_env_file()
    password = get_password_from_env(lines)
    
    if not password:
        print("PROM_PASSWORD variable must be set in .env")
        exit(1)
    
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    updated_lines = update_or_add_hash(lines, hashed)
    ENV_FILE.write_text("\n".join(updated_lines) + "\n")

if __name__ == "__main__":
    main()

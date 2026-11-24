#!/usr/bin/env python3
"""Scan the public showcase for obvious secrets, private paths, and risky claims."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SKIP = {".git", "bin", "obj", "node_modules", ".playwright-cli", "test-results", "playwright-report"}
TEXT_SUFFIXES = {".md", ".html", ".css", ".js", ".mjs", ".json", ".cs", ".csproj", ".sql", ".yml", ".yaml", ".toml", ".txt", ".csv"}

PATTERNS = {
    "private-key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "aws-access-key": re.compile(r"AKIA[0-9A-Z]{16}"),
    "github-token": re.compile(r"gh[pousr]_[A-Za-z0-9]{30,}"),
    "slack-token": re.compile(r"xox[baprs]-[A-Za-z0-9-]{10,}"),
    "openai-key": re.compile(r"sk-[A-Za-z0-9]{20,}"),
    "bearer-token": re.compile(r"Bearer\s+[A-Za-z0-9._-]{24,}"),
    "private-path": re.compile(r"/root/|/home/[^/\s]+/|C:\\\\Users\\\\"),
    "cookie": re.compile(r"(?i)(?:cookie|sessionid|auth_token)\s*[:=]\s*['\"][^'\"]{12,}"),
}
FORBIDDEN_CLAIMS = [
    "100% 准确", "100%准确", "保证见效", "包赚", "稳赚", "永久免费", "永久维护",
    "100% accurate", "guaranteed results", "guaranteed income",
]

def main() -> int:
    problems = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or any(part in SKIP for part in path.parts):
            continue
        if path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        rel = path.relative_to(ROOT)
        for name, pattern in PATTERNS.items():
            for match in pattern.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                problems.append(f"{rel}:{line}: {name}")
        for claim in FORBIDDEN_CLAIMS:
            if claim in text:
                line = text.count("\n", 0, text.index(claim)) + 1
                problems.append(f"{rel}:{line}: risky claim: {claim}")
    if problems:
        print("[FAIL] public showcase scan")
        for item in problems:
            print(" -", item)
        return 1
    print("[OK] no obvious secrets, private paths, or risky claims found")
    return 0

if __name__ == "__main__":
    sys.exit(main())

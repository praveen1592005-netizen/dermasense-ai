import os
import yaml
import sys

SUITES = {
    "SEL": "tests/selenium/test_cases/test_cases.yml",
    "APP": "tests/appium/test_cases/test_cases.yml",
    "LOAD": "tests/load/test_cases/test_cases.yml",
    "SEC": "tests/security/test_cases/test_cases.yml"
}
REQUIRED_FIELDS = ['id', 'category', 'name', 'description', 'priority', 'expected_result']

failed = False

for prefix, path in SUITES.items():
    if not os.path.exists(path):
        print(f"ERROR: {path} missing")
        failed = True
        continue
    with open(path, 'r') as f:
        data = yaml.safe_load(f)
    cases = data.get('test_cases', [])
    if len(cases) != 300:
        print(f"ERROR: {prefix} has {len(cases)} cases, expected 300")
        failed = True
    ids = [c.get('id') for c in cases]
    if len(set(ids)) != len(ids):
        print(f"ERROR: {prefix} has duplicate IDs")
        failed = True
    
    for i in range(1, 301):
        expected_id = f"{prefix}-{i:03d}"
        if expected_id not in ids:
            print(f"ERROR: Missing ID {expected_id}")
            failed = True

    for c in cases:
        for field in REQUIRED_FIELDS:
            if field not in c:
                print(f"ERROR: Case {c.get('id')} missing field {field}")
                failed = True

if failed:
    sys.exit(1)
else:
    print("All 1,200 test cases validated successfully!")

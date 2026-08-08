"""
Fix imported questions - clean up stems and fix AEEG IDs
"""
import requests, re, sys, json

API_BASE = "http://localhost:3001/api"
token = open('/tmp/admin_token.txt').read().strip()
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Get all questions
r = requests.get(f"{API_BASE}/questions?limit=2000", headers=headers)
data = r.json()
questions = data["questions"]
print(f"Total questions to fix: {data['total']}")

fixed = 0

for q in questions:
    qid = q["id"]
    stem = q.get("questionStem", "")
    if not stem:
        continue
    
    original_stem = stem
    
    # 1. Remove metadata prefixes
    # Remove "Assessment" block
    stem = re.sub(r'^Assessment\s*\n\s*SAT\s*\n\s*Test\s*\n\s*[^\n]+\s*\n\s*Domain\s*\n\s*[^\n]+', '', stem).strip()
    stem = re.sub(r'^Assessment\s*\n\s*SAT\s*\n\s*Test\s*\n\s*[^\n]+', '', stem).strip()
    stem = re.sub(r'^Assessment\s*\n\s*SAT', '', stem).strip()
    stem = re.sub(r'^SAT\s*\n', '', stem).strip()
    stem = re.sub(r'^Test\s*\n\s*[^\n]+\s*\n', '', stem).strip()
    stem = re.sub(r'^Domain\s*\n\s*[^\n]+\s*\n', '', stem).strip()
    stem = re.sub(r'^Skill\s*\n\s*[^\n]+', '', stem).strip()
    stem = re.sub(r'^Difficulty\s*\n\s*\w+\s*\n', '', stem).strip()
    stem = re.sub(r'^Difficulty\s*\??\s*\n', '', stem).strip()
    
    # 2. Remove "Question Difficulty" line
    stem = re.sub(r'Question Difficulty:\s*\w+\s*\n', '', stem).strip()
    
    # 3. Clean up multiple newlines
    stem = re.sub(r'\n{3,}', '\n\n', stem).strip()
    
    # 4. Remove stray "Rationale" or "Correct Answer" text
    stem = re.sub(r'Rationale\s*\n.*', '', stem).strip()
    stem = re.sub(r'Correct Answer:.*', '', stem).strip()
    
    # 5. Fix the ID line
    stem = re.sub(r'^ID:\s*[a-f0-9]+\s*\n', '', stem).strip()
    stem = re.sub(r'\nID:\s*[a-f0-9]+\s*$', '', stem).strip()
    
    if stem != original_stem:
        # Update via API
        r = requests.put(f"{API_BASE}/admin/questions/{qid}", 
                        json={"questionStem": stem}, headers=headers)
        if r.status_code == 200:
            fixed += 1

print(f"Fixed stems: {fixed}")

# Re-verify
r = requests.get(f"{API_BASE}/questions?limit=3", headers=headers)
data = r.json()
for q in data["questions"]:
    print(f"\nFixed: {q['aeeqId']}")
    print(f"  Stem: {q['questionStem'][:150]}")
    print(f"  Options: {json.dumps(q.get('answerOptions', []))[:200]}")
    print(f"  Passages: {(q.get('passageText') or '')[:100]}")
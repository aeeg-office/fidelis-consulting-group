"""
Fix imported questions - clean up stems that have metadata text
"""
import requests, re, sys, json

API_BASE = "http://localhost:3001/api"
token = open('/tmp/admin_token.txt').read().strip()
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Get all questions
r = requests.get(f"{API_BASE}/questions?limit=2000", headers=headers)
data = r.json()
questions = data["questions"]
print(f"Total questions: {data['total']}")

fixed = 0
for q in questions:
    qid = q["id"]
    stem = q.get("questionStem", "")
    if not stem:
        continue
    
    original = stem
    
    # The metadata pattern is: "Assessment Test Domain Skill Difficulty" 
    # followed by a line with "SAT <subject> <domain> <skill>"
    # followed by "ID: <hash>" and then the actual question
    
    # Remove everything from start up to and including "ID: <hash>" line
    # But only if it starts with metadata
    lines = stem.split('\n')
    
    # Check if the first line contains metadata keywords
    if lines and ('Assessment' in lines[0] or 'Difficulty' in lines[0] or 'Domain' in lines[0]):
        # Find the line with "ID:" and use everything after it as the new stem
        id_idx = -1
        for i, line in enumerate(lines):
            if re.match(r'^ID:\s*[a-f0-9]+', line.strip()):
                id_idx = i
                break
        
        if id_idx >= 0:
            # Take everything after the ID line
            new_stem = '\n'.join(lines[id_idx + 1:]).strip()
            # Also remove the ID line itself
            stem = new_stem
        else:
            # No ID line found, try to find actual question content
            # Look for content that starts with a question word or letter
            for i, line in enumerate(lines):
                if re.match(r'^(What|Which|How|The|In|A\s|If|Based|According)', line.strip()):
                    stem = '\n'.join(lines[i:]).strip()
                    break
    
    # Additional cleanup
    stem = re.sub(r'^ID:\s*[a-f0-9]+\s*\n', '', stem).strip()
    stem = re.sub(r'\n{3,}', '\n\n', stem).strip()
    stem = stem.strip()
    
    # Only update if changed
    if stem and stem != original:
        r = requests.put(f"{API_BASE}/admin/questions/{qid}", 
                        json={"questionStem": stem}, headers=headers)
        if r.status_code == 200:
            fixed += 1
        else:
            pass  # Skip if fails

print(f"Fixed: {fixed}")

# Show samples
r = requests.get(f"{API_BASE}/questions?limit=5", headers=headers)
for q in r.json()["questions"]:
    stem = q.get("questionStem", "")
    opts = q.get("answerOptions", [])
    print(f"\n{q['aeeqId']} [{q['difficulty']}] {q.get('category',{}).get('name','')}")
    print(f"  Stem: {stem[:120]}")
    print(f"  Options: {len(opts) if opts else 0} choices")
    print(f"  Passage: {(q.get('passageText') or '')[:80]}")
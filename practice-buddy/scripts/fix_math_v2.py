"""
Fix Math questions - paginated version
"""
import requests, re, json, math

API_BASE = "http://localhost:3001/api"
token = open('/tmp/admin_token.txt').read().strip()
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Get total count
r = requests.get(f"{API_BASE}/questions?limit=1", headers=headers)
total = r.json()["total"]
print(f"Total: {total}")

format_fixed = 0
options_fixed = 0
stem_fixed = 0
total_processed = 0

# Paginate through all questions
for offset in range(0, total, 50):
    r = requests.get(f"{API_BASE}/questions?limit=50&offset={offset}", headers=headers)
    questions = r.json()["questions"]
    
    for q in questions:
        qid = q["id"]
        stem = q.get("questionStem", "") or ""
        opts = q.get("answerOptions") or []
        fmt = q.get("questionFormat", "")
        total_processed += 1
        
        # Check for A. B. C. D. pattern
        has_abcd = bool(re.search(r'\n([A-D])\.\s', stem))
        if not has_abcd:
            continue
        
        # Get the full question with answer + explanation
        r2 = requests.post(f"{API_BASE}/questions/{qid}/reveal", headers=headers)
        if r2.status_code != 200:
            continue
        full = r2.json()
        
        explanation = full.get("shortExplanation", "") or ""
        correct = full.get("correctAnswer", "")
        
        updates = {}
        
        # Fix format
        if fmt == "studentProducedResponse":
            updates["questionFormat"] = "multipleChoice"
            format_fixed += 1
        
        # Extract options from explanation
        if not opts and explanation:
            new_opts = []
            for letter in ['A', 'B', 'C', 'D']:
                pattern = rf'Choice {letter}\s+(?:is\s+)?(?:correct|incorrect)[\.\:]?\s*(.+?)(?=Choice\s+[A-D]\s+(?:is|$)|$)'
                m = re.search(pattern, explanation, re.DOTALL)
                if m:
                    text = m.group(1).strip()
                    text = re.sub(r'\s*\.\s*$', '', text)
                    if text:
                        new_opts.append({"id": letter, "text": text})
            
            if len(new_opts) >= 2:
                updates["answerOptions"] = new_opts
                options_fixed += 1
        
        # Fix stem - remove empty choice lines
        new_stem = re.sub(r'\n([A-D])\.\s*\n', '\n', stem)
        if new_stem != stem:
            updates["questionStem"] = new_stem.strip()
            stem_fixed += 1
        
        if updates:
            r3 = requests.put(f"{API_BASE}/admin/questions/{qid}", json=updates, headers=headers)
    
    if offset % 200 == 0:
        print(f"  Processed {min(offset+50, total)}/{total}... fmt={format_fixed} opts={options_fixed}")

print(f"\nFinal:")
print(f"  Processed: {total_processed}")
print(f"  Format fixed: {format_fixed}")
print(f"  Options fixed: {options_fixed}")
print(f"  Stem cleaned: {stem_fixed}")

# Verify
r = requests.get(f"{API_BASE}/questions?limit=5", headers=headers)
for q in r.json()["questions"]:
    opts = q.get("answerOptions", [])
    print(f"\n{q['aeeqId']} [{q['difficulty']}] {q.get('questionFormat')}")
    print(f"  Stem: {q['questionStem'][:100]}")
    if opts:
        for o in opts[:3]:
            print(f"  {o['id']}. {o['text'][:60]}")
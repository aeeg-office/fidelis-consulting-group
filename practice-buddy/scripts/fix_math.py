"""
Fix Math questions: extract options from rationale text,
fix format classification, clean up stems
"""
import requests, re, json

API_BASE = "http://localhost:3001/api"
token = open('/tmp/admin_token.txt').read().strip()
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Get all Math questions
r = requests.get(f"{API_BASE}/questions?limit=2000", headers=headers)
data = r.json()
questions = data["questions"]
print(f"Total: {len(questions)}")

format_fixed = 0
options_fixed = 0
stem_fixed = 0

for q in questions:
    qid = q["id"]
    stem = q.get("questionStem", "") or ""
    opts = q.get("answerOptions") or []
    fmt = q.get("questionFormat", "")
    
    # Check if this is a multiple choice question (has A. B. C. D. in stem)
    has_abcd = bool(re.search(r'\nA\.\s*\nB\.\s*\nC\.\s*\nD\.', stem))
    
    if not has_abcd:
        continue
    
    # Get the full question with answer + explanation
    r2 = requests.post(f"{API_BASE}/questions/{qid}/reveal", headers=headers)
    if r2.status_code != 200:
        continue
    full = r2.json()
    
    explanation = full.get("shortExplanation", "") or ""
    correct = full.get("correctAnswer", "")
    
    # Fix format if needed
    updates = {}
    if fmt == "studentProducedResponse" and has_abcd:
        updates["questionFormat"] = "multipleChoice"
        format_fixed += 1
    
    # Extract options from explanation
    if not opts and explanation:
        # Parse each choice from the rationale
        new_opts = []
        for letter in ['A', 'B', 'C', 'D']:
            # Pattern: "Choice X is correct/incorrect. <text>"
            # or "Choice X ..."
            pattern = rf'Choice {letter}\s+(?:is\s+)?(?:correct|incorrect)[\.\:]?\s*(.+?)(?=Choice\s+[A-D]\s+(?:is|$)|$)'
            m = re.search(pattern, explanation, re.DOTALL)
            if m:
                text = m.group(1).strip()
                text = re.sub(r'\s*\.\s*$', '', text)
                if text:
                    new_opts.append({"id": letter, "text": text})
        
        # If we couldn't parse from rationale, try extracting the values from the stem
        # The stem has "A.\nB.\nC.\nD." with empty values
        # But the explanation text has the actual values
        
        if len(new_opts) >= 2:
            updates["answerOptions"] = new_opts
            options_fixed += 1
        else:
            # Try alternative: extract from the stem's choice lines
            pass
    
    # Fix stem - remove empty choice lines
    new_stem = re.sub(r'\n([A-D])\.\s*\n', '\n', stem)
    if new_stem != stem:
        updates["questionStem"] = new_stem.strip()
        stem_fixed += 1
    
    # Apply updates
    if updates:
        r3 = requests.put(f"{API_BASE}/admin/questions/{qid}", json=updates, headers=headers)
        if r3.status_code == 200:
            if format_fixed % 50 == 0 or options_fixed % 50 == 0:
                print(f"  Progress: {qid[:8]}... fmt={updates.get('questionFormat','')} opts={len(updates.get('answerOptions',[]))}")

print(f"\nSummary:")
print(f"  Format fixed: {format_fixed}")
print(f"  Options fixed: {options_fixed}")
print(f"  Stem cleaned: {stem_fixed}")

# Show samples
r = requests.get(f"{API_BASE}/questions?limit=5", headers=headers)
for q in r.json()["questions"]:
    opts = q.get("answerOptions", [])
    print(f"\n{q['aeeqId']} [{q['difficulty']}]")
    print(f"  Format: {q.get('questionFormat')}")
    print(f"  Stem: {q['questionStem'][:100]}")
    if opts:
        for o in opts[:3]:
            print(f"  {o['id']}. {o['text'][:60]}")
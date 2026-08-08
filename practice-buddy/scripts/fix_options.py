"""
Fix: Extract answer options from rationale text for Math questions
Many Math PDFs have missing A/B/C/D values (equations not in text layer)
The rationale text contains the actual values
"""
import requests, re, json

API_BASE = "http://localhost:3001/api"
token = open('/tmp/admin_token.txt').read().strip()
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Get Math questions with missing options
r = requests.get(f"{API_BASE}/questions?subjectId={requests.get(f'{API_BASE}/admin/exams', headers=headers).json()[0]['subjects'][1]['id']}&limit=2000", headers=headers)
data = r.json()
print(f"Total Math questions: {data['total']}")

fixed_opts = 0
for q in data["questions"]:
    qid = q["id"]
    opts = q.get("answerOptions")
    stem = q.get("questionStem", "")
    
    # Skip if already has options
    if opts and len(opts) > 0:
        continue
    
    # Only process multiple choice questions
    if q.get("questionFormat") != "multipleChoice":
        continue
    
    # Get the full question with correct answer
    r2 = requests.post(f"{API_BASE}/questions/{qid}/reveal", headers=headers)
    if r2.status_code != 200:
        continue
    full = r2.json()
    
    explanation = full.get("shortExplanation", "") or ""
    correct = full.get("correctAnswer", "")
    
    # Extract options from rationale
    if "Choice A" in explanation or "Choice A is" in explanation:
        # Parse the rationale to extract each choice
        new_opts = []
        for letter in ['A', 'B', 'C', 'D']:
            # Find "Choice X is correct/incorrect." or "Choice X ..."
            pattern = rf'Choice {letter}\s+(?:is\s+)?(?:correct|incorrect)[\.\:]?\s*(.+?)(?=Choice\s+[A-D]|$)'
            m = re.search(pattern, explanation, re.DOTALL)
            if m:
                text = m.group(1).strip()
                # Remove trailing punctuation
                text = re.sub(r'\s*\.\s*$', '', text)
                if text:
                    new_opts.append({"id": letter, "text": text})
        
        if new_opts and len(new_opts) >= 2:
            r3 = requests.put(f"{API_BASE}/admin/questions/{qid}", 
                            json={"answerOptions": new_opts}, headers=headers)
            if r3.status_code == 200:
                fixed_opts += 1
                print(f"  Fixed {qid[:8]}... → {len(new_opts)} options")

print(f"\nFixed options: {fixed_opts}")

# Verify
r = requests.get(f"{API_BASE}/questions?subjectId={requests.get(f'{API_BASE}/admin/exams', headers=headers).json()[0]['subjects'][1]['id']}&limit=5", headers=headers)
for q in r.json()["questions"]:
    opts = q.get("answerOptions", [])
    print(f"\n{q['aeeqId']}")
    print(f"  Stem: {q['questionStem'][:100]}")
    if opts:
        for o in opts:
            print(f"  {o['id']}. {o['text'][:60]}")
    else:
        print(f"  Format: {q.get('questionFormat')} (no options)")
"""
AEEG Practice Buddy - PDF Question Importer v3
Extracts from answer key PDFs (which have full text including equations)
"""

import fitz, re, json, os, requests, time

API_BASE = "http://localhost:3001/api"
AUTH = {"username": "admin", "password": "admin123"}

DOMAIN_CATEGORY_MAP = {
    "Central Idea and Details": ("INFO_IDEAS", "CENTRAL_IDEAS"),
    "Central Ideas and Details": ("INFO_IDEAS", "CENTRAL_IDEAS"),
    "Inference": ("INFO_IDEAS", "INFERENCES"),
    "Inferences": ("INFO_IDEAS", "INFERENCES"),
    "Command of Evidence": ("INFO_IDEAS", "CMD_EVIDENCE"),
    "Command of Evidence Questions": ("INFO_IDEAS", "CMD_EVIDENCE"),
    "Words in Context": ("CRAFT_STRUCTURE", "WORDS_CONTEXT"),
    "Word in Context": ("CRAFT_STRUCTURE", "WORDS_CONTEXT"),
    "Text Structure and Purpose": ("CRAFT_STRUCTURE", "TEXT_STRUCTURE"),
    "Cross Text Connections": ("CRAFT_STRUCTURE", "CROSS_TEXT"),
    "Cross-Text Connections": ("CRAFT_STRUCTURE", "CROSS_TEXT"),
    "Transitions": ("EXPR_IDEAS", "TRANSITIONS"),
    "Transition": ("EXPR_IDEAS", "TRANSITIONS"),
    "Rhetorical Synthesis": ("EXPR_IDEAS", "RHETORICAL_SYNTH"),
    "Boundaries": ("CONVENTIONS", "BOUNDARIES"),
    "Boundary Punctuation": ("CONVENTIONS", "BOUNDARIES"),
    "Form Structure and Sense": ("CONVENTIONS", "FORM_SENSE"),
    "Form, Structure, and Sense": ("CONVENTIONS", "FORM_SENSE"),
    "Linear Equations in One Variable": ("ALGEBRA", "LIN_EQ_1VAR"),
    "Linear Equations in Two Variables": ("ALGEBRA", "LIN_EQ_2VAR"),
    "Linear Functions": ("ALGEBRA", "LIN_FUNCTIONS"),
    "Linear Inequalities": ("ALGEBRA", "LIN_INEQ"),
    "Systems of Linear Equations": ("ALGEBRA", "SYS_LIN_EQ"),
    "Systems of Linear Equations in Two Variables": ("ALGEBRA", "SYS_LIN_EQ"),
    "Equivalent Expressions": ("ADV_MATH", "EQV_EXPR"),
    "Nonlinear Equations": ("ADV_MATH", "NONLIN_EQ"),
    "Nonlinear Equations and Systems of Equations": ("ADV_MATH", "NONLIN_EQ"),
    "Nonlinear Functions": ("ADV_MATH", "NONLIN_FUNC"),
    "Quadratic Functions": ("ADV_MATH", "QUAD_FUNC"),
    "Exponential Functions": ("ADV_MATH", "EXP_FUNC"),
    "Polynomial Expressions and Functions": ("ADV_MATH", "POLY_EXPR"),
    "Rational Expressions": ("ADV_MATH", "RATIONAL_EXPR"),
    "Radical Expressions": ("ADV_MATH", "RADICAL_EXPR"),
    "Ratios, Rates, Proportions, and Units": ("PSDA", "RATIOS"),
    "Ratios, Rates, Proportions": ("PSDA", "RATIOS"),
    "Percentages": ("PSDA", "PERCENTAGES"),
    "One-Variable Data": ("PSDA", "1VAR_DATA"),
    "Two-Variable Data": ("PSDA", "2VAR_DATA"),
    "Probability": ("PSDA", "PROBABILITY"),
    "Evaluating Statistical Claims": ("PSDA", "STAT_CLAIMS"),
    "Area and Volume": ("GEOMETRY", "AREA_VOL"),
    "Lines, Angles, and Triangles": ("GEOMETRY", "LINES_ANGLES"),
    "Lines and Angles": ("GEOMETRY", "LINES_ANGLES"),
    "Triangles": ("GEOMETRY", "LINES_ANGLES"),
    "Right Triangles and Trigonometry": ("GEOMETRY", "RIGHT_TRI"),
    "Right Triangles": ("GEOMETRY", "RIGHT_TRI"),
    "Trigonometry": ("GEOMETRY", "RIGHT_TRI"),
    "Circles": ("GEOMETRY", "CIRCLES"),
    "Coordinate Geometry": ("GEOMETRY", "COORD_GEOM"),
    "Similarity": ("GEOMETRY", "LINES_ANGLES"),
}

SAME_Y_THRESHOLD = 15

class QuestionImporter:
    def __init__(self):
        self.token = None
        self.exam_map = {}
        self.subject_map = {}
        self.domain_map = {}
        self.category_map = {}
        self.imported = 0
        self.skipped = 0
        self.errors = 0
        self.imported_qids = set()

    def authenticate(self):
        r = requests.post(f"{API_BASE}/auth/login", json=AUTH)
        r.raise_for_status()
        self.token = r.json()["token"]

    def get_id_maps(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        r = requests.get(f"{API_BASE}/admin/exams", headers=headers)
        r.raise_for_status()
        for exam in r.json():
            self.exam_map[exam["code"]] = exam["id"]
            for subj in exam.get("subjects", []):
                self.subject_map[subj["code"]] = subj["id"]
                for dom in subj.get("domains", []):
                    self.domain_map[dom["code"]] = dom["id"]
                    for cat in dom.get("categories", []):
                        self.category_map[cat["code"]] = cat["id"]

    def combine_blocks(self, blocks):
        """Combine adjacent blocks on same y-line"""
        sorted_blocks = sorted(blocks, key=lambda b: (b[1], b[0]))
        lines, current_line, current_y = [], [], 0
        for b in sorted_blocks:
            text = b[4].strip()
            if not text: continue
            if not current_line:
                current_line, current_y = [(b[0], text)], b[1]
            elif abs(b[1] - current_y) < SAME_Y_THRESHOLD:
                current_line.append((b[0], text))
            else:
                current_line.sort(key=lambda t: t[0])
                lines.append(" ".join(t[1] for t in current_line))
                current_line, current_y = [(b[0], text)], b[1]
        if current_line:
            current_line.sort(key=lambda t: t[0])
            lines.append(" ".join(t[1] for t in current_line))
        return "\n".join(lines)

    def get_blocks(self, path):
        """Get page blocks from PDF"""
        doc = fitz.open(path)
        pages = [list(page.get_text("blocks")) for page in doc]
        doc.close()
        return pages

    def extract_question_from_answer_key_page(self, blocks, is_math=False):
        """Extract a question from a single answer key page"""
        combined = self.combine_blocks(blocks)
        
        # Extract question ID
        qid = ""
        m = re.search(r'ID\s*:\s*([a-f0-9]+)', combined)
        if m: qid = m.group(1)
        if not qid: return None
        
        # Split into question section and answer section
        parts = re.split(r'ID\s*:\s*[a-f0-9]+\s*Answer', combined)
        question_part = parts[0] if len(parts) > 0 else ""
        answer_part = parts[1] if len(parts) > 1 else ""
        
        # Clean question part
        question_part = re.sub(r'Question ID\s+[a-f0-9]+\s*\n?', '', question_part).strip()
        question_part = re.sub(r'^ID\s*:\s*[a-f0-9]+\s*\n?', '', question_part).strip()
        
        # Extract answer choices
        choices = []
        for m in re.finditer(r'([A-D])\.\s*(.+?)(?=\n[A-D]\.|\nID:|\nCorrect|\Z)', question_part, re.DOTALL):
            letter, text = m.group(1), m.group(2).strip()
            # Filter out empty choices and metadata
            if text and len(text) > 2 and not text.startswith("Assessment") and not text.startswith("SAT"):
                choices.append({"id": letter, "text": text})
        
        # Also try single-line choices
        if not choices:
            for line in question_part.split("\n"):
                m = re.match(r'^([A-D])\.\s*(.+)', line)
                if m:
                    t = m.group(2).strip()
                    if t and len(t) > 2:
                        choices.append({"id": m.group(1), "text": t})
        
        # Extract question stem (everything before choices)
        stem = question_part
        if choices:
            # Remove choice lines from stem
            for c in choices:
                stem = stem.replace(f"{c['id']}. {c['text']}", "")
            stem = stem.strip()
        
        # Clean up stem
        stem = re.sub(r'\n{3,}', '\n\n', stem).strip()
        
        # Extract correct answer
        correct_answer = ""
        am = re.search(r'Correct Answer:\s*([A-Za-z0-9./\-]+)', answer_part)
        if not am:
            am = re.search(r'Correct\s+([A-Za-z0-9./\-]+)', answer_part)
        if am:
            correct_answer = am.group(1).strip()
        
        # Extract rationale
        explanation = ""
        rm = re.search(r'Rationale\s*\n(.+)', answer_part, re.DOTALL)
        if rm:
            explanation = rm.group(1).strip()
            # Cut at next "Question Difficulty" or end
            explanation = re.split(r'Question Difficulty', explanation)[0].strip()[:1500]
        
        # Extract difficulty
        difficulty = "medium"
        dm = re.search(r'Difficulty\s+\??\s*(\w+)', combined)
        if dm:
            d = dm.group(1).lower()
            if d in ["easy", "medium", "hard"]: difficulty = d
        
        # Extract metadata
        domain_name = ""
        skill_name = ""
        dm = re.search(r'Domain\s+([^\n]+)', combined)
        if dm: domain_name = dm.group(1).strip()
        sm = re.search(r'Skill\s+([^\n]+)', combined)
        if sm: skill_name = sm.group(1).strip()
        
        # Determine format
        qformat = "multipleChoice" if choices else "studentProducedResponse"
        
        # Map domain/category
        domain_code = "ALGEBRA" if is_math else "CRAFT_STRUCTURE"
        category_code = "LIN_EQ_1VAR" if is_math else "WORDS_CONTEXT"
        for key, (dc, cc) in DOMAIN_CATEGORY_MAP.items():
            if key.lower() in skill_name.lower() or key.lower() in domain_name.lower():
                domain_code, category_code = dc, cc
                break
        
        # Determine subject
        subject_code = "MATH" if is_math else "RW"
        
        q = {
            "source_qid": qid,
            "questionStem": stem,
            "answerOptions": choices if choices else None,
            "correctAnswer": correct_answer,
            "shortExplanation": explanation or None,
            "difficulty": difficulty,
            "questionFormat": qformat,
            "hasEquation": is_math,
            "calculatorAllowed": is_math,
            "source": "SAT Suite Question Bank",
            "examId": self.exam_map.get("SAT"),
            "subjectId": self.subject_map.get(subject_code),
            "domainId": self.domain_map.get(domain_code),
            "categoryId": self.category_map.get(category_code),
        }
        
        # For RW: try to extract passage text
        if not is_math and stem:
            # Passage is everything before the question stem
            stem_patterns = [
                r'Which choice completes the text',
                r'Which choice best',
                r'Which option',
                r'Which finding',
                r'Which of the following',
                r'According to the text',
                r'Based on the texts',
                r'Which quotation',
                r'As used in the text',
            ]
            for p in stem_patterns:
                m = re.search(p, stem)
                if m:
                    passage = stem[:m.start()].strip()
                    if passage and len(passage) > 30:
                        q["passageText"] = passage
                        q["questionStem"] = stem[m.start():]
                    break
        
        return q

    def import_question(self, q):
        """Import via API"""
        headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
        q["publicationStatus"] = "active"
        q["qualityStatus"] = "approved"
        q["rightsStatus"] = "original"
        q.pop("source_qid", None)
        try:
            r = requests.post(f"{API_BASE}/admin/questions", json=q, headers=headers, timeout=10)
            if r.status_code == 201: return True
            return False
        except: return False

    def process_answer_key(self, path, is_math):
        """Process a single answer key PDF"""
        pages = self.get_blocks(path)
        imported = 0
        for page_blocks in pages:
            combined = self.combine_blocks(page_blocks)
            if not re.search(r'ID\s*:\s*[a-f0-9]+', combined): continue
            if not re.search(r'Correct Answer', combined): continue
            
            qid_m = re.search(r'ID\s*:\s*([a-f0-9]+)', combined)
            if not qid_m: continue
            qid = qid_m.group(1)
            if qid in self.imported_qids: continue
            
            q = self.extract_question_from_answer_key_page(page_blocks, is_math)
            if not q: continue
            if not q.get("questionStem") or len(q["questionStem"]) < 10: continue
            if not q.get("correctAnswer"): continue
            
            if self.import_question(q):
                self.imported_qids.add(qid)
                self.imported += 1
                imported += 1
        return imported

    def process_all(self, base_dir, label, is_math=False):
        """Process all answer key PDFs in a directory"""
        answer_keys = []
        for root, dirs, files in os.walk(base_dir):
            for f in files:
                if not f.endswith(".pdf"): continue
                is_ak = ("Answer" in f or "answer" in f or "Answers" in f or 
                        (f.startswith("A") and len(f) > 2 and f[1].isdigit()))
                if is_ak:
                    answer_keys.append(os.path.join(root, f))
        
        print(f"  {label}: {len(answer_keys)} answer key files found")
        total = 0
        for ak in sorted(answer_keys):
            cnt = self.process_answer_key(ak, is_math)
            if cnt > 0:
                total += cnt
                print(f"  ✓ {os.path.basename(ak)} → {cnt}")
            else:
                self.skipped += 1
        print(f"  {label}: {total} imported")
        return total


def main():
    imp = QuestionImporter()
    print("=" * 60)
    print("AEEG Practice Buddy - Question Importer v3")
    print("=" * 60)
    
    print("\n[1/3] Authenticating...")
    imp.authenticate()
    print("✓ Authenticated")
    
    print("\n[2/3] Loading hierarchy...")
    imp.get_id_maps()
    print("✓ Hierarchy loaded")
    
    print("\n[3/3] Importing from answer key PDFs...")
    
    # RW: use answer key PDFs (they have answers + metadata)
    import requests as rq
    rw = imp.process_all("/home/qadir/Downloads/extracted_001", "Reading & Writing", is_math=False)
    
    # Math: use answer key PDFs (only way to get equations)
    math = imp.process_all("/home/qadir/Downloads/extracted_002", "Math", is_math=True)
    
    print("\n" + "=" * 60)
    print(f"IMPORT COMPLETE")
    print(f"  Reading & Writing: {rw}")
    print(f"  Math:             {math}")
    print(f"  Total imported:   {imp.imported}")
    print(f"  Skipped:          {imp.skipped}")
    print(f"  Errors:           {imp.errors}")
    
    # Verify
    headers = {"Authorization": f"Bearer {imp.token}"}
    r = rq.get(f"{API_BASE}/questions", headers=headers)
    d = r.json()
    print(f"  Questions in DB now: {d['total']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
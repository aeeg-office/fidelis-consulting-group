"""
AEEG Practice Buddy - PDF Question Extractor & Importer
Extracts questions from SAT Suite Question Bank PDFs and imports into the database.
"""

import fitz
import re
import json
import os
import sys
import requests
import time

API_BASE = "http://localhost:3001/api"
AUTH = {"username": "admin", "password": "admin123"}

# Category code mapping from file paths
DOMAIN_CATEGORY_MAP = {
    # RW: Information and Ideas
    "Central Idea and Details": ("INFO_IDEAS", "CENTRAL_IDEAS"),
    "Central Ideas and Details": ("INFO_IDEAS", "CENTRAL_IDEAS"),
    "Inference": ("INFO_IDEAS", "INFERENCES"),
    "Inferences": ("INFO_IDEAS", "INFERENCES"),
    "Command of Evidence": ("INFO_IDEAS", "CMD_EVIDENCE"),
    "Command of Evidence Questions": ("INFO_IDEAS", "CMD_EVIDENCE"),
    # RW: Craft and Structure
    "Words in Context": ("CRAFT_STRUCTURE", "WORDS_CONTEXT"),
    "Word in Context": ("CRAFT_STRUCTURE", "WORDS_CONTEXT"),
    "Text Structure and Purpose": ("CRAFT_STRUCTURE", "TEXT_STRUCTURE"),
    "Cross Text Connections": ("CRAFT_STRUCTURE", "CROSS_TEXT"),
    "Cross-Text Connections": ("CRAFT_STRUCTURE", "CROSS_TEXT"),
    # RW: Expression of Ideas
    "Transitions": ("EXPR_IDEAS", "TRANSITIONS"),
    "Transition": ("EXPR_IDEAS", "TRANSITIONS"),
    "Rhetorical Synthesis": ("EXPR_IDEAS", "RHETORICAL_SYNTH"),
    # RW: Standard English Conventions
    "Boundaries": ("CONVENTIONS", "BOUNDARIES"),
    "Boundary Punctuation": ("CONVENTIONS", "BOUNDARIES"),
    "Form Structure and Sense": ("CONVENTIONS", "FORM_SENSE"),
    "Form, Structure, and Sense": ("CONVENTIONS", "FORM_SENSE"),
    # Math: Algebra
    "Linear Equations in One Variable": ("ALGEBRA", "LIN_EQ_1VAR"),
    "Linear Equations in Two Variables": ("ALGEBRA", "LIN_EQ_2VAR"),
    "Linear Functions": ("ALGEBRA", "LIN_FUNCTIONS"),
    "Linear Inequalities": ("ALGEBRA", "LIN_INEQ"),
    "Systems of Linear Equations": ("ALGEBRA", "SYS_LIN_EQ"),
    "Systems of Linear Equations in Two Variables": ("ALGEBRA", "SYS_LIN_EQ"),
    # Math: Advanced Math
    "Equivalent Expressions": ("ADV_MATH", "EQV_EXPR"),
    "Nonlinear Equations": ("ADV_MATH", "NONLIN_EQ"),
    "Nonlinear Equations and Systems of Equations": ("ADV_MATH", "NONLIN_EQ"),
    "Nonlinear Functions": ("ADV_MATH", "NONLIN_FUNC"),
    "Quadratic Functions": ("ADV_MATH", "QUAD_FUNC"),
    "Exponential Functions": ("ADV_MATH", "EXP_FUNC"),
    "Polynomial Expressions and Functions": ("ADV_MATH", "POLY_EXPR"),
    "Rational Expressions": ("ADV_MATH", "RATIONAL_EXPR"),
    "Radical Expressions": ("ADV_MATH", "RADICAL_EXPR"),
    # Math: PSDA
    "Ratios, Rates, Proportions, and Units": ("PSDA", "RATIOS"),
    "Ratios, Rates, Proportions": ("PSDA", "RATIOS"),
    "Percentages": ("PSDA", "PERCENTAGES"),
    "One-Variable Data": ("PSDA", "1VAR_DATA"),
    "Two-Variable Data": ("PSDA", "2VAR_DATA"),
    "Probability": ("PSDA", "PROBABILITY"),
    "Evaluating Statistical Claims": ("PSDA", "STAT_CLAIMS"),
    # Math: Geometry
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

SUBJECT_MAP = {
    "Reading and Writing": "RW",
    "Reading and Writing Test": "RW",
    "Writing and Language Test": "RW",
    "Reading Test": "RW",
    "Math": "MATH",
    "Math Test": "MATH",
    "Math Test (No Calculator)": "MATH",
    "Math Test (Calculator)": "MATH",
}

DIFFICULTY_MAP = {
    "Easy": "easy",
    "Medium": "medium",
    "Hard": "hard",
    "Challenging": "hard",
    "Easy & Medium": "medium",
    "Easy and Medium": "medium",
}

class QuestionExtractor:
    def __init__(self):
        self.token = None
        self.exam_map = {}
        self.subject_map = {}
        self.domain_map = {}
        self.category_map = {}
        self.subcategory_map = {}
        self.imported = 0
        self.skipped = 0
        self.errors = 0

    def authenticate(self):
        """Get admin auth token"""
        r = requests.post(f"{API_BASE}/auth/login", json=AUTH)
        r.raise_for_status()
        self.token = r.json()["token"]
        print(f"✓ Authenticated as admin")

    def get_id_maps(self):
        """Build maps of exam/subject/domain/category IDs"""
        headers = {"Authorization": f"Bearer {self.token}"}
        r = requests.get(f"{API_BASE}/admin/exams", headers=headers)
        r.raise_for_status()
        exams = r.json()
        for exam in exams:
            self.exam_map[exam["code"]] = exam["id"]
            for subj in exam.get("subjects", []):
                self.subject_map[subj["code"]] = subj["id"]
                for dom in subj.get("domains", []):
                    self.domain_map[dom["code"]] = dom["id"]
                    for cat in dom.get("categories", []):
                        self.category_map[cat["code"]] = cat["id"]
        print(f"✓ Loaded hierarchy: {len(self.exam_map)} exams, {len(self.subject_map)} subjects, {len(self.domain_map)} domains, {len(self.category_map)} categories")

    def extract_text(self, pdf_path):
        """Extract text from a PDF"""
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
        return text

    def parse_rw_question(self, text_block, answer_text=None):
        """Parse a single RW question from text block"""
        lines = text_block.strip().split("\n")
        
        # Extract question ID
        qid = ""
        for line in lines:
            m = re.search(r'ID[:\s]+([a-f0-9]+)', line)
            if m:
                qid = m.group(1)
                break
        
        # Extract passage text (everything before the question stem)
        passage = ""
        stem_start = 0
        stem_patterns = [
            r'Which choice completes the text',
            r'Which choice best describes',
            r'Which choice best states',
            r'Which option',
            r'Which finding',
            r'Which of the following',
            r'According to the text',
            r'Based on the texts',
        ]
        
        full_text = "\n".join(lines)
        
        # Find the question stem
        stem = ""
        stem_idx = -1
        for pattern in stem_patterns:
            m = re.search(pattern, full_text)
            if m:
                stem_idx = m.start()
                stem = full_text[stem_idx:]
                passage = full_text[:stem_idx].strip()
                break
        
        # If no stem pattern found, try to find answer choices
        if not stem:
            # Look for the last sentence before A. B. C. D.
            choice_match = re.search(r'\n([A-D]\.)\s', full_text)
            if choice_match:
                stem = full_text[:choice_match.start()].strip()
                # Extract passage (everything before last few lines)
                parts = stem.split("\n")
                if len(parts) > 3:
                    passage = "\n".join(parts[:-1])
                    stem = parts[-1]
        
        # Extract answer choices
        choices = []
        choice_pattern = re.findall(r'([A-D])\.\s*(.+?)(?=\n[A-D]\.|\n\n|\Z)', full_text, re.DOTALL)
        if not choice_pattern:
            choice_pattern = re.findall(r'([A-D])\.\s*([^\n]+)', full_text)
        
        for letter, text in choice_pattern:
            clean = text.strip().rstrip('\n')
            if clean and len(clean) > 1:
                choices.append({"id": letter, "text": clean})
        
        # Extract metadata
        metadata = {}
        meta_patterns = [
            (r'Assessment\s*\n\s*(\w+)', 'assessment'),
            (r'Test\s*\n\s*(.+)', 'test'),
            (r'Domain\s*\n\s*(.+)', 'domain'),
            (r'Skill\s*\n\s*(.+)', 'skill'),
            (r'Difficulty\s*\n\s*(\w+)', 'difficulty'),
        ]
        for pattern, key in meta_patterns:
            m = re.search(pattern, full_text)
            if m:
                metadata[key] = m.group(1).strip().strip('"')
        
        # Extract answer from answer key text
        correct_answer = ""
        explanation = ""
        rationale = ""
        if answer_text:
            # Find correct answer
            am = re.search(r'Correct Answer:\s*([A-Za-z0-9.]+)', answer_text)
            if not am:
                am = re.search(r'Correct\s+([A-Za-z0-9.]+)', answer_text)
            if am:
                correct_answer = am.group(1).strip()
            
            # Extract rationale
            rm = re.search(r'Rationale\s*\n(.+)', answer_text, re.DOTALL)
            if rm:
                explanation = rm.group(1).strip()[:1000]
        
        # Determine subject and domain
        subject_code = "RW"
        test_name = metadata.get("test", "")
        if "math" in test_name.lower():
            subject_code = "MATH"
        
        domain_name = metadata.get("domain", "")
        skill_name = metadata.get("skill", "")
        
        # Map to our hierarchy
        domain_code = "INFO_IDEAS"
        category_code = "CENTRAL_IDEAS"
        
        # Try to match from skill or domain
        for key, (dc, cc) in DOMAIN_CATEGORY_MAP.items():
            if key.lower() in skill_name.lower() or key.lower() in domain_name.lower():
                domain_code = dc
                category_code = cc
                break
        
        difficulty = DIFFICULTY_MAP.get(metadata.get("difficulty", ""), "medium")
        
        question = {
            "source_qid": qid,
            "passageText": passage if passage and len(passage) > 20 else None,
            "questionStem": stem,
            "answerOptions": choices if choices else None,
            "correctAnswer": correct_answer,
            "shortExplanation": explanation or None,
            "wrongAnswerRationales": None,
            "difficulty": difficulty,
            "questionFormat": "multipleChoice",
            "source": f"SAT Suite Question Bank",
        }
        
        # Determine subject IDs
        if subject_code == "MATH":
            question["subjectId"] = self.subject_map.get("MATH")
            question["examId"] = self.exam_map.get("SAT")
            question["hasEquation"] = True
        else:
            question["subjectId"] = self.subject_map.get("RW")
            question["examId"] = self.exam_map.get("SAT")
        
        # Category mapping
        if domain_code in self.domain_map:
            question["domainId"] = self.domain_map[domain_code]
        if category_code in self.category_map:
            question["categoryId"] = self.category_map[category_code]
        
        return question

    def parse_math_question(self, text_block, answer_text=None):
        """Parse a single Math question from text block"""
        lines = text_block.strip().split("\n")
        
        # Extract question ID
        qid = ""
        for line in lines:
            m = re.search(r'ID[:\s]+([a-f0-9]+)', line)
            if m:
                qid = m.group(1)
                break
        
        full_text = "\n".join(lines)
        
        # Extract answer choices
        choices = []
        choice_pattern = re.findall(r'([A-D])\.\s*(.+?)(?=\n[A-D]\.|\n\n|\Z)', full_text, re.DOTALL)
        if not choice_pattern:
            choice_pattern = re.findall(r'([A-D])\.\s*([^\n]+)', full_text)
        
        for letter, text in choice_pattern:
            clean = text.strip().rstrip('\n')
            if clean and len(clean) > 1:
                choices.append({"id": letter, "text": clean})
        
        # Determine question format
        qformat = "multipleChoice" if choices else "studentProducedResponse"
        
        # Extract question stem (everything before choices)
        stem = full_text
        if choices:
            first_choice = f"\n{choices[0]['id']}."
            idx = full_text.find(first_choice)
            if idx > 0:
                stem = full_text[:idx].strip()
        
        # Clean up ID line from stem
        stem = re.sub(r'^ID[:\s]+[a-f0-9]+\s*\n', '', stem).strip()
        stem = re.sub(r'^Question ID[:\s]+[a-f0-9]+\s*\n', '', stem).strip()
        
        # Extract answer from answer key
        correct_answer = ""
        explanation = ""
        if answer_text:
            am = re.search(r'Correct Answer:\s*([A-Za-z0-9./\-]+)', answer_text)
            if not am:
                am = re.search(r'Correct\s+([A-Za-z0-9./\-]+)', answer_text)
            if am:
                correct_answer = am.group(1).strip()
            
            rm = re.search(r'Rationale\s*\n(.+)', answer_text, re.DOTALL)
            if rm:
                explanation = rm.group(1).strip()[:1000]
        
        # Extract difficulty
        diff_m = re.search(r'Difficulty:\s*(\w+)', full_text)
        difficulty = "medium"
        if diff_m:
            difficulty = diff_m.group(1).lower()
        
        # Determine category from filename context
        question = {
            "source_qid": qid,
            "questionStem": stem,
            "answerOptions": choices if choices else None,
            "correctAnswer": correct_answer,
            "shortExplanation": explanation or None,
            "difficulty": difficulty if difficulty in ["easy", "medium", "hard"] else "medium",
            "questionFormat": qformat,
            "hasEquation": True,
            "source": "SAT Suite Question Bank",
            "subjectId": self.subject_map.get("MATH"),
            "examId": self.exam_map.get("SAT"),
            "calculatorAllowed": True,
        }
        return question

    def extract_questions_from_pdf(self, pdf_path, is_answer_key=False):
        """Extract all questions from a PDF"""
        text = self.extract_text(pdf_path)
        
        # Split by question IDs
        if is_answer_key:
            blocks = re.split(r'(?=Question ID\s+[a-f0-9]+\s*\nID\s*:\s*[a-f0-9]+)', text)
        else:
            blocks = re.split(r'(?=Question ID\s+[a-f0-9]+\s*\nID\s*:\s*[a-f0-9]+)', text)
        
        # Also try splitting by just ID: pattern
        if len(blocks) < 2:
            blocks = re.split(r'(?=\nID\s*:\s*[a-f0-9]+)', text)
        
        # Filter out empty blocks
        blocks = [b.strip() for b in blocks if b.strip() and len(b.strip()) > 50]
        
        return blocks

    def find_answer_key(self, question_path, base_dir):
        """Find the corresponding answer key for a question PDF"""
        # Answer key patterns
        dir_name = os.path.dirname(question_path)
        base_name = os.path.basename(question_path)
        
        # Try: A prefix + same name
        answer_name = "A" + base_name
        answer_path = os.path.join(dir_name, answer_name)
        if os.path.exists(answer_path):
            return answer_path
        
        # Try: - Answer Key.pdf suffix
        if "Answer Key" not in base_name:
            # Insert before .pdf
            name_no_ext = base_name.replace(".pdf", "")
            patterns = [
                f"{name_no_ext} - Answer Key.pdf",
                f"{name_no_ext} Answer Key.pdf",
                f"{name_no_ext} Answers.pdf",
                f"{name_no_ext} - Answers.pdf",
                f"Answer Key - {base_name}",
                f"A{name_no_ext}.pdf",
            ]
            for p in patterns:
                fp = os.path.join(dir_name, p)
                if os.path.exists(fp):
                    return fp
        
        # Try in Answers subdirectory
        answers_dir = os.path.join(base_dir, "Answers")
        if os.path.isdir(answers_dir):
            for p in os.listdir(answers_dir):
                if base_name.replace(".pdf", "") in p:
                    return os.path.join(answers_dir, p)
        
        # Try in subdirectories
        for root, dirs, files in os.walk(base_dir):
            for f in files:
                if "Answer" in f and base_name.replace(".pdf", "")[:20] in f:
                    return os.path.join(root, f)
        
        return None

    def classify_file(self, filename):
        """Determine subject and category from filename"""
        f = filename.lower()
        
        # Determine subject
        rw_keywords = ["words in context", "text structure", "cross text", "central idea", 
                       "inference", "command of evidence", "transitions", "rhetorical",
                       "boundary", "form structure", "craft", "expression", "conventions",
                       "information and ideas"]
        math_keywords = ["algebra", "linear equation", "quadratic", "exponential", 
                        "polynomial", "rational", "radical", "equivalent expression",
                        "nonlinear", "geometry", "trigonometry", "circle", "triangle",
                        "area", "volume", "probability", "percentage", "statistic",
                        "data analysis", "ratio", "rate", "proportion"]
        
        is_math = any(kw in f for kw in math_keywords)
        is_rw = any(kw in f for kw in rw_keywords)
        
        if is_math:
            return "MATH"
        elif is_rw:
            return "RW"
        return None

    def determine_category_from_path(self, filepath):
        """Extract domain/category from file path"""
        path_lower = filepath.lower()
        
        # Try to match against known categories
        for key, (dc, cc) in DOMAIN_CATEGORY_MAP.items():
            if key.lower() in path_lower:
                return dc, cc
        
        # Try to infer from path
        if "algebra" in path_lower:
            return "ALGEBRA", None
        elif "advanced math" in path_lower or "adv_math" in path_lower:
            return "ADV_MATH", None
        elif "problem-solving" in path_lower or "data analysis" in path_lower or "psda" in path_lower:
            return "PSDA", None
        elif "geometry" in path_lower or "trigonometry" in path_lower:
            return "GEOMETRY", None
        elif "information and ideas" in path_lower or "info_ideas" in path_lower:
            return "INFO_IDEAS", None
        elif "craft and structure" in path_lower or "craft_structure" in path_lower:
            return "CRAFT_STRUCTURE", None
        elif "expression of ideas" in path_lower or "expr_ideas" in path_lower:
            return "EXPR_IDEAS", None
        elif "conventions" in path_lower:
            return "CONVENTIONS", None
        
        return None, None

    def process_file(self, question_path, answer_path=None, subject_hint=None, domain_hint=None, category_hint=None):
        """Process a question PDF and import its questions"""
        try:
            blocks = self.extract_questions_from_pdf(question_path, is_answer_key=False)
            if not blocks:
                print(f"  ⚠ No questions found in {os.path.basename(question_path)}")
                self.skipped += 1
                return
            
            # Extract answer key if available
            answer_blocks = []
            if answer_path and os.path.exists(answer_path):
                answer_blocks = self.extract_questions_from_pdf(answer_path, is_answer_key=True)
                # Build answer lookup
                answer_map = {}
                for block in answer_blocks:
                    qid_m = re.search(r'ID[:\s]+([a-f0-9]+)', block)
                    if qid_m:
                        answer_map[qid_m.group(1)] = block
            else:
                answer_map = {}
            
            # Get domain/category from path
            dc, cc = self.determine_category_from_path(question_path)
            if domain_hint: dc = domain_hint
            if category_hint: cc = category_hint
            
            subject_code = self.classify_file(os.path.basename(question_path))
            if not subject_code:
                subject_code = "RW" if "extracted_001" in question_path else "MATH"
            
            parse_fn = self.parse_math_question if subject_code == "MATH" else self.parse_rw_question
            
            imported = 0
            for block in blocks:
                try:
                    # Get answer key for this question
                    qid_m = re.search(r'ID[:\s]+([a-f0-9]+)', block)
                    qid = qid_m.group(1) if qid_m else ""
                    answer_text = answer_map.get(qid, "")
                    
                    question = parse_fn(block, answer_text)
                    
                    # Apply path-derived category hints
                    if dc and dc in self.domain_map and not question.get("domainId"):
                        question["domainId"] = self.domain_map[dc]
                    if cc and cc in self.category_map and not question.get("categoryId"):
                        question["categoryId"] = self.category_map[cc]
                    
                    # Ensure exam and subject are set
                    if not question.get("examId"):
                        question["examId"] = self.exam_map.get("SAT")
                    if not question.get("subjectId"):
                        question["subjectId"] = self.subject_map.get(subject_code, self.subject_map.get("RW"))
                    
                    # Skip if no question stem
                    if not question.get("questionStem") or len(question["questionStem"]) < 10:
                        continue
                    
                    # Import via API
                    if self.import_question(question):
                        imported += 1
                        self.imported += 1
                except Exception as e:
                    self.errors += 1
            
            if imported > 0:
                print(f"  ✓ {imported} questions from {os.path.basename(question_path)}")
            else:
                print(f"  ⚠ No questions parsed from {os.path.basename(question_path)}")
                self.skipped += 1
                
        except Exception as e:
            print(f"  ✗ Error processing {os.path.basename(question_path)}: {e}")
            self.errors += 1

    def import_question(self, question):
        """Import a single question via API"""
        headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
        
        # Set publication status to active
        question["publicationStatus"] = "active"
        question["qualityStatus"] = "approved"
        question["rightsStatus"] = "original"
        
        # Clean up
        for key in ["source_qid"]:
            question.pop(key, None)
        
        try:
            r = requests.post(f"{API_BASE}/admin/questions", json=question, headers=headers, timeout=10)
            if r.status_code == 201:
                return True
            elif r.status_code == 409:
                # Duplicate - skip
                return False
            else:
                # Try extracting question text and checking if it's a duplicate
                err_text = r.text[:200]
                if "Unique constraint" in err_text or "already exists" in err_text.lower():
                    return False
                return False
        except Exception as e:
            return False

    def extract_from_and_import(self, base_dir, subject_hint=None):
        """Process all PDFs in a directory"""
        # Find all question PDFs (not answer keys)
        question_files = []
        answer_files = []
        
        for root, dirs, files in os.walk(base_dir):
            # Skip answer key directories
            for f in files:
                if not f.endswith(".pdf"):
                    continue
                fpath = os.path.join(root, f)
                if "Answer" in f or "answer" in f or "Answers" in f or f.startswith("A") and f[1].isdigit():
                    answer_files.append(fpath)
                else:
                    question_files.append(fpath)
        
        print(f"  Found {len(question_files)} question files, {len(answer_files)} answer key files")
        
        # Build answer key lookup by question file
        answer_map = {}
        for af in answer_files:
            base = os.path.basename(af)
            # Remove Answer Key / Answers suffix
            match_name = base
            for suffix in [" - Answer Key", " Answer Key", " Answers", " - Answers"]:
                if suffix in match_name:
                    match_name = match_name.replace(suffix, "")
                    break
            # Also try A prefix
            if match_name.startswith("A") and match_name[1].isdigit():
                match_name = match_name[1:]
            
            answer_map[match_name] = af
        
        # Process each question file
        for qf in sorted(question_files):
            base = os.path.basename(qf)
            
            # Find matching answer key
            answer_path = None
            if base in answer_map:
                answer_path = answer_map[base]
            else:
                # Try without extension
                name_no_ext = base.replace(".pdf", "")
                for k, v in answer_map.items():
                    k_no_ext = k.replace(".pdf", "")
                    if name_no_ext in k_no_ext or k_no_ext in name_no_ext:
                        answer_path = v
                        break
            
            if answer_path:
                print(f"  Processing: {base} → {os.path.basename(answer_path)}")
            else:
                print(f"  Processing: {base} (no answer key)")
            
            self.process_file(qf, answer_path, subject_hint)
        
        print(f"\n  Done: {self.imported} imported, {self.skipped} skipped, {self.errors} errors")


def main():
    extractor = QuestionExtractor()
    
    print("=" * 60)
    print("AEEG Practice Buddy - Question Importer")
    print("=" * 60)
    
    # Authenticate and load hierarchy
    print("\n[1/4] Authenticating...")
    extractor.authenticate()
    
    print("\n[2/4] Loading content hierarchy...")
    extractor.get_id_maps()
    
    # Process RW files
    print("\n[3/4] Processing Reading & Writing files...")
    rw_dir = "/home/qadir/Downloads/extracted_001"
    extractor.extract_from_and_import(rw_dir, "RW")
    
    # Process Math files
    print("\n[4/4] Processing Math files...")
    math_dir = "/home/qadir/Downloads/extracted_002"
    extractor.extract_from_and_import(math_dir, "MATH")
    
    print("\n" + "=" * 60)
    print(f"IMPORT SUMMARY:")
    print(f"  Imported: {extractor.imported}")
    print(f"  Skipped:  {extractor.skipped}")
    print(f"  Errors:   {extractor.errors}")
    print("=" * 60)


if __name__ == "__main__":
    main()
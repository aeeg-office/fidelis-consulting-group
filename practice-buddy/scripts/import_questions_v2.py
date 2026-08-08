"""
AEEG Practice Buddy - Enhanced PDF Question Extractor & Importer
Handles Math equations as separate text blocks, extracts from answer key rationales
"""

import fitz
import re
import json
import os
import requests
import sys
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

SAME_Y_THRESHOLD = 15  # pixels within which blocks are considered "same line"

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
        print(f"✓ Authenticated as admin")

    def get_id_maps(self):
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
        print(f"✓ Loaded: {len(self.exam_map)} exams, {len(self.subject_map)} subjects, {len(self.domain_map)} domains, {len(self.category_map)} categories")

    def get_page_text_with_blocks(self, pdf_path):
        """Extract text with position info from PDF"""
        doc = fitz.open(pdf_path)
        all_pages = []
        for page in doc:
            blocks = page.get_text("blocks")
            all_pages.append(blocks)
        doc.close()
        return all_pages

    def combine_blocks_on_page(self, blocks):
        """Combine adjacent blocks on the same line into coherent text"""
        if not blocks:
            return ""
        
        # Sort by y position, then x
        sorted_blocks = sorted(blocks, key=lambda b: (b[1], b[0]))
        
        lines = []
        current_line = []
        current_y = 0
        
        for b in sorted_blocks:
            x0, y0, x1, y1, text, *_ = b
            text = text.strip()
            if not text:
                continue
            
            if not current_line:
                current_line = [(x0, text)]
                current_y = y0
            elif abs(y0 - current_y) < SAME_Y_THRESHOLD:
                current_line.append((x0, text))
            else:
                # Sort by x position and join
                current_line.sort(key=lambda t: t[0])
                line_text = " ".join(t[1] for t in current_line)
                lines.append(line_text)
                current_line = [(x0, text)]
                current_y = y0
        
        if current_line:
            current_line.sort(key=lambda t: t[0])
            line_text = " ".join(t[1] for t in current_line)
            lines.append(line_text)
        
        return "\n".join(lines)

    def extract_math_question_from_blocks(self, blocks, answer_key_text=None):
        """Extract a Math question from page blocks"""
        combined = self.combine_blocks_on_page(blocks)
        lines = combined.split("\n")
        
        qid = ""
        for line in lines:
            m = re.search(r'ID[:\s]+([a-f0-9]+)', line)
            if m:
                qid = m.group(1)
                break
        
        # Build full text without metadata
        full_text = combined
        
        # Extract answer choices
        choices = []
        choice_lines = []
        for line in lines:
            m = re.match(r'^([A-D])\.\s*(.*)', line)
            if m:
                letter, text = m.group(1), m.group(2).strip()
                if text:
                    choices.append({"id": letter, "text": text})
                    choice_lines.append(line)
        
        # Remove choice lines from stem
        stem = full_text
        for cl in choice_lines:
            stem = stem.replace(cl, "")
        
        # Clean up
        stem = re.sub(r'^ID[:\s]+[a-f0-9]+\s*\n?', '', stem).strip()
        stem = re.sub(r'^Question ID[:\s]+[a-f0-9]+\s*\n?', '', stem).strip()
        stem = re.sub(r'\n{3,}', '\n\n', stem).strip()
        
        # Determine question format
        qformat = "multipleChoice" if choices else "studentProducedResponse"
        
        # Extract answer from answer key
        correct_answer = ""
        explanation = ""
        metadata = {}
        
        if answer_key_text:
            if isinstance(answer_key_text, list):
                ak_combined = self.combine_blocks_on_page(answer_key_text)
            else:
                ak_combined = answer_key_text
            
            # Extract correct answer
            am = re.search(r'Correct Answer:\s*([A-Za-z0-9./\-]+)', ak_combined)
            if not am:
                am = re.search(r'Correct\s+([A-Za-z0-9./\-]+)', ak_combined)
            if am:
                correct_answer = am.group(1).strip()
            
            # Extract rationale
            rm = re.search(r'Rationale\s*\n(.+)', ak_combined, re.DOTALL)
            if rm:
                explanation = rm.group(1).strip()[:1500]
            
            # Extract metadata from answer key
            meta_patterns = [
                (r'Assessment\s+(\w+)', 'assessment'),
                (r'Test\s+(.+)', 'test'),
                (r'Domain\s+(.+)', 'domain'),
                (r'Skill\s+(.+)', 'skill'),
                (r'Difficulty\s+(\w+)', 'difficulty'),
            ]
            for pattern, key in meta_patterns:
                m = re.search(pattern, ak_combined)
                if m:
                    metadata[key] = m.group(1).strip()
        
        # Extract difficulty from metadata
        difficulty = "medium"
        diff_str = metadata.get("difficulty", "")
        if diff_str.lower() in ["easy", "medium", "hard"]:
            difficulty = diff_str.lower()
        
        # Extract equation from rationale and add to stem
        equation = ""
        if explanation:
            # Look for the equation in the rationale
            eq_match = re.search(r'equation\s+([^\.]+)', explanation)
            if eq_match:
                equation = eq_match.group(1).strip()
        
        # Get domain/category from metadata
        domain_name = metadata.get("domain", "")
        skill_name = metadata.get("skill", "")
        
        domain_code = "ALGEBRA"
        category_code = "LIN_EQ_1VAR"
        
        for key, (dc, cc) in DOMAIN_CATEGORY_MAP.items():
            if key.lower() in skill_name.lower() or key.lower() in domain_name.lower():
                domain_code = dc
                category_code = cc
                break
        
        question = {
            "source_qid": qid,
            "questionStem": stem,
            "answerOptions": choices if choices else None,
            "correctAnswer": correct_answer,
            "shortExplanation": explanation or None,
            "difficulty": difficulty,
            "questionFormat": qformat,
            "hasEquation": True,
            "calculatorAllowed": True,
            "source": "SAT Suite Question Bank",
            "examId": self.exam_map.get("SAT"),
            "subjectId": self.subject_map.get("MATH"),
            "domainId": self.domain_map.get(domain_code),
            "categoryId": self.category_map.get(category_code),
        }
        return question

    def extract_rw_question_from_blocks(self, blocks, answer_key_text=None):
        """Extract an RW question from page blocks"""
        combined = self.combine_blocks_on_page(blocks)
        lines = combined.split("\n")
        
        qid = ""
        for line in lines:
            m = re.search(r'ID[:\s]+([a-f0-9]+)', line)
            if m:
                qid = m.group(1)
                break
        
        full_text = combined
        
        # Extract answer choices
        choices = []
        choice_lines = []
        for line in lines:
            m = re.match(r'^([A-D])\.\s*(.*)', line)
            if m:
                letter, text = m.group(1), m.group(2).strip()
                if text and len(text) > 2:
                    choices.append({"id": letter, "text": text})
                    choice_lines.append(line)
        
        # Find question stem
        stem_patterns = [
            r'Which choice completes the text',
            r'Which choice best describes',
            r'Which choice best states',
            r'Which option',
            r'Which finding',
            r'Which of the following',
            r'According to the text',
            r'Based on the texts',
            r'Which quotation',
            r'Which choice most logically',
            r'Which choice most effectively',
            r'As used in the text',
        ]
        
        stem = ""
        passage = ""
        for pattern in stem_patterns:
            m = re.search(pattern, full_text)
            if m:
                stem = full_text[m.start():]
                passage = full_text[:m.start()].strip()
                break
        
        if not stem:
            stem = full_text
        
        # Clean up stem
        stem = re.sub(r'^ID[:\s]+[a-f0-9]+\s*\n?', '', stem).strip()
        # Clean metadata from stem
        stem = re.sub(r'\nAssessment\s*\n.*', '', stem, flags=re.DOTALL).strip()
        stem = re.sub(r'\n{3,}', '\n\n', stem).strip()
        
        # Clean passage
        if passage:
            passage = re.sub(r'^ID[:\s]+[a-f0-9]+\s*\n?', '', passage).strip()
            passage = re.sub(r'\n{3,}', '\n\n', passage).strip()
        
        # Extract metadata from answer key
        metadata = {}
        if answer_key_text:
            if isinstance(answer_key_text, list):
                ak_combined = self.combine_blocks_on_page(answer_key_text)
            else:
                ak_combined = answer_key_text
            
            meta_patterns = [
                (r'Assessment\s+(\w+)', 'assessment'),
                (r'Test\s+(.+)', 'test'),
                (r'Domain\s+(.+)', 'domain'),
                (r'Skill\s+(.+)', 'skill'),
                (r'Difficulty\s+(\w+)', 'difficulty'),
            ]
            for pattern, key in meta_patterns:
                m = re.search(pattern, ak_combined)
                if m:
                    metadata[key] = m.group(1).strip()
        
        # Extract answer from answer key
        correct_answer = ""
        explanation = ""
        if answer_key_text:
            ak_combined = self.combine_blocks_on_page(answer_key_text) if isinstance(answer_key_text, list) else answer_key_text
            am = re.search(r'Correct Answer:\s*([A-Za-z0-9]+)', ak_combined)
            if not am:
                am = re.search(r'Correct\s+([A-Za-z0-9]+)', ak_combined)
            if am:
                correct_answer = am.group(1).strip()
            
            rm = re.search(r'Rationale\s*\n(.+)', ak_combined, re.DOTALL)
            if rm:
                explanation = rm.group(1).strip()[:1000]
        
        # Determine domain/category
        domain_name = metadata.get("domain", "")
        skill_name = metadata.get("skill", "")
        
        domain_code = "CRAFT_STRUCTURE"
        category_code = "WORDS_CONTEXT"
        
        for key, (dc, cc) in DOMAIN_CATEGORY_MAP.items():
            if key.lower() in skill_name.lower() or key.lower() in domain_name.lower():
                domain_code = dc
                category_code = cc
                break
        
        # Determine difficulty
        difficulty = "medium"
        diff_str = metadata.get("difficulty", "")
        diff_map = {"easy": "easy", "medium": "medium", "hard": "hard"}
        if diff_str.lower() in diff_map:
            difficulty = diff_map[diff_str.lower()]
        
        question = {
            "source_qid": qid,
            "passageText": passage if passage and len(passage) > 30 else None,
            "questionStem": stem,
            "answerOptions": choices if choices else None,
            "correctAnswer": correct_answer,
            "shortExplanation": explanation or None,
            "difficulty": difficulty,
            "questionFormat": "multipleChoice",
            "source": "SAT Suite Question Bank",
            "examId": self.exam_map.get("SAT"),
            "subjectId": self.subject_map.get("RW"),
            "domainId": self.domain_map.get(domain_code),
            "categoryId": self.category_map.get(category_code),
        }
        return question

    def extract_all_questions_from_pdf(self, pdf_path, is_math=False):
        """Extract all questions from a PDF using per-page block extraction"""
        pages = self.get_page_text_with_blocks(pdf_path)
        questions = []
        
        for page_blocks in pages:
            combined = self.combine_blocks_on_page(page_blocks)
            
            # Check if this page has a question ID
            if not re.search(r'ID\s*:\s*[a-f0-9]+', combined):
                continue
            
            # Check if it's a question page (has stem or answer key)
            if is_math:
                q = self.extract_math_question_from_blocks(page_blocks, None)
            else:
                q = self.extract_rw_question_from_blocks(page_blocks, None)
            
            if q.get("source_qid"):
                questions.append(q)
        
        return questions

    def extract_answer_key(self, pdf_path, is_math=False):
        """Extract answer key data from answer key PDF"""
        pages = self.get_page_text_with_blocks(pdf_path)
        answers = {}
        
        current_qid = None
        current_blocks = []
        
        for page_blocks in pages:
            combined = self.combine_blocks_on_page(page_blocks)
            
            # Check for question ID
            qid_m = re.search(r'ID\s*:\s*[a-f0-9]+', combined)
            answer_m = re.search(r'Answer', combined)
            
            if qid_m:
                qid = qid_m.group(0).split(":")[-1].strip()
                if answer_m:
                    current_qid = qid
                    current_blocks = page_blocks
                    answers[qid] = page_blocks
                else:
                    current_qid = qid
                    current_blocks = page_blocks
        
        return answers

    def process_file_pair(self, question_path, answer_path, is_math=False):
        """Process a question PDF with its answer key"""
        try:
            # Extract questions
            doc = fitz.open(question_path)
            num_pages = len(doc)
            doc.close()
            
            # Extract answer key
            answer_map = {}
            if answer_path and os.path.exists(answer_path):
                pages = self.get_page_text_with_blocks(answer_path)
                for page_blocks in pages:
                    combined = self.combine_blocks_on_page(page_blocks)
                    qid_m = re.search(r'ID\s*:\s*[a-f0-9]+', combined)
                    if qid_m:
                        qid = qid_m.group(0).split(":")[-1].strip()
                        answer_map[qid] = page_blocks
            
            # Process each page
            pages = self.get_page_text_with_blocks(question_path)
            imported = 0
            
            for page_blocks in pages:
                combined = self.combine_blocks_on_page(page_blocks)
                
                qid_m = re.search(r'ID\s*:\s*[a-f0-9]+', combined)
                if not qid_m:
                    continue
                qid = qid_m.group(0).split(":")[-1].strip()
                
                # Skip if already imported
                if qid in self.imported_qids:
                    continue
                
                # Parse question
                if is_math:
                    q = self.extract_math_question_from_blocks(page_blocks, answer_map.get(qid))
                else:
                    q = self.extract_rw_question_from_blocks(page_blocks, answer_map.get(qid))
                
                if not q.get("questionStem") or len(q["questionStem"]) < 10:
                    continue
                if not q.get("correctAnswer"):
                    continue
                
                # Import
                if self.import_question(q):
                    self.imported_qids.add(qid)
                    imported += 1
                    self.imported += 1
            
            return imported
        except Exception as e:
            print(f"  ✗ Error: {e}")
            self.errors += 1
            return 0

    def import_question(self, question):
        """Import a single question via API"""
        headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
        
        question["publicationStatus"] = "active"
        question["qualityStatus"] = "approved"
        question["rightsStatus"] = "original"
        question.pop("source_qid", None)
        
        try:
            r = requests.post(f"{API_BASE}/admin/questions", json=question, headers=headers, timeout=10)
            if r.status_code == 201:
                return True
            return False
        except:
            return False

    def classify_pdf(self, filepath):
        """Classify a PDF as Math or RW based on filename and path"""
        f = filepath.lower()
        math_dirs = ["algebra", "advanced math", "geometry", "trigonometry", "problem-solving", "data analysis"]
        rw_dirs = ["craft and structure", "expression of ideas", "information and ideas", "conventions"]
        
        if any(d in f for d in math_dirs):
            return True
        if any(d in f for d in rw_dirs):
            return False
        # Default based on extracted_001 (RW) or extracted_002 (Math)
        return "extracted_002" in filepath

    def get_domain_category_from_path(self, filepath):
        """Extract domain/category code from file path"""
        f = filepath.lower()
        for key, (dc, cc) in DOMAIN_CATEGORY_MAP.items():
            if key.lower() in f:
                return dc, cc
        return None, None

    def process_all(self, base_dir, label, is_math=False):
        """Process all PDFs in a directory"""
        question_files = []
        answer_files = {}
        
        for root, dirs, files in os.walk(base_dir):
            for f in files:
                if not f.endswith(".pdf"):
                    continue
                fpath = os.path.join(root, f)
                # Check if answer key
                is_answer = ("Answer" in f or "answer" in f or "Answers" in f or 
                           (f.startswith("A") and len(f) > 2 and f[1].isdigit()))
                if is_answer:
                    # Normalize name for matching
                    key = f.replace(" - Answer Key", "").replace(" Answer Key", "")
                    key = key.replace(" Answers", "").replace(" - Answers", "")
                    if key.startswith("A") and key[1].isdigit():
                        key = key[1:]
                    answer_files[key] = fpath
                else:
                    question_files.append(fpath)
        
        print(f"  {label}: {len(question_files)} question files, {len(answer_files)} answer files")
        
        total_imported = 0
        for qf in sorted(question_files):
            base = os.path.basename(qf)
            
            # Find matching answer key
            answer_path = None
            if base in answer_files:
                answer_path = answer_files[base]
            else:
                # Try fuzzy matching
                name_no_ext = base.replace(".pdf", "")
                for k, v in answer_files.items():
                    k_no_ext = k.replace(".pdf", "")
                    if name_no_ext in k_no_ext or k_no_ext in name_no_ext:
                        answer_path = v
                        break
            
            is_math = self.classify_pdf(qf)
            imported = self.process_file_pair(qf, answer_path, is_math)
            if imported > 0:
                total_imported += imported
                print(f"  ✓ {os.path.basename(qf)} → {imported} questions")
            else:
                self.skipped += 1
        
        print(f"  {label}: {total_imported} imported, {self.skipped} skipped")
        return total_imported


def main():
    importer = QuestionImporter()
    
    print("=" * 60)
    print("AEEG Practice Buddy - Question Importer v2")
    print("=" * 60)
    
    print("\n[1/3] Authenticating...")
    importer.authenticate()
    
    print("\n[2/3] Loading hierarchy...")
    importer.get_id_maps()
    
    print("\n[3/3] Importing questions...")
    
    rw_imported = importer.process_all("/home/qadir/Downloads/extracted_001", "Reading & Writing", is_math=False)
    math_imported = importer.process_all("/home/qadir/Downloads/extracted_002", "Math", is_math=True)
    
    print("\n" + "=" * 60)
    print(f"IMPORT COMPLETE:")
    print(f"  Reading & Writing: {rw_imported} questions")
    print(f"  Math:             {math_imported} questions")
    print(f"  Total imported:   {importer.imported}")
    print(f"  Skipped:          {importer.skipped}")
    print(f"  Errors:           {importer.errors}")
    print("=" * 60)


if __name__ == "__main__":
    main()
# Student Answer Plagiarism Checker

A plagiarism checking service that compares input text against student answers stored in MongoDB.

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with your MongoDB connection string:
```
MONGODB_URI=your_mongodb_connection_string
```

3. Run the Flask server:
```bash
python app.py
```

## API Endpoints

### Check Plagiarism
```
POST /check-plagiarism
Content-Type: application/json

{
    "text": "Text to check for plagiarism",
    "subject_id": "optional_subject_id"  // Optional: Filter by subject
}
```

Response format:
```json
{
    "results": [
        {
            "student_name": "Student Name",
            "student_roll": "Roll Number",
            "question": "Original Question",
            "answer": "Student's Answer",
            "similarity_percentage": 85.5
        }
    ],
    "total_matches": 1
}
```

### Get Subject Answers
```
GET /subject-answers/<subject_id>
```

Returns all answers for a specific subject.

## How it Works

The system:
1. Connects to your MongoDB database containing student answers
2. When checking for plagiarism, it compares the input text against all stored student answers
3. Uses Python's difflib SequenceMatcher to calculate similarity ratios
4. Returns matches with similarity percentage above 50%
5. Results are sorted by similarity percentage in descending order

Note: The system only returns matches with similarity above 50% to focus on significant matches. 
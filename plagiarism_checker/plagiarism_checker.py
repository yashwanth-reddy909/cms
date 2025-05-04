from pymongo import MongoClient
import difflib
import os
from dotenv import load_dotenv

load_dotenv()

class PlagiarismChecker:
    def __init__(self):
        # Initialize MongoDB connection
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        db_name = os.getenv('DB_NAME', 'newschool')
        collection_name = os.getenv('COLLECTION_NAME', 'students')
        self.client = MongoClient(mongodb_uri)
        self.db = self.client[db_name]  # Replace with your actual database name
        self.collection = self.db[collection_name]  # Collection containing student data

    def calculate_similarity(self, text1, text2):
        """Calculate similarity ratio between two texts"""
        if not text1 or not text2:
            return 0
        matcher = difflib.SequenceMatcher(None, str(text1).lower(), str(text2).lower())
        return matcher.ratio() * 100

    def check_plagiarism(self, input_text, subject_id=None):
        """
        Check input text against all student answers in the database
        Returns a list of matches with similarity percentages
        """
        results = []
        
        # Find all students with question results
        # query = {"questionResult": {"$exists": True, "$ne": []}}
        # if subject_id:
        #     query["questionResult.subName.$oid"] = subject_id
            
        students = self.collection.find()
        
        for student in students:
            for question_result in student.get('questionResult', []):
                for result in question_result.get('result', []):
                    # check if the marks is present and in int format and then check its greater than zero
                    if result.get('marks') and int(result.get('marks')) > -1:
                        similarity = self.calculate_similarity(input_text, result.get('answer'))
                        if similarity > 15:  # Only include matches above 50%
                            results.append({
                                'student_name': student.get('name'),
                                'student_roll': student.get('rollNum'),
                                'question': result.get('question'),
                                'answer': result.get('answer'),
                                'similarity_percentage': round(similarity, 2)
                            })
        # Sort results by similarity percentage in descending order
        results.sort(key=lambda x: x['similarity_percentage'], reverse=True)
        return results

    def get_subject_answers(self, subject_id):
        """Get all answers for a specific subject"""
        query = {
            "questionResult": {
                "$elemMatch": {
                    "subName.$oid": subject_id
                }
            }
        }
        return list(self.collection.find(query))

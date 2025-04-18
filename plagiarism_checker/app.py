from flask import Flask, request, jsonify
from plagiarism_checker import PlagiarismChecker

app = Flask(__name__)
checker = PlagiarismChecker()

# generate a simple curl for checking plagiarism
# curl -X POST http://localhost:5001/check-plagiarism -H "Content-Type: application/json" -d '{"text": "This is a test text", "subject_id": "68026e0101b87da2fbe57745"}'

@app.route('/check-plagiarism', methods=['POST'])
def check_plagiarism():
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data['text']
    subject_id = data.get('subject_id')  # Optional subject ID to filter by subject
    
    plagiarism_results = checker.check_plagiarism(text, subject_id)
    
    return jsonify({
        'results': plagiarism_results,
        'total_matches': len(plagiarism_results)
    })

@app.route('/subject-answers/<subject_id>', methods=['GET'])
def get_subject_answers(subject_id):
    """Get all answers for a specific subject"""
    answers = checker.get_subject_answers(subject_id)
    return jsonify({
        'answers': answers
    })

@app.route('/add-reference', methods=['POST'])
def add_reference():
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data['text']
    checker.add_reference_text(text)
    
    return jsonify({
        'message': 'Reference text added successfully'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001) 
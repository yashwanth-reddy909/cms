// call the python api to check plagiarism

const axios = require('axios');

exports.checkPlagiarism = async (req, res) => {
    const { text, subjectId } = req.body;

    try {
        const response = await axios.post('http://localhost:5001/check-plagiarism', {
            text,
            subjectId
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Plagiarism check error:', error.message);
        return res.status(500).json({ message: 'Error checking plagiarism', error: error.message });
    }
}


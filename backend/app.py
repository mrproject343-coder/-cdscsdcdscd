# ===== Flask Backend =====

from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
import os

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Import routes
from routes import admin, teacher, student, exam

# Register blueprints
app.register_blueprint(admin.bp, url_prefix='/api/admin')
app.register_blueprint(teacher.bp, url_prefix='/api/teacher')
app.register_blueprint(student.bp, url_prefix='/api/student')
app.register_blueprint(exam.bp, url_prefix='/api/exam')

@app.route('/')
def index():
    return jsonify({
        'message': 'اسألني API',
        'version': '1.0.0',
        'status': 'running'
    })

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy'})

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

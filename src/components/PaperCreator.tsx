import { useState, useRef } from 'react';
import { validatePaperJSON } from '../utils/validator';
import { savePaper } from '../utils/storage';
import { TestPaper } from '../types';
import { Upload, FileText, AlertCircle, CheckCircle, ClipboardPaste } from 'lucide-react';

interface PaperCreatorProps {
  onPaperCreated: () => void;
}

const SAMPLE_JSON = `{
  "paperName": "SSC CGL Mock Test 01",
  "description": "General awareness + reasoning mock test for SSC CGL aspirants",
  "duration": 60,
  "totalQuestions": 5,
  "totalMarks": 20,
  "negativeMarking": 0.25,
  "questions": [
    {
      "id": "q1",
      "questionText": "What is the capital of France?",
      "questionType": "single_choice",
      "options": [
        { "id": "a", "text": "Berlin" },
        { "id": "b", "text": "Madrid" },
        { "id": "c", "text": "Paris" },
        { "id": "d", "text": "Rome" }
      ],
      "correctAnswer": "c",
      "marks": 4
    },
    {
      "id": "q2",
      "questionText": "Which of these are prime numbers?",
      "questionType": "multiple_choice",
      "options": [
        { "id": "a", "text": "2" },
        { "id": "b", "text": "4" },
        { "id": "c", "text": "5" },
        { "id": "d", "text": "9" }
      ],
      "correctAnswer": ["a", "c"],
      "marks": 4
    },
    {
      "id": "q3",
      "questionText": "The earth revolves around the sun.",
      "questionType": "true_false",
      "options": [
        { "id": "a", "text": "True" },
        { "id": "b", "text": "False" }
      ],
      "correctAnswer": "a",
      "marks": 4
    }
  ]
}`;

export default function PaperCreator({ onPaperCreated }: PaperCreatorProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [createdPaper, setCreatedPaper] = useState<TestPaper | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      setErrors([]);
      setSuccess(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSubmit = () => {
    setErrors([]);
    setSuccess(false);
    setCreatedPaper(null);

    const result = validatePaperJSON(jsonInput);

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    if (result.paper) {
      savePaper(result.paper);
      setCreatedPaper(result.paper);
      setSuccess(true);
      onPaperCreated();
    }
  };

  const handleLoadSample = () => {
    setJsonInput(SAMPLE_JSON);
    setErrors([]);
    setSuccess(false);
    setCreatedPaper(null);
  };

  const handleClear = () => {
    setJsonInput('');
    setErrors([]);
    setSuccess(false);
    setCreatedPaper(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create Test Paper
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Paste a JSON object or upload a .json file to create a new mock test paper.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleLoadSample}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
        >
          <ClipboardPaste size={18} />
          Load Sample
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        >
          <Upload size={18} />
          Upload JSON File
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Clear
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* JSON Input */}
      <div className="mb-6">
        <textarea
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setErrors([]);
            setSuccess(false);
          }}
          placeholder='Paste your test paper JSON here...'
          className="w-full h-80 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl resize-y focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          spellCheck={false}
        />
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-red-800 dark:text-red-300">
              Validation Errors ({errors.length})
            </h3>
          </div>
          <ul className="space-y-1">
            {errors.map((error, idx) => (
              <li key={idx} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {success && createdPaper && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-green-800 dark:text-green-300">
              Paper Created Successfully!
            </h3>
          </div>
          <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
            <p><strong>Name:</strong> {createdPaper.paperName}</p>
            <p><strong>Questions:</strong> {createdPaper.totalQuestions}</p>
            <p><strong>Total Marks:</strong> {createdPaper.totalMarks}</p>
            <p><strong>Duration:</strong> {createdPaper.duration} minutes</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!jsonInput.trim()}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FileText size={20} />
        Validate & Create Paper
      </button>
    </div>
  );
}

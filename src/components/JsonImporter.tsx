import { useState, useRef } from 'react';
import { validatePaperJSON, parsePaperJSON } from '../utils/validator';
import { savePaper, checkDuplicatePaper } from '../services/database';
import { getDemoPaperJSON } from '../utils/demoData';
import { PaperJSON, ValidationResult } from '../types';
import { Upload, FileJson, CheckCircle, AlertTriangle, XCircle, ClipboardPaste, Eye, Download, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface JsonImporterProps {
  userId?: string;
  onImported: () => void;
}

export default function JsonImporter({ userId, onImported }: JsonImporterProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [parsedPaper, setParsedPaper] = useState<PaperJSON | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [showSchema, setShowSchema] = useState(false);
  const [showPromptGen, setShowPromptGen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleValidate = () => {
    const result = validatePaperJSON(jsonInput);
    setValidation(result);
    if (result.valid) {
      const paper = parsePaperJSON(jsonInput);
      setParsedPaper(paper);
      setShowPreview(true);
    } else {
      setParsedPaper(null);
      setShowPreview(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setJsonInput(content);
      setValidation(null);
      setParsedPaper(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadDemo = () => {
    setJsonInput(getDemoPaperJSON());
    setValidation(null);
    setParsedPaper(null);
    setShowPreview(false);
  };

  const handleImport = async () => {
    if (!parsedPaper || !validation?.valid) return;
    setImporting(true);
    setImportError('');
    setDuplicateWarning('');

    // Check for duplicates
    const existing = await checkDuplicatePaper(parsedPaper.paperTitle, userId);
    if (existing) {
      setDuplicateWarning(`A paper titled "${parsedPaper.paperTitle}" already exists.`);
      setImporting(false);
      return;
    }

    try {
      await savePaper({
        user_id: userId || 'guest',
        exam: parsedPaper.exam || 'SSC CGL',
        title: parsedPaper.paperTitle,
        description: parsedPaper.description || '',
        difficulty: parsedPaper.difficulty || 'medium',
        duration_minutes: parsedPaper.durationMinutes,
        total_marks: parsedPaper.totalMarks || validation.totalMarks,
        negative_marking: parsedPaper.negativeMarking || 0,
        question_count: parsedPaper.questions.length,
        subjects: parsedPaper.subjects || validation.subjects,
        raw_json: parsedPaper,
        is_demo: false,
        visibility: 'private',
      });
      setJsonInput('');
      setValidation(null);
      setParsedPaper(null);
      setShowPreview(false);
      onImported();
    } catch (err) {
      setImportError('Failed to save paper. Please try again.');
      console.error(err);
    }
    setImporting(false);
  };

  const handleForceImport = async () => {
    if (!parsedPaper) return;
    setImporting(true);
    try {
      await savePaper({
        user_id: userId || 'guest',
        exam: parsedPaper.exam || 'SSC CGL',
        title: parsedPaper.paperTitle + ' (Copy)',
        description: parsedPaper.description || '',
        difficulty: parsedPaper.difficulty || 'medium',
        duration_minutes: parsedPaper.durationMinutes,
        total_marks: parsedPaper.totalMarks || validation!.totalMarks,
        negative_marking: parsedPaper.negativeMarking || 0,
        question_count: parsedPaper.questions.length,
        subjects: parsedPaper.subjects || validation!.subjects,
        raw_json: parsedPaper,
        is_demo: false,
        visibility: 'private',
      });
      setDuplicateWarning('');
      setJsonInput('');
      setValidation(null);
      setParsedPaper(null);
      setShowPreview(false);
      onImported();
    } catch { setImportError('Failed to save.'); }
    setImporting(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Import Question Paper</h1>
        <p className="text-gray-600 dark:text-gray-400">Paste AI-generated JSON, validate it, and import into your exam library.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={handleLoadDemo} className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors text-sm font-medium">
          <Sparkles size={16} /> Load Demo Paper
        </button>
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium">
          <Upload size={16} /> Upload .json File
        </button>
        <button onClick={() => setShowPromptGen(!showPromptGen)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-sm font-medium">
          <Sparkles size={16} /> AI Prompt Generator
        </button>
        <button onClick={() => setShowSchema(!showSchema)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
          <FileJson size={16} /> {showSchema ? 'Hide' : 'Show'} Schema
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
      </div>

      {/* AI Prompt Generator */}
      {showPromptGen && <AIPromptHelper />}

      {/* JSON Schema */}
      {showSchema && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">JSON Schema Reference</h3>
            <button onClick={() => { navigator.clipboard.writeText(SCHEMA_EXAMPLE); }} className="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Copy Schema</button>
          </div>
          <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto max-h-64 overflow-y-auto">{SCHEMA_EXAMPLE}</pre>
        </div>
      )}

      {/* JSON Editor */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paste your JSON below</label>
        <textarea
          value={jsonInput}
          onChange={(e) => { setJsonInput(e.target.value); setValidation(null); setParsedPaper(null); }}
          placeholder='Paste your AI-generated question paper JSON here...'
          className="w-full h-64 p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl resize-y focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          spellCheck={false}
        />
      </div>

      {/* Validate Button */}
      <button onClick={handleValidate} disabled={!jsonInput.trim()} className="mb-6 flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <CheckCircle size={18} /> Validate JSON
      </button>

      {/* Validation Results */}
      {validation && (
        <div className={`mb-6 p-5 rounded-xl border ${validation.valid ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
          <div className="flex items-center gap-2 mb-3">
            {validation.valid ? <CheckCircle size={20} className="text-green-600" /> : <XCircle size={20} className="text-red-600" />}
            <h3 className={`font-bold ${validation.valid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
              {validation.valid ? 'JSON is Valid!' : `Validation Failed (${validation.errors.length} error${validation.errors.length > 1 ? 's' : ''})`}
            </h3>
          </div>

          {validation.valid && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{validation.questionCount}</div>
                <div className="text-xs text-gray-500">Questions</div>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{validation.totalMarks}</div>
                <div className="text-xs text-gray-500">Total Marks</div>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{validation.duration}m</div>
                <div className="text-xs text-gray-500">Duration</div>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{validation.subjects.length}</div>
                <div className="text-xs text-gray-500">Subjects</div>
              </div>
            </div>
          )}

          {validation.errors.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {validation.errors.map((err, i) => (
                <li key={i} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                  <XCircle size={14} className="mt-0.5 shrink-0" />
                  <span><code className="text-xs bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded">{err.path}</code> — {err.message}</span>
                </li>
              ))}
            </ul>
          )}

          {validation.warnings.length > 0 && (
            <ul className="space-y-1.5">
              {validation.warnings.map((w, i) => (
                <li key={i} className="text-sm text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{w.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-yellow-600" />
            <p className="font-medium text-yellow-800 dark:text-yellow-300">{duplicateWarning}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleForceImport} className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">Import Anyway</button>
            <button onClick={() => setDuplicateWarning('')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {importError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">{importError}</div>
      )}

      {/* Preview */}
      {showPreview && parsedPaper && validation?.valid && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button onClick={() => setShowPreview(!showPreview)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-indigo-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Preview Paper</span>
            </div>
            {showPreview ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showPreview && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{parsedPaper.paperTitle}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{parsedPaper.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">{parsedPaper.exam}</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{parsedPaper.durationMinutes} min</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{parsedPaper.totalMarks} marks</span>
                {parsedPaper.subjects?.map(s => (
                  <span key={s} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs">{s}</span>
                ))}
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {parsedPaper.questions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Q{idx + 1}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 dark:text-gray-400">
                      {q.options.map((opt, oi) => (
                        <span key={oi} className={`px-2 py-1 rounded ${oi === q.answerIndex ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium' : ''}`}>
                          {String.fromCharCode(65 + oi)}) {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Button */}
      {validation?.valid && parsedPaper && !duplicateWarning && (
        <button onClick={handleImport} disabled={importing} className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
          <Download size={18} /> {importing ? 'Importing...' : 'Import Paper'}
        </button>
      )}
    </div>
  );
}

// AI Prompt Generator Sub-component
function AIPromptHelper() {
  const [subject, setSubject] = useState('Quantitative Aptitude');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [includeHints, setIncludeHints] = useState(true);
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [includeShortcuts, setIncludeShortcuts] = useState(true);
  const [includeSuggestions, setIncludeSuggestions] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePrompt = () => {
    const parts = [
      `Generate ${count} SSC CGL ${subject} questions`,
      topic ? `on the topic "${topic}"` : '',
      `with ${difficulty} difficulty level.`,
      '',
      'Each question must follow this exact JSON schema:',
      '```',
      JSON.stringify({
        id: "number",
        subject: subject,
        topic: topic || "topic_name",
        difficulty: difficulty,
        question: "Question text here",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Exact text of correct option",
        answerIndex: "0-based index of correct option",
        marks: 2,
        negativeMarks: 0.5,
        ...(includeHints && { hint: "A helpful hint" }),
        ...(includeSolutions && { solution: "Step-by-step solution" }),
        ...(includeShortcuts && { shortcut: "Faster method if applicable" }),
        ...(includeSuggestions && { learningSuggestion: "What to practice" }),
      }, null, 2),
      '```',
      '',
      'IMPORTANT RULES:',
      '1. Return ONLY valid JSON — no Markdown, no explanations outside JSON.',
      '2. Wrap the entire output in a paper object with: exam, paperTitle, description, durationMinutes, totalMarks, negativeMarking, difficulty, subjects, questions.',
      '3. Each question must have exactly 4 options with exactly one correct answer.',
      '4. The correctAnswer must exactly match one of the options.',
      '5. The answerIndex must be the 0-based index of the correct option.',
      '6. Verify all calculations are correct.',
      '7. Match SSC CGL exam style and difficulty.',
      '8. Avoid duplicate questions.',
      '9. Provide useful but concise hints and solutions.',
      '10. Provide shortcut methods where mathematically appropriate.',
    ].filter(Boolean);

    return parts.join('\n');
  };

  const prompt = generatePrompt();

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-6 p-5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl">
      <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
        <Sparkles size={18} /> AI Question Generator — Prompt Builder
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white">
            <option>Quantitative Aptitude</option>
            <option>General Intelligence & Reasoning</option>
            <option>English Comprehension</option>
            <option>General Awareness</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Topic (optional)</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Percentage" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Number of Questions</label>
          <input type="number" min={1} max={100} value={count} onChange={e => setCount(Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Difficulty</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Include:</label>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={includeHints} onChange={e => setIncludeHints(e.target.checked)} /> Hints</label>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={includeSolutions} onChange={e => setIncludeSolutions(e.target.checked)} /> Solutions</label>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={includeShortcuts} onChange={e => setIncludeShortcuts(e.target.checked)} /> Shortcuts</label>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={includeSuggestions} onChange={e => setIncludeSuggestions(e.target.checked)} /> Suggestions</label>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Generated Prompt (copy and paste to your AI model):</label>
        <pre className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-800 dark:text-gray-200 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">{prompt}</pre>
      </div>
      <div className="flex gap-2">
        <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <ClipboardPaste size={14} /> {copied ? 'Copied!' : 'Copy AI Prompt'}
        </button>
      </div>
    </div>
  );
}

const SCHEMA_EXAMPLE = `{
  "exam": "SSC CGL",
  "paperTitle": "Your Paper Title",
  "description": "Brief description",
  "durationMinutes": 60,
  "totalMarks": 100,
  "negativeMarking": 0.5,
  "difficulty": "medium",
  "subjects": ["Quantitative Aptitude", "General Intelligence & Reasoning", "English Comprehension", "General Awareness"],
  "questions": [
    {
      "id": 1,
      "subject": "Quantitative Aptitude",
      "topic": "Percentage",
      "subtopic": "Successive Percentage",
      "difficulty": "medium",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B",
      "answerIndex": 1,
      "marks": 2,
      "negativeMarks": 0.5,
      "hint": "A helpful hint for the student",
      "solution": "Step-by-step solution...",
      "method": "Standard method explanation",
      "shortcut": "Faster approach",
      "learningSuggestion": "What to practice next",
      "timeEstimate": 60,
      "tags": ["ssc-cgl", "quant"],
      "source": "Previous year paper",
      "image": "https://example.com/image.png",
      "formula": "A = P(1 + r/100)^n",
      "passage": "For English comprehension questions"
    }
  ]
}`;

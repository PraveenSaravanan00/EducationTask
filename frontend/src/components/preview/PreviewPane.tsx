import { useState } from 'react';
import type { Question } from '../../types';

interface Props {
  questions: Question[];
  documentTitle: string;
}

const TYPE_LABEL: Record<string, string> = {
  'multiple-choice': 'Multiple Choice',
  'true-false': 'True / False',
  'short-answer': 'Short Answer',
};

export default function PreviewPane({ questions, documentTitle }: Props) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [perQuestionShow, setPerQuestionShow] = useState<Record<number, boolean>>({});

  const toggleGlobal = () => {
    setShowAnswers((prev) => !prev);
    setPerQuestionShow({});
  };

  const toggleQuestion = (i: number) => {
    setPerQuestionShow((prev) => ({
      ...prev,
      [i]: !(prev[i] ?? showAnswers),
    }));
  };

  const isAnswerVisible = (i: number) =>
    perQuestionShow[i] !== undefined ? perQuestionShow[i] : showAnswers;

  return (
    <div className="preview-pane">
      <div className="preview-toolbar">
        <h2 className="preview-title">👁 Preview</h2>
        <button
          id="toggle-all-answers"
          className={`btn btn-toggle ${showAnswers ? 'btn-toggle--active' : ''}`}
          onClick={toggleGlobal}
        >
          {showAnswers ? 'Hide All Answers' : 'Show All Answers'}
        </button>
      </div>

      <div className="preview-doc-title">
        <h3>{documentTitle || 'Untitled Document'}</h3>
      </div>

      {questions.length === 0 ? (
        <div className="preview-empty">
          <span>📄</span>
          <p>Questions will appear here as you create them.</p>
        </div>
      ) : (
        <div className="preview-questions">
          {questions.map((q, i) => (
            <div key={q._id ?? i} className="preview-question">
              <div className="preview-q-header">
                <div className="preview-q-meta">
                  <span className="preview-q-num">Q{i + 1}</span>
                  <span className="preview-q-type">{TYPE_LABEL[q.type]}</span>
                </div>
                <button
                  id={`toggle-answer-${i}`}
                  className="btn btn-ghost btn-sm"
                  onClick={() => toggleQuestion(i)}
                >
                  {isAnswerVisible(i) ? ' Hide' : ' Show'}
                </button>
              </div>

              <p className="preview-q-text">
                {q.questionText || <em className="muted">No question text yet...</em>}
              </p>

              {q.type === 'multiple-choice' && q.options.length > 0 && (
                <div className="preview-options">
                  {q.options
                    .filter((o) => o.trim() !== '')
                    .map((opt, j) => (
                      <div
                        key={j}
                        className={`preview-option ${
                          isAnswerVisible(i) && opt === q.correctAnswer
                            ? 'preview-option--correct'
                            : ''
                        }`}
                      >
                        <span className="opt-label">
                          {String.fromCharCode(65 + j)}.
                        </span>
                        {opt}
                        {isAnswerVisible(i) && opt === q.correctAnswer && (
                          <span className="correct-badge">✓ Correct</span>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {q.type === 'true-false' && (
                <div className="preview-options">
                  {['True', 'False'].map((opt) => (
                    <div
                      key={opt}
                      className={`preview-option ${
                        isAnswerVisible(i) && opt === q.correctAnswer
                          ? 'preview-option--correct'
                          : ''
                      }`}
                    >
                      {opt === 'True' ? 'Yes' : 'No'} {opt}
                      {isAnswerVisible(i) && opt === q.correctAnswer && (
                        <span className="correct-badge">✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'short-answer' && (
                <div className="preview-sa">
                  {isAnswerVisible(i) ? (
                    <div className="answer-reveal">
                      <span className="answer-label">Answer:</span>
                      <span className="answer-text">
                        {q.correctAnswer || <em className="muted">Not set</em>}
                      </span>
                    </div>
                  ) : (
                    <div className="answer-hidden">
                      <div className="answer-blur-bar" />
                      <span className="muted">Answer hidden</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

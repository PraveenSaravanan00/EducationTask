import { useState, useEffect } from 'react';
import type { Question, QuestionType, QuestionErrors } from '../../types';

interface Props {
  question: Question;
  index: number;
  onChange: (updated: Question) => void;
  onDelete: () => void;
}

function validateQuestion(q: Question): QuestionErrors {
  const errors: QuestionErrors = {};

  if (!q.questionText.trim()) {
    errors.questionText = 'Question text cannot be empty.';
  }

  if (q.type === 'multiple-choice') {
    const filled = q.options.filter((o) => o.trim() !== '');
    if (filled.length < 2) {
      errors.options = 'Provide at least 2 options.';
    }
    if (!q.correctAnswer.trim()) {
      errors.correctAnswer = 'Select a correct answer.';
    }
  }

  if (q.type === 'true-false') {
    if (!q.correctAnswer.trim()) {
      errors.correctAnswer = 'Select True or False as the correct answer.';
    }
  }

  if (q.type === 'short-answer') {
    if (!q.correctAnswer.trim()) {
      errors.correctAnswer = 'Provide the expected correct answer.';
    }
  }

  return errors;
}

const TYPE_LABELS: Record<QuestionType, string> = {
  'multiple-choice': 'Multiple Choice',
  'true-false': 'True / False',
  'short-answer': 'Short Answer',
};

export default function QuestionBlock({ question, index, onChange, onDelete }: Props) {
  const [errors, setErrors] = useState<QuestionErrors>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) {
      setErrors(validateQuestion(question));
    }
  }, [question, touched]);

  const update = (patch: Partial<Question>) => {
    setTouched(true);
    onChange({ ...question, ...patch });
  };

  const updateOption = (i: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[i] = value;
    update({ options: newOptions });
  };

  const addOption = () => {
    update({ options: [...question.options, ''] });
  };

  const removeOption = (i: number) => {
    const newOptions = question.options.filter((_, idx) => idx !== i);
    const newCorrect = question.correctAnswer === question.options[i] ? '' : question.correctAnswer;
    update({ options: newOptions, correctAnswer: newCorrect });
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className={`question-block ${hasErrors && touched ? 'question-block--error' : ''}`}>
      <div className="question-block__header">
        <div className="question-block__meta">
          <span className="question-index">Q{index + 1}</span>
          <select
            id={`q-type-${index}`}
            className="type-select"
            value={question.type}
            onChange={(e) => {
              update({
                type: e.target.value as QuestionType,
                options:
                  e.target.value === 'true-false'
                    ? ['True', 'False']
                    : e.target.value === 'multiple-choice'
                    ? ['', '', '', '']
                    : [],
                correctAnswer: '',
              });
            }}
          >
            {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <button
          id={`q-delete-${index}`}
          className="btn btn-icon btn-danger"
          onClick={onDelete}
          title="Delete question"
        >
          🗑
        </button>
      </div>

      <div className={`form-group ${errors.questionText ? 'form-group--error' : ''}`}>
        <label htmlFor={`q-text-${index}`}>Question</label>
        <textarea
          id={`q-text-${index}`}
          className="question-textarea"
          placeholder="Enter your question here..."
          value={question.questionText}
          rows={2}
          onChange={(e) => update({ questionText: e.target.value })}
          onBlur={() => setTouched(true)}
        />
        {errors.questionText && (
          <span className="field-error">⚠️ {errors.questionText}</span>
        )}
      </div>

      {question.type === 'multiple-choice' && (
        <div className={`form-group ${errors.options ? 'form-group--error' : ''}`}>
          <label>Options</label>
          <div className="options-list">
            {question.options.map((opt, i) => (
              <div key={i} className="option-row">
                <input
                  id={`q-${index}-opt-${i}`}
                  type="radio"
                  name={`correct-${question._id ?? index}`}
                  checked={question.correctAnswer === opt && opt.trim() !== ''}
                  onChange={() => opt.trim() && update({ correctAnswer: opt })}
                  title="Mark as correct"
                />
                <input
                  id={`q-${index}-opt-text-${i}`}
                  type="text"
                  className="option-input"
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  onBlur={() => setTouched(true)}
                />
                {question.options.length > 2 && (
                  <button
                    className="btn btn-icon"
                    onClick={() => removeOption(i)}
                    title="Remove option"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {question.options.length < 6 && (
            <button className="btn btn-ghost btn-sm" onClick={addOption} id={`q-${index}-add-opt`}>
              + Add Option
            </button>
          )}
          {errors.options && (
            <span className="field-error"> {errors.options}</span>
          )}
          {errors.correctAnswer && (
            <span className="field-error"> {errors.correctAnswer}</span>
          )}
        </div>
      )}

      {question.type === 'true-false' && (
        <div className={`form-group ${errors.correctAnswer ? 'form-group--error' : ''}`}>
          <label>Correct Answer</label>
          <div className="tf-group">
            {['True', 'False'].map((opt) => (
              <button
                key={opt}
                id={`q-${index}-tf-${opt.toLowerCase()}`}
                className={`btn btn-tf ${question.correctAnswer === opt ? 'btn-tf--active' : ''}`}
                onClick={() => update({ correctAnswer: opt, options: ['True', 'False'] })}
              >
                {opt === 'True' ? 'Yes' : 'No'} {opt}
              </button>
            ))}
          </div>
          {errors.correctAnswer && (
            <span className="field-error"> {errors.correctAnswer}</span>
          )}
        </div>
      )}

      {question.type === 'short-answer' && (
        <div className={`form-group ${errors.correctAnswer ? 'form-group--error' : ''}`}>
          <label htmlFor={`q-${index}-sa`}>Expected Answer</label>
          <input
            id={`q-${index}-sa`}
            type="text"
            className={errors.correctAnswer ? 'input--error' : ''}
            placeholder="Enter the expected correct answer..."
            value={question.correctAnswer}
            onChange={(e) => update({ correctAnswer: e.target.value })}
            onBlur={() => setTouched(true)}
          />
          {errors.correctAnswer && (
            <span className="field-error"> {errors.correctAnswer}</span>
          )}
        </div>
      )}

      {/* Valid badge */}
      {touched && !hasErrors && (
        <div className="valid-badge">✓ Valid</div>
      )}
    </div>
  );
}

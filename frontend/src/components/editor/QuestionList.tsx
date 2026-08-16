import type { Question, QuestionType } from '../../types';
import QuestionBlock from './QuestionBlock';

interface Props {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

const DEFAULT_QUESTION = (order: number): Question => ({
  type: 'multiple-choice',
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  order,
});

export default function QuestionList({ questions, onChange }: Props) {
  const addQuestion = (type: QuestionType) => {
    const base: Question = {
      type,
      questionText: '',
      options:
        type === 'multiple-choice'
          ? ['', '', '', '']
          : type === 'true-false'
          ? ['True', 'False']
          : [],
      correctAnswer: '',
      order: questions.length,
    };
    onChange([...questions, base]);
  };

  const updateQuestion = (index: number, updated: Question) => {
    const copy = [...questions];
    copy[index] = updated;
    onChange(copy);
  };

  const deleteQuestion = (index: number) => {
    const copy = questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i }));
    onChange(copy);
  };

  return (
    <div className="question-list">
      {questions.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>No questions yet.</p>
          <p className="empty-sub">Add a question below to get started.</p>
        </div>
      )}

      {questions.map((q, i) => (
        <QuestionBlock
          key={q._id ?? i}
          question={q}
          index={i}
          onChange={(updated) => updateQuestion(i, updated)}
          onDelete={() => deleteQuestion(i)}
        />
      ))}

      <div className="add-question-bar">
        <span className="add-label">Add question:</span>
        <button
          id="add-mcq"
          className="btn btn-add"
          onClick={() => addQuestion('multiple-choice')}
        >
           Multiple Choice
        </button>
        <button
          id="add-tf"
          className="btn btn-add"
          onClick={() => addQuestion('true-false')}
        >
           True / False
        </button>
        <button
          id="add-sa"
          className="btn btn-add"
          onClick={() => addQuestion('short-answer')}
        >
           Short Answer
        </button>
      </div>

      {questions.length === 0 && (
        <div className="add-question-bar" style={{ marginTop: 0 }}>
          <button
            id="add-default"
            className="btn btn-primary"
            onClick={() => onChange([DEFAULT_QUESTION(0)])}
          >
             Start with a question
          </button>
        </div>
      )}
    </div>
  );
}

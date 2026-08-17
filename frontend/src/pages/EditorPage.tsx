import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Document, Question } from '../types';
import QuestionList from '../components/editor/QuestionList';
import PreviewPane from '../components/preview/PreviewPane';

export default function EditorPage() {
  const { user, logout } = useAuth();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.data.documents);
    } catch {
    }
  }, []);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const openDocument = async (doc: Document) => {
    try {
      const res = await api.get(`/documents/${doc._id}`);
      const full: Document = res.data.data.document;
      setActiveDoc(full);
      setDocTitle(full.title);
      setQuestions(full.questions);
    } catch {
    }
  };

  const createDocument = async () => {
    if (!newDocTitle.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/documents', { title: newDocTitle.trim() });
      const doc: Document = res.data.data.document;
      setDocuments((prev) => [doc, ...prev]);
      setNewDocTitle('');
      await openDocument(doc);
    } catch {
    } finally {
      setCreating(false);
    }
  };

  const saveDocument = async () => {
    if (!activeDoc) return;
    setSaving(true);
    setSaveMsg('');
    try {
      await api.put(`/documents/${activeDoc._id}`, {
        title: docTitle,
        questions,
      });
      setSaveMsg('✓ Saved');
      setDocuments((prev) =>
        prev.map((d) =>
          d._id === activeDoc._id ? { ...d, title: docTitle } : d
        )
      );
      setTimeout(() => setSaveMsg(''), 2000);
    } catch {
      setSaveMsg('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      if (activeDoc?._id === id) {
        setActiveDoc(null);
        setQuestions([]);
        setDocTitle('');
      }
    } catch {
    }
  };

  return (
    <div className="editor-layout">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : 'sidebar--collapsed'}`}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-icon">📝</span>
            {sidebarOpen && <span className="brand-name">QA Editor</span>}
          </div>
          <button
            className="btn btn-icon"
            onClick={() => setSidebarOpen((p) => !p)}
            title="Toggle sidebar"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {sidebarOpen && (
          <>
            <div className="sidebar-user">
              <div className="user-avatar">{user?.name[0]?.toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>

            <div className="new-doc-form">
              <input
                id="new-doc-title"
                type="text"
                placeholder="New document title..."
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void createDocument()}
              />
              <button
                id="create-doc-btn"
                className="btn btn-primary btn-sm"
                onClick={() => void createDocument()}
                disabled={creating || !newDocTitle.trim()}
              >
                {creating ? '...' : '+'}
              </button>
            </div>

            <div className="doc-list">
              {documents.length === 0 && (
                <p className="doc-list-empty">No documents yet.</p>
              )}
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className={`doc-item ${activeDoc?._id === doc._id ? 'doc-item--active' : ''}`}
                  onClick={() => void openDocument(doc)}
                >
                  <span className="doc-icon">📄</span>
                  <span className="doc-title">{doc.title}</span>
                  <button
                    className="btn btn-icon btn-danger doc-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      void deleteDocument(doc._id);
                    }}
                    title="Delete document"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>

            <button
              id="logout-btn"
              className="btn btn-ghost sidebar-logout"
              onClick={() => void logout()}
            >
              ↩ Sign Out
            </button>
          </>
        )}
      </aside>

      {activeDoc ? (
        <main className="editor-main">
          <section className="editor-panel">
            <div className="editor-panel-header">
              <input
                id="doc-title-input"
                className="doc-title-input"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Document title..."
              />
              <div className="editor-actions">
                {saveMsg && <span className="save-msg">{saveMsg}</span>}
                <button
                  id="save-doc-btn"
                  className="btn btn-primary"
                  onClick={() => void saveDocument()}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : '💾 Save'}
                </button>
              </div>
            </div>

            <div className="editor-scroll">
              <QuestionList questions={questions} onChange={setQuestions} />
            </div>
          </section>

          <section className="preview-panel">
            <PreviewPane questions={questions} documentTitle={docTitle} />
          </section>
        </main>
      ) : (
        <main className="editor-welcome">
          <div className="welcome-card">
            <span className="welcome-icon">📝</span>
            <h2>QA Editor Workspace</h2>
            <p>Create a new document or select one from the sidebar to start authoring assessment questions.</p>
          </div>
        </main>
      )}
    </div>
  );
}

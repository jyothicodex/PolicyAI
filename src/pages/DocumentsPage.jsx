import { useState, useEffect } from 'react';
import { Search, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import DocumentCard from '../components/DocumentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDocuments, deleteDocument } from '../services/api';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'status'

  const fetchDocs = async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    // Poll every 5 seconds so processing status updates automatically
    const interval = setInterval(fetchDocs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        setDocuments(documents.filter((d) => d.id !== id));
      } catch (err) {
        alert('Failed to delete document: ' + err.message);
      }
    }
  };

  const filteredDocs = documents
    .filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  return (
    <div className="page-enter" style={{ padding: '32px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            Document Library
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {loading ? 'Loading...' : `${documents.length} policy documents uploaded`}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div
          style={{
            flex: 1,
            minWidth: '250px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Search size={16} color="var(--text-tertiary)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name or category..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'inherit',
              width: '100%',
            }}
          />
        </div>

        {/* Sort */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <SlidersHorizontal size={14} color="var(--text-tertiary)" style={{ marginLeft: '8px' }} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
              padding: '4px 8px',
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        {/* View toggle */}
        <div
          style={{
            display: 'flex',
            gap: '2px',
            padding: '4px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'list' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              border: 'none',
              color: viewMode === 'list' ? 'var(--color-primary-400)' : 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              border: 'none',
              color: viewMode === 'grid' ? 'var(--color-primary-400)' : 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Grid3X3 size={16} />
          </button>
        </div>
      </div>

      {/* Documents */}
      {loading ? (
        <LoadingSpinner text="Loading documents..." />
      ) : filteredDocs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
          }}
        >
          <Search
            size={48}
            color="var(--text-tertiary)"
            style={{ marginBottom: '16px', opacity: 0.5 }}
          />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            No documents found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search term.`
              : 'Upload your first policy document to get started.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: viewMode === 'grid'
              ? 'grid'
              : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(340px, 1fr))' : undefined,
            flexDirection: viewMode === 'list' ? 'column' : undefined,
            gap: '14px',
          }}
        >
          {filteredDocs.map((doc, idx) => (
            <DocumentCard key={doc.id} document={doc} index={idx} onDelete={handleDelete} onReprocess={fetchDocs} />
          ))}
        </div>
      )}
    </div>
  );
}

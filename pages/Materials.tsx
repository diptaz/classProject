import React, { useState, useRef } from 'react';
import { useStore } from '../context/Store';
import { Role, DocumentMaterial } from '../types';
import { FileText, Plus, Trash2, Download, File, Eye, X, Maximize2, ExternalLink } from 'lucide-react';

export const Materials = () => {
  const { materials, subjects, currentUser, addMaterial, deleteMaterial } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [filterSubject, setFilterSubject] = useState('ALL');
  
  // Viewer State
  const [viewingDoc, setViewingDoc] = useState<DocumentMaterial | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  const [newDoc, setNewDoc] = useState({ title: '', url: '', description: '', subject: '', type: 'PDF' as const });

  const canAdd = [Role.SEKRETARIS, Role.KURIKULUM, Role.ADMIN].includes(currentUser?.role as Role);

  const formatUrl = (url: string) => {
    // Transform Google Drive links to preview mode to avoid "View" permission errors in iframe
    // Case: /view, /edit -> /preview
    if (url.includes('drive.google.com') && (url.includes('/view') || url.includes('/edit'))) {
       return url.replace(/\/view.*|\/edit.*/, '/preview');
    }
    return url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    addMaterial({
      id: Date.now().toString(),
      ...newDoc,
      url: formatUrl(newDoc.url),
      uploadedBy: currentUser.role
    });
    setShowModal(false);
    setNewDoc({ title: '', url: '', description: '', subject: '', type: 'PDF' });
  };

  const handleView = (doc: DocumentMaterial) => {
    if (!doc.url || doc.url === '#' || doc.url.trim() === '') {
      alert("Invalid document URL.");
      return;
    }
    setViewingDoc(doc);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement && viewerRef.current) {
      viewerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  };

  const filteredMaterials = filterSubject === 'ALL' 
    ? materials 
    : materials.filter(m => m.subject === filterSubject);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText /> Documents & Guides
        </h1>
        {canAdd && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={18} /> Add Material
          </button>
        )}
      </div>

      <div className="mb-6">
        <select 
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
        >
          <option value="ALL">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMaterials.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between group">
            <div className="flex gap-4">
              <div className="bg-red-50 text-red-500 p-3 rounded-lg dark:bg-red-900/20">
                 <File size={24} />
              </div>
              <div>
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-bold text-gray-900 dark:text-white hover:text-primary hover:underline"
                >
                  {doc.title}
                </a>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{doc.description}</p>
                <div className="flex gap-3 mt-2 text-xs font-medium">
                   <span className="text-primary bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{doc.subject}</span>
                   <span className="text-gray-400 uppercase">{doc.type}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
               {/* View Button for PDFs */}
               {doc.type === 'PDF' && (
                 <button 
                   onClick={() => handleView(doc)} 
                   className="text-gray-400 hover:text-primary p-1"
                   title="Preview Document"
                 >
                   <Eye size={18} />
                 </button>
               )}
               
               <a href={doc.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary p-1" title="Download / Open Link">
                 <Download size={18} />
               </a>
               
               {canAdd && (
                  <button onClick={() => deleteMaterial(doc.id)} className="text-gray-400 hover:text-red-500 p-1" title="Delete">
                    <Trash2 size={18} />
                  </button>
               )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 text-gray-400">No documents found.</div>
      )}

      {/* PDF Viewer Modal */}
      {viewingDoc && (
        <div ref={viewerRef} className="fixed inset-0 z-50 bg-gray-900 flex flex-col animate-fade-in">
          {/* Viewer Toolbar */}
          <div className="flex justify-between items-center px-6 py-3 bg-gray-800 border-b border-gray-700 text-white shadow-md">
             <div className="flex items-center gap-3">
               <FileText size={20} className="text-primary" />
               <h3 className="font-semibold truncate max-w-md">{viewingDoc.title}</h3>
             </div>
             <div className="flex items-center gap-4">
                <a 
                   href={viewingDoc.url} 
                   target="_blank" 
                   rel="noreferrer"
                   className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white flex items-center gap-2"
                >
                   <ExternalLink size={16} /> Open in New Tab
                </a>
                <button 
                  onClick={toggleFullScreen}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-300 hover:text-white"
                  title="Toggle Full Screen"
                >
                  <Maximize2 size={20} />
                </button>
                <button 
                  onClick={() => setViewingDoc(null)}
                  className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-colors text-gray-300"
                  title="Close Viewer"
                >
                  <X size={24} />
                </button>
             </div>
          </div>
          
          {/* Viewer Content */}
          <div className="flex-1 bg-gray-200 dark:bg-gray-900 relative flex items-center justify-center">
             <iframe 
               src={viewingDoc.url} 
               className="w-full h-full border-0"
               title={viewingDoc.title}
             />
             <div className="absolute -z-10 text-gray-500 text-center p-4">
                <p>Loading document...</p>
                <p className="text-sm mt-2">If content does not appear, use the "Open in New Tab" button.</p>
             </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Add Document</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Document Title"
                required
                value={newDoc.title}
                onChange={e => setNewDoc({...newDoc, title: e.target.value})}
              />
              <textarea 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Description"
                required
                value={newDoc.description}
                onChange={e => setNewDoc({...newDoc, description: e.target.value})}
              />
              <div className="space-y-1">
                 <input 
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="File URL / Drive Link"
                  required
                  value={newDoc.url}
                  onChange={e => setNewDoc({...newDoc, url: e.target.value})}
                />
                <p className="text-xs text-gray-400">For Google Drive, ensure "Anyone with the link" is selected.</p>
              </div>
              <select 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                value={newDoc.subject}
                onChange={e => setNewDoc({...newDoc, subject: e.target.value})}
              >
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
               <select 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newDoc.type}
                onChange={(e: any) => setNewDoc({...newDoc, type: e.target.value})}
              >
                <option value="PDF">PDF</option>
                <option value="DOC">DOC</option>
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
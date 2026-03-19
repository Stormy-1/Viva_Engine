const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const api = {
  documents: {
    upload: async (file: File, syllabus?: File) => {
      const formData = new FormData();
      formData.append('file', file);
      if (syllabus) formData.append('syllabus', syllabus);
      return fetch(`${BASE}/api/documents/upload`, { method: 'POST', body: formData });
    },
    getStatus: (id: string) => fetch(`${BASE}/api/documents/${id}`),
    getChunks: (id: string) => fetch(`${BASE}/api/documents/${id}/chunks`),
    generateCards: (id: string, count: number) =>
      fetch(`${BASE}/api/documents/${id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      }),
    list: () => fetch(`${BASE}/api/documents`),
  },
  cards: {
    getDue: () => fetch(`${BASE}/api/cards/due`),
    review: (id: string, grade: number) =>
      fetch(`${BASE}/api/cards/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade }),
      }),
  },
  audio: {
    transcribe: (blob: Blob, cardId: string) => {
      const formData = new FormData();
      formData.append('audio', blob);
      formData.append('cardId', cardId);
      return fetch(`${BASE}/api/audio/transcribe`, { method: 'POST', body: formData });
    },
    grade: (transcript: string, cardId: string, rubric: object) =>
      fetch(`${BASE}/api/audio/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, cardId, rubric }),
      }),
  },
  stats: {
    dashboard: () => fetch(`${BASE}/api/stats/dashboard`),
  },
  syllabus: {
    coverage: (docId: string) => fetch(`${BASE}/api/syllabus/${docId}/coverage`),
  },
};

// ---- Shared State ----
window.AppState = {
  user: { name: '', initials: '' },
  currentUser: null,
  isAdmin: false,
  moodLogs: [], // { date, emoji, score }
  streak: 0,
  phqResults: [],
  chatHistory: [],
  highContrast: false,
  medications: [
    { id: 1, name: 'Sertraline', dose: '50mg', timing: 'Morning 🌅', notes: 'Take with food', color: '#4ECDC4' },
    { id: 2, name: 'Clonazepam', dose: '0.5mg', timing: 'Night 🌙',  notes: 'As needed for anxiety', color: '#A29BFE' }
  ],
  medLogs: [
    { medId: 1, date: new Date().toISOString().split('T')[0], taken: true, time: '08:14 AM' }
  ],
  reminders: [
    { id: 1, type: 'medication', label: 'Morning Meds 💊', time: '08:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], channel: 'App + SMS', active: true },
    { id: 2, type: 'mood',       label: 'Mood Check-in 📊', time: '20:00', days: ['Mon','Wed','Fri'],                        channel: 'App',        active: true },
    { id: 3, type: 'appointment',label: 'Therapy session 🧑‍⚕️', time: '14:00', days: ['Tue'],                                  channel: 'SMS',        active: false }
  ],
  gameLogs: [],
  gameScores: { bubble: 0, zen: 0 },
  journalEntries: [],
  sleepLogs: []
};

window.chartInstances = {};

// Seed 12 days of mock mood data
(function seedMoods() {
  const emojis = ['😔', '😟', '😐', '🙂', '😊'];
  const today = new Date();
  for (let i = 12; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const score = Math.floor(Math.random() * 5);
    AppState.moodLogs.push({ date: d.toISOString().split('T')[0], emoji: emojis[score], score });
  }
  // Streak = consecutive recent days
  let streak = 0;
  for (let i = AppState.moodLogs.length - 1; i >= 0; i--) { streak++; if (Math.random() > 0.92) break; }
  AppState.streak = Math.min(streak, 7);
})();

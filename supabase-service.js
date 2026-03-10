/* ============================================================
   supabase-service.js – All Database CRUD Functions
   Depends on: supabaseClient.js (must be loaded first)
   ============================================================ */

// ---- AUTH -------------------------------------------------------

window.sbLogin = async function (email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Fetch role from profiles table
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (pErr || !profile) {
    // First-time user — create a profile row
    await supabase.from('profiles').insert({
      id: data.user.id,
      name: data.user.email.split('@')[0],
      initials: data.user.email.slice(0, 2).toUpperCase(),
      role: 'patient',
      patient_status: 'active'
    });
    return { role: 'patient', profile: null };
  }

  return { role: profile.role, profile };
};

window.sbLogout = async function () {
  await supabase.auth.signOut();
};

window.sbGetSession = async function () {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

// ---- PROFILE ----------------------------------------------------

window.sbGetProfile = async function (userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
};

window.sbUpsertProfile = async function (userId, updates) {
  await supabase.from('profiles').upsert({ id: userId, ...updates });
};

// ---- MOOD LOGS --------------------------------------------------

window.sbLoadMoodLogs = async function (userId) {
  const { data } = await supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  return data || [];
};

window.sbSaveMoodLog = async function (userId, entry) {
  const { data } = await supabase
    .from('mood_logs')
    .upsert({ user_id: userId, date: entry.date, emoji: entry.emoji, score: entry.score })
    .select()
    .single();
  return data;
};

// ---- JOURNAL ENTRIES --------------------------------------------

window.sbLoadJournalEntries = async function (userId) {
  const { data } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
};

window.sbSaveJournalEntry = async function (userId, entry) {
  const { data } = await supabase
    .from('journal_entries')
    .insert({ user_id: userId, title: entry.title, body: entry.text, mood_emoji: entry.moodTag.emoji, mood_score: entry.moodTag.score })
    .select()
    .single();
  return data;
};

window.sbDeleteJournalEntry = async function (id) {
  await supabase.from('journal_entries').delete().eq('id', id);
};

// ---- SLEEP LOGS -------------------------------------------------

window.sbLoadSleepLogs = async function (userId) {
  const { data } = await supabase
    .from('sleep_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  return data || [];
};

window.sbSaveSleepLog = async function (userId, log) {
  await supabase.from('sleep_logs').insert({
    user_id: userId, date: log.date,
    bedtime: log.bedtime, wake_time: log.wakeTime,
    duration: log.duration, quality: log.quality
  });
};

// ---- MEDICATIONS ------------------------------------------------

window.sbLoadMedications = async function (userId) {
  const { data } = await supabase.from('medications').select('*').eq('user_id', userId);
  return data || [];
};

window.sbSaveMedication = async function (userId, med) {
  const { data } = await supabase
    .from('medications')
    .insert({ user_id: userId, name: med.name, dose: med.dose, timing: med.timing, notes: med.notes, color: med.color })
    .select()
    .single();
  return data;
};

window.sbDeleteMedication = async function (id) {
  await supabase.from('medications').delete().eq('id', id);
  await supabase.from('med_logs').delete().eq('med_id', id);
};

// ---- MED LOGS ---------------------------------------------------

window.sbLoadMedLogs = async function (userId) {
  const { data } = await supabase
    .from('med_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
};

window.sbSaveMedLog = async function (userId, log) {
  await supabase.from('med_logs').upsert({
    user_id: userId, med_id: log.medId,
    date: log.date, taken: log.taken, time: log.time
  });
};

// ---- REMINDERS --------------------------------------------------

window.sbLoadReminders = async function (userId) {
  const { data } = await supabase.from('reminders').select('*').eq('user_id', userId);
  return data || [];
};

window.sbSaveReminder = async function (userId, rem) {
  const { data } = await supabase
    .from('reminders')
    .insert({ user_id: userId, type: rem.type, label: rem.label, time: rem.time, days: rem.days, channel: rem.channel, active: rem.active })
    .select()
    .single();
  return data;
};

window.sbDeleteReminder = async function (id) {
  await supabase.from('reminders').delete().eq('id', id);
};

window.sbToggleReminder = async function (id, active) {
  await supabase.from('reminders').update({ active }).eq('id', id);
};

// ---- PHQ-9 RESULTS ----------------------------------------------

window.sbSavePhq9Result = async function (userId, result) {
  await supabase.from('phq9_results').insert({
    user_id: userId, score: result.score, severity: result.severity, answers: result.answers
  });
};

// ---- GAME LOGS --------------------------------------------------

window.sbSaveGameLog = async function (userId, log) {
  await supabase.from('game_logs').insert({
    user_id: userId, game: log.game, score: log.score, duration: log.duration || 0
  });
};

// ---- CLINICIAN: PATIENT LIST ------------------------------------

window.sbGetActivePatients = async function () {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'patient')
    .eq('patient_status', 'active')
    .order('created_at', { ascending: false });
  return data || [];
};

window.sbGetArchivedPatients = async function () {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'patient')
    .eq('patient_status', 'inactive')
    .order('created_at', { ascending: false });
  return data || [];
};

window.sbSetPatientStatus = async function (id, status) {
  await supabase.from('profiles').update({ patient_status: status }).eq('id', id);
};

// ---- SYNC: Load all user data into AppState ---------------------

window.syncFromSupabase = async function (userId) {
  try {
    const [moods, journal, sleep, meds, medLogs, reminders] = await Promise.all([
      sbLoadMoodLogs(userId),
      sbLoadJournalEntries(userId),
      sbLoadSleepLogs(userId),
      sbLoadMedications(userId),
      sbLoadMedLogs(userId),
      sbLoadReminders(userId)
    ]);

    // Map Supabase rows → AppState format
    AppState.moodLogs       = moods.map(m  => ({ date: m.date, emoji: m.emoji, score: m.score }));
    AppState.journalEntries = journal.map(j => ({ id: j.id, date: new Date(j.created_at).toLocaleString('en-IN'), title: j.title, text: j.body, moodTag: { emoji: j.mood_emoji, score: j.mood_score } }));
    AppState.sleepLogs      = sleep.map(s  => ({ date: s.date, bedtime: s.bedtime, wakeTime: s.wake_time, duration: parseFloat(s.duration), quality: s.quality }));

    if (meds.length > 0)    AppState.medications = meds.map(m   => ({ id: m.id, name: m.name, dose: m.dose, timing: m.timing, notes: m.notes, color: m.color }));
    if (medLogs.length > 0) AppState.medLogs     = medLogs.map(l => ({ medId: l.med_id, date: l.date, taken: l.taken, time: l.time }));
    if (reminders.length > 0) AppState.reminders = reminders.map(r => ({ id: r.id, type: r.type, label: r.label, time: r.time, days: r.days, channel: r.channel, active: r.active }));

    // Recalculate streak
    let streak = 0;
    const sorted = [...AppState.moodLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(); expected.setDate(expected.getDate() - i);
      if (sorted[i].date === expected.toISOString().split('T')[0]) streak++;
      else break;
    }
    AppState.streak = streak;
    console.log('✅ Supabase sync complete');
  } catch (e) {
    console.warn('⚠️ Supabase sync failed (running in offline/mock mode):', e.message);
  }
};

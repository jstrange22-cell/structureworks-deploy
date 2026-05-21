// ===== AgentWorks — Firebase Auth + Firestore + Storage (compat) =====
// Agent-facing portal. Jobs are submitted into the ProjectWorks Leads pipeline
// (webLeads, source: "agentworks"); all StructureWorks-side work happens in
// ProjectWorks. Agents auto-approve on first login.

let db, auth, storage;

const SUBMIT_ENDPOINT = 'https://us-central1-projectworks-8b692.cloudfunctions.net/submitWebLead';

function initFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: 'AIzaSyAYVmBGio_iMbeCgn7iH0MPOga1k0xTY1U',
      authDomain: 'projectworks-8b692.firebaseapp.com',
      projectId: 'projectworks-8b692',
      storageBucket: 'projectworks-8b692.firebasestorage.app',
      messagingSenderId: '876322383528',
      appId: '1:876322383528:web:654de92bee2c70015bc49d',
    });
  }
  if (!db) db = firebase.firestore();
  if (!auth) auth = firebase.auth();
  if (!storage && firebase.storage) storage = firebase.storage();
}

// ===== Auth =====

function agentLogin(email, password) {
  initFirebase();
  return auth.signInWithEmailAndPassword(email, password);
}

function agentRegister(email, password, profileData) {
  initFirebase();
  return auth.createUserWithEmailAndPassword(email, password).then((cred) =>
    db.collection('agentUsers').doc(cred.user.uid).set({
      email,
      fullName: profileData.fullName || '',
      phone: profileData.phone || '',
      company: profileData.company || '',
      licenseNumber: profileData.licenseNumber || '',
      role: 'agent',
      isApproved: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => cred),
  );
}

function agentLogout() {
  initFirebase();
  return auth.signOut().then(() => { window.location.href = '/agent-login'; });
}

function agentGoogleLogin() {
  initFirebase();
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider).then((result) =>
    ensureAgentProfile(result.user).then(() => result),
  );
}

function resetPassword(email) {
  initFirebase();
  return auth.sendPasswordResetEmail(email);
}

function getCurrentUser() {
  initFirebase();
  return new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged((user) => { unsub(); resolve(user); });
  });
}

function getAgentProfile(uid) {
  initFirebase();
  return db.collection('agentUsers').doc(uid).get()
    .then((doc) => (doc.exists ? { id: doc.id, ...doc.data() } : null));
}

// Auto-create the agent profile if missing (auto-approved). This fixes the old
// "Your account is being set up" dead-end: any signed-in agent gets a profile.
function ensureAgentProfile(user) {
  initFirebase();
  const ref = db.collection('agentUsers').doc(user.uid);
  return ref.get().then((doc) => {
    if (doc.exists) return { id: doc.id, ...doc.data() };
    const data = {
      email: user.email || '',
      fullName: user.displayName || (user.email ? user.email.split('@')[0] : 'Agent'),
      phone: user.phoneNumber || '',
      company: '',
      licenseNumber: '',
      role: 'agent',
      isApproved: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    return ref.set(data).then(() => ({ id: user.uid, ...data }));
  });
}

// Auth guard for agent pages — redirects to login if not signed in, otherwise
// ensures a profile exists, then runs the callback.
function requireAuth(callback) {
  initFirebase();
  auth.onAuthStateChanged((user) => {
    if (!user) { window.location.href = '/agent-login'; return; }
    ensureAgentProfile(user)
      .then((profile) => callback(user, profile))
      .catch(() => callback(user, null));
  });
}

// ===== Job submission → ProjectWorks Leads (source: agentworks) =====

async function submitAgentJob(job, files) {
  initFirebase();
  const user = auth.currentUser;
  if (!user) throw new Error('Your session expired. Please sign in again.');

  const photos = [];
  const documents = [];
  if (files && files.length) {
    if (!storage) throw new Error('File upload is unavailable. Please refresh and try again.');
    for (const f of files) {
      const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const ref = storage.ref().child(`documents/agentUploads/${user.uid}/${Date.now()}_${safe}`);
      await ref.put(f);
      const url = await ref.getDownloadURL();
      (f.type === 'application/pdf' ? documents : photos).push(url);
    }
  }

  const idToken = await user.getIdToken();
  const profile = await getAgentProfile(user.uid);
  const address = [job.propertyAddress, job.city, job.state, job.zip].filter(Boolean).join(', ');

  const res = await fetch(SUBMIT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'agentworks',
      idToken,
      agentName: (profile && profile.fullName) || user.displayName || '',
      name: job.clientName,
      email: job.clientEmail || '',
      phone: job.clientPhone || '',
      address,
      projectType: job.projectType,
      timeframe: job.urgency || '',
      details: job.description,
      photos,
      documents,
      page: window.location.href,
    }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out.ok) throw new Error(out.error || 'Submission failed. Please try again.');
  return out.id;
}

// The agent's own submitted jobs (their webLeads). Single equality filter (no
// composite index); sorted client-side.
function getMyJobs(uid) {
  initFirebase();
  return db.collection('webLeads')
    .where('agentUid', '==', uid)
    .get()
    .then((snap) =>
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)),
    );
}

// ===== Utility =====

function formatDate(timestamp) {
  if (!timestamp) return '--';
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Agent-facing status labels mapped from the ProjectWorks lead lifecycle.
function statusBadge(status) {
  const colors = { new: '#f59e0b', contacted: '#3b82f6', quoted: '#8b5cf6', converted: '#10b981', won: '#16a34a', lost: '#94a3b8' };
  const labels = { new: 'Received', contacted: 'In Review', quoted: 'Quote Sent', converted: 'Approved', won: 'Won', lost: 'Closed' };
  const color = colors[status] || '#f59e0b';
  const label = labels[status] || 'Received';
  return `<span style="display:inline-block; padding:4px 12px; border-radius:12px; font-size:0.8rem; font-weight:600; color:#fff; background:${color};">${label}</span>`;
}

function showToast(message, type) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; padding:14px 24px; border-radius:10px; z-index:9999;
    font-size:0.95rem; font-weight:500; color:#fff; box-shadow:0 4px 16px rgba(0,0,0,0.15);
    background:${type === 'error' ? '#ef4444' : '#16a34a'}; transition:opacity 0.3s; max-width:90vw;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
}

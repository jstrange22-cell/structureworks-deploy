// ===== AgentWorks Backend - Firebase Auth + Firestore =====

// Firebase SDK (compat mode for simplicity in static HTML)
// Loaded via CDN in the HTML pages that need it

let db, auth;

function initFirebase() {
  if (firebase.apps.length) return;
  firebase.initializeApp({
    apiKey: "AIzaSyAYVmBGio_iMbeCgn7iH0MPOga1k0xTY1U",
    authDomain: "projectworks-8b692.firebaseapp.com",
    projectId: "projectworks-8b692",
    storageBucket: "projectworks-8b692.firebasestorage.app",
    messagingSenderId: "876322383528",
    appId: "1:876322383528:web:654de92bee2c70015bc49d"
  });
  db = firebase.firestore();
  auth = firebase.auth();
}

// ===== Auth Helpers =====

function agentLogin(email, password) {
  initFirebase();
  return auth.signInWithEmailAndPassword(email, password);
}

function agentRegister(email, password, profileData) {
  initFirebase();
  return auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return db.collection('agentUsers').doc(cred.user.uid).set({
        email: email,
        fullName: profileData.fullName,
        phone: profileData.phone || '',
        company: profileData.company || '',
        licenseNumber: profileData.licenseNumber || '',
        role: 'agent',
        isApproved: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => cred);
    });
}

function agentLogout() {
  initFirebase();
  return auth.signOut().then(() => {
    window.location.href = '/agent-login';
  });
}

function agentGoogleLogin() {
  initFirebase();
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider).then(result => {
    const user = result.user;
    // Check if agentUsers doc exists, create if not
    return db.collection('agentUsers').doc(user.uid).get().then(doc => {
      if (!doc.exists) {
        return db.collection('agentUsers').doc(user.uid).set({
          email: user.email,
          fullName: user.displayName || '',
          phone: user.phoneNumber || '',
          company: '',
          licenseNumber: '',
          role: 'agent',
          isApproved: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => result);
      }
      return result;
    });
  });
}

function resetPassword(email) {
  initFirebase();
  return auth.sendPasswordResetEmail(email);
}

function getCurrentUser() {
  initFirebase();
  return new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged(user => {
      unsub();
      resolve(user);
    });
  });
}

function getAgentProfile(uid) {
  initFirebase();
  return db.collection('agentUsers').doc(uid).get().then(doc => {
    if (doc.exists) return { id: doc.id, ...doc.data() };
    return null;
  });
}

// ===== Auth Guard =====
// Call this on protected pages - redirects to login if not authenticated
function requireAuth(callback) {
  initFirebase();
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = '/agent-login';
      return;
    }
    getAgentProfile(user.uid).then(profile => {
      callback(user, profile);
    });
  });
}

function requireAdmin(callback) {
  requireAuth((user, profile) => {
    if (!profile || profile.role !== 'admin') {
      // Check if they're in the ProjectWorks users collection as admin
      db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists && (doc.data().role === 'admin' || doc.data().role === 'manager')) {
          callback(user, { ...doc.data(), id: doc.id, role: 'admin' });
        } else {
          window.location.href = '/agent-dashboard';
        }
      });
      return;
    }
    callback(user, profile);
  });
}

// ===== Project CRUD =====

function createProject(projectData) {
  initFirebase();
  const user = auth.currentUser;
  return getAgentProfile(user.uid).then(profile => {
    return db.collection('agentProjects').add({
      agentUid: user.uid,
      agentName: profile.fullName,
      agentEmail: profile.email,
      propertyAddress: projectData.propertyAddress,
      city: projectData.city || 'Knoxville',
      state: projectData.state || 'TN',
      zipCode: projectData.zipCode || '',
      clientName: projectData.clientName,
      clientPhone: projectData.clientPhone || '',
      clientEmail: projectData.clientEmail || '',
      projectType: projectData.projectType || 'inspection_repair',
      description: projectData.description,
      urgency: projectData.urgency || 'standard',
      targetCloseDate: projectData.targetCloseDate || '',
      estimatedBudget: projectData.estimatedBudget || '',
      status: 'submitted',
      statusHistory: [{
        status: 'submitted',
        changedBy: profile.fullName,
        changedAt: new Date().toISOString(),
        note: 'Project submitted'
      }],
      notes: '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  });
}

function getMyProjects(uid) {
  initFirebase();
  return db.collection('agentProjects')
    .where('agentUid', '==', uid)
    .orderBy('createdAt', 'desc')
    .get()
    .then(snap => snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
}

function getAllProjects() {
  initFirebase();
  return db.collection('agentProjects')
    .orderBy('createdAt', 'desc')
    .get()
    .then(snap => snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
}

function updateProjectStatus(projectId, newStatus, changedBy, note) {
  initFirebase();
  return db.collection('agentProjects').doc(projectId).update({
    status: newStatus,
    statusHistory: firebase.firestore.FieldValue.arrayUnion({
      status: newStatus,
      changedBy: changedBy,
      changedAt: new Date().toISOString(),
      note: note || ''
    }),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function updateProjectNotes(projectId, notes) {
  initFirebase();
  return db.collection('agentProjects').doc(projectId).update({
    notes: notes,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// ===== Agent Management (Admin) =====

function getPendingAgents() {
  initFirebase();
  return db.collection('agentUsers')
    .where('isApproved', '==', false)
    .where('role', '==', 'agent')
    .get()
    .then(snap => snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
}

function getAllAgents() {
  initFirebase();
  return db.collection('agentUsers')
    .where('role', '==', 'agent')
    .get()
    .then(snap => snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
}

function approveAgent(uid) {
  initFirebase();
  return db.collection('agentUsers').doc(uid).update({
    isApproved: true,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function rejectAgent(uid) {
  initFirebase();
  return db.collection('agentUsers').doc(uid).delete();
}

// ===== Utility =====

function formatDate(timestamp) {
  if (!timestamp) return '--';
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusBadge(status) {
  const colors = {
    submitted: '#f59e0b',
    reviewing: '#3b82f6',
    approved: '#10b981',
    in_progress: '#8b5cf6',
    completed: '#16a34a',
    cancelled: '#ef4444'
  };
  const labels = {
    submitted: 'Submitted',
    reviewing: 'Reviewing',
    approved: 'Approved',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  const color = colors[status] || '#94a3b8';
  const label = labels[status] || status;
  return `<span style="display:inline-block; padding:4px 12px; border-radius:12px; font-size:0.8rem; font-weight:600; color:#fff; background:${color};">${label}</span>`;
}

function showToast(message, type) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; padding:14px 24px; border-radius:10px; z-index:9999;
    font-size:0.95rem; font-weight:500; color:#fff; box-shadow:0 4px 16px rgba(0,0,0,0.15);
    background:${type === 'error' ? '#ef4444' : '#16a34a'}; transition:opacity 0.3s;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

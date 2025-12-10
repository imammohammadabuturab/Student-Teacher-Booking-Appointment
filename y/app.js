const firebaseConfig = {
  apiKey: "",
  authDomain: "student-teacher-booking-8aed0.firebaseapp.com",
  projectId: "student-teacher-booking-8aed0",
  storageBucket: "student-teacher-booking-8aed0.firebasestorage.app",
  messagingSenderId: "600254149936",
  appId: "1:600254149936:web:864b417714313fb01704f5",
  measurementId: "G-NKJMGX31LE"
};


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();


const log = (action, detail) => console.log(`[LOG - ${new Date().toLocaleTimeString()}] ${action}: ${detail}`);


const views = {
    auth: document.getElementById('auth-section'),
    admin: document.getElementById('admin-dashboard'),
    teacher: document.getElementById('teacher-dashboard'),
    student: document.getElementById('student-dashboard')
};


auth.onAuthStateChanged(user => {
    if (user) {
        log("Auth", `User logged in: ${user.email}`);
        checkUserRole(user.uid);
        document.getElementById('logout-btn').style.display = 'block';
    } else {
        log("Auth", "User logged out");
        showView('auth');
        document.getElementById('logout-btn').style.display = 'none';
    }
});

function showView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
}

async function checkUserRole(uid) {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
        const data = doc.data();
        log("Role Check", `User is ${data.role}`);
        
        if (data.role === 'admin') loadAdminView();
        else if (data.role === 'teacher') loadTeacherView(uid);
        else if (data.role === 'student') loadStudentView(uid);
    }
}


window.handleRegister = async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        await db.collection('users').doc(cred.user.uid).set({
            email: email,
            role: 'student',
            approved: false
        });
        alert("Registration successful! Wait for Admin approval.");
    } catch (e) {
        alert(e.message);
    }
}

window.handleLogin = async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (e) {
        alert(e.message);
    }
}

document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());


function loadAdminView() {
    showView('admin');
    const list = document.getElementById('admin-student-list');
    db.collection('users').where('role', '==', 'student').where('approved', '==', false)
    .onSnapshot(snap => {
        list.innerHTML = '';
        snap.forEach(doc => {
            list.innerHTML += `
                <li>
                    ${doc.data().email}
                    <button onclick="approveStudent('${doc.id}')">Approve</button>
                </li>`;
        });
    });
}

window.approveStudent = function(uid) {
    db.collection('users').doc(uid).update({ approved: true });
}

window.adminAddTeacher = async function() {
    
    alert("This feature requires a secondary app instance in client-side code, skipping for demo simplicity.");
}


function loadTeacherView(uid) {
    showView('teacher');
    const list = document.getElementById('teacher-appt-list');
    
    db.collection('appointments').where('teacherId', '==', uid)
    .onSnapshot(snap => {
        list.innerHTML = ''; 
        snap.forEach(doc => {
            const data = doc.data();
            const isPending = data.status === 'pending';
            
            let actionHtml = '';
            if (isPending) {
                actionHtml = `
                    <button onclick="updateAppt('${doc.id}', 'approved')">Accept</button>
                    <button onclick="updateAppt('${doc.id}', 'rejected')" style="background:red">Reject</button>
                `;
            } else {
                const color = data.status === 'approved' ? 'green' : 'red';
                actionHtml = `<span style="color:${color}; font-weight:bold;">${data.status.toUpperCase()}</span>`;
            }

            list.innerHTML += `
                <li>
                    <div>
                        <strong>Date:</strong> ${data.date} <br>
                        <strong>Msg:</strong> ${data.message}
                    </div>
                    <div>
                        ${actionHtml}
                    </div>
                </li>`;
        });
    });
}

window.updateAppt = function(id, status) {
    db.collection('appointments').doc(id).update({ status: status })
    .then(() => {
        console.log(`Appointment ${status}`);
    })
    .catch((error) => {
        alert("Error: " + error.message);
    });
}

async function loadStudentView(uid) {
    showView('student');
    const dropdown = document.getElementById('teacher-dropdown');
    
    const teachers = await db.collection('users').where('role', '==', 'teacher').get();
    dropdown.innerHTML = '<option value="">Select a Teacher</option>';
    teachers.forEach(doc => {
        const tData = doc.data();
        dropdown.innerHTML += `<option value="${doc.id}">${tData.name || tData.email} (${tData.subject || 'General'})</option>`;
    });

    const list = document.getElementById('student-status-list');
    db.collection('appointments').where('studentId', '==', uid)
    .onSnapshot(snap => {
        list.innerHTML = '';
        snap.forEach(doc => {
            const data = doc.data();
            list.innerHTML += `<li>${data.date} - <strong style="color:${data.status === 'approved' ? 'green' : 'orange'}">${data.status}</strong></li>`;
        });
    });
}

window.studentBookAppointment = async function() {
    const teacherId = document.getElementById('teacher-dropdown').value;
    const date = document.getElementById('book-date').value;
    const msg = document.getElementById('book-msg').value;
    const user = auth.currentUser;

    if (teacherId && date) {
        await db.collection('appointments').add({
            studentId: user.uid,
            teacherId: teacherId,
            date: date,
            message: msg,
            status: 'pending'
        });
        alert("Booking Sent!");
    } else {
        alert("Please select a teacher and date");
    }
}
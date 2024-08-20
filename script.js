import { db, auth } from './firebase.js'; // Import Firebase instances

// DOM elements
const examNameInput = document.getElementById('exam-name');
const subjectNameInput = document.getElementById('subject-name');
const fileInput = document.getElementById('pdf-upload');
const startButton = document.getElementById('start-button');
const submitButton = document.getElementById('submit-button');
const pdfViewer = document.getElementById('pdf-viewer');
const examContainer = document.getElementById('exam-container');
const examForm = document.getElementById('exam-form');

// Authentication handler
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('User is signed in:', user);
  } else {
    console.log('No user is signed in');
  }
});

// Sign-in function
function signIn(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("User signed in:", userCredential.user);
    })
    .catch(error => {
      console.error("Error signing in:", error.message);
    });
}

// Sign-out function
function signOut() {
  auth.signOut()
    .then(() => {
      console.log("User signed out");
    })
    .catch(error => {
      console.error("Error signing out:", error.message);
    });
}

// Start Exam
startButton.addEventListener('click', () => {
  const examName = examNameInput.value;
  const subjectName = subjectNameInput.value;

  if (examName && subjectName && fileInput.files.length > 0) {
    const pdfFile = fileInput.files[0];
    const pdfURL = URL.createObjectURL(pdfFile);

    pdfViewer.src = pdfURL;
    examContainer.style.display = 'block';
    examForm.style.display = 'none';

    // Load questions from Firestore or other data sources (this part is not implemented)
    // e.g., loadQuestions();
  } else {
    alert('Please fill all fields and upload a PDF.');
  }
});

// Submit Exam
submitButton.addEventListener('click', () => {
  // Collect selected options (example placeholder logic)
  const selectedOptions = {}; // Collect user's answers

  // Save exam results to Firestore
  if (auth.currentUser) {
    const userId = auth.currentUser.uid;
    db.collection('examResults').add({
      userId: userId,
      examName: examNameInput.value,
      subjectName: subjectNameInput.value,
      answers: selectedOptions,
      timestamp: new Date()
    }).then(() => {
      alert('Exam submitted successfully!');
      // Display results (this part is not implemented)
      // e.g., displayResults();
    }).catch(error => {
      console.error("Error submitting exam:", error);
    });
  } else {
    alert('User is not authenticated. Please sign in.');
  }
});

// Example sign-in button (replace with your actual button)
document.getElementById('login-button').addEventListener('click', () => {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  signIn(email, password);
});

// Example sign-out button (replace with your actual button)
document.getElementById('logout-button').addEventListener('click', signOut);

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
const questionsContainer = document.getElementById('questions-container');

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

    // Load questions (stub implementation)
    loadQuestions();
  } else {
    alert('Please fill all fields and upload a PDF.');
  }
});

// Load Questions (example stub)
function loadQuestions() {
  // Replace with actual Firestore query or PDF parsing
  // Example static questions for demonstration
  const questions = [
    { id: 1, text: "Question 1", options: ["Option A", "Option B", "Option C"] },
    { id: 2, text: "Question 2", options: ["Option A", "Option B", "Option C"] }
  ];

  questionsContainer.innerHTML = ''; // Clear previous questions

  questions.forEach(question => {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');
    questionDiv.innerHTML = `
      <p>${question.text}</p>
      ${question.options.map((option, index) => `
        <label>
          <input type="radio" name="question-${question.id}" value="${option}">
          ${option}
        </label>
      `).join('<br>')}
    `;
    questionsContainer.appendChild(questionDiv);
  });
}

// Submit Exam
submitButton.addEventListener('click', () => {
  if (!auth.currentUser) {
    alert('User is not authenticated. Please sign in.');
    return;
  }

  const selectedOptions = {}; // Collect user's answers
  const questionElems = document.querySelectorAll('.question');

  questionElems.forEach(questionElem => {
    const questionId = questionElem.querySelector('input').name.split('-')[1];
    const selectedOption = document.querySelector(`input[name="question-${questionId}"]:checked`);

    if (selectedOption) {
      selectedOptions[questionId] = selectedOption.value;
    }
  });

  // Save exam results to Firestore
  db.collection('examResults').add({
    userId: auth.currentUser.uid,
    examName: examNameInput.value,
    subjectName: subjectNameInput.value,
    answers: selectedOptions,
    timestamp: new Date()
  }).then(() => {
    alert('Exam submitted successfully!');
    // Optionally display results here
  }).catch(error => {
    console.error("Error submitting exam:", error);
  });
});

// Example sign-in button (replace with your actual button)
document.getElementById('login-button').addEventListener('click', () => {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  signIn(email, password);
});

// Example sign-out button (replace with your actual button)
document.getElementById('logout-button').addEventListener('click', signOut);

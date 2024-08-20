import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.12.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.12.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, where, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.12.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_dNTrWIo8fSTub-J4uh_Yjf4Fr_qay3c",
    authDomain: "ind-edu.firebaseapp.com",
    databaseURL: "https://ind-edu-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ind-edu",
    storageBucket: "ind-edu.appspot.com",
    messagingSenderId: "60520122150",
    appId: "1:60520122150:web:0205f57353dae6cfc723e7",
    measurementId: "G-XLZRGM88T9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const examSelection = document.getElementById('exam-selection');
    const quizOptions = document.getElementById('quiz-options');
    const quizContainer = document.getElementById('quiz');
    const questionContainer = document.getElementById('question-container');
    const feedback = document.getElementById('feedback');
    const leaderboardList = document.getElementById('leaderboard-list');
    const examListAdmin = document.getElementById('exam-list-admin');
    const userListAdmin = document.getElementById('user-list-admin');

    // Show/Hide Forms
    showSignup.addEventListener('click', () => {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    showLogin.addEventListener('click', () => {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Login and Signup
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        try {
            await signInWithEmailAndPassword(auth, username, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error(error);
        }
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        try {
            await createUserWithEmailAndPassword(auth, username, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error(error);
        }
    });

    // Password Reset
    document.getElementById('reset-password').addEventListener('click', async () => {
        const email = prompt('Enter your email for password reset');
        if (email) {
            try {
                await sendPasswordResetEmail(auth, email);
                alert('Password reset email sent!');
            } catch (error) {
                console.error(error);
            }
        }
    });

    // Quiz Dashboard
    async function loadExams() {
        const examsRef = collection(db, 'exams');
        const examSnapshot = await getDocs(examsRef);
        const examList = document.getElementById('exam-list');
        examList.innerHTML = '';
        examSnapshot.forEach((doc) => {
            const exam = doc.data();
            const li = document.createElement('li');
            li.textContent = exam.name;
            li.addEventListener('click', () => {
                showQuizOptions(doc.id);
            });
            examList.appendChild(li);
        });
    }

    async function showQuizOptions(examId) {
        quizOptions.style.display = 'block';
        const startQuizButton = document.getElementById('start-quiz');
        startQuizButton.addEventListener('click', () => {
            startQuiz(examId);
        });
    }

    async function startQuiz(examId) {
        const timePerQuestion = document.getElementById('time-per-question').value;
        const numQuestions = document.getElementById('num-questions').value;

        if (!timePerQuestion || !numQuestions) {
            alert('Please fill in all fields');
            return;
        }

        const questionsRef = collection(db, 'exams', examId, 'questions');
        const questionSnapshot = await getDocs(questionsRef);
        const questions = [];
        questionSnapshot.forEach((doc) => {
            questions.push(doc.data());
        });

        quizContainer.style.display = 'block';
        showQuestion(questions, 0, timePerQuestion, numQuestions);
    }

    function showQuestion(questions, currentIndex, timePerQuestion, numQuestions) {
        if (currentIndex >= numQuestions) {
            alert('Quiz Complete!');
            quizContainer.style.display = 'none';
            return;
        }

        const question = questions[currentIndex];
        questionContainer.innerHTML = `<h3>${question.text}</h3>`;
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.addEventListener('click', () => {
                checkAnswer(question, option, index);
            });
            questionContainer.appendChild(button);
        });
    }

    function checkAnswer(question, selectedOption, index) {
        const isCorrect = question.correctOption === String.fromCharCode(65 + index);
        feedback.innerHTML = `<p class="${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? 'Correct!' : 'Incorrect!'} The correct answer is ${question.options[question.correctOption.charCodeAt(0) - 65]}</p>`;
    }

    // Admin Dashboard
    document.getElementById('create-exam-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const examName = document.getElementById('exam-name').value;
        try {
            await addDoc(collection(db, 'exams'), { name: examName });
            loadAdminExams();
        } catch (error) {
            console.error(error);
        }
    });

    async function loadAdminExams() {
        const examsRef = collection(db, 'exams');
        const examSnapshot = await getDocs(examsRef);
        examListAdmin.innerHTML = '';
        examSnapshot.forEach((doc) => {
            const exam = doc.data();
            const li = document.createElement('li');
            li.textContent = exam.name;
            li.addEventListener('click', () => {
                showQuestionManagement(doc.id);
            });
            examListAdmin.appendChild(li);
        });
    }

    function showQuestionManagement(examId) {
        document.getElementById('question-management').style.display = 'block';
        document.getElementById('add-question').addEventListener('click', async () => {
            const questionText = document.getElementById('question-text').value;
            const options = [
                document.getElementById('option-a').value,
                document.getElementById('option-b').value,
                document.getElementById('option-c').value,
                document.getElementById('option-d').value,
            ];
            const correctOption = document.getElementById('correct-option').value;

            try {
                await addDoc(collection(db, 'exams', examId, 'questions'), {
                    text: questionText,
                    options: options,
                    correctOption: correctOption
                });
                alert('Question added!');
            } catch (error) {
                console.error(error);
            }
        });
    }

    async function loadUserList() {
        const usersRef = collection(db, 'users');
        const userSnapshot = await getDocs(usersRef);
        userListAdmin.innerHTML = '';
        userSnapshot.forEach((doc) => {
            const user = doc.data();
            const li = document.createElement('li');
            li.textContent = `Username: ${user.username}, Email: ${user.email}, Score: ${user.score}`;
            userListAdmin.appendChild(li);
        });
    }

    // Load data on page load
    if (document.body.id === 'dashboard') {
        loadExams();
    } else if (document.body.id === 'admin-dashboard') {
        loadAdminExams();
        loadUserList();
    }
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, updateProfile, deleteUser } from "https://www.gstatic.com/firebasejs/9.12.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.12.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const showLoginReset = document.getElementById('show-login-reset');
    const examSelection = document.getElementById('exam-selection');
    const quizOptions = document.getElementById('quiz-options');
    const quizContainer = document.getElementById('quiz');
    const questionContainer = document.getElementById('question-container');
    const feedback = document.getElementById('feedback');
    const leaderboardList = document.getElementById('leaderboard-list');
    const examListAdmin = document.getElementById('exam-list-admin');
    const userListAdmin = document.getElementById('user-list-admin');
    const profileForm = document.getElementById('profile-form');
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');
    const viewProfileButton = document.getElementById('view-profile');
    const deleteAccountButton = document.getElementById('delete-account');
    const backToDashboardButton = document.getElementById('back-to-dashboard');

    // Show/Hide Forms
    showSignup.addEventListener('click', () => {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    showLogin.addEventListener('click', () => {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    showLoginReset.addEventListener('click', () => {
        resetPasswordForm.style.display = 'none';
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
            alert(error.message);
        }
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            alert(error.message);
        }
    });

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent!');
            resetPasswordForm.style.display = 'none';
            loginForm.style.display = 'block';
        } catch (error) {
            alert(error.message);
        }
    });

    // Logout
    document.getElementById('logout').addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            alert(error.message);
        }
    });

    // Profile Management
    viewProfileButton.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (user) {
            profileUsername.value = user.displayName || '';
            profileEmail.value = user.email || '';
            document.getElementById('profile').style.display = 'block';
        }
    });

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user) {
            try {
                await updateProfile(user, {
                    displayName: profileUsername.value
                });
                await updateDoc(doc(db, 'users', user.uid), {
                    email: profileEmail.value
                });
                alert('Profile updated!');
            } catch (error) {
                alert(error.message);
            }
        }
    });

    deleteAccountButton.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await deleteUser(user);
                await deleteDoc(doc(db, 'users', user.uid));
                alert('Account deleted!');
                window.location.href = 'index.html';
            } catch (error) {
                alert(error.message);
            }
        }
    });

    backToDashboardButton.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
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
            button.addEventListener('click', () => checkAnswer(question, option));
            questionContainer.appendChild(button);
        });

        document.getElementById('next-question').style.display = 'none';
    }

    function checkAnswer(question, selectedOption) {
        const correct = question.correctOption === selectedOption;
        feedback.innerHTML = `<p class="${correct ? 'correct' : 'incorrect'}">${correct ? 'Correct!' : 'Incorrect!'}</p>`;
        feedback.innerHTML += `<p>Correct Answer: ${question.options[question.correctOption]}</p>`;

        document.getElementById('next-question').style.display = 'block';
    }

    // Admin Dashboard Functions
    async function loadExamsAdmin() {
        const examsRef = collection(db, 'exams');
        const examSnapshot = await getDocs(examsRef);
        examListAdmin.innerHTML = '';
        examSnapshot.forEach((doc) => {
            const exam = doc.data();
            const li = document.createElement('li');
            li.textContent = exam.name;
            li.addEventListener('click', () => {
                manageQuestions(doc.id);
            });
            examListAdmin.appendChild(li);
        });
    }

    async function manageQuestions(examId) {
        const questionsRef = collection(db, 'exams', examId, 'questions');
        const questionSnapshot = await getDocs(questionsRef);
        const questionList = document.getElementById('question-management');
        questionList.style.display = 'block';
    }

    document.getElementById('create-exam-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const examName = document.getElementById('exam-name').value;
        try {
            await addDoc(collection(db, 'exams'), { name: examName });
            alert('Exam created!');
            loadExamsAdmin();
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('add-question').addEventListener('click', async () => {
        const examId = document.getElementById('exam-id').value;
        const questionText = document.getElementById('question-text').value;
        const options = [
            document.getElementById('option-a').value,
            document.getElementById('option-b').value,
            document.getElementById('option-c').value,
            document.getElementById('option-d').value
        ];
        const correctOption = document.getElementById('correct-option').value;

        try {
            await addDoc(collection(db, 'exams', examId, 'questions'), {
                text: questionText,
                options,
                correctOption
            });
            alert('Question added!');
            manageQuestions(examId);
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('delete-question').addEventListener('click', async () => {
        const examId = document.getElementById('exam-id').value;
        const questionId = document.getElementById('question-id').value;

        try {
            await deleteDoc(doc(db, 'exams', examId, 'questions', questionId));
            alert('Question deleted!');
            manageQuestions(examId);
        } catch (error) {
            alert(error.message);
        }
    });

    async function loadUserListAdmin() {
        const usersRef = collection(db, 'users');
        const userSnapshot = await getDocs(usersRef);
        userListAdmin.innerHTML = '';
        userSnapshot.forEach((doc) => {
            const user = doc.data();
            const li = document.createElement('li');
            li.textContent = `${user.username} - ${user.email} - ${user.score}`;
            userListAdmin.appendChild(li);
        });
    }

    // Load the initial data
    loadExams();
    loadExamsAdmin();
    loadUserListAdmin();
});

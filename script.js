// Your Firebase configuration
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Signup Form Submission
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert('Signup successful! Please check your email to verify your account.');
        window.location.href = 'login.html'; // Redirect to login page after signup
    } catch (error) {
        console.error('Error signing up:', error.message);
        alert('Error signing up: ' + error.message);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    
    if (searchButton) {
        searchButton.addEventListener('click', searchPosts);
    }

    // Load posts
    loadPosts();
});

async function loadPosts() {
    const postsList = document.getElementById('posts-list');
    const postsSnapshot = await firestore.collection('posts').get();
    
    postsList.innerHTML = ''; // Clear existing posts

    postsSnapshot.forEach(doc => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.classList.add('post-item');
        postElement.innerHTML = `
            <h2><a href="post.html?id=${doc.id}">${post.title}</a></h2>
            <p>by ${post.publisher}</p>
            <p>${post.summary}</p>
        `;
        postsList.appendChild(postElement);
    });
}

async function searchPosts() {
    const query = searchInput.value.toLowerCase();
    const postsList = document.getElementById('posts-list');
    const postsSnapshot = await firestore.collection('posts').get();
    
    postsList.innerHTML = ''; // Clear existing posts

    postsSnapshot.forEach(doc => {
        const post = doc.data();
        if (post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query)) {
            const postElement = document.createElement('div');
            postElement.classList.add('post-item');
            postElement.innerHTML = `
                <h2><a href="post.html?id=${doc.id}">${post.title}</a></h2>
                <p>by ${post.publisher}</p>
                <p>${post.summary}</p>
            `;
            postsList.appendChild(postElement);
        }
    });
}

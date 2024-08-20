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
const firestore = firebase.firestore();

// User Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = 'index.html'; // Redirect to home page after login
  } catch (error) {
    console.error(error.message);
  }
});

// Admin Login
document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = 'admin.html'; // Redirect to admin page after login
  } catch (error) {
    console.error(error.message);
  }
});

// Display Posts (Home Page)
window.onload = async () => {
  if (window.location.pathname.endsWith('index.html')) {
    const postsList = document.getElementById('posts-list');
    const postsSnapshot = await firestore.collection('posts').get();
    
    postsSnapshot.forEach(doc => {
      const post = doc.data();
      const postElement = document.createElement('div');
      postElement.innerHTML = `
        <h2><a href="post.html?id=${doc.id}">${post.title}</a></h2>
        <p>by ${post.publisher}</p>
      `;
      postsList.appendChild(postElement);
    });
  }
  
  // Display Full Post (Post Page)
  if (window.location.pathname.endsWith('post.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    const postDoc = await firestore.collection('posts').doc(postId).get();
    if (postDoc.exists) {
      const post = postDoc.data();
      document.getElementById('post-title').innerText = post.title;
      document.getElementById('post-content').innerHTML = post.content;
    }
  }
};

 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAJVzWcSVu7nW-069bext5W6Nizx4sfxIA",
    authDomain: "edu-hub-c81b5.firebaseapp.com",
    databaseURL: "https://edu-hub-c81b5-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "edu-hub-c81b5",
    storageBucket: "edu-hub-c81b5.appspot.com",
    messagingSenderId: "560742513136",
    appId: "1:560742513136:web:102edd272982704fdb8535",
    measurementId: "G-78TC8XTPF7"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Show Profile Popup
function showProfilePopup() {
    document.getElementById('profile-popup').style.display = 'flex';
}

// Hide Profile Popup
function hideProfilePopup() {
    document.getElementById('profile-popup').style.display = 'none';
}

// Profile page logic
if (window.location.pathname.includes('profile.html')) {
    const authSection = document.getElementById('auth-section');
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const profilePic = document.getElementById('profile-pic');
    const profileName = document.getElementById('profile-name');
    const signOutButton = document.getElementById('sign-out');
    const viewPostsButton = document.getElementById('view-posts');

    signOutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    });

    document.getElementById('sign-in').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert('Welcome back!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing in: ', error);
        }
    });

    document.getElementById('sign-up').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert('Welcome to Edu Hub!');
            window.location.href = 'profile.html';
        } catch (error) {
            console.error('Error signing up: ', error);
        }
    });

    onAuthStateChanged(auth, user => {
        if (user) {
            authSection.style.display = 'none';
            userInfo.style.display = 'block';
            const profilePicURL = user.photoURL || 'default-profile.png';
            profilePic.src = profilePicURL;
            profileName.textContent = user.displayName || 'Guest';
            usernameDisplay.textContent = user.email.split('@')[0];
        } else {
            authSection.style.display = 'block';
            userInfo.style.display = 'none';
        }
    });

    viewPostsButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Main index page logic
if (window.location.pathname.includes('index.html')) {
    const postForm = document.getElementById('post-form');
    const signOutButton = document.getElementById('sign-out');
    const replyPopup = document.getElementById('reply-popup');
    let currentPostId = '';

    onAuthStateChanged(auth, user => {
        if (user) {
            postForm.style.display = 'block';
            signOutButton.style.display = 'inline';
        } else {
            postForm.style.display = 'none';
            signOutButton.style.display = 'none';
        }
    });

    document.getElementById('submit-post').addEventListener('click', async () => {
        const postContent = document.getElementById('post-content').value;
        const displayName = document.getElementById('display-name').value;
        if (postContent.trim() === '' || displayName.trim() === '') {
            alert('Post content and display name cannot be empty.');
            return;
        }

        if (auth.currentUser) {
            try {
                await addDoc(collection(db, 'posts'), {
                    content: postContent,
                    timestamp: serverTimestamp(),
                    uid: auth.currentUser.uid,
                    displayName: displayName,
                    profilePic: auth.currentUser.photoURL || 'default-profile.png',
                    likes: 0
                });
                document.getElementById('post-content').value = '';
                document.getElementById('display-name').value = '';
                displayPosts();
                alert('Post added successfully!');
            } catch (error) {
                console.error('Error adding post: ', error);
            }
        } else {
            alert('You must be logged in to post.');
        }
    });

    document.getElementById('sign-out').addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'profile.html';
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    });

    document.getElementById('close-popup').addEventListener('click', () => {
        replyPopup.style.display = 'none';
    });

    document.getElementById('submit-reply').addEventListener('click', async () => {
        const replyContent = document.getElementById('reply-content').value;
        if (replyContent.trim() === '') {
            alert('Reply cannot be empty.');
            return;
        }

        if (auth.currentUser) {
            try {
                await addDoc(collection(db, 'posts', currentPostId, 'replies'), {
                    content: replyContent,
                    timestamp: serverTimestamp(),
                    uid: auth.currentUser.uid,
                    displayName: auth.currentUser.displayName || 'Anonymous',
                    profilePic: auth.currentUser.photoURL || 'default-profile.png'
                });
                replyPopup.style.display = 'none';
                displayPosts();
            } catch (error) {
                console.error('Error adding reply: ', error);
            }
        } else {
            alert('You must be logged in to reply.');
        }
    });

    async function displayPosts() {
        const postList = document.getElementById('post-list');
        postList.innerHTML = '';

        try {
            const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => {
                const post = doc.data();
                const postDiv = document.createElement('div');
                postDiv.classList.add('post');
                const postId = doc.id;

                // Format timestamp
                const timestamp = post.timestamp.toDate();
                const formattedDate = timestamp.toLocaleString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
                    hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' 
                });

                postDiv.innerHTML = `
                    <div class="post-header">
                        <img src="${post.profilePic}" alt="Profile Picture">
                        <div class="author">${post.displayName}</div>
                        <div class="date">Posted on: ${formattedDate}</div>
                    </div>
                    <div class="content">${post.content}</div>
                    <div class="actions">
                        <button class="reply-btn" onclick="showReplyPopup('${postId}')">Reply</button>
                        <button class="like-btn" onclick="likePost('${postId}')">Like <span id="likes-${postId}">${post.likes}</span></button>
                        ${auth.currentUser && auth.currentUser.uid === post.uid ? `
                            <button class="edit-btn" onclick="editPost('${postId}', '${post.content}')">Edit</button>
                            <button class="delete-btn" onclick="deletePost('${postId}')">Delete</button>
                        ` : ''}
                    </div>
                    <div id="replies-${postId}" class="replies-section"></div>
                `;
                postList.appendChild(postDiv);

                // Display replies
                displayReplies(postId);
            });
        } catch (error) {
            console.error('Error getting posts: ', error);
        }
    }

    async function displayReplies(postId) {
        const repliesSection = document.getElementById(`replies-${postId}`);
        repliesSection.innerHTML = '';

        try {
            const q = query(collection(db, 'posts', postId, 'replies'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => {
                const reply = doc.data();
                const replyDiv = document.createElement('div');
                replyDiv.classList.add('reply');

                // Format timestamp
                const timestamp = reply.timestamp.toDate();
                const formattedDate = timestamp.toLocaleString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
                    hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' 
                });

                replyDiv.innerHTML = `
                    <div class="reply-header">
                        <img src="${reply.profilePic}" alt="Profile Picture">
                        <div class="author">${reply.displayName}</div>
                        <div class="date">Replied on: ${formattedDate}</div>
                    </div>
                    <div class="content">${reply.content}</div>
                    ${auth.currentUser && auth.currentUser.uid === reply.uid ? `
                        <div class="actions">
                            <button class="delete-reply-btn" onclick="deleteReply('${postId}', '${doc.id}')">Delete</button>
                        </div>
                    ` : ''}
                `;
                repliesSection.appendChild(replyDiv);
            });
        } catch (error) {
            console.error('Error getting replies: ', error);
        }
    }

    function showReplyPopup(postId) {
        currentPostId = postId;
        replyPopup.style.display = 'flex';
    }

    async function likePost(postId) {
        try {
            const postRef = doc(db, 'posts', postId);
            const postDoc = await getDoc(postRef);
            const post = postDoc.data();

            await updateDoc(postRef, {
                likes: post.likes + 1
            });

            document.getElementById(`likes-${postId}`).textContent = post.likes + 1;
        } catch (error) {
            console.error('Error liking post: ', error);
        }
    }

    function editPost(postId, content) {
        const newContent = prompt('Edit your post:', content);
        if (newContent !== null && newContent.trim() !== '') {
            updatePost(postId, newContent);
        }
    }

    async function updatePost(postId, newContent) {
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, { content: newContent });
            displayPosts();
        } catch (error) {
            console.error('Error updating post: ', error);
        }
    }

    async function deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            try {
                await deleteDoc(doc(db, 'posts', postId));
                displayPosts();
            } catch (error) {
                console.error('Error deleting post: ', error);
            }
        }
    }

    async function deleteReply(postId, replyId) {
        if (confirm('Are you sure you want to delete this reply?')) {
            try {
                await deleteDoc(doc(db, 'posts', postId, 'replies', replyId));
                displayReplies(postId);
            } catch (error) {
                console.error('Error deleting reply: ', error);
            }
        }
    }

    displayPosts();
}

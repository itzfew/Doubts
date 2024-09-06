import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Profile page logic
if (window.location.pathname.includes('profile.html')) {
    const authSection = document.getElementById('auth-section');
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
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
            alert('Welcome to Ind Edu!');
            window.location.href = 'profile.html';
        } catch (error) {
            console.error('Error signing up: ', error);
        }
    });

    onAuthStateChanged(auth, user => {
        if (user) {
            authSection.style.display = 'none';
            userInfo.style.display = 'block';
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
    const replyContent = document.getElementById('reply-content');
    const submitReplyButton = document.getElementById('submit-reply');
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
                    displayName: displayName
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

    async function displayPosts() {
        const postList = document.getElementById('post-list');
        postList.innerHTML = '';

        try {
            const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async doc => {
                const post = doc.data();
                const postDiv = document.createElement('div');
                postDiv.classList.add('post');

                // Format timestamp
                const timestamp = post.timestamp.toDate();
                const formattedDate = timestamp.toLocaleString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
                    hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' 
                });

                // Check if display name includes "verify"
                const isVerified = post.displayName.toLowerCase().includes('verify');
                // Remove "verify" from display name
                const cleanDisplayName = post.displayName.replace(/verify/i, '').trim();

                // Display post content
                postDiv.innerHTML = `
                    <div class="author">
                        ${cleanDisplayName} ${isVerified ? '<i class="fa fa-check-circle verified"></i> Verified' : ''}
                    </div>
                    <div class="content">${post.content}</div>
                    <div class="date">Published on: ${formattedDate}</div>
                    <div class="actions">
                        <button class="reply-btn" onclick="showReplyPopup('${doc.id}')"><i class="fa fa-reply"></i> Reply</button>
                        ${auth.currentUser && auth.currentUser.uid === post.uid ? `
                            <button class="edit-btn" onclick="editPost('${doc.id}', '${post.content}')"><i class="fa fa-edit"></i> Edit</button>
                            <button class="delete-btn" onclick="deletePost('${doc.id}')"><i class="fa fa-trash"></i> Delete</button>
                        ` : ''}
                    </div>
                    <div class="replies-section" id="replies-${doc.id}">
                        <!-- Replies will be dynamically added here -->
                    </div>
                `;

                postList.appendChild(postDiv);
                displayReplies(doc.id);
            });
        } catch (error) {
            console.error('Error getting posts: ', error);
        }
    }

    async function displayReplies(postId) {
        const repliesSection = document.getElementById(`replies-${postId}`);
        repliesSection.innerHTML = '';
        try {
            const q = query(collection(db, `posts/${postId}/replies`), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            let count = 0;
            querySnapshot.forEach(doc => {
                if (count < 2) {
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
                        <div class="author">${reply.displayName}</div>
                        <div class="content">${reply.content}</div>
                        <div class="date">Replied on: ${formattedDate}</div>
                        ${auth.currentUser && auth.currentUser.uid === reply.uid ? `
                            <div class="actions">
                                <button class="delete-btn" onclick="deleteReply('${postId}', '${doc.id}')"><i class="fa fa-trash"></i> Delete</button>
                            </div>
                        ` : ''}
                    `;
                    repliesSection.appendChild(replyDiv);
                    count++;
                }
            });

            if (count >= 2) {
                const viewMoreBtn = document.createElement('button');
                viewMoreBtn.classList.add('view-more-replies');
                viewMoreBtn.textContent = 'View more replies';
                viewMoreBtn.onclick = () => displayAllReplies(postId);
                repliesSection.appendChild(viewMoreBtn);
            }
        } catch (error) {
            console.error('Error getting replies: ', error);
        }
    }

    async function displayAllReplies(postId) {
        const repliesSection = document.getElementById(`replies-${postId}`);
        repliesSection.innerHTML = '';
        try {
            const q = query(collection(db, `posts/${postId}/replies`), orderBy('timestamp', 'desc'));
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
                    <div class="author">${reply.displayName}</div>
                    <div class="content">${reply.content}</div>
                    <div class="date">Replied on: ${formattedDate}</div>
                    ${auth.currentUser && auth.currentUser.uid === reply.uid ? `
                        <div class="actions">
                            <button class="delete-btn" onclick="deleteReply('${postId}', '${doc.id}')"><i class="fa fa-trash"></i> Delete</button>
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

    document.querySelector('.popup .close-btn').addEventListener('click', () => {
        replyPopup.style.display = 'none';
    });

    submitReplyButton.addEventListener('click', async () => {
        const content = replyContent.value;
        if (content.trim() === '') {
            alert('Reply content cannot be empty.');
            return;
        }

        if (auth.currentUser) {
            try {
                await addDoc(collection(db, `posts/${currentPostId}/replies`), {
                    content: content,
                    timestamp: serverTimestamp(),
                    uid: auth.currentUser.uid,
                    displayName: auth.currentUser.email.split('@')[0]
                });
                replyContent.value = '';
                displayReplies(currentPostId);
                replyPopup.style.display = 'none';
            } catch (error) {
                console.error('Error adding reply: ', error);
            }
        } else {
            alert('You must be logged in to reply.');
        }
    });

    window.editPost = async function(postId, currentContent) {
        const newContent = prompt('Edit your post:', currentContent);
        if (newContent !== null && newContent.trim() !== '') {
            try {
                await updateDoc(doc(db, 'posts', postId), {
                    content: newContent
                });
                displayPosts();
            } catch (error) {
                console.error('Error editing post: ', error);
            }
        }
    };

    window.deletePost = async function(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            try {
                await deleteDoc(doc(db, 'posts', postId));
                displayPosts();
            } catch (error) {
                console.error('Error deleting post: ', error);
            }
        }
    };

    window.deleteReply = async function(postId, replyId) {
        if (confirm('Are you sure you want to delete this reply?')) {
            try {
                await deleteDoc(doc(db, `posts/${postId}/replies`, replyId));
                displayReplies(postId);
            } catch (error) {
                console.error('Error deleting reply: ', error);
            }
        }
    };

    displayPosts();
}

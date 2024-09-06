import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";

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
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('auth-modal');
    const closeModal = document.querySelector('.modal .close');
    const signOutBtn = document.getElementById('sign-out');
    const submitPostBtn = document.getElementById('submit-post');
    const messageDiv = document.getElementById('message');
    let actionAfterAuth = null; // Store the action to perform after authentication

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    async function checkAuth() {
        onAuthStateChanged(auth, user => {
            if (user) {
                document.getElementById('sign-out').style.display = 'block';
                displayPosts();  // Show posts to authenticated users
                showMessage('Welcome back to Edu Hub Doubt Community!');
            } else {
                document.getElementById('sign-out').style.display = 'none';
                displayPosts();  // Show posts to unauthenticated users
                showMessage('Please sign in to interact with posts.');
            }
        });
    }

    document.getElementById('modal-sign-in').addEventListener('click', async () => {
        const email = document.getElementById('modal-email').value;
        const password = document.getElementById('modal-password').value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            modal.style.display = 'none';
            showMessage('Welcome back to Edu Hub Doubt Community!');
            if (actionAfterAuth) {
                actionAfterAuth(); // Execute the action after authentication
                actionAfterAuth = null; // Clear the action
            }
        } catch (error) {
            console.error('Error signing in: ', error);
            showMessage('Error signing in. Please try again.');
        }
    });

    document.getElementById('modal-sign-up').addEventListener('click', async () => {
        const email = document.getElementById('modal-email').value;
        const password = document.getElementById('modal-password').value;
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            modal.style.display = 'none';
            showMessage('Welcome to Edu Hub Doubt Community!');
            if (actionAfterAuth) {
                actionAfterAuth(); // Execute the action after authentication
                actionAfterAuth = null; // Clear the action
            }
        } catch (error) {
            console.error('Error signing up: ', error);
            showMessage('Error signing up. Please try again.');
        }
    });

    submitPostBtn.addEventListener('click', async () => {
        if (auth.currentUser) {
            const postContent = document.getElementById('post-content').value;
            const displayName = document.getElementById('display-name').value;

            if (postContent.trim() === '') {
                showMessage('Post content cannot be empty.');
                return;
            }

            try {
                await addDoc(collection(db, 'posts'), {
                    content: postContent,
                    timestamp: serverTimestamp(),
                    uid: auth.currentUser.uid,
                    displayName: displayName || 'Anonymous'
                });
                document.getElementById('post-content').value = '';
                document.getElementById('display-name').value = '';
                displayPosts();
                showMessage('Post added successfully!');
            } catch (error) {
                console.error('Error adding post: ', error);
                showMessage('Error adding post. Please try again.');
            }
        } else {
            actionAfterAuth = () => {
                submitPostBtn.click(); // Trigger the original action after authentication
            };
            showModal();
        }
    });

    signOutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'profile.html';
        } catch (error) {
            console.error('Error signing out: ', error);
            showMessage('Error signing out. Please try again.');
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
                const postId = doc.id;
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
                
                postDiv.innerHTML = `
                    <div class="author">
                        <img src="https://exam-one-ashen.vercel.app/defult.jpg" alt="Profile Picture" class="profile-pic" />
                        <span class="author-name">${cleanDisplayName} ${isVerified ? '<i class="fa fa-check-circle verified"></i> Verified' : ''}</span>
                    </div>
                    <div class="content">${post.content}</div>
                    <div class="date">Published on: ${formattedDate}</div>
                    <div class="actions">
                        ${auth.currentUser && auth.currentUser.uid === post.uid ? `
                            <button class="edit-btn" onclick="editPost('${postId}', '${post.content}')"><i class="fa fa-edit"></i> Edit</button>
                            <button class="delete-btn" onclick="deletePost('${postId}')"><i class="fa fa-trash"></i> Delete</button>
                        ` : ''}
                        ${auth.currentUser ? `
                            <textarea id="reply-content-${postId}" placeholder="Write a reply..."></textarea>
                            <button onclick="addReply('${postId}')"><i class="fa fa-paper-plane"></i> Add Reply</button>
                        ` : `
                            <p>Please <a href="#" onclick="showModal()">sign in</a> to reply.</p>
                        `}
                    </div>
                    <div id="replies-${postId}" class="replies">
                        <!-- Replies will be dynamically loaded here -->
                    </div>
                `;
                postList.appendChild(postDiv);
                displayReplies(postId);
            });
        } catch (error) {
            console.error('Error getting posts: ', error);
            showMessage('Error retrieving posts. Please try again.');
        }
    }

    window.editPost = async function(postId, currentContent) {
        const newContent = prompt('Edit your post:', currentContent);
        if (newContent !== null && newContent.trim() !== '') {
            try {
                const postRef = doc(db, 'posts', postId);
                await updateDoc(postRef, {
                    content: newContent
                });
                displayPosts();
                showMessage('Post updated successfully!');
            } catch (error) {
                console.error('Error updating post: ', error);
                showMessage('Error updating post. Please try again.');
            }
        }
    };

    window.deletePost = async function(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            try {
                await deleteDoc(doc(db, 'posts', postId));
                displayPosts();
                showMessage('Post deleted successfully!');
            } catch (error) {
                console.error('Error deleting post: ', error);
                showMessage('Error deleting post. Please try again.');
            }
        }
    };

    window.addReply = async function(postId) {
        if (auth.currentUser) {
            const replyContent = document.getElementById(`reply-content-${postId}`).value;
            if (replyContent.trim() === '') {
                showMessage('Reply content cannot be empty.');
                return;
            }

            try {
                await addDoc(collection(db, `posts/${postId}/replies`), {
                    content: replyContent,
                    timestamp: serverTimestamp(),
                    uid: auth.currentUser.uid,
                    displayName: auth.currentUser.email.split('@')[0] // Using email as default display name
                });
                document.getElementById(`reply-content-${postId}`).value = '';
                displayReplies(postId);
                showMessage('Reply added successfully!');
            } catch (error) {
                console.error('Error adding reply: ', error);
                showMessage('Error adding reply. Please try again.');
            }
        } else {
            actionAfterAuth = () => {
                document.getElementById(`reply-content-${postId}`).focus(); // Focus the reply input
            };
            showModal();
        }
    };

    async function displayReplies(postId) {
        const repliesList = document.getElementById(`replies-${postId}`);
        repliesList.innerHTML = '';

        try {
            const q = query(collection(db, `posts/${postId}/replies`), orderBy('timestamp', 'asc'));
            const querySnapshot = await getDocs(q);
            const replies = querySnapshot.docs.map(doc => doc.data());

            // Display the first 2 replies
            replies.slice(0, 2).forEach(reply => {
                const replyDiv = document.createElement('div');
                replyDiv.classList.add('reply');

                // Format timestamp
                const timestamp = reply.timestamp.toDate();
                const formattedDate = timestamp.toLocaleString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
                    hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' 
                });

                replyDiv.innerHTML = `
                    <div class="reply-author">
                        ${reply.displayName}
                    </div>
                    <div class="reply-content">${reply.content}</div>
                    <div class="reply-date">Replied on: ${formattedDate}</div>
                `;
                repliesList.appendChild(replyDiv);
            });

            if (replies.length > 2) {
                const showMoreButton = document.createElement('button');
                showMoreButton.textContent = 'Show More Replies';
                showMoreButton.onclick = () => {
                    replies.slice(2).forEach(reply => {
                        const replyDiv = document.createElement('div');
                        replyDiv.classList.add('reply');

                        // Format timestamp
                        const timestamp = reply.timestamp.toDate();
                        const formattedDate = timestamp.toLocaleString('en-US', { 
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
                            hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' 
                        });

                        replyDiv.innerHTML = `
                            <div class="reply-author">
                                ${reply.displayName}
                            </div>
                            <div class="reply-content">${reply.content}</div>
                            <div class="reply-date">Replied on: ${formattedDate}</div>
                        `;
                        repliesList.appendChild(replyDiv);
                    });
                    showMoreButton.remove();
                };
                repliesList.appendChild(showMoreButton);
            }
        } catch (error) {
            console.error('Error getting replies: ', error);
            showMessage('Error retrieving replies. Please try again.');
        }
    }

    function showModal() {
        document.getElementById('auth-modal').style.display = 'block';
    }

    function showMessage(message) {
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000); // Hide message after 5 seconds
    }

    checkAuth();
});

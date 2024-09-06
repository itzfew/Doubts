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

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    async function checkAuth() {
        onAuthStateChanged(auth, user => {
            if (user) {
                document.getElementById('sign-out').style.display = 'block';
                displayPosts();
            } else {
                document.getElementById('sign-out').style.display = 'none';
                modal.style.display = 'block';
            }
        });
    }

    document.getElementById('modal-sign-in').addEventListener('click', async () => {
        const email = document.getElementById('modal-email').value;
        const password = document.getElementById('modal-password').value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            modal.style.display = 'none';
        } catch (error) {
            console.error('Error signing in: ', error);
        }
    });

    document.getElementById('modal-sign-up').addEventListener('click', async () => {
        const email = document.getElementById('modal-email').value;
        const password = document.getElementById('modal-password').value;
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            modal.style.display = 'none';
        } catch (error) {
            console.error('Error signing up: ', error);
        }
    });

    submitPostBtn.addEventListener('click', async () => {
        const postContent = document.getElementById('post-content').value;
        const displayName = document.getElementById('display-name').value;

        if (postContent.trim() === '') {
            alert('Post content cannot be empty.');
            return;
        }

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
    });

    signOutBtn.addEventListener('click', async () => {
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
                        <button class="share-btn" onclick="sharePost('${postId}')"><i class="fa fa-share"></i> Share</button>
                        ${auth.currentUser && auth.currentUser.uid === post.uid ? `
                            <button class="edit-btn" onclick="editPost('${postId}', '${post.content}')"><i class="fa fa-edit"></i> Edit</button>
                            <button class="delete-btn" onclick="deletePost('${postId}')"><i class="fa fa-trash"></i> Delete</button>
                        ` : ''}
                        <button class="toggle-replies-btn" onclick="toggleReplies('${postId}')"><i class="fa fa-comment"></i> Replies</button>
                        <textarea id="reply-content-${postId}" placeholder="Write a reply..."></textarea>
                        <button onclick="addReply('${postId}')">Add Reply</button>
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
            } catch (error) {
                console.error('Error updating post: ', error);
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

    window.addReply = async function(postId) {
        const replyContent = document.getElementById(`reply-content-${postId}`).value;
        if (replyContent.trim() === '') {
            alert('Reply content cannot be empty.');
            return;
        }

        if (auth.currentUser) {
            try {
                await addDoc(collection(db, `posts/${postId}/replies`), {
                    content: replyContent,
                    timestamp: serverTimestamp(),
                    uid: auth.currentUser.uid,
                    displayName: auth.currentUser.email.split('@')[0] // Using email as default display name
                });
                document.getElementById(`reply-content-${postId}`).value = '';
                displayReplies(postId);
            } catch (error) {
                console.error('Error adding reply: ', error);
            }
        } else {
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
        }
    }

    function showModal() {
        document.getElementById('auth-modal').style.display = 'block';
    }

    function toggleReplies(postId) {
        const repliesSection = document.getElementById(`replies-${postId}`);
        repliesSection.style.display = repliesSection.style.display === 'none' ? 'block' : 'none';
    }

    checkAuth();
});

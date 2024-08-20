document.addEventListener('DOMContentLoaded', () => {
    const addPostButton = document.getElementById('add-post-button');
    
    if (addPostButton) {
        addPostButton.addEventListener('click', () => {
            window.location.href = 'add-post.html';
        });
    }

    // Load posts for management
    loadAdminPosts();
});

async function loadAdminPosts() {
    const postsManagementList = document.getElementById('posts-management-list');
    const postsSnapshot = await firestore.collection('posts').get();
    
    postsManagementList.innerHTML = ''; // Clear existing posts

    postsSnapshot.forEach(doc => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.classList.add('post-item');
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p>by ${post.publisher}</p>
            <button onclick="editPost('${doc.id}')">Edit</button>
            <button onclick="deletePost('${doc.id}')">Delete</button>
        `;
        postsManagementList.appendChild(postElement);
    });
}

async function editPost(postId) {
    // Navigate to edit post page or open edit form
    window.location.href = `edit-post.html?id=${postId}`;
}

async function deletePost(postId) {
    try {
        await firestore.collection('posts').doc(postId).delete();
        loadAdminPosts(); // Refresh the posts list
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

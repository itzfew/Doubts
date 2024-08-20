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

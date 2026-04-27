const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Get blog ID from URL if exists
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');

    if (blogId) {
        fetchBlogDetails(blogId);
    } else {
        fetchLatestBlog();
    }

    fetchRecentPosts();
    fetchCategories();
    setupSearch();
});

async function fetchBlogDetails(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/blogs/${id}`);
        const blog = await res.json();
        updatePageContent(blog);
    } catch (err) {
        console.error('Error fetching blog details:', err);
    }
}

async function fetchLatestBlog() {
    try {
        const res = await fetch(`${API_BASE_URL}/blogs`);
        const blogs = await res.json();
        if (blogs.length > 0) {
            updatePageContent(blogs[0]);
        }
    } catch (err) {
        console.error('Error fetching latest blog:', err);
    }
}

function updatePageContent(blog) {
    if (!blog) return;

    console.log('Updating page with blog data:', blog);

    document.title = `${blog.title} | LockHive Security`;

    // Title and Breadcrumb
    const titleEl = document.getElementById('blog-main-title');
    const breadcrumbEl = document.getElementById('breadcrumb-current');
    if (titleEl) titleEl.innerText = blog.title;
    if (breadcrumbEl) breadcrumbEl.innerText = blog.title;

    // Date
    const dateEl = document.getElementById('blog-date');
    if (dateEl) {
        dateEl.innerText = new Date(blog.createdAt).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        }).toUpperCase();
    }

    // Category
    const categoryTag = document.querySelector('.category-tag');
    if (categoryTag) {
        categoryTag.innerHTML = `<i class="fas fa-folder"></i> ${blog.category || 'CYBER SECURITY'}`;
    }

    // Image
    const imgEl = document.getElementById('blog-featured-img');
    if (imgEl && blog.image) {
        imgEl.src = blog.image;
        imgEl.alt = blog.title;
    }

    // Content
    const contentBody = document.getElementById('blog-content-body');
    if (contentBody) {
        if (blog.content) {
            // Convert line breaks to paragraphs and preserve basic formatting
            const formattedContent = blog.content
                .split('\n')
                .filter(p => p.trim() !== '')
                .map(p => `<p>${p.trim()}</p>`)
                .join('');
            contentBody.innerHTML = formattedContent;
        } else {
            contentBody.innerHTML = '<p>No content available for this post.</p>';
        }
    }

    // Tags
    const tagsCloud = document.querySelector('.tags-cloud');
    if (tagsCloud && blog.tags && blog.tags.length > 0) {
        tagsCloud.innerHTML = blog.tags.map(tag => `<a href="#">${tag}</a>`).join('');
    }
}

async function fetchRecentPosts() {
    try {
        const res = await fetch(`${API_BASE_URL}/blogs`);
        const blogs = await res.json();
        const recentList = document.getElementById('recent-posts-list');

        if (!recentList) return;

        // Take top 4 recent posts
        recentList.innerHTML = blogs.slice(0, 4).map(blog => `
            <div class="post-item" style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center; cursor: pointer;" onclick="location.href='?id=${blog._id}'">
                <img src="${blog.image || 'https://via.placeholder.com/80'}" alt="${blog.title}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">
                <div class="post-info">
                    <h4 style="margin: 0; font-size: 14px; line-height: 1.4;">${blog.title}</h4>
                    <span style="font-size: 12px; color: #b74aeb;"><i class="far fa-calendar"></i> ${new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error fetching recent posts:', err);
    }
}

async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE_URL}/blogs`);
        const blogs = await res.json();
        const categoriesList = document.querySelector('.categories-widget ul');

        if (!categoriesList) return;

        // Extract unique categories and counts
        const catCounts = {};
        blogs.forEach(b => {
            const cat = b.category || 'Cyber Security';
            catCounts[cat] = (catCounts[cat] || 0) + 1;
        });

        categoriesList.innerHTML = Object.keys(catCounts).map(cat => `
            <li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <a href="#" style="color: #ccc; text-decoration: none;"><i class="fas fa-chevron-right" style="color: #b74aeb; font-size: 10px; margin-right: 10px;"></i> ${cat}</a>
                <span style="background: rgba(183, 74, 235, 0.1); color: #b74aeb; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${catCounts[cat]}</span>
            </li>
        `).join('');
    } catch (err) {
        console.error('Error fetching categories:', err);
    }
}

function setupSearch() {
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');

    if (!searchInput || !searchBtn) return;

    const handleSearch = async () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;

        try {
            const res = await fetch(`${API_BASE_URL}/blogs`);
            const blogs = await res.json();
            const found = blogs.find(b => b.title.toLowerCase().includes(query) || b.content.toLowerCase().includes(query));

            if (found) {
                location.href = `?id=${found._id}`;
            } else {
                alert('No posts found matching your search.');
            }
        } catch (err) {
            console.error('Search error:', err);
        }
    };

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

// Handle comment submission (mock)
document.querySelector('.comment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your comment! It will be reviewed by our team.');
    e.target.reset();
});

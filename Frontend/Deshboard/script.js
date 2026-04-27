const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('page-title');

// Blog Elements
const blogForm = document.getElementById('blog-form');
const blogList = document.getElementById('blog-list');
const blogCount = document.getElementById('blog-count');
const blogImageFile = document.getElementById('blog-image-file');

// Project Elements
const projectForm = document.getElementById('project-form');
const projectList = document.getElementById('project-list');
const projectCount = document.getElementById('project-count');
const projectImageFile = document.getElementById('project-image-file');

// --- Navigation Logic ---
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');

        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        sections.forEach(sec => sec.classList.remove('active'));
        const targetSection = document.getElementById(`${page}-section`);
        if (targetSection) targetSection.classList.add('active');

        pageTitle.innerText = item.innerText.trim();

        if (page === 'home') fetchStats();
        if (page === 'blogs') fetchBlogs();
        if (page === 'projects') fetchProjects();
    });
});

// --- Image Upload Helper ---
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    try {
        const res = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.imageUrl;
    } catch (err) {
        console.error('Upload failed:', err);
        return null;
    }
}

// --- Preview Logic (Local Only, No Upload) ---
blogImageFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('preview-blog-img').src = URL.createObjectURL(file);
    }
});

projectImageFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('preview-project-img').src = URL.createObjectURL(file);
    }
});

// --- Live Preview Logic ---
function updateBlogPreview() {
    document.getElementById('preview-blog-title').innerText = document.getElementById('blog-title').value || 'Your Blog Title Here';
    document.getElementById('preview-blog-body').innerText = document.getElementById('blog-content').value || 'Content appears here...';
    document.getElementById('preview-blog-category').innerText = document.getElementById('blog-category').value || 'General';
    const tags = document.getElementById('blog-tags').value;
    document.getElementById('preview-blog-tags').innerText = tags ? tags.split(',').map(t => `#${t.trim()}`).join(' ') : '#cybersecurity';

    // Update date to current date
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    document.getElementById('preview-blog-date').innerText = new Date().toLocaleDateString('en-US', options);
}

function updateProjectPreview() {
    document.getElementById('preview-project-name').innerText = document.getElementById('project-name').value || 'Project Name';
    document.getElementById('preview-project-desc').innerText = document.getElementById('project-description').value || 'Description here...';
    const tech = document.getElementById('project-tech').value;
    const techHTML = tech ? tech.split(',').map(t => `<span>${t.trim()}</span>`).join('') : '<span>Tech</span>';
    document.getElementById('preview-project-tech').innerHTML = techHTML;
}

// Add event listeners for blog inputs
['blog-title', 'blog-content', 'blog-category', 'blog-tags'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateBlogPreview);
});

// Add event listeners for project inputs
['project-name', 'project-description', 'project-tech'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateProjectPreview);
});

// --- Helper for Image URLs ---
function getImgUrl(path) {
    if (!path || path === '' || path === 'undefined') {
        return 'https://via.placeholder.com/40';
    }
    
    // Use localhost as it's the most common for local dev
    const serverUrl = 'http://localhost:5000';
    
    // Extract only the filename from the path
    let filename = path;
    if (path.includes('/')) filename = path.split('/').pop();
    if (path.includes('\\')) filename = path.split('\\').pop();
    
    // Encode the filename to handle spaces and commas
    return `${serverUrl}/uploads/${encodeURIComponent(filename)}`;
}

// --- Blog CRUD ---
async function fetchBlogs() {
    try {
        const res = await fetch(`${API_BASE_URL}/blogs`);
        const blogs = await res.json();
        blogList.innerHTML = blogs.map(blog => `
            <tr>
                <td>
                    <div class="table-item-info">
                        <img src="${getImgUrl(blog.image)}" class="table-thumb" alt="" onerror="this.src='https://via.placeholder.com/40'">
                        <span>${blog.title}</span>
                    </div>
                </td>
                <td>${new Date(blog.createdAt).toLocaleDateString()}</td>
                <td class="actions-cell">
                    <a href="Blog Static Page/index.html?id=${blog._id}" target="_blank" class="btn btn-primary btn-sm" title="View Blog">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="btn btn-danger btn-sm" onclick="deleteBlog('${blog._id}')" title="Delete Blog">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error(err); }
}

blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('blog-submit');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Uploading...';
    submitBtn.disabled = true;

    try {
        let imageUrl = '';
        if (blogImageFile.files[0]) {
            imageUrl = await uploadImage(blogImageFile.files[0]);
        }

        const blogData = {
            title: document.getElementById('blog-title').value,
            content: document.getElementById('blog-content').value,
            category: document.getElementById('blog-category').value,
            tags: document.getElementById('blog-tags').value.split(',').map(t => t.trim()),
            image: imageUrl
        };

        const res = await fetch(`${API_BASE_URL}/blogs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blogData)
        });

        if (res.ok) {
            blogForm.reset();
            document.getElementById('preview-blog-img').src = 'https://via.placeholder.com/400x200?text=Blog+Image';
            alert('Blog created successfully!');
            fetchBlogs();
        }
    } catch (err) {
        alert('Failed to create blog');
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});

async function deleteBlog(id) {
    if (confirm('Delete this blog?')) {
        await fetch(`${API_BASE_URL}/blogs/${id}`, { method: 'DELETE' });
        fetchBlogs();
    }
}

// --- Project CRUD ---
async function fetchProjects() {
    try {
        const res = await fetch(`${API_BASE_URL}/projects`);
        const projects = await res.json();
        projectList.innerHTML = projects.map(project => `
            <tr>
                <td>
                    <div class="table-item-info">
                        <img src="${getImgUrl(project.image)}" class="table-thumb" alt="" onerror="this.src='https://via.placeholder.com/40'">
                        <span>${project.name}</span>
                    </div>
                </td>
                <td>
                    <div class="table-links">
                        <a href="${project.liveLink}" target="_blank" title="Live Link"><i class="fas fa-external-link-alt"></i></a>
                        <a href="${project.githubLink}" target="_blank" title="GitHub Link"><i class="fab fa-github"></i></a>
                    </div>
                </td>
                <td class="actions-cell">
                    <button class="btn btn-danger btn-sm" onclick="deleteProject('${project._id}')" title="Delete Project">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error(err); }
}

projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('project-submit');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Uploading...';
    submitBtn.disabled = true;

    try {
        let imageUrl = '';
        if (projectImageFile.files[0]) {
            imageUrl = await uploadImage(projectImageFile.files[0]);
        }

        const projectData = {
            name: document.getElementById('project-name').value,
            description: document.getElementById('project-description').value,
            liveLink: document.getElementById('project-live').value,
            githubLink: document.getElementById('project-github').value,
            techStack: document.getElementById('project-tech').value.split(',').map(t => t.trim()),
            image: imageUrl
        };

        const res = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });

        if (res.ok) {
            projectForm.reset();
            document.getElementById('preview-project-img').src = 'https://via.placeholder.com/400x200?text=Project+Image';
            alert('Project uploaded successfully!');
            fetchProjects();
        }
    } catch (err) {
        alert('Failed to upload project');
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});

async function deleteProject(id) {
    if (confirm('Delete this project?')) {
        await fetch(`${API_BASE_URL}/projects/${id}`, { method: 'DELETE' });
        fetchProjects();
    }
}

// --- Stats Logic ---
async function fetchStats() {
    try {
        const [bRes, pRes] = await Promise.all([
            fetch(`${API_BASE_URL}/blogs`),
            fetch(`${API_BASE_URL}/projects`)
        ]);
        const blogs = await bRes.json();
        const projects = await pRes.json();

        document.getElementById('blog-count').innerText = blogs.length || 0;
        document.getElementById('project-count').innerText = projects.length || 0;
    } catch (e) {
        console.log("Stats fetch error");
    }
}

// Initial Call
window.onload = () => {
    fetchStats();
};
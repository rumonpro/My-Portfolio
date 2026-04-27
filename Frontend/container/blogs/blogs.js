async function initBlogs() {
    const slider = document.getElementById('blog-slider-content');
    const prevBtn = document.getElementById('blog-prev');
    const nextBtn = document.getElementById('blog-next');
    
    let currentIndex = 0;
    let blogsData = [];

    try {
        const response = await fetch('http://localhost:5000/api/blogs');
        blogsData = await response.json();
        
        if (blogsData.length > 0) {
            renderBlogs(blogsData);
        } else {
            slider.innerHTML = '<p style="color: #666; text-align: center; width: 100%;">No blogs found.</p>';
        }
    } catch (error) {
        console.error('Error fetching blogs:', error);
        slider.innerHTML = '<p style="color: #666; text-align: center; width: 100%;">Failed to load blogs.</p>';
    }

    function renderBlogs(blogs) {
        slider.innerHTML = blogs.map(blog => `
            <a href="Deshboard/Blog Static Page/index.html?id=${blog._id}" class="blog-card">
                <div class="blog-img-wrapper">
                    <img src="${blog.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}" alt="${blog.title}">
                    <span class="blog-category-badge">${blog.category || 'Cyber Security'}</span>
                </div>
                <div class="blog-card-content">
                    <span class="blog-date">${new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <h3 class="blog-card-title">${blog.title}</h3>
                    <p class="blog-excerpt">${stripHtml(blog.content)}</p>
                    <div class="read-more">
                        READ MORE <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </a>
        `).join('');
    }

    function stripHtml(html) {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    // Slider Logic
    nextBtn.addEventListener('click', () => {
        const cardWidth = slider.querySelector('.blog-card').offsetWidth + 30;
        const maxScroll = (blogsData.length - getVisibleCards()) * cardWidth;
        
        if (Math.abs(currentIndex * cardWidth) < maxScroll) {
            currentIndex--;
            slider.style.transform = `translateX(${currentIndex * cardWidth}px)`;
        } else {
            // Loop back to start
            currentIndex = 0;
            slider.style.transform = `translateX(0)`;
        }
    });

    prevBtn.addEventListener('click', () => {
        const cardWidth = slider.querySelector('.blog-card').offsetWidth + 30;
        
        if (currentIndex < 0) {
            currentIndex++;
            slider.style.transform = `translateX(${currentIndex * cardWidth}px)`;
        }
    });

    function getVisibleCards() {
        if (window.innerWidth > 1200) return 4;
        if (window.innerWidth > 992) return 3;
        if (window.innerWidth > 768) return 2;
        return 1;
    }
}

// Initialize when components are loaded
// In Index.html, loadComponents will run this if we add it as a script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogs);
} else {
    initBlogs();
}

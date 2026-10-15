document.addEventListener('DOMContentLoaded', () => {
    // 1. Loader screen
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        if (loader) {
            loader.classList.add('hidden');
        }
    });

    // 2. Dark mode toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', targetTheme);
            localStorage.setItem('theme', targetTheme);
        });
    }

    // 3. 3D Flip Card accessibility & toggle
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                card.classList.toggle('is-flipped');
            }
        });

        const backBtn = card.querySelector('.btn-flip-back');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.remove('is-flipped');
            });
        }
    });
});
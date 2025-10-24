document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'x' || e.key === 'v')) {
            e.preventDefault();
            return false;
        }

        if (e.key === 'F12' || 
            (e.ctrlKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            return false;
        }
    });

    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });

    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });

    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }

    const video = document.getElementById('video-bg');
    const overlay = document.getElementById('overlay');
    
    video.setAttribute('playsinline', '');
    
    function keepPlaying() {
        if (!video.paused && overlay.style.display === 'none') {
            video.play();
        }
        requestAnimationFrame(keepPlaying);
    }
    
    requestAnimationFrame(keepPlaying);
    
    const volumeControl = document.createElement('div');
    volumeControl.classList.add('volume-control');
    volumeControl.style.display = 'none';
    
    const volumeIcon = document.createElement('div');
    volumeIcon.classList.add('volume-icon');
    volumeControl.appendChild(volumeIcon);

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.01';
    
    const storedVolume = localStorage.getItem('videoVolume');
    if (storedVolume !== null) {
        video.volume = parseFloat(storedVolume);
        volumeSlider.value = video.volume;
    } else {
        volumeSlider.value = video.volume;
    }
    volumeSlider.classList.add('volume-slider');
    volumeControl.appendChild(volumeSlider);

    document.body.appendChild(volumeControl);

    document.addEventListener('click', function() {
        if (video.muted) {
            video.muted = false;
            const storedVolume = localStorage.getItem('videoVolume');
            if (storedVolume !== null) {
                video.volume = parseFloat(storedVolume);
                volumeSlider.value = video.volume;
                console.log('Restored volume on unmute:', video.volume);
            } else {
                video.volume = 0.5;
                volumeSlider.value = 0.5;
                console.log('Set default volume on unmute:', video.volume);
            }
        }
    }, { once: true });

    volumeSlider.addEventListener('input', function() {
        video.volume = volumeSlider.value;
        localStorage.setItem('videoVolume', video.volume);
        console.log('Saved volume to localStorage:', video.volume);
    });

    window.enterSite = function() {
        overlay.style.display = 'none';
        video.play();
        volumeControl.style.display = 'flex';
        const contentElement = document.querySelector('.content');
        if (contentElement) {
            contentElement.classList.add('visible');
            contentElement.onclick = null;
        }
    }

    window.openLink = function(url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    window.copyDiscord = function() {
        navigator.clipboard.writeText('vrailn').then(function() {
            const copied = document.getElementById('discord-copied');
            if (copied) {
                copied.classList.add('show');
                setTimeout(function() {
                    copied.classList.remove('show');
                }, 1200);
            }
        }).catch(function(err) {
            console.error('failed to copy username:', err);
        });
    }

    document.getElementById('overlay').onclick = enterSite;

    const view_api = 'https://2rich.xyz/api/views';
    
    async function fetchViewCount() {
        const viewCountElement = document.getElementById('view-count');
        
        try {
            const response = await fetch(view_api, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`error status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.views !== undefined) {
                viewCountElement.textContent = data.views.toLocaleString();
                viewCountElement.setAttribute('aria-label', `View count: ${data.views.toLocaleString()}`);
            } else {
                viewCountElement.textContent = '0';
                viewCountElement.setAttribute('aria-label', 'View count: 0');
            }
        } catch (error) {
            console.error('failed to fetch views:', error);
            viewCountElement.textContent = 'Error';
            viewCountElement.setAttribute('aria-label', 'View count unavailable');
        }
    }
    
    fetchViewCount();
}); 

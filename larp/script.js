// Discord Servers Integration
const DISCORD_INVITES = ['2rich', 'tickler', 'rustinternal'];

async function loadDiscordServers() {
    const serversGrid = document.getElementById('servers-grid');
    serversGrid.innerHTML = ''; // Clear loading state
    
    for (const inviteCode of DISCORD_INVITES) {
        try {
            const response = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`);
            const data = await response.json();
            
            if (data.guild) {
                const guild = data.guild;
                const iconUrl = guild.icon 
                    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
                    : null;
                
                // Create server card
                const serverCard = document.createElement('a');
                serverCard.href = `https://discord.gg/${inviteCode}`;
                serverCard.target = '_blank';
                serverCard.className = 'server-card';
                
                // Server icon
                const serverIcon = document.createElement('div');
                serverIcon.className = 'server-icon';
                if (iconUrl) {
                    serverIcon.style.backgroundImage = `url(${iconUrl})`;
                    serverIcon.style.backgroundSize = 'cover';
                    serverIcon.style.backgroundPosition = 'center';
                } else {
                    // Fallback to first 2 letters if no icon
                    serverIcon.textContent = guild.name.substring(0, 2).toUpperCase();
                }
                
                // Server info
                const serverInfo = document.createElement('div');
                serverInfo.className = 'server-info';
                
                const serverHeader = document.createElement('div');
                serverHeader.className = 'server-header';
                
                const serverName = document.createElement('h3');
                serverName.textContent = guild.name;
                
                // Add role badges based on server
                const roleBadges = document.createElement('div');
                roleBadges.className = 'server-role-badges';
                
                if (inviteCode === '2rich') {
                    roleBadges.innerHTML = '<span class="server-badge owner-2rich">Owner</span>';
                } else if (inviteCode === 'tickler') {
                    roleBadges.innerHTML = '<span class="server-badge founder">Founder</span><span class="server-badge developer">Developer</span>';
                } else if (inviteCode === 'rustinternal') {
                    roleBadges.innerHTML = '<span class="server-badge owner-novacaine">Owner</span><span class="server-badge developer-novacaine">Developer</span>';
                }
                
                serverHeader.appendChild(serverName);
                serverHeader.appendChild(roleBadges);
                
                const serverDesc = document.createElement('p');
                serverDesc.textContent = guild.description || 'Join our community';
                
                const serverMembers = document.createElement('span');
                serverMembers.className = 'server-members';
                const onlineCount = data.approximate_presence_count || 0;
                const totalCount = data.approximate_member_count || 0;
                serverMembers.innerHTML = `<span class="online">🟢 ${onlineCount.toLocaleString()} online</span> • <span class="total">${totalCount.toLocaleString()} members</span>`;
                
                serverInfo.appendChild(serverHeader);
                serverInfo.appendChild(serverDesc);
                serverInfo.appendChild(serverMembers);
                
                serverCard.appendChild(serverIcon);
                serverCard.appendChild(serverInfo);
                
                serversGrid.appendChild(serverCard);
            }
        } catch (error) {
            console.error(`Error loading server ${inviteCode}:`, error);
        }
    }
}

// Load servers on page load
loadDiscordServers();

// Generate stars and constellations
function generateStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 300;
    
    // Regular stars with faster drift
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 2.5 + 0.5;
        const driftX = (Math.random() - 0.5) * 200;
        const driftY = (Math.random() - 0.5) * 200;
        
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--drift-x', `${driftX}px`);
        star.style.setProperty('--drift-y', `${driftY}px`);
        star.style.animationDuration = `${Math.random() * 2 + 1}s, ${Math.random() * 15 + 10}s`;
        star.style.animationDelay = `${Math.random() * 2}s, 0s`;
        
        starsContainer.appendChild(star);
    }
    
    // Create star-shaped constellations - disabled for now
    // createStarConstellation(20, 20, 0.5);
    // createStarConstellation(75, 18, 0.6);
    // createStarConstellation(18, 65, 0.4);
    // createStarConstellation(80, 60, 0.5);
    // createStarConstellation(50, 40, 0.4);
    // createStarConstellation(35, 75, 0.5);
}

// Create a 5-pointed star constellation using SVG for perfect line connections
function createStarConstellation(centerX, centerY, size) {
    const starsContainer = document.getElementById('stars');
    
    // Create container div for better positioning control
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = `${centerX}%`;
    container.style.top = `${centerY}%`;
    container.style.transform = 'translate(-50%, -50%)';
    container.style.width = `${size * 3}vw`;
    container.style.height = `${size * 3}vw`;
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.overflow = 'visible';
    
    // Generate 5-pointed star path
    const points = [];
    for (let i = 0; i < 10; i++) {
        const angle = (i * 36 - 90) * Math.PI / 180;
        const radius = i % 2 === 0 ? 40 : 16; // Outer and inner radius
        points.push({
            x: 50 + Math.cos(angle) * radius,
            y: 50 + Math.sin(angle) * radius
        });
    }
    
    // Create path string
    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x} ${points[i].y}`;
    }
    pathData += ' Z'; // Close the path
    
    // Create path element with multi-layered glow
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(255, 255, 255, 0.8)');
    path.setAttribute('stroke-width', '1');
    path.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 24px rgba(200, 200, 200, 0.3))';
    path.style.animation = 'constellationPulse 4s ease-in-out infinite';
    
    svg.appendChild(path);
    container.appendChild(svg);
    starsContainer.appendChild(container);
}

// Create shooting stars with particle trail effect
function createShootingStar() {
    const startX = Math.random() * 60 + 20; // 20-80% to stay away from edges
    const startY = Math.random() * 30; // Top 30% of screen
    
    // Create a streak of particles
    const particleCount = 20;
    const angle = Math.random() * 20 + 35; // 35 to 55 degrees (downward right)
    const speed = 600; // pixels to travel
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'mouse-particle';
            
            // Calculate position along the path - moving DOWN and RIGHT
            const progress = i / particleCount;
            const radians = (angle * Math.PI) / 180;
            const xOffset = Math.cos(radians) * speed * progress;
            const yOffset = Math.sin(radians) * speed * progress;
            
            const x = (window.innerWidth * startX / 100 + xOffset) / window.innerWidth * 100;
            const y = (window.innerHeight * startY / 100 + yOffset) / window.innerHeight * 100;
            
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            
            // Small random scatter
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;
            particle.style.setProperty('--particle-x', `${offsetX}px`);
            particle.style.setProperty('--particle-y', `${offsetY}px`);
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1200);
        }, i * 50); // Slower stagger - 50ms between particles
    }
}

// Spawn shooting stars periodically - slower
setInterval(() => {
    if (Math.random() > 0.3) {
        createShootingStar();
    }
}, 4000);

generateStars();

// Mouse particle trail effect
let lastParticleTime = 0;
const particleCooldown = 30; // ms

document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastParticleTime < particleCooldown) return;
    
    lastParticleTime = now;
    createMouseParticles(e.clientX, e.clientY);
});

function createMouseParticles(x, y) {
    const particleCount = 3;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'mouse-particle';
        
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--particle-x', `${offsetX}px`);
        particle.style.setProperty('--particle-y', `${offsetY}px`);
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Extract dominant color from image
function getDominantColor(imageUrl, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;
        
        // Sample pixels
        for (let i = 0; i < imageData.length; i += 4 * 10) {
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
            count++;
        }
        
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        callback(`${r}, ${g}, ${b}`);
    };
    
    img.onerror = function() {
        callback('138, 43, 226'); // Fallback purple
    };
}

// Discord Profile Integration
function updateDiscordProfile(data) {
    if (!data.success || !data.data) return;
    
    const discordUser = data.data.discord_user;
    const discordStatus = data.data.discord_status;
    const activities = data.data.activities || [];
    
    // Update avatar
    const avatarImg = document.getElementById('discord-avatar');
    if (discordUser.avatar) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${discordUser.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`;
        avatarImg.src = avatarUrl;
        
        // Extract color from avatar and apply glow
        getDominantColor(avatarUrl, (color) => {
            avatarImg.style.boxShadow = `
                0 8px 32px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                0 0 60px rgba(${color}, 0.4)`;
        });
    }
    
    // Update username
    const usernameEl = document.getElementById('discord-username');
    if (discordUser.global_name) {
        usernameEl.textContent = discordUser.global_name;
    } else {
        usernameEl.textContent = discordUser.username;
    }
    
    // Update tag
    const tagEl = document.getElementById('discord-tag');
    if (discordUser.discriminator && discordUser.discriminator !== '0') {
        tagEl.textContent = `@${discordUser.username}#${discordUser.discriminator}`;
    } else {
        tagEl.textContent = `@${discordUser.username}`;
    }
    
    // Update status indicator
    const statusIndicator = document.getElementById('status-indicator');
    statusIndicator.className = 'status-indicator';
    
    switch(discordStatus) {
        case 'online':
            statusIndicator.classList.add('status-online');
            break;
        case 'idle':
            statusIndicator.classList.add('status-idle');
            break;
        case 'dnd':
            statusIndicator.classList.add('status-dnd');
            break;
        default:
            statusIndicator.classList.add('status-offline');
    }
    
    // Update custom status if exists
    const customStatus = activities.find(a => a.type === 4);
    if (customStatus && customStatus.state) {
        const statusEl = document.getElementById('discord-status');
        const emoji = customStatus.emoji ? (customStatus.emoji.id ? `<img src="https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.png" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle;">` : customStatus.emoji.name) : '';
        statusEl.innerHTML = `${emoji} ${customStatus.state}`;
    }
}

// Lanyard Spotify Integration
const DISCORD_ID = '366032523689721856';
const LANYARD_API = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;

let lastTrackId = null;
let spotifyData = null;
let currentLyrics = [];
let lyricsInterval = null;

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateProgress() {
    if (!spotifyData) return;
    
    const now = Date.now();
    const start = spotifyData.timestamps.start;
    const end = spotifyData.timestamps.end;
    
    const elapsed = now - start;
    const total = end - start;
    const progress = Math.min((elapsed / total) * 100, 100);
    
    // Update progress bar
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    // Update time displays
    const currentTime = document.getElementById('current-time');
    const totalTime = document.getElementById('total-time');
    
    if (currentTime) currentTime.textContent = formatTime(elapsed);
    if (totalTime) totalTime.textContent = formatTime(total);
}

// Fetch lyrics from lrclib.net
async function fetchLyrics(trackName, artistName, duration) {
    try {
        const params = new URLSearchParams({
            track_name: trackName,
            artist_name: artistName,
            duration: Math.floor(duration / 1000) // Convert ms to seconds
        });
        
        const response = await fetch(`https://lrclib.net/api/get?${params}`);
        
        if (!response.ok) {
            console.log('No lyrics found');
            return null;
        }
        
        const data = await response.json();
        
        if (data.syncedLyrics) {
            // Parse synced lyrics
            return parseLyrics(data.syncedLyrics);
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching lyrics:', error);
        return null;
    }
}

// Parse LRC format lyrics
function parseLyrics(lrcText) {
    const lines = lrcText.split('\n');
    const lyrics = [];
    
    for (const line of lines) {
        // Match [mm:ss.xx] format
        const match = line.match(/\[(\d+):(\d+)\.(\d+)\](.*)/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const centiseconds = parseInt(match[3]);
            const text = match[4].trim();
            
            const timeMs = (minutes * 60 + seconds) * 1000 + centiseconds * 10;
            
            if (text) {
                lyrics.push({ time: timeMs, text });
            }
        }
    }
    
    return lyrics;
}

// Truncate text if too long (approximate character limit based on font size)
function truncateText(text, maxChars = 45) {
    if (text.length > maxChars) {
        return text.substring(0, maxChars - 3) + '...';
    }
    return text;
}

// No fallback lyrics needed - just show "no active song"
// Update current lyric based on playback position
function updateCurrentLyric() {
    if (!spotifyData || currentLyrics.length === 0) return;
    
    const now = Date.now();
    const elapsed = now - spotifyData.timestamps.start;
    
    // Find the current lyric index
    let currentIndex = -1;
    for (let i = currentLyrics.length - 1; i >= 0; i--) {
        if (elapsed >= currentLyrics[i].time) {
            currentIndex = i;
            break;
        }
    }
    
    const lyricContainer = document.getElementById('current-lyric');
    if (!lyricContainer) return;
    
    // Show 5 lines: 2 before, current, 2 after (fixed positions)
    const linesToShow = 5;
    const centerPosition = 2; // Current line is always at position 2 (0-indexed)
    const startIndex = Math.max(0, currentIndex - centerPosition);
    
    let html = '<div class="lyrics-container">';
    
    for (let i = 0; i < linesToShow; i++) {
        const lyricIndex = startIndex + i;
        let className = 'lyric-line';
        let text = '';
        
        if (lyricIndex === currentIndex) {
            className += ' active';
            text = currentLyrics[lyricIndex] ? truncateText(currentLyrics[lyricIndex].text, 38) : '';
        } else if (lyricIndex < currentIndex) {
            className += ' past';
            text = currentLyrics[lyricIndex] ? truncateText(currentLyrics[lyricIndex].text, 45) : '';
        } else {
            className += ' future';
            text = currentLyrics[lyricIndex] ? truncateText(currentLyrics[lyricIndex].text, 45) : '';
        }
        
        html += `<div class="${className}"><p>${text}</p></div>`;
    }
    
    html += '</div>';
    
    lyricContainer.innerHTML = html;
}

async function updateSpotify() {
    try {
        const response = await fetch(LANYARD_API);
        const data = await response.json();
        
        // Update Discord profile
        updateDiscordProfile(data);
        
        const clockWidget = document.querySelector('.island-clock');
        
        if (data.success && data.data.spotify) {
            const spotify = data.data.spotify;
            const trackId = spotify.track_id;
            
            // Store spotify data for progress updates
            spotifyData = spotify;
            
            // Only update if track changed
            if (trackId !== lastTrackId) {
                lastTrackId = trackId;
                
                // Remove no-music class from clock immediately
                if (clockWidget) {
                    clockWidget.classList.remove('no-music');
                }
                
                // Update album art
                const albumArt = document.getElementById('album-art');
                albumArt.innerHTML = `<img src="${spotify.album_art_url}" alt="Album Art">`;
                
                // Extract color from album art and apply glow
                getDominantColor(spotify.album_art_url, (color) => {
                    const albumArtEl = document.getElementById('album-art');
                    albumArtEl.style.boxShadow = `0 4px 20px rgba(${color}, 0.5)`;
                });
                
                // Update track info
                document.getElementById('track-name').textContent = spotify.song;
                document.getElementById('track-artist').textContent = spotify.artist;
                document.getElementById('spotify-status').textContent = '🎵 Playing on Spotify';
                
                // Show progress container
                const progressContainer = document.getElementById('progress-container');
                if (progressContainer) {
                    progressContainer.style.display = 'block';
                }
                
                // Fetch lyrics
                const duration = spotify.timestamps.end - spotify.timestamps.start;
                const lyrics = await fetchLyrics(spotify.song, spotify.artist, duration);
                
                if (lyrics && lyrics.length > 0) {
                    currentLyrics = lyrics;
                    
                    // Start lyrics update interval
                    if (lyricsInterval) {
                        clearInterval(lyricsInterval);
                    }
                    lyricsInterval = setInterval(updateCurrentLyric, 100);
                    
                    // Update immediately
                    updateCurrentLyric();
                } else {
                    currentLyrics = [];
                    const lyricElement = document.getElementById('current-lyric');
                    if (lyricElement) {
                        lyricElement.innerHTML = '<p class="hero-quote-text">"No lyrics available for this track"</p>';
                    }
                }
            }
            
            // Update progress
            updateProgress();
            
        } else {
            // Not playing anything - show "no active song"
            lastTrackId = null;
            spotifyData = null;
            
            // Clear lyrics interval
            if (lyricsInterval) {
                clearInterval(lyricsInterval);
                lyricsInterval = null;
            }
            
            // Show "no active song" message
            const lyricElement = document.getElementById('current-lyric');
            if (lyricElement) {
                lyricElement.innerHTML = '<p class="hero-quote-text no-glow">No Active Song Playing Right Now</p>';
            }
            
            const albumArt = document.getElementById('album-art');
            albumArt.innerHTML = '<div class="album-art-placeholder">🎵</div>';
            document.getElementById('track-name').textContent = 'Not Playing';
            document.getElementById('track-artist').textContent = 'Connect Spotify to Discord';
            document.getElementById('spotify-status').textContent = 'Checking...';
            
            // Hide progress container
            const progressContainer = document.getElementById('progress-container');
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
            
            // Add no-music class to clock
            if (clockWidget) {
                clockWidget.classList.add('no-music');
            }
        }
    } catch (error) {
        console.error('Error fetching Spotify data:', error);
        document.getElementById('spotify-status').textContent = 'Connection error';
    }
}

// Start background music immediately on page load - always play
window.addEventListener('DOMContentLoaded', () => {
    const bgMusic = document.getElementById('background-music');
    if (bgMusic) {
        bgMusic.play().catch(e => {
            console.log('Autoplay prevented on startup:', e);
            // Add click listener to start music on first interaction
            document.body.addEventListener('click', () => {
                if (bgMusic.paused) {
                    bgMusic.play();
                }
            }, { once: true });
        });
    }
});

// Update immediately and then every 5 seconds
updateSpotify();
setInterval(updateSpotify, 5000);

// Update progress bar more frequently (every second) for smooth animation
setInterval(() => {
    if (spotifyData) {
        updateProgress();
    }
}, 1000);

// Music Player Controls (for background music)
const audio = document.getElementById('background-music');

// Handle tab visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        updateSpotify(); // Update immediately when tab becomes visible
    }
});

// Add stagger animation to islands
const islands = document.querySelectorAll('.island');
islands.forEach((island, index) => {
    island.style.animationDelay = `${index * 0.1}s`;
});

// Parallax effect on scroll
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const heroIsland = document.querySelector('.hero-island');
            if (heroIsland && scrolled < 300) {
                heroIsland.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
            ticking = false;
        });
        ticking = true;
    }
});

// Console easter egg
console.log('%c2r1ch', 'font-size: 48px; font-weight: bold; background: linear-gradient(135deg, #0a84ff 0%, #bf5af2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cTop 10 Discordians OAT 🎯', 'font-size: 16px; color: #0a84ff;');
console.log('%cBuilding communities, one connection at a time.', 'font-size: 14px; color: #98989d;');

// Clock Widget - EST Timezone
function updateClock() {
    const now = new Date();
    
    // Convert to EST (America/New_York)
    const options = {
        timeZone: 'America/New_York',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    const timeString = now.toLocaleTimeString('en-US', options);
    
    document.getElementById('clock-time').textContent = timeString;
}

// Update clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);

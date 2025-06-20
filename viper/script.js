$(document).ready(function() {
    var audio = $('#background-music')[0];
    var video = $('#background-video')[0];
    var isPlaying = false;

    // Preload video metadata to reduce initial loading time
    video.preload = 'metadata';

    // Start playing the video and audio when the video is loaded
    video.oncanplay = function() {
        video.play();
        audio.play();
        isPlaying = true;
    };

    // Handle video loading errors
    video.onerror = function() {
        console.error('Error loading video');
        // You can display a message to the user or retry loading the video
    };

    // Handle button click
    $('#enter-button').click(function() {
        $('#enter-site').fadeOut('slow', function() {
            $('#content').fadeIn('slow', function() {
                // Play both audio and video
                audio.play();
                video.play();
            });
        });
    });

    // Handle tab visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            if (isPlaying) {
                audio.play();
                video.play();
            }
        } else {
            if (!audio.paused) {
                audio.pause();
            }
            if (!video.paused) {
                video.pause();
            }
        }
    });

    // Optional: Handle when audio ends to stop the video as well
    audio.onended = function() {
        video.pause();
        isPlaying = false;
    };

    // Optional: Handle when video ends to stop the audio as well
    video.onended = function() {
        audio.pause();
        isPlaying = false;
    };
});
Chat

New Conversation

🤓 Explain a complex thing

Explain Artificial Intelligence so that I can explain it to my six-year-old child.


🧠 Get suggestions and create new ideas

Please give me the best 10 travel ideas around the world


💭 Translate, summarize, fix grammar and more…

Translate "I love you" French


GPT-4o Mini
Hello, how can I help you today?
GPT-4o Mini
coin image
10
Upgrade




$(document).ready(function() {
    var audio = $('#background-music')[0];
    var video = $('#background-video')[0];
    var isPlaying = false;

    // Preload video metadata to reduce initial loading time
    video.preload = 'metadata';

    // Start playing the video and audio when the video is loaded
    video.oncanplay = function() {
        video.play();
        audio.play();
        isPlaying = true;
    };

    // Handle video loading errors
    video.onerror = function() {
        console.error('Error loading video');
        // You can display a message to the user or retry loading the video
    };

    // Handle button click
    $('#enter-button').click(function() {
        $('#enter-site').fadeOut('slow', function() {
            $('#content').fadeIn('slow', function() {
                // Play both audio and video
                audio.play();
                video.play();
            });
        });
    });

    // Handle tab visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            if (isPlaying) {
                audio.play();
                video.play();
            }
        } else {
            if (!audio.paused) {
                audio.pause();
            }
            if (!video.paused) {
                video.pause();
            }
        }
    });

    // Optional: Handle when audio ends to stop the video as well
    audio.onended = function() {
        video.pause();
        isPlaying = false;
    };

    // Optional: Handle when video ends to stop the audio as well
    video.onended = function() {
        audio.pause();
        isPlaying = false;
    };
});

Paste selection



Powered by AITOPIA 
Chat
Ask
Search
Write
Image
ChatFile
Vision
Full Page

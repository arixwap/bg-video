/**
 * YouTube Player API for Background Video
 */

// Insert the <script> tag targeting the iframe API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
function onYouTubeIframeAPIReady() {

    // Loop all available background video element
    document.querySelectorAll('.bg-video').forEach(function(element, i) {

        let ytPlayer;
        let bgVideoID = element.getAttribute('data-video'); // Get the video ID passed to the data-video attribute
        let ytPlayerId = "yt-player-" + i;
        let btnSound = element.querySelector('.bg-video__btn-sound');
        let btnPause = element.querySelector('.bg-video__btn-pause');

        // Get video config from data attribute
        let autoplay = 1;
        let mute = 1;
        if (element.getAttribute('data-autoplay') != undefined) {
            if (element.getAttribute('data-autoplay') == '0' || element.getAttribute('data-autoplay') == 'false') {
                autoplay = 0;
                btnPause.classList.add('active');
            }
        }
        if (element.getAttribute('data-mute') != undefined) {
            if (element.getAttribute('data-mute') == '0' || element.getAttribute('data-mute') == 'false') {
                mute = 0;
                btnSound.classList.add('active');
            }
        }

        // Check if element is appear or not in screen
        // If not appear, set autoplay off and mute
        if (element.offsetHeight <= 0 || element.offsetWidth <= 0) {
            autoplay = 0;
            mute = 1;
        }

        // Set the player options
        let playerOptions = {
            'autoplay': autoplay,
            'mute': mute,
            'autohide': 1,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0,
            'controls': 0,
            'disablekb': 1,
            'enablejsapi': 1,
            'iv_load_policy': 3,
            'loop': 1, // For looping video you have to have loop to 1
            'playlist': bgVideoID, // Playlist is value equal to your currently playing video
        }

        // Create element for video iframe container
        let playerWrapper = document.createElement('div');
        playerWrapper.classList.add('bg-video__player-wrapper');
        element.querySelector('.bg-video__embed').prepend(playerWrapper);

        // Create element for video iframe player
        let ytPlayerElement = document.createElement('div');
        ytPlayerElement.id = ytPlayerId;
        playerWrapper.prepend(ytPlayerElement);

        // Generate video player
        ytPlayer = new YT.Player(ytPlayerId, {
            // 'width': '1280', // I think these things not working
            // 'height': '720', // I think these things not working
            'videoId': bgVideoID,
            'playerVars': playerOptions,
            'events': {

                // The API will call this function when the video player is ready.
                'onReady': function(event) {

                    event.target.playVideo();
                    if (autoplay == 0) event.target.pauseVideo(); // Pause video if autoplay is set false

                    // Get the duration of the currently playing video
                    const videoDuration = event.target.getDuration();

                    // When the video is playing, compare the total duration
                    // To the current passed time if it's below 2 and above 0,
                    // Return to the first frame (0) of the video
                    // This is needed to avoid the buffering at the end of the video
                    // Which displays a black screen + the YouTube loader
                    setInterval(function() {
                        const videoCurrentTime = event.target.getCurrentTime();
                        const timeDifference = videoDuration - videoCurrentTime;

                        if (2 > timeDifference > 0) {
                            event.target.seekTo(0);
                        }
                    }, 1000);

                },

                // When the player is ready and when the video starts playing
                // The state changes to PLAYING and we can remove our overlay
                // This is needed to mask the preloading
                'onStateChange': function onPlayerStateChange(event) {

                    // Get the video overlay, to mask it when the video is loaded
                    const videoOverlay = element.querySelector('.bg-video__overlay');

                    if (event.data == YT.PlayerState.PLAYING) {
                        // Timeout set for prevent youtube information shown on fit video mode
                        // Youtube information will be hidden after 3 second
                        setTimeout(function() {
                            videoOverlay.classList.add('fadeOut');

                            // Reset video time to beginning on first loaded.
                            if (element.classList.contains('loaded') == false) {
                                event.target.seekTo(0);
                                element.classList.add('loaded');
                            }
                        }, 3000)
                    }

                    // Play Pause video function
                    btnPause.onclick = function() {
                        if (event.data == YT.PlayerState.PLAYING) {
                            event.target.pauseVideo();
                            btnPause.classList.add('active');
                            element.classList.add('paused');
                        } else {
                            event.target.playVideo();
                            btnPause.classList.remove('active');
                            element.classList.remove('paused');
                        }
                    }

                    // Mute Unmute video function
                    btnSound.onclick = function() {
                        if (event.target.isMuted()) {
                            event.target.unMute();
                            btnSound.classList.add('active');
                        } else {
                            event.target.mute();
                            btnSound.classList.remove('active');
                        }
                    }

                }

            }
        });

    })
}

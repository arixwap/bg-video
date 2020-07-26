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

        // Set the player options
        let playerOptions = {
            autoplay: 1, // Autoplay + mute has to be activated (value = 1) if you want to autoplay it everywhere. Chrome/Safari/Mobile
            mute: 1,
            autohide: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            iv_load_policy: 3,
            loop: 1, // For looping video you have to have loop to 1
            playlist: bgVideoID, // Playlist is value equal to your currently playing video
        }

        // Create element for video iframe container
        let playerWrapper = document.createElement('div');
        playerWrapper.classList.add('bg-video__player-wrapper');
        element.prepend(playerWrapper);

        // Create element for video iframe player
        let ytPlayerElement = document.createElement('div');
        ytPlayerElement.id = ytPlayerId;
        playerWrapper.prepend(ytPlayerElement);

        // Generate video player
        ytPlayer = new YT.Player(ytPlayerId, {
            width: '1280',
            height: '720',
            videoId: bgVideoID,
            playerVars: playerOptions,
            events: {

                // The API will call this function when the video player is ready.
                'onReady': function(event) {
                    event.target.playVideo();

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
                    const videoOverlay = element.querySelector('.js-video-overlay');

                    if (event.data == YT.PlayerState.PLAYING) {
                        videoOverlay.classList.add('bg-video__overlay--fadeOut');
                    }
                }

            }
        });

    })
}

/* Theme song, in order of preference:
   1. theme.mp3 in this folder (your own copy of the song; loops forever)
   2. the YouTube video "Cinderella's Golden Carousel" (loops; needs internet and a page served from http://, not file://)
   3. the built-in calm song (always works)
   The built-in song goes quiet only while one of the other two is really playing. */
(function () {
  const VIDEO = 'lBz_DwRRE0M';
  let player = null, ready = false, ytStarted = false, started = false, mode = 'synth';

  /* ---- 1. local file ---- */
  const audio = new Audio();
  audio.loop = true; audio.preload = 'auto'; audio.volume = 0.5; audio.src = 'theme.mp3';

  /* ---- 2. YouTube ---- */
  const card = document.createElement('div');
  card.id = 'ytCard'; card.hidden = true;
  card.innerHTML = '<div class="ytbar">🎵 Now playing: Cinderella\'s Golden Carousel</div><div id="ytMount"></div>';
  document.body.appendChild(card);

  function useSynth(why) {
    mode = 'synth'; card.hidden = true; Snd.mute(false);
    if (why && typeof toast === 'function') toast('🎵 ' + why + ', so the built-in song is playing');
  }
  function loadYT() {
    if (ytStarted) return; ytStarted = true;
    window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player('ytMount', {
        width: 200, height: 113, videoId: VIDEO,
        playerVars: { autoplay: 1, controls: 1, loop: 1, playlist: VIDEO, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady(e) { ready = true; card.hidden = false; e.target.setVolume(50); if (Snd.isOn()) e.target.playVideo(); },
          onStateChange(e) {
            const S = YT.PlayerState;
            if (e.data === S.PLAYING) { mode = 'yt'; if (e.target.isMuted && e.target.isMuted()) e.target.unMute(); Snd.mute(true); }
            else if (e.data === S.ENDED) e.target.playVideo();                       /* loop */
            else if (e.data !== S.BUFFERING) { mode = 'synth'; Snd.mute(false); }    /* paused / not started: never leave it silent */
          },
          onError() { useSynth('YouTube would not play the video'); },
        },
      });
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api'; s.onerror = () => useSynth('YouTube is not reachable'); document.head.appendChild(s);
    setTimeout(() => { if (!ready) useSynth('YouTube took too long'); }, 10000);
  }

  function playFile() {
    const p = audio.play();
    if (p && p.then) p.then(() => { mode = 'file'; Snd.mute(true); }).catch(loadYT); else { mode = 'file'; Snd.mute(true); }
  }
  function start() {
    if (started) return; started = true;
    if (audio.error) return loadYT();
    if (audio.readyState >= 2) return playFile();
    audio.addEventListener('canplay', playFile, { once: true });
    audio.addEventListener('error', loadYT, { once: true });
    setTimeout(() => { if (mode === 'synth' && !ytStarted) loadYT(); }, 3000);
  }

  /* browsers only allow sound after a tap or key press, so begin on the first one */
  addEventListener('pointerdown', start, { once: true, capture: true });
  addEventListener('keydown', start, { once: true, capture: true });

  /* Sound on/off button controls whichever song is active */
  document.getElementById('soundBtn').addEventListener('click', () => {
    const on = Snd.isOn();
    if (mode === 'file') { if (on) audio.play(); else audio.pause(); }
    else if (ready && player) { if (on) player.playVideo(); else player.pauseVideo(); }
  });

  /* quieter inside a ride so the physics is easier to hear */
  const baseLevel = Snd.level;
  Snd.level = function (x) {
    baseLevel(x);
    const v = Math.max(8, Math.min(70, Math.round((x / 0.1) * 50)));
    audio.volume = v / 100; if (ready && player) player.setVolume(v);
  };
})();

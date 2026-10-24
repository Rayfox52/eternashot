/* =========================================================
   ETERNASHOT // Y2K NEO-BRUTALIST PHOTO LAB - CORE LOGIC
   Fully Dynamic Responsive & Dimensionless Precision Export
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const video = document.getElementById('webcam-video');
  const liveCanvas = document.getElementById('live-canvas');
  const liveCtx = liveCanvas.getContext('2d');
  const exportCanvas = document.getElementById('export-canvas');
  const exportCtx = exportCanvas.getContext('2d');

  const flashOverlay = document.getElementById('flash-overlay');
  const countdownOverlay = document.getElementById('countdown-overlay');
  const countdownNumber = document.getElementById('countdown-number');
  const poseInstruction = document.getElementById('pose-instruction');
  const btsIndicator = document.getElementById('bts-indicator');

  const cameraStatusBadge = document.getElementById('camera-status');
  const btnStartSession = document.getElementById('btn-start-session');
  const btnRetakeAll = document.getElementById('btn-retake-all');
  const btnMirror = document.getElementById('btn-mirror');
  const btnSwitchCam = document.getElementById('btn-switch-cam');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const btnUploadPhotos = document.getElementById('btn-upload-photos');
  const photoFileInput = document.getElementById('photo-file-input');
  const mobileCamInput = document.getElementById('mobile-cam-input');
  const cameraOfflineOverlay = document.getElementById('camera-offline-overlay');
  const offlineDescText = document.getElementById('offline-desc-text');
  const btnActivateCamera = document.getElementById('btn-activate-camera');
  const btnOpenMobileCam = document.getElementById('btn-open-mobile-cam');
  const btnUseSamplePhotos = document.getElementById('btn-use-sample-photos');

  const panelCamera = document.getElementById('panel-camera');
  const panelEditor = document.getElementById('panel-editor');
  const mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
  const mobilePhotoCount = document.getElementById('mobile-photo-count');

  const stripStageOuter = document.getElementById('strip-stage-outer');
  const stripScalerBox = document.getElementById('strip-scaler-box');
  const stripWrapper = document.getElementById('strip-wrapper');
  const stripPhotosGrid = document.getElementById('strip-photos-grid');
  const stripStatusBadge = document.getElementById('strip-status-badge');
  const captionInput = document.getElementById('caption-input');
  const stripCaptionDisplay = document.getElementById('strip-caption-display');
  const stripDateDisplay = document.getElementById('strip-date-display');
  const stickersLayer = document.getElementById('stickers-layer');
  const stickersTray = document.getElementById('stickers-tray');
  const btnClearStickers = document.getElementById('btn-clear-stickers');

  const btnToggleDrawer = document.getElementById('btn-toggle-sticker-drawer');
  const stickerDrawer = document.getElementById('sticker-drawer');
  const drawerTabsRow = document.getElementById('drawer-tabs-row');
  const drawerSearchInput = document.getElementById('sticker-search-input');
  const drawerGrid = document.getElementById('drawer-grid');

  const btnDownloadStrip = document.getElementById('btn-download-strip');
  const btnDownloadBts = document.getElementById('btn-download-bts');
  const btnShareQr = document.getElementById('btn-share-qr');
  const modalQr = document.getElementById('modal-qr');
  const btnCloseQr = document.getElementById('btn-close-qr');

  const activeLayoutLabel = document.getElementById('active-layout-label');
  const activeFrameLabel = document.getElementById('active-frame-label');

  // --- State Variables ---
  let isSoundEnabled = true;
  let isMirrored = true;
  let currentFacingMode = 'user';
  let activeStream = null;
  let isCapturingSession = false;
  let isRetakingSingle = false;

  let activeFilterId = 'normal';
  let capturedPhotos = [null, null, null, null]; // dataURLs
  let placedStickers = []; // { id, type, content, x, y, width, height, elem }
  let currentLayout = 'vertical';
  let currentFrameTemplate = 'white';
  let activeDrawerCategory = 'aesthetic';
  let activeMobileTab = 'camera';

  // BTS Recording state
  let mediaRecorder = null;
  let recordedBtsChunks = [];
  let btsVideoBlob = null;

  // Filter Presets Definition
  const FILTER_PRESETS = [
    { id: 'normal', name: 'Original', css: 'none', swatch: '#f5f2eb' },
    { id: 'bw_mono', name: 'Mono Seoul', css: 'grayscale(100%) contrast(120%) brightness(98%)', swatch: '#3a3f4d' },
    { id: 'retro_warm', name: 'Warm Vintage', css: 'sepia(25%) contrast(108%) brightness(102%) saturate(110%)', swatch: '#c8874a' },
    { id: 'vintage_90s', name: 'Film 90s', css: 'sepia(18%) hue-rotate(-10deg) contrast(112%) brightness(98%)', swatch: '#9b5836' },
    { id: 'soft_glow', name: 'Soft Cream', css: 'brightness(108%) contrast(96%) saturate(108%)', swatch: '#f3c4cb' },
    { id: 'cool_studio', name: 'Cool Tone', css: 'contrast(110%) hue-rotate(185deg) saturate(90%) brightness(102%)', swatch: '#5a789a' },
    { id: 'amber_gold', name: 'Golden Hour', css: 'sepia(35%) hue-rotate(8deg) saturate(130%) brightness(104%)', swatch: '#d99338' },
    { id: 'noir_studio', name: 'Noir Studio', css: 'grayscale(100%) contrast(145%) brightness(92%)', swatch: '#15171e' }
  ];

  const LAYOUT_NAMES = {
    vertical: 'Strip Vertikal (1x4)',
    grid: 'Kotak Grid (2x2)',
    twin: 'Twin Strip (2x4 Berdampingan)',
    cinematic: 'Cinematic Widescreen (1x3)',
    film35: 'Analog 35mm Film Roll'
  };

  const FRAME_NAMES = {
    white: 'Cloud White',
    black: 'Noir Black',
    pink: 'Pastel Sakura',
    lavender: 'Soft Lavender',
    butter: 'Butter Cream',
    matcha: 'Matcha Milk',
    cyber: 'Cyber Vaporwave',
    checker_black: 'Y2K Checkerboard',
    checker_pink: 'Kawaii Pink Checker',
    film_analog: 'Analog Film 35mm',
    hearts_pattern: 'Sweet Hearts Pattern',
    denim_y2k: 'Denim Blue',
    newspaper: 'Vintage Newspaper',
    custom: 'Warna Kustom'
  };

  const POSE_INSTRUCTIONS = [
    '[POSE 01: SMILE // READY]',
    '[POSE 02: V-SIGN // SNAP]',
    '[POSE 03: HEART // CAPTURE]',
    '[POSE 04: FREESTYLE // FINAL]'
  ];

  // Set today's date formatted (YYYY.MM.DD)
  const now = new Date();
  const dateFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  stripDateDisplay.textContent = dateFormatted;

  // =========================================================
  // 1. MOBILE RESPONSIVE TABS & ADAPTIVE VIEWPORTS
  // =========================================================
  function switchMobileTab(tabName) {
    activeMobileTab = tabName;
    mobileTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    if (window.innerWidth <= 1024) {
      if (tabName === 'camera') {
        panelCamera.classList.remove('mobile-tab-hidden');
        panelEditor.classList.add('mobile-tab-hidden');
      } else {
        panelCamera.classList.add('mobile-tab-hidden');
        panelEditor.classList.remove('mobile-tab-hidden');
        requestAnimationFrame(() => {
          scaleStripToFit();
          setTimeout(scaleStripToFit, 60);
          setTimeout(scaleStripToFit, 180);
        });
      }
    } else {
      panelCamera.classList.remove('mobile-tab-hidden');
      panelEditor.classList.remove('mobile-tab-hidden');
      scaleStripToFit();
    }
  }

  mobileTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchMobileTab(btn.dataset.tab);
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      panelCamera.classList.remove('mobile-tab-hidden');
      panelEditor.classList.remove('mobile-tab-hidden');
    } else {
      switchMobileTab(activeMobileTab);
    }
    scaleStripToFit();
  });

  // Auto-fit strip preview precisely within the stage container
  function scaleStripToFit() {
    if (!stripStageOuter || !stripScalerBox || !stripWrapper) return;
    stripStageOuter.scrollTop = 0;
    stripStageOuter.scrollLeft = 0;

    const availableW = stripStageOuter.clientWidth - 16;
    const availableH = stripStageOuter.clientHeight - 16;
    const stripW = stripWrapper.offsetWidth || 195;
    const stripH = stripWrapper.offsetHeight || 620;

    if (availableW > 0 && availableH > 0 && stripW > 0 && stripH > 0) {
      const scaleW = availableW / stripW;
      const scaleH = availableH / stripH;
      // Fit both dimensions with 4% safety margin so 100% of header, slots & footer are always visible
      const scale = Math.min(scaleW, scaleH, 1) * 0.96;
      stripScalerBox.style.transform = `scale(${scale.toFixed(3)})`;
    }
  }

  // =========================================================
  // 2. WEBCAM INITIALIZATION & STREAM ENGINE
  // =========================================================
  async function initCamera(userTriggered = false) {
    updateCameraStatus('connecting', 'Kamera...');

    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      activeStream = null;
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // If mediaDevices is missing (e.g. mobile Chrome on HTTP non-secure origin)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('mediaDevices.getUserMedia not available on this origin or browser.');
      showOfflineOverlay(
        'Kamera Dibatasi Browser',
        'Browser melarang streaming kamera di jaringan Wi-Fi lokal HTTP. Klik tombol di bawah untuk langsung menggunakan kamera bawaan HP Anda atau coba Foto Sample!'
      );
      return;
    }

    let stream = null;
    let error = null;

    // Attempt 1: Standard constraints (avoid unconditional facingMode on desktop)
    const constraints1 = isMobile
      ? { video: { facingMode: currentFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }
      : { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false };

    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints1);
    } catch (err1) {
      console.warn('Primary camera constraints failed, attempting fallback:', err1);
      error = err1;

      // Attempt 2: Minimal fallback without resolution or facingMode requirements
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        error = null;
      } catch (err2) {
        console.warn('Fallback camera constraints failed:', err2);
        error = err2;
      }
    }

    if (stream) {
      activeStream = stream;
      video.srcObject = stream;
      try {
        await video.play();
      } catch (playErr) {
        console.warn('video.play() failed:', playErr);
      }

      liveCanvas.width = video.videoWidth || 1280;
      liveCanvas.height = video.videoHeight || 720;

      if (cameraOfflineOverlay) cameraOfflineOverlay.classList.add('hidden');
      updateCameraStatus('online', 'Aktif (HD)');
      startLiveRenderLoop();
    } else {
      let desc = 'Izinkan akses webcam di browser Anda atau gunakan tombol di bawah untuk membuka kamera HP atau coba foto sample.';
      if (error && error.name === 'NotAllowedError') {
        desc = 'Akses kamera ditolak oleh browser. Mohon izinkan kamera pada ikon gembok/kamera di samping URL browser.';
      } else if (error && error.name === 'NotFoundError') {
        desc = 'Tidak ada perangkat kamera yang terdeteksi pada perangkat ini.';
      } else if (isMobile) {
        desc = 'Browser membatasi webcam di jaringan lokal HTTP. Klik "Buka Kamera HP Langsung" untuk memotret!';
      }
      showOfflineOverlay('Kamera Belum Aktif', desc);
    }
  }

  function showOfflineOverlay(title, desc) {
    if (cameraOfflineOverlay) {
      cameraOfflineOverlay.classList.remove('hidden');
      const titleElem = cameraOfflineOverlay.querySelector('.offline-title');
      if (titleElem && title) titleElem.textContent = title;
      if (offlineDescText && desc) offlineDescText.textContent = desc;
    }
    updateCameraStatus('offline', 'Offline (Unggah)');

    // Render clean dark background on liveCanvas without flipped text
    liveCanvas.width = 800;
    liveCanvas.height = 600;
    liveCtx.fillStyle = '#0f121d';
    liveCtx.fillRect(0, 0, liveCanvas.width, liveCanvas.height);
  }

  function updateCameraStatus(state, text) {
    cameraStatusBadge.className = `status-badge status-${state}`;
    cameraStatusBadge.querySelector('.status-text').textContent = text;
  }

  function startLiveRenderLoop() {
    function render() {
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        liveCtx.save();
        const filter = FILTER_PRESETS.find(f => f.id === activeFilterId);
        liveCtx.filter = filter ? filter.css : 'none';
        liveCtx.drawImage(video, 0, 0, liveCanvas.width, liveCanvas.height);
        liveCtx.restore();
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  // =========================================================
  // 3. FILTERS SETUP & SELECTION
  // =========================================================
  function renderFilterPills() {
    const container = document.getElementById('filter-pills');
    container.innerHTML = '';

    FILTER_PRESETS.forEach(f => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${f.id === activeFilterId ? 'active' : ''}`;
      btn.dataset.filter = f.id;
      btn.innerHTML = `
        <span class="filter-swatch" style="background: ${f.swatch};"></span>
        <span class="filter-name">${f.name}</span>
      `;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilterId = f.id;
        document.getElementById('active-filter-name').textContent = f.name;
        if (isSoundEnabled) soundEffects.playBeep(440, 0.04);
      });

      container.appendChild(btn);
    });
  }

  // =========================================================
  // 4. CAPTURE WORKFLOW (ETERNASHOT 4-SHOT COUNTDOWN & BTS)
  // =========================================================
  btnStartSession.addEventListener('click', async () => {
    if (isCapturingSession) return;
    if (!activeStream) {
      await initCamera(true);
      if (!activeStream) {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile && mobileCamInput) {
          mobileCamInput.click();
        } else {
          showOfflineOverlay(
            'Kamera Belum Aktif',
            'Silakan izinkan webcam atau klik "Gunakan Foto Sample (Demo)" untuk langsung mencoba strip foto.'
          );
        }
        return;
      }
    }
    startFullSession();
  });

  btnRetakeAll.addEventListener('click', () => {
    if (isCapturingSession) return;
    capturedPhotos = [null, null, null, null];
    updateStripUI();
    btnRetakeAll.classList.add('hidden');
    startFullSession();
  });

  async function startFullSession() {
    isCapturingSession = true;
    btnStartSession.disabled = true;
    startBtsRecording();

    const maxShots = currentLayout === 'cinematic' ? 3 : 4;

    for (let i = 0; i < maxShots; i++) {
      highlightProgressPill(i);
      await runCountdownForPose(i);
      snapPhoto(i);
      updateStripUI();

      if (i < maxShots - 1) {
        countdownOverlay.classList.remove('hidden');
        countdownNumber.textContent = 'READY';
        countdownNumber.style.fontSize = 'clamp(36px, 8vw, 56px)';
        poseInstruction.textContent = 'NEXT POSE INCOMING // STAND BY...';
        await sleep(2000);
        countdownNumber.style.fontSize = '';
      }
    }

    countdownOverlay.classList.add('hidden');
    stopBtsRecording();
    isCapturingSession = false;
    btnStartSession.disabled = false;
    btnRetakeAll.classList.remove('hidden');

    stripStatusBadge.textContent = 'STRIP READY // EXPORT READY';
    stripStatusBadge.classList.add('complete');
    btnDownloadStrip.disabled = false;
    btnShareQr.disabled = false;

    // Automatically transition to the Editor Tab on mobile so user sees the finished strip
    if (window.innerWidth <= 1024) {
      setTimeout(() => {
        switchMobileTab('editor');
      }, 500);
    }
  }

  function highlightProgressPill(index) {
    for (let i = 0; i < 4; i++) {
      const pill = document.getElementById(`pill-${i}`);
      pill.className = 'progress-pill';
      if (i < index) pill.classList.add('done');
      if (i === index) pill.classList.add('active');
    }
  }

  function runCountdownForPose(poseIndex) {
    return new Promise(resolve => {
      countdownOverlay.classList.remove('hidden');
      poseInstruction.textContent = POSE_INSTRUCTIONS[poseIndex] || '[STAND BY // READY]';
      
      let count = 3;
      countdownNumber.textContent = count;
      if (isSoundEnabled) soundEffects.playCountdownTick();

      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          countdownNumber.textContent = count;
          if (isSoundEnabled) soundEffects.playCountdownTick();
        } else {
          clearInterval(timer);
          countdownOverlay.classList.add('hidden');
          if (isSoundEnabled) soundEffects.playCountdownFinal();
          resolve();
        }
      }, 1000);
    });
  }

  function snapPhoto(slotIndex) {
    if (isSoundEnabled) soundEffects.playShutter();
    triggerFlash();

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = liveCanvas.width;
    tempCanvas.height = liveCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (isMirrored) {
      tempCtx.translate(tempCanvas.width, 0);
      tempCtx.scale(-1, 1);
    }
    tempCtx.drawImage(liveCanvas, 0, 0);

    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
    capturedPhotos[slotIndex] = dataUrl;
  }

  function triggerFlash() {
    flashOverlay.classList.add('active');
    setTimeout(() => {
      flashOverlay.classList.remove('active');
    }, 120);
  }

  // =========================================================
  // 5. BTS (BEHIND THE SCENES) VIDEO RECORDING
  // =========================================================
  function startBtsRecording() {
    recordedBtsChunks = [];
    btsVideoBlob = null;
    btnDownloadBts.disabled = true;

    try {
      if (liveCanvas.captureStream) {
        const stream = liveCanvas.captureStream(25);
        const options = { mimeType: 'video/webm;codecs=vp8' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'video/webm';
        }

        mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = e => {
          if (e.data && e.data.size > 0) {
            recordedBtsChunks.push(e.data);
          }
        };
        mediaRecorder.onstop = () => {
          btsVideoBlob = new Blob(recordedBtsChunks, { type: 'video/webm' });
          btnDownloadBts.disabled = false;
        };

        mediaRecorder.start(100);
        btsIndicator.classList.remove('hidden');
      }
    } catch (e) {
      console.warn('MediaRecorder error for BTS:', e);
    }
  }

  function stopBtsRecording() {
    btsIndicator.classList.add('hidden');
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }

  btnDownloadBts.addEventListener('click', () => {
    if (!btsVideoBlob) return;
    const url = URL.createObjectURL(btsVideoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eternashot_bts_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // =========================================================
  // 6. STRIP UI & REBUILD SLOTS
  // =========================================================
  function rebuildSlotsForLayout() {
    stripPhotosGrid.innerHTML = '';

    let slotCount = 4;
    if (currentLayout === 'cinematic') slotCount = 3;
    if (currentLayout === 'twin') slotCount = 8; // 2 sets of 4 photos!

    for (let i = 0; i < slotCount; i++) {
      const dataIndex = currentLayout === 'twin' ? (i % 4) : i;
      const slot = document.createElement('div');
      slot.className = 'photo-slot';
      slot.dataset.index = dataIndex;

      slot.innerHTML = `
        <div class="slot-placeholder"><span class="slot-tag">ETN-0${dataIndex + 1}</span></div>
        <img class="slot-img hidden" alt="Pose ${dataIndex + 1}">
        <button class="btn-slot-retake hidden" title="Ambil Ulang Pose ${dataIndex + 1}">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
        </button>
      `;

      // Retake action
      slot.querySelector('.btn-slot-retake').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (isCapturingSession || isRetakingSingle) return;
        
        // If on mobile editor tab, switch back to camera for retake
        if (window.innerWidth <= 1024) {
          switchMobileTab('camera');
        }

        isRetakingSingle = true;
        highlightProgressPill(dataIndex);
        await runCountdownForPose(dataIndex);
        snapPhoto(dataIndex);
        updateStripUI();
        isRetakingSingle = false;

        if (window.innerWidth <= 1024) {
          setTimeout(() => switchMobileTab('editor'), 400);
        }
      });

      stripPhotosGrid.appendChild(slot);
    }

    // Toggle cut divider in twin layout
    const cutDivider = stripWrapper.querySelector('.cut-divider-line');
    if (cutDivider) {
      cutDivider.classList.toggle('hidden', currentLayout !== 'twin');
    }

    // Toggle sprockets in film35 layout or film_analog frame
    const sprockets = stripWrapper.querySelectorAll('.sprocket-track');
    const isFilmMode = currentLayout === 'film35' || currentFrameTemplate === 'film_analog';
    sprockets.forEach(s => s.classList.toggle('hidden', !isFilmMode));

    updateStripUI();
    scaleStripToFit();
  }

  function updateStripUI() {
    const slots = stripWrapper.querySelectorAll('.photo-slot');
    let filledCount = 0;

    slots.forEach(slot => {
      const idx = parseInt(slot.dataset.index, 10);
      const dataUrl = capturedPhotos[idx];
      const placeholder = slot.querySelector('.slot-placeholder');
      const img = slot.querySelector('.slot-img');
      const retakeBtn = slot.querySelector('.btn-slot-retake');

      if (dataUrl) {
        placeholder.classList.add('hidden');
        img.src = dataUrl;
        img.classList.remove('hidden');
        retakeBtn.classList.remove('hidden');
      } else {
        placeholder.classList.remove('hidden');
        img.classList.add('hidden');
        retakeBtn.classList.add('hidden');
      }
    });

    const maxShots = currentLayout === 'cinematic' ? 3 : 4;
    const actualFilled = capturedPhotos.slice(0, maxShots).filter(p => p !== null).length;
    mobilePhotoCount.textContent = `${actualFilled}/${maxShots}`;

    const isReady = capturedPhotos.slice(0, maxShots).every(p => p !== null);
    if (isReady) {
      btnDownloadStrip.disabled = false;
      btnShareQr.disabled = false;
      stripStatusBadge.textContent = 'Strip Siap! ✨';
      stripStatusBadge.classList.add('complete');
    }
  }

  // Layout Selector
  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const layout = btn.dataset.layout;
      currentLayout = layout;
      activeLayoutLabel.textContent = LAYOUT_NAMES[layout] || layout;

      // Auto sync 35mm film frame template
      if (layout === 'film35') {
        currentFrameTemplate = 'film_analog';
        activeFrameLabel.textContent = FRAME_NAMES['film_analog'] || 'Analog Film 35mm';
        document.querySelectorAll('.frame-swatch-item').forEach(b => {
          b.classList.toggle('active', b.dataset.frame === 'film_analog');
        });
      }

      stripWrapper.className = `strip-wrapper layout-${layout} frame-${currentFrameTemplate}`;
      stripWrapper.style.backgroundColor = '';
      stripWrapper.style.color = '';
      rebuildSlotsForLayout();
    });
  });

  // Frame Template Selector
  document.querySelectorAll('.frame-swatch-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.frame-swatch-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const frame = btn.dataset.frame;
      currentFrameTemplate = frame;
      activeFrameLabel.textContent = FRAME_NAMES[frame] || frame;

      // Auto sync 35mm film layout
      if (frame === 'film_analog') {
        currentLayout = 'film35';
        activeLayoutLabel.textContent = LAYOUT_NAMES['film35'] || 'Analog 35mm Film Roll';
        document.querySelectorAll('.layout-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.layout === 'film35');
        });
        rebuildSlotsForLayout();
      }

      stripWrapper.className = `strip-wrapper layout-${currentLayout} frame-${frame}`;
      stripWrapper.style.backgroundColor = '';
      stripWrapper.style.color = '';

      const sprockets = stripWrapper.querySelectorAll('.sprocket-track');
      const isFilmMode = currentLayout === 'film35' || frame === 'film_analog';
      sprockets.forEach(s => s.classList.toggle('hidden', !isFilmMode));
    });
  });

  // Custom Color Picker
  const customColorInput = document.getElementById('custom-frame-color');
  customColorInput.addEventListener('input', (e) => {
    document.querySelectorAll('.frame-swatch-item').forEach(s => s.classList.remove('active'));
    currentFrameTemplate = 'custom';
    activeFrameLabel.textContent = `Custom (${e.target.value})`;

    stripWrapper.className = `strip-wrapper layout-${currentLayout} frame-custom`;
    stripWrapper.style.backgroundColor = e.target.value;
    
    // Auto contrast text
    const hex = e.target.value.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    stripWrapper.style.color = yiq >= 128 ? '#111827' : '#ffffff';
  });

  // Caption Live Sync
  captionInput.addEventListener('input', (e) => {
    stripCaptionDisplay.textContent = e.target.value || 'ETERNASHOT // 2000-ARCHIVE';
  });

  // =========================================================
  // 7. EXPANDABLE STICKER DRAWER & KEYBOARD EMOJIS
  // =========================================================
  function renderQuickStickerTray() {
    stickersTray.innerHTML = '';
    window.STICKER_PRESETS.forEach(stk => {
      const item = document.createElement('button');
      item.className = 'sticker-tray-item';
      item.title = stk.name;

      if (stk.type === 'svg') {
        item.innerHTML = stk.content;
      } else {
        item.textContent = stk.content;
      }

      item.addEventListener('click', () => {
        addStickerToStrip(stk);
      });

      stickersTray.appendChild(item);
    });
  }

  btnToggleDrawer.addEventListener('click', () => {
    const isHidden = stickerDrawer.classList.contains('hidden');
    stickerDrawer.classList.toggle('hidden', !isHidden);
    btnToggleDrawer.textContent = isHidden ? '❌ Tutup Galeri' : '✨ Galeri (150+)';
    if (isHidden) {
      renderDrawerTabs();
      renderDrawerGrid();
    }
  });

  function renderDrawerTabs() {
    drawerTabsRow.innerHTML = '';
    window.STICKER_CATEGORIES.forEach(cat => {
      const tab = document.createElement('button');
      tab.className = `drawer-tab-btn ${cat.id === activeDrawerCategory ? 'active' : ''}`;
      tab.textContent = cat.name;

      tab.addEventListener('click', () => {
        document.querySelectorAll('.drawer-tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeDrawerCategory = cat.id;
        renderDrawerGrid();
      });

      drawerTabsRow.appendChild(tab);
    });
  }

  function renderDrawerGrid(searchQuery = '') {
    drawerGrid.innerHTML = '';
    const query = searchQuery.trim().toLowerCase();

    let items = [];
    if (activeDrawerCategory === 'aesthetic') {
      items = window.STICKER_VECTORS;
    } else if (window.KEYBOARD_EMOJIS[activeDrawerCategory]) {
      items = window.KEYBOARD_EMOJIS[activeDrawerCategory].map((char, i) => ({
        id: `emoji_${activeDrawerCategory}_${i}`,
        type: 'emoji',
        name: char,
        content: char
      }));
    }

    if (query) {
      items = [
        ...window.STICKER_VECTORS.filter(v => v.name.toLowerCase().includes(query)),
        ...Object.values(window.KEYBOARD_EMOJIS).flat().map((char, i) => ({
          id: `search_emoji_${i}`,
          type: 'emoji',
          name: char,
          content: char
        }))
      ];
    }

    items.forEach(stk => {
      const btn = document.createElement('button');
      btn.className = 'drawer-item';
      btn.title = stk.name || stk.content;

      if (stk.type === 'svg') {
        btn.innerHTML = stk.content;
      } else {
        btn.textContent = stk.content;
      }

      btn.addEventListener('click', () => {
        addStickerToStrip(stk);
      });

      drawerGrid.appendChild(btn);
    });
  }

  drawerSearchInput.addEventListener('input', (e) => {
    renderDrawerGrid(e.target.value);
  });

  function addStickerToStrip(preset) {
    const stickerId = 'stk_' + Date.now();
    const elem = document.createElement('div');
    elem.className = 'placed-sticker selected';
    elem.id = stickerId;

    const posX = Math.max(10, (stripWrapper.offsetWidth / 2) - 22 + (Math.random() * 30 - 15));
    const posY = Math.max(20, (stripWrapper.offsetHeight / 2) - 22 + (Math.random() * 40 - 20));
    elem.style.left = `${posX}px`;
    elem.style.top = `${posY}px`;

    if (preset.type === 'svg') {
      elem.innerHTML = `
        ${preset.content}
        <button class="sticker-delete-handle" title="Hapus">&times;</button>
      `;
    } else {
      elem.innerHTML = `
        <span class="sticker-emoji-char">${preset.content}</span>
        <button class="sticker-delete-handle" title="Hapus">&times;</button>
      `;
    }

    stickersLayer.appendChild(elem);

    const stickerObj = {
      id: stickerId,
      type: preset.type,
      content: preset.content,
      x: posX,
      y: posY,
      width: 44,
      height: 44,
      elem: elem
    };
    placedStickers.push(stickerObj);

    setupStickerDrag(elem, stickerObj);

    elem.querySelector('.sticker-delete-handle').addEventListener('click', (e) => {
      e.stopPropagation();
      elem.remove();
      placedStickers = placedStickers.filter(s => s.id !== stickerId);
    });
  }

  function setupStickerDrag(elem, stickerObj) {
    let isDragging = false;
    let startX, startY;
    let initialLeft, initialTop;

    function onPointerDown(e) {
      isDragging = true;
      document.querySelectorAll('.placed-sticker').forEach(s => s.classList.remove('selected'));
      elem.classList.add('selected');

      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);

      initialLeft = elem.offsetLeft;
      initialTop = elem.offsetTop;

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault(); // Prevent screen scrolling while dragging sticker!

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const dx = clientX - startX;
      const dy = clientY - startY;

      const newLeft = initialLeft + dx;
      const newTop = initialTop + dy;

      elem.style.left = `${newLeft}px`;
      elem.style.top = `${newTop}px`;

      stickerObj.x = newLeft;
      stickerObj.y = newTop;
    }

    function onPointerUp() {
      isDragging = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }

    elem.addEventListener('pointerdown', onPointerDown);
  }

  btnClearStickers.addEventListener('click', () => {
    stickersLayer.innerHTML = '';
    placedStickers = [];
  });

  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.placed-sticker') && !e.target.closest('.sticker-tray-item') && !e.target.closest('.drawer-item')) {
      document.querySelectorAll('.placed-sticker').forEach(s => s.classList.remove('selected'));
    }
  });

  // =========================================================
  // 8. 100% PRECISE PARITY HIGH-RESOLUTION CANVAS EXPORT
  // =========================================================
  btnDownloadStrip.addEventListener('click', async () => {
    await exportHighResStrip();
  });

  async function exportHighResStrip() {
    // 1. Measure bounding rect without scale transform to get exact unscaled DOM box
    const originalTransform = stripScalerBox ? stripScalerBox.style.transform : '';
    if (stripScalerBox) stripScalerBox.style.transform = 'none';

    const stripRect = stripWrapper.getBoundingClientRect();
    const previewW = stripWrapper.offsetWidth;
    const previewH = stripWrapper.offsetHeight;

    // Use ratio-based dimensionless scaling: base export on target width (1800px HD)
    const exportW = 1800;
    const exportH = Math.round((previewH / previewW) * exportW);

    exportCanvas.width = exportW;
    exportCanvas.height = exportH;

    const scale = exportW / previewW;

    // 2. Draw Frame Background based on template
    drawFrameBackgroundOnCanvas(exportCtx, exportW, exportH, scale);

    // 3. Pre-load all captured photos
    const loadedImages = await Promise.all(
      capturedPhotos.map(url => {
        if (!url) return null;
        return new Promise(res => {
          const img = new Image();
          img.onload = () => res(img);
          img.src = url;
        });
      })
    );

    // 4. Draw each photo slot using dimensionless ratio from strip preview
    const slots = stripWrapper.querySelectorAll('.photo-slot');
    slots.forEach(slot => {
      const slotRect = slot.getBoundingClientRect();
      const idx = parseInt(slot.dataset.index, 10);
      const img = loadedImages[idx];

      const relX = ((slotRect.left - stripRect.left) / stripRect.width) * exportW;
      const relY = ((slotRect.top - stripRect.top) / stripRect.height) * exportH;
      const relW = (slotRect.width / stripRect.width) * exportW;
      const relH = (slotRect.height / stripRect.height) * exportH;

      if (img) {
        exportCtx.save();
        exportCtx.beginPath();
        if (typeof exportCtx.roundRect === 'function') {
          exportCtx.roundRect(relX, relY, relW, relH, 4 * scale);
        } else {
          const r = 4 * scale;
          exportCtx.moveTo(relX + r, relY);
          exportCtx.arcTo(relX + relW, relY, relX + relW, relY + relH, r);
          exportCtx.arcTo(relX + relW, relY + relH, relX, relY + relH, r);
          exportCtx.arcTo(relX, relY + relH, relX, relY, r);
          exportCtx.arcTo(relX, relY, relX + relW, relY, r);
          exportCtx.closePath();
        }
        exportCtx.clip();

        drawImageCover(exportCtx, img, relX, relY, relW, relH);
        exportCtx.restore();

        // Crisp border stroke matching preview
        exportCtx.save();
        const isFilmBorder = currentLayout === 'film35' || currentFrameTemplate === 'film_analog';
        exportCtx.strokeStyle = isFilmBorder ? 'rgba(255, 255, 255, 0.25)' : '#000000';
        exportCtx.lineWidth = 1.5 * scale;
        exportCtx.strokeRect(relX, relY, relW, relH);
        exportCtx.restore();
      } else {
        exportCtx.fillStyle = 'rgba(0,0,0,0.1)';
        exportCtx.fillRect(relX, relY, relW, relH);
      }
    });

    // 5. Draw Sprockets if film35 layout or film_analog template
    if (currentLayout === 'film35' || currentFrameTemplate === 'film_analog') {
      drawFilmSprockets(exportCtx, exportW, exportH, scale);
    }

    // 6. Draw Cut Line if Twin layout
    if (currentLayout === 'twin') {
      const divider = stripWrapper.querySelector('.cut-divider-line');
      if (divider) {
        const divRect = divider.getBoundingClientRect();
        const midX = ((divRect.left - stripRect.left) / stripRect.width) * exportW;
        exportCtx.save();
        exportCtx.setLineDash([12 * scale, 8 * scale]);
        exportCtx.strokeStyle = currentFrameTemplate === 'black' ? '#ffffff' : '#666666';
        exportCtx.lineWidth = 2 * scale;
        exportCtx.beginPath();
        exportCtx.moveTo(midX, 20 * scale);
        exportCtx.lineTo(midX, exportH - 20 * scale);
        exportCtx.stroke();
        exportCtx.restore();
      }
    }

    // 7. Draw Header & Footer Text precisely positioned
    drawStripTypography(exportCtx, stripRect, exportW, exportH, scale);

    // 8. Draw Placed Stickers & Emojis exactly at dimensionless coordinates
    for (const stk of placedStickers) {
      try {
        const stkRect = stk.elem.getBoundingClientRect();
        const relX = ((stkRect.left - stripRect.left) / stripRect.width) * exportW;
        const relY = ((stkRect.top - stripRect.top) / stripRect.height) * exportH;
        const relW = (stkRect.width / stripRect.width) * exportW;
        const relH = (stkRect.height / stripRect.height) * exportH;

        if (stk.type === 'svg') {
          const img = await svgToImage(stk.content);
          exportCtx.drawImage(img, relX, relY, relW, relH);
        } else {
          exportCtx.save();
          exportCtx.font = `${relH * 0.85}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          exportCtx.textAlign = 'center';
          exportCtx.textBaseline = 'middle';
          exportCtx.fillText(stk.content, relX + relW / 2, relY + relH / 2);
          exportCtx.restore();
        }
      } catch (err) {
        console.warn('Sticker render error:', err);
      }
    }

    // Restore original transform on preview scaler
    if (stripScalerBox) stripScalerBox.style.transform = originalTransform;

    // 9. Direct Download Trigger
    exportCanvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eternashot_${currentLayout}_${dateFormatted.replace(/\./g, '')}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  function drawImageCover(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let sx, sy, sWidth, sHeight;

    if (imgRatio > targetRatio) {
      sHeight = img.height;
      sWidth = img.height * targetRatio;
      sx = (img.width - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = img.width;
      sHeight = img.width / targetRatio;
      sx = 0;
      sy = (img.height - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  }

  function drawFrameBackgroundOnCanvas(ctx, w, h, scale) {
    // 35mm Film Roll layout or film_analog frame is always an authentic analog dark film roll
    if (currentLayout === 'film35' || currentFrameTemplate === 'film_analog') {
      ctx.fillStyle = '#0a0a0c'; // Deep 35mm film base
      ctx.fillRect(0, 0, w, h);
      return;
    }

    switch (currentFrameTemplate) {
      case 'white':
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'black':
        ctx.fillStyle = '#121214';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'pink':
        ctx.fillStyle = '#ffdbe4';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'lavender':
        ctx.fillStyle = '#ece5ff';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'butter':
        ctx.fillStyle = '#fff5c0';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'matcha':
        ctx.fillStyle = '#daf0dc';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'cyber': {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#180033');
        grad.addColorStop(0.5, '#3a005f');
        grad.addColorStop(1, '#ff007f');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        break;
      }
      case 'checker_black':
        drawCheckerPattern(ctx, w, h, 24 * scale, '#1a1a1a', '#ffffff');
        break;
      case 'checker_pink':
        drawCheckerPattern(ctx, w, h, 24 * scale, '#ffccd5', '#ffffff');
        break;
      case 'film_analog':
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'hearts_pattern': {
        ctx.fillStyle = '#ffe5ec';
        ctx.fillRect(0, 0, w, h);
        const dotSize = 24 * scale;
        ctx.fillStyle = '#ff758f';
        for (let x = 0; x < w; x += dotSize) {
          for (let y = 0; y < h; y += dotSize) {
            ctx.beginPath();
            ctx.arc(x + dotSize / 2, y + dotSize / 2, 4 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
      case 'denim_y2k':
        ctx.fillStyle = '#2b3a55';
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.setLineDash([8 * scale, 6 * scale]);
        ctx.strokeStyle = '#ffb26b';
        ctx.lineWidth = 3 * scale;
        ctx.strokeRect(10 * scale, 10 * scale, w - 20 * scale, h - 20 * scale);
        ctx.restore();
        break;
      case 'newspaper':
        ctx.fillStyle = '#f4ecd8';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'custom':
        ctx.fillStyle = customColorInput.value || '#ffe3e8';
        ctx.fillRect(0, 0, w, h);
        break;
      default:
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
    }
  }

  function drawCheckerPattern(ctx, w, h, size, color1, color2) {
    ctx.fillStyle = color2;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = color1;
    for (let x = 0; x < w; x += size) {
      for (let y = 0; y < h; y += size) {
        if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawFilmSprockets(ctx, w, h, scale) {
    const sprockW = 16 * scale;
    const sprockH = 12 * scale;
    const gap = 12 * scale;
    const leftX = 8 * scale;
    const rightX = w - 8 * scale - sprockW;
    const radius = 2.5 * scale;

    ctx.save();
    // 1. Draw rounded sprocket perforation holes on left and right borders
    ctx.fillStyle = '#ffffff';
    for (let y = 14 * scale; y < h - 20 * scale; y += sprockH + gap) {
      drawRoundedRect(ctx, leftX, y, sprockW, sprockH, radius);
      drawRoundedRect(ctx, rightX, y, sprockW, sprockH, radius);
    }

    // 2. Add authentic 35mm film edge numbers & stamps
    ctx.fillStyle = '#f59e0b';
    ctx.font = `700 ${Math.round(8 * scale)}px 'Courier Prime', monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('▶ 01A', 28 * scale, 18 * scale);
    ctx.fillText('ETN-35MM · 400', 28 * scale, h - 14 * scale);

    ctx.textAlign = 'right';
    ctx.fillText('SAFETY FILM', w - 28 * scale, 18 * scale);
    ctx.fillText('▶ 04', w - 28 * scale, h - 14 * scale);
    ctx.restore();
  }

  function drawStripTypography(ctx, stripRect, exportW, exportH, scale) {
    const headerElem = stripWrapper.querySelector('.strip-header');
    const headerRect = headerElem.getBoundingClientRect();
    const captionRect = stripCaptionDisplay.getBoundingClientRect();
    const dateRect = stripDateDisplay.getBoundingClientRect();

    const isFilm = currentLayout === 'film35' || currentFrameTemplate === 'film_analog';

    let textColor = '#111827';
    if (['black', 'film_analog'].includes(currentFrameTemplate)) textColor = '#ffffff';
    if (currentFrameTemplate === 'cyber') textColor = '#00f0ff';
    if (isFilm) textColor = '#f59e0b';
    if (currentFrameTemplate === 'checker_pink') textColor = '#c9184a';
    if (currentFrameTemplate === 'hearts_pattern') textColor = '#a4133c';
    if (currentFrameTemplate === 'denim_y2k') textColor = '#f1f6f9';
    if (currentFrameTemplate === 'custom') textColor = stripWrapper.style.color || '#111827';

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';

    // 1. Header
    const headX = ((headerRect.left + headerRect.width / 2 - stripRect.left) / stripRect.width) * exportW;
    const headY = ((headerRect.top + headerRect.height / 2 + 4 - stripRect.top) / stripRect.height) * exportH;
    ctx.font = isFilm
      ? `700 ${Math.round(10 * scale)}px 'Courier Prime', monospace`
      : `800 ${Math.round(10 * scale)}px 'Space Grotesk', monospace`;
    ctx.fillText('ETERNASHOT · ARCHIVE 2000', headX, headY);

    // 2. Caption
    const capX = ((captionRect.left + captionRect.width / 2 - stripRect.left) / stripRect.width) * exportW;
    const capY = ((captionRect.top + captionRect.height / 2 + 5 - stripRect.top) / stripRect.height) * exportH;
    ctx.font = isFilm
      ? `700 ${Math.round(11 * scale)}px 'Courier Prime', monospace`
      : `700 ${Math.round(12 * scale)}px 'Space Grotesk', monospace`;
    ctx.fillText(captionInput.value || 'ETERNASHOT // 2000-ARCHIVE', capX, capY);

    // 3. Date
    const dateX = ((dateRect.left + dateRect.width / 2 - stripRect.left) / stripRect.width) * exportW;
    const dateY = ((dateRect.top + dateRect.height / 2 + 4 - stripRect.top) / stripRect.height) * exportH;
    ctx.font = isFilm
      ? `700 ${Math.round(9 * scale)}px 'Courier Prime', monospace`
      : `700 ${Math.round(9 * scale)}px 'Space Grotesk', monospace`;
    ctx.globalAlpha = 0.85;
    ctx.fillText(dateFormatted, dateX, dateY);
    ctx.globalAlpha = 1.0;

    // 4. Meta Badge (ETERNASHOT LAB · VER.2000)
    const tagElem = stripWrapper.querySelector('.strip-studio-tag') || stripWrapper.querySelector('.strip-tag-badge');
    if (tagElem) {
      const tagRect = tagElem.getBoundingClientRect();
      const tagX = ((tagRect.left + tagRect.width / 2 - stripRect.left) / stripRect.width) * exportW;
      const tagY = ((tagRect.top + tagRect.height / 2 + 3 - stripRect.top) / stripRect.height) * exportH;
      ctx.font = isFilm
        ? `700 ${Math.round(7.5 * scale)}px 'Courier Prime', monospace`
        : `700 ${Math.round(7.5 * scale)}px 'Space Grotesk', monospace`;
      ctx.fillStyle = isFilm ? '#f59e0b' : textColor;
      ctx.globalAlpha = 0.75;
      ctx.fillText('ETERNASHOT LAB · VER.2000', tagX, tagY);
      ctx.globalAlpha = 1.0;
    }
  }

  function svgToImage(svgString) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // =========================================================
  // 9. FILE UPLOAD FALLBACK
  // =========================================================
  btnUploadPhotos.addEventListener('click', () => {
    photoFileInput.click();
  });

  photoFileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    if (!files.length) return;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        capturedPhotos[index] = event.target.result;
        updateStripUI();
      };
      reader.readAsDataURL(file);
    });

    if (window.innerWidth <= 1024) {
      setTimeout(() => switchMobileTab('editor'), 400);
    }
  });

  // =========================================================
  // 10. CONTROLS: MIRROR, CAMERA SWITCH, AUDIO, QR MODAL
  // =========================================================
  btnMirror.addEventListener('click', () => {
    isMirrored = !isMirrored;
    liveCanvas.classList.toggle('unmirrored', !isMirrored);
  });

  btnSwitchCam.addEventListener('click', () => {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    initCamera();
  });

  btnSoundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    if (isSoundEnabled) {
      soundIcon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
      btnSoundToggle.title = 'Suara Aktif';
    } else {
      soundIcon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
      btnSoundToggle.title = 'Suara Dimatikan';
    }
  });

  btnShareQr.addEventListener('click', () => {
    modalQr.classList.remove('hidden');
  });

  btnCloseQr.addEventListener('click', () => {
    modalQr.classList.add('hidden');
  });

  modalQr.querySelector('.modal-backdrop').addEventListener('click', () => {
    modalQr.classList.add('hidden');
  });

  // Wire Mobile Camera & Overlay Buttons
  if (mobileCamInput) {
    mobileCamInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        let targetIndex = capturedPhotos.findIndex(p => p === null);
        if (targetIndex === -1) targetIndex = 0;

        capturedPhotos[targetIndex] = dataUrl;
        if (isSoundEnabled) soundEffects.playShutter();
        triggerFlash();
        updateStripUI();

        const maxShots = currentLayout === 'cinematic' ? 3 : 4;
        const filled = capturedPhotos.slice(0, maxShots).filter(p => p !== null).length;
        if (filled === maxShots) {
          stripStatusBadge.textContent = 'Strip Siap Cetak';
          stripStatusBadge.classList.add('complete');
          btnDownloadStrip.disabled = false;
          btnShareQr.disabled = false;
          btnRetakeAll.classList.remove('hidden');
          if (window.innerWidth <= 1024) {
            setTimeout(() => switchMobileTab('editor'), 400);
          }
        } else {
          stripStatusBadge.textContent = `${filled}/${maxShots} Foto (Lanjut Potret)`;
        }
      };
      reader.readAsDataURL(file);
      mobileCamInput.value = '';
    });
  }

  if (btnActivateCamera) {
    btnActivateCamera.addEventListener('click', () => {
      initCamera(true);
    });
  }

  if (btnOpenMobileCam && mobileCamInput) {
    btnOpenMobileCam.addEventListener('click', () => {
      mobileCamInput.click();
    });
  }

  if (btnUseSamplePhotos) {
    btnUseSamplePhotos.addEventListener('click', () => {
      if (window.SAMPLE_PHOTOS && window.SAMPLE_PHOTOS.length >= 4) {
        capturedPhotos = [...window.SAMPLE_PHOTOS];
        if (isSoundEnabled) soundEffects.playShutter();
        updateStripUI();
        stripStatusBadge.textContent = 'Strip Siap Cetak';
        stripStatusBadge.classList.add('complete');
        btnDownloadStrip.disabled = false;
        btnShareQr.disabled = false;
        btnRetakeAll.classList.remove('hidden');
        if (window.innerWidth <= 1024) {
          switchMobileTab('editor');
        }
      }
    });
  }

  const btnCopyNetworkUrl = document.getElementById('btn-copy-network-url');
  const networkUrlInput = document.getElementById('network-url-input');
  if (networkUrlInput && window.location.href && !window.location.href.startsWith('file:')) {
    networkUrlInput.value = window.location.href;
  }
  if (btnCopyNetworkUrl && networkUrlInput) {
    btnCopyNetworkUrl.addEventListener('click', () => {
      networkUrlInput.select();
      navigator.clipboard.writeText(networkUrlInput.value).then(() => {
        btnCopyNetworkUrl.textContent = 'Tersalin! ✓';
        setTimeout(() => {
          btnCopyNetworkUrl.textContent = 'Salin Link';
        }, 2000);
      });
    });
  }

  // Carousel smooth scroll navigation buttons
  document.querySelectorAll('.carousel-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.scroll;
      const target = document.getElementById(targetId);
      if (!target) return;
      const direction = btn.classList.contains('prev') ? -1 : 1;
      const scrollAmount = 220 * direction;
      target.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  });

  // Observe container size changes to dynamically fit the strip
  if (window.ResizeObserver && stripStageOuter) {
    const ro = new ResizeObserver(() => {
      scaleStripToFit();
    });
    ro.observe(stripStageOuter);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- Initial Launches ---
  switchMobileTab(window.innerWidth <= 1024 ? 'camera' : 'camera');
  renderFilterPills();
  renderQuickStickerTray();
  rebuildSlotsForLayout();
  initCamera();
  setTimeout(scaleStripToFit, 60);
  setTimeout(scaleStripToFit, 200);
});

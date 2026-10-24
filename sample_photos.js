// Sample Photos Generator for EternaShot Studio Fallback
function createSamplePhoto(poseNumber, bgColor, emoji, text) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 640, 480);
  grad.addColorStop(0, bgColor[0]);
  grad.addColorStop(1, bgColor[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);

  // Decorative subtle circle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(320, 220, 150, 0, Math.PI * 2);
  ctx.fill();

  // Draw Cute Character / Avatar
  ctx.font = '120px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 320, 210);

  // Pose Label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Outfit, sans-serif';
  ctx.fillText(`Pose ${poseNumber}: ${text}`, 320, 370);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('EternaShot Lab // Sample', 320, 410);

  return canvas.toDataURL('image/jpeg', 0.95);
}

window.SAMPLE_PHOTOS = [
  createSamplePhoto(1, ['#ff758f', '#ff4d6d'], '🥰', 'Sweet Smile'),
  createSamplePhoto(2, ['#7209b7', '#4361ee'], '✌️', 'Peace Sign'),
  createSamplePhoto(3, ['#f72585', '#b5179e'], '🫰', 'Finger Heart'),
  createSamplePhoto(4, ['#4cc9f0', '#4895ef'], '✨', 'Wink & Sparkle')
];

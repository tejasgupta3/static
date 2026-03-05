/**
 * placement.js
 * Computes where and how to draw jewelry on the canvas
 * based on detected facial landmarks.
 */

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function mid(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function jawAngle(leftJaw, rightJaw) {
  return Math.atan2(rightJaw.y - leftJaw.y, rightJaw.x - leftJaw.x);
}

/**
 * Compute necklace placement from landmarks.
 */
export function computeNecklacePlacement(landmarks, options = {}) {
  const { widthScale = 1.15, verticalOffset = 0 } = options;
  const { chin, leftJaw, rightJaw, foreheadTop } = landmarks;

  const faceWidth = dist(leftJaw, rightJaw);
  const faceHeight = dist(foreheadTop, chin);
  const jawMid = mid(leftJaw, rightJaw);

  const centerX = jawMid.x;
  const neckOffsetY = faceHeight * 0.08 + verticalOffset;
  const centerY = chin.y + neckOffsetY;

  const necklaceWidth = faceWidth * widthScale;
  const rotation = jawAngle(leftJaw, rightJaw);

  return { x: centerX, y: centerY, width: necklaceWidth, rotation, faceWidth, faceHeight };
}

/**
 * Compute earring placement for BOTH ears.
 * Returns { left, right } each with { x, y, width, rotation }
 */
export function computeEarringPlacement(landmarks, options = {}) {
  const { sizeScale = 0.38 } = options;
  const { leftEar, rightEar, leftJaw, rightJaw, foreheadTop, chin } = landmarks;

  const faceWidth = dist(leftJaw, rightJaw);
  const faceHeight = dist(foreheadTop, chin);
  const earringSize = faceWidth * sizeScale;
  const rotation = jawAngle(leftJaw, rightJaw);

  // Drop earrings hang below the ear lobe — shift downward
  const dropOffsetY = faceHeight * 0.05;

  return {
    left: {
      x: leftEar.x,
      y: leftEar.y + dropOffsetY,
      width: earringSize,
      rotation: rotation,
      mirror: false,
    },
    right: {
      x: rightEar.x,
      y: rightEar.y + dropOffsetY,
      width: earringSize,
      rotation: rotation,
      mirror: true,   // flip horizontally for the right ear
    },
  };
}

/**
 * Draw a necklace image onto the canvas at the computed placement.
 */
export function drawJewelry(ctx, jewelryImg, placement) {
  const { x, y, width, rotation } = placement;
  const aspectRatio = jewelryImg.naturalHeight / jewelryImg.naturalWidth;
  const drawWidth = width;
  const drawHeight = width * aspectRatio;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(jewelryImg, -drawWidth / 2, 0, drawWidth, drawHeight);
  ctx.restore();
}

/**
 * Draw a pair of earrings onto the canvas.
 */
export function drawEarrings(ctx, jewelryImg, placement) {
  const { left, right } = placement;

  [left, right].forEach((ear) => {
    const { x, y, width, rotation, mirror } = ear;
    const aspectRatio = jewelryImg.naturalHeight / jewelryImg.naturalWidth;
    const drawHeight = width * aspectRatio;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    if (mirror) {
      ctx.scale(-1, 1);
    }
    // Draw centered horizontally, hanging down from the ear point
    ctx.drawImage(jewelryImg, -width / 2, 0, width, drawHeight);
    ctx.restore();
  });
}

/**
 * Draw the base portrait photo letterboxed onto the canvas.
 */
export function drawPhoto(ctx, photo, canvasW, canvasH) {
  ctx.clearRect(0, 0, canvasW, canvasH);

  const imgAspect = photo.naturalWidth / photo.naturalHeight;
  const canvasAspect = canvasW / canvasH;

  let drawW, drawH, offsetX, offsetY;

  if (imgAspect > canvasAspect) {
    drawW = canvasW;
    drawH = canvasW / imgAspect;
    offsetX = 0;
    offsetY = (canvasH - drawH) / 2;
  } else {
    drawH = canvasH;
    drawW = canvasH * imgAspect;
    offsetX = (canvasW - drawW) / 2;
    offsetY = 0;
  }

  const scale = drawW / photo.naturalWidth;
  ctx.drawImage(photo, offsetX, offsetY, drawW, drawH);
  return { scale, offsetX, offsetY, drawW, drawH };
}

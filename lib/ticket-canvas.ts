/**
 * Ticket Canvas Utilities
 *
 * Mirrors the drawing logic in components/TicketPreview.tsx (background
 * PNG at public/ticket-background.png + overlaid text/barcode) so a future
 * high-resolution export would look identical to the live preview.
 * Not currently called anywhere in the UI (the download feature was
 * intentionally removed), but kept in sync with the preview by design.
 */

import bwipjs from 'bwip-js/browser';

interface TicketData {
  movieTitle: string;
  posterUrl: string;
  recipientName: string;
  message: string;
  seatNumber: string;
  barcodeWord: string;
}

const INK = '#1E1712';
const BASE_W = 927;
const BASE_H = 373;
const POSTER_RADIUS_RATIO = 0.018;
const TITLE_FONT_RATIO = 0.205;
const MIN_TITLE_FONT_RATIO = 0.09;
const RECIPIENT_FONT_RATIO = 0.083;
const MESSAGE_FONT_RATIO = 0.057;
const MESSAGE_LINE_HEIGHT_RATIO = 0.077;

const POSTER = { left: 0.0566, top: 0.1716, right: 0.2643, bottom: 0.8686 };
const TEXT_LEFT = 0.326;
const TEXT_RIGHT = 0.848;

export async function generateTicketCanvas(): Promise<void> {
  throw new Error('Use /api/ticket endpoint for ticket generation');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  const pushChunk = (chunk: string) => {
    if (chunk) lines.push(chunk);
  };

  const splitWord = (word: string) => {
    let chunk = '';
    for (const char of word) {
      const testChunk = chunk + char;
      if (context.measureText(testChunk).width > maxWidth) {
        pushChunk(chunk);
        chunk = char;
      } else {
        chunk = testChunk;
      }
    }
    return chunk;
  };

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
      return;
    }
    if (currentLine) {
      pushChunk(currentLine);
      currentLine = '';
    }
    currentLine = context.measureText(word).width <= maxWidth ? word : splitWord(word);
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

function truncateToWidth(context: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  let line = text;
  while (line.length > 0 && context.measureText(line + '...').width > maxWidth) {
    line = line.slice(0, -1);
  }
  return line + '...';
}

export async function generateHighResTicketImage(ticketData: TicketData): Promise<string> {
  const width = 1854; // 2x base resolution
  const height = 746;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  try {
    const bgImg = await loadImage('/ticket-background.png');
    ctx.drawImage(bgImg, 0, 0, width, height);
  } catch (error) {
    ctx.fillStyle = '#EAE0CC';
    ctx.fillRect(0, 0, width, height);
  }

  const px = POSTER.left * width;
  const py = POSTER.top * height;
  const pw = (POSTER.right - POSTER.left) * width;
  const ph = (POSTER.bottom - POSTER.top) * height;

  if (ticketData.posterUrl) {
    try {
      const img = await loadImage(ticketData.posterUrl);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, POSTER_RADIUS_RATIO * width);
      ctx.clip();

      const imageRatio = img.width / img.height;
      const frameRatio = pw / ph;
      let drawWidth = pw;
      let drawHeight = ph;
      let drawX = px;
      let drawY = py;

      if (imageRatio > frameRatio) {
        drawWidth = ph * imageRatio;
        drawX = px - (drawWidth - pw) / 2;
      } else {
        drawHeight = pw / imageRatio;
        drawY = py - (drawHeight - ph) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
    } catch (error) {
      console.warn('Failed to load poster:', ticketData.posterUrl);
    }
  }

  drawTextContent(ctx, ticketData, width, height);
  drawSeatAndBarcode(ctx, ticketData, width, height);

  return canvas.toDataURL('image/png');
}

export async function downloadTicketImage(ticketData: TicketData): Promise<void> {
  try {
    const dataUrl = await generateHighResTicketImage(ticketData);
    const link = document.createElement('a');
    link.download = `ticket-${ticketData.recipientName.replace(/\s+/g, '-')}-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to download ticket:', error);
    throw error;
  }
}

function drawTextContent(
  ctx: CanvasRenderingContext2D,
  ticketData: TicketData,
  width: number,
  height: number
) {
  const textMaxWidth = (TEXT_RIGHT - TEXT_LEFT) * width - 8 * (width / BASE_W);
  const textX = TEXT_LEFT * width;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;

  let titleFont = TITLE_FONT_RATIO * height;
  const minTitleFont = MIN_TITLE_FONT_RATIO * height;
  let titleLines: string[] = [];
  while (titleFont >= minTitleFont) {
    ctx.font = `700 ${titleFont}px Georgia, 'Times New Roman', serif`;
    titleLines = wrapText(ctx, ticketData.movieTitle.toUpperCase(), textMaxWidth);
    if (titleLines.length <= 2) break;
    titleFont -= 1 * (height / BASE_H);
  }
  if (titleLines.length > 2) {
    titleLines = titleLines.slice(0, 2);
    titleLines[1] = truncateToWidth(ctx, titleLines[1], textMaxWidth);
  }

  let cursorY = 0.289 * height;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, textX, cursorY + i * titleFont * 1.15);
  });
  cursorY += (titleLines.length - 1) * titleFont * 1.15;

  const recipientFont = RECIPIENT_FONT_RATIO * height;
  ctx.font = `600 ${recipientFont}px Georgia, 'Times New Roman', serif`;
  cursorY += 0.086 * height;
  let recipientLine = `TO: ${(ticketData.recipientName || '').toUpperCase()}`;
  if (ctx.measureText(recipientLine).width > textMaxWidth) {
    recipientLine = truncateToWidth(ctx, recipientLine, textMaxWidth);
  }
  ctx.fillText(recipientLine, textX, cursorY);

  const messageFont = MESSAGE_FONT_RATIO * height;
  const messageLineHeight = MESSAGE_LINE_HEIGHT_RATIO * height;
  ctx.font = `400 ${messageFont}px Inter, 'Segoe UI', sans-serif`;
  let messageY = cursorY + 0.081 * height;
  const bottomBound = POSTER.bottom * height;
  const maxMessageLines = Math.max(2, Math.floor((bottomBound - messageY) / messageLineHeight));

  let messageLines = wrapText(ctx, ticketData.message || '', textMaxWidth);
  const didTruncate = messageLines.length > maxMessageLines;
  if (didTruncate) {
    messageLines = messageLines.slice(0, maxMessageLines);
    const lastIndex = messageLines.length - 1;
    messageLines[lastIndex] = truncateToWidth(ctx, messageLines[lastIndex], textMaxWidth);
  }
  messageLines.forEach((line) => {
    ctx.fillText(line, textX, messageY);
    messageY += messageLineHeight;
  });
}

function drawSeatAndBarcode(
  ctx: CanvasRenderingContext2D,
  ticketData: TicketData,
  width: number,
  height: number
) {
  const seatCenterX = 0.9256 * width;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;

  ctx.font = `600 ${0.042 * height}px Georgia, 'Times New Roman', serif`;
  ctx.fillText('SEAT NO.', seatCenterX, 0.155 * height);

  ctx.font = `700 ${0.115 * height}px Georgia, 'Times New Roman', serif`;
  ctx.fillText(ticketData.seatNumber || '—', seatCenterX, 0.26 * height);

  const label = (ticketData.barcodeWord || '').toUpperCase();
  if (label) {
    ctx.save();
    ctx.translate(0.8825 * width, 0.67 * height);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = `600 ${0.032 * height}px Georgia, 'Times New Roman', serif`;
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }

  const bx = 0.9095 * width;
  const by = 0.2869 * height;
  const bw = 0.0398 * width;
  const bh = 0.59 * height;
  const maxBarcodeLength = 13;
  const displayBarcodeWord = (ticketData.barcodeWord || 'TICKET').substring(0, maxBarcodeLength);

  ctx.save();
  ctx.translate(bx + bw / 2, by + bh / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.translate(-bh / 2, -bw / 2);

  const barcodeCanvas = document.createElement('canvas');
  try {
    bwipjs.toCanvas(barcodeCanvas, {
      bcid: 'code128',
      text: displayBarcodeWord,
      scale: 2,
      height: 8,
      includetext: false,
    });
    ctx.drawImage(barcodeCanvas, 0, 0, bh, bw);
  } catch (err) {
    console.error('Barcode error:', err);
  }
  ctx.restore();
}

export type { TicketData };

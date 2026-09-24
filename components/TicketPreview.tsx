"use client";
import { useEffect, useRef, memo } from "react";
import bwipjs from 'bwip-js/browser';
import { NowShowingPost } from "@/components/types/posts";

// Cache for background image to avoid reloading
let bgImageCache: HTMLImageElement | null = null;

interface NowShowingSectionProps {
  posts: NowShowingPost[];
}

export function NowShowingSection({ posts }: NowShowingSectionProps) {
  return (
    <div className="now-showing-section">
      {posts.map((post) => (
        <div key={post._id ?? post.url}>
          <h3>{post.title}</h3>
          <p>By {post.submittedByName}</p>
        </div>
      ))}
    </div>
  );
}

interface TicketPreviewProps {
  movieTitle: string;
  posterUrl: string;
  recipientName: string;
  message: string;
  seatNumber: string;
  barcodeWord: string;
  width?: number;
  height?: number;
}

// Base layout reference: 927 x 373 (the source ticket-background.png).
// All coordinates below are ratios of that base, applied against the
// actual rendered width/height so the ticket scales cleanly.
const BASE_W = 927;
const BASE_H = 373;
const POSTER_RADIUS_RATIO = 0.018;

export const TicketPreview = memo(function TicketPreview({
  movieTitle,
  posterUrl,
  recipientName,
  message,
  seatNumber,
  barcodeWord,
  width = 600,
  height = 241,
}: TicketPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Independent x/y scale so the layout stays correct even if a caller
    // passes a width/height pair that isn't exactly the 927:373 ratio.
    const sx = width / BASE_W;
    const sy = height / BASE_H;

    function wrapText(text: string, maxWidth: number): string[] {
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      const pushChunk = (chunk: string) => {
        if (chunk) lines.push(chunk);
      };

      const splitWord = (word: string) => {
        let chunk = "";
        for (const char of word) {
          const testChunk = chunk + char;
          if (ctx.measureText(testChunk).width > maxWidth) {
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
        if (ctx.measureText(testLine).width <= maxWidth) {
          currentLine = testLine;
          return;
        }
        if (currentLine) {
          pushChunk(currentLine);
          currentLine = "";
        }
        currentLine = ctx.measureText(word).width <= maxWidth ? word : splitWord(word);
      });

      if (currentLine) lines.push(currentLine);
      return lines;
    }

    function truncateToWidth(text: string, maxWidth: number): string {
      let line = text;
      while (line.length > 0 && ctx.measureText(line + "...").width > maxWidth) {
        line = line.slice(0, -1);
      }
      return line + "...";
    }

    const INK = "#1E1712";

    // ---------- layout constants (ratios of the 927x373 base) ----------
    const POSTER = { left: 0.0566, top: 0.1716, right: 0.2643, bottom: 0.8686 };
    const TEXT_LEFT = 0.326;
    const TEXT_RIGHT = 0.848; // stop before the perforation line baked into the bg image

    function drawPoster() {
      const px = POSTER.left * width;
      const py = POSTER.top * height;
      const pw = (POSTER.right - POSTER.left) * width;
      const ph = (POSTER.bottom - POSTER.top) * height;

      if (!posterUrl) return;

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
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
      };
      img.src = posterUrl;
    }

    function drawTextContent() {
      const textMaxWidth = (TEXT_RIGHT - TEXT_LEFT) * width - 8 * sx;
      const textX = TEXT_LEFT * width;

      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = INK;

      // Movie title — auto-shrinks to fit, up to 2 lines
      let titleFont = 0.15 * height;
      const minTitleFont = 0.09 * height;
      let titleLines: string[] = [];
      while (titleFont >= minTitleFont) {
        ctx.font = `700 ${titleFont}px Georgia, 'Times New Roman', serif`;
        titleLines = wrapText(movieTitle.toUpperCase(), textMaxWidth);
        if (titleLines.length <= 2) break;
        titleFont -= 1 * sy;
      }
      if (titleLines.length > 2) {
        titleLines = titleLines.slice(0, 2);
        titleLines[1] = truncateToWidth(titleLines[1], textMaxWidth);
      }

      let cursorY = 0.289 * height; // first title line baseline
      titleLines.forEach((line, i) => {
        ctx.fillText(line, textX, cursorY + i * titleFont * 1.20);
      });
      cursorY += (titleLines.length - 1) * titleFont * 1.35;

      // Recipient
      const recipientFont = 0.083 * height;
      ctx.font = `600 ${recipientFont}px Georgia, 'Times New Roman', serif`;
      cursorY += 0.11 * height;
      let recipientLine = `TO: ${(recipientName || "").toUpperCase()}`;
      if (ctx.measureText(recipientLine).width > textMaxWidth) {
        recipientLine = truncateToWidth(recipientLine, textMaxWidth);
      }
      ctx.fillText(recipientLine, textX, cursorY);

      // Message
      const messageFont = 0.08 * height;
      const messageLineHeight = 0.091 * height;
      ctx.fillStyle = "#120F0E";
      ctx.font = `400 ${messageFont}px Inter, 'Segoe UI', sans-serif`;
      let messageY = cursorY + 0.1 * height;
      const bottomBound = POSTER.bottom * height;
      const maxMessageLines = Math.max(3, Math.floor((bottomBound - messageY) / messageLineHeight));

      let messageLines = wrapText(message || "", textMaxWidth);
      const didTruncate = messageLines.length > maxMessageLines;
      if (didTruncate) {
        messageLines = messageLines.slice(0, maxMessageLines);
        const lastIndex = messageLines.length - 1;
        messageLines[lastIndex] = truncateToWidth(messageLines[lastIndex], textMaxWidth);
      }
      messageLines.forEach((line) => {
        ctx.fillText(line, textX, messageY);
        messageY += messageLineHeight;
      });
    }

    function drawSeatAndBarcode() {
      const seatCenterX = 0.9256 * width;

      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = INK;

      ctx.font = `600 ${0.042 * height}px Georgia, 'Times New Roman', serif`;
      ctx.fillText("SEAT NO.", seatCenterX, 0.155 * height);

      ctx.font = `700 ${0.09 * height}px Georgia, 'Times New Roman', serif`;
      ctx.fillText(seatNumber || "—", seatCenterX, 0.26 * height);

      // Rotated "barcode word" label running alongside the barcode
      const label = (barcodeWord || "").toUpperCase();
      if (label) {
        ctx.save();
        ctx.translate(0.895 * width, 0.67 * height);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.font = `600 ${0.06 * height}px Georgia, 'Times New Roman', serif`;
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }

      // Barcode, rotated 90° so the bars run top-to-bottom
      const bx = 0.9095 * width;
      const by = 0.2869 * height;
      const bw = 0.0398 * width;
      const bh = 0.59 * height;
      const maxBarcodeLength = 13;
      const displayBarcodeWord = (barcodeWord || "TICKET").substring(0, maxBarcodeLength);

      ctx.save();
      ctx.translate(bx + bw / 2, by + bh / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.translate(-bh / 2, -bw / 2);

      const barcodeCanvas = document.createElement("canvas");
      try {
        bwipjs.toCanvas(barcodeCanvas, {
          bcid: "code128",
          text: displayBarcodeWord,
          scale: 2,
          height: 8,
          includetext: false,
        });
        ctx.drawImage(barcodeCanvas, 0, 0, bh, bw);
      } catch (err) {
        console.error("Barcode error:", err);
      }
      ctx.restore();
    }

    function drawAll() {
      drawPoster();
      drawTextContent();
      drawSeatAndBarcode();
    }

    if (bgImageCache && bgImageCache.complete) {
      ctx.drawImage(bgImageCache, 0, 0, width, height);
      drawAll();
    } else {
      const bgImg = new window.Image();
      bgImg.onload = () => {
        bgImageCache = bgImg;
        ctx.drawImage(bgImg, 0, 0, width, height);
        drawAll();
      };
      bgImg.onerror = () => {
        ctx.fillStyle = "#EAE0CC";
        ctx.fillRect(0, 0, width, height);
        drawAll();
      };
      bgImg.src = "/ticket-background.png";
    }

  }, [movieTitle, posterUrl, recipientName, message, seatNumber, barcodeWord, width, height]);

  return (
    <div className="w-full flex justify-center">
      <canvas ref={canvasRef} className="max-w-full h-auto" />
    </div>
  );
});

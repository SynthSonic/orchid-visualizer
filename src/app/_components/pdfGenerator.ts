import { PDFDocument, rgb, StandardFonts, grayscale } from "pdf-lib";

export interface ChordSnapshot {
  // Modifier buttons
  chordType: "Dim" | "Min" | "Maj" | "Sus" | undefined;
  hasSixth: boolean;
  hasSeventh: boolean;
  hasMajorSeventh: boolean;
  hasNinth: boolean;
  // Piano keys (note names without octave)
  notes: string[]; // e.g., ["C", "E", "G"]
  rootNote?: string; // The primary key that was pressed (e.g., "G")
}

// Define the white and black key layout for one octave
const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_KEYS = ["C#", "D#", null, "F#", "G#", "A#", null]; // null = no black key

// Dark mode color palette
const BACKGROUND = grayscale(0); // Pure black
const WHITE = grayscale(1); // Pure white
const VERY_SUBTLE_GREY = grayscale(0.25); // Very subtle grey for secondary keys (barely visible)
const MEDIUM_GREY = grayscale(0.5); // Medium grey for borders/text
const DARK_GREY = grayscale(0.15); // Dark grey for inactive black keys

/**
 * Helper function to draw rounded rectangle (pdf-lib doesn't have native support)
 */
function drawRoundedRect(
  page: ReturnType<PDFDocument["getPages"]>[0],
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  options: {
    color?: any;
    borderColor?: any;
    borderWidth?: number;
  } = {},
) {
  const { color, borderColor, borderWidth = 1 } = options;

  // For simplicity, we'll use regular rectangles but with the aesthetic in mind
  // pdf-lib doesn't support rounded corners easily, so we'll keep sharp corners
  // but make them look good with proper sizing
  if (color) {
    page.drawRectangle({ x, y, width, height, color });
  }
  if (borderColor) {
    page.drawRectangle({
      x,
      y,
      width,
      height,
      borderColor,
      borderWidth,
      color: color || BACKGROUND,
    });
  }
}

/**
 * Draws a single chord position on the PDF
 */
function drawChordPosition(
  page: ReturnType<PDFDocument["getPages"]>[0],
  snapshot: ChordSnapshot,
  startX: number,
  startY: number,
  monoFont: any,
) {
  const whiteKeyWidth = 45;
  const whiteKeyHeight = 140;
  const blackKeyWidth = 28;
  const blackKeyHeight = 90;
  const buttonSize = 55;
  const buttonGap = 8;

  // Draw modifier buttons (4x2 grid on the left)
  const modifiers = [
    ["Dim", "Min", "Maj", "Sus"],
    ["6", "m7", "M7", "9"],
  ];

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const label = modifiers[row]?.[col];
      if (!label) continue;

      const x = startX + col * (buttonSize + buttonGap);
      const y = startY - row * (buttonSize + buttonGap);

      // Determine if this button is active
      let isActive = false;
      if (row === 0) {
        // Top row: chord types
        isActive = snapshot.chordType === label;
      } else {
        // Bottom row: extensions
        isActive =
          (label === "6" && snapshot.hasSixth) ||
          (label === "m7" && snapshot.hasSeventh) ||
          (label === "M7" && snapshot.hasMajorSeventh) ||
          (label === "9" && snapshot.hasNinth);
      }

      // Draw button square with dark mode styling
      page.drawRectangle({
        x,
        y: y - buttonSize,
        width: buttonSize,
        height: buttonSize,
        color: isActive ? WHITE : BACKGROUND,
        borderColor: isActive ? WHITE : MEDIUM_GREY,
        borderWidth: 1.5,
      });

      // Draw label (monospace font for clean look)
      const fontSize = 11;
      const textWidth = monoFont.widthOfTextAtSize(label, fontSize);
      page.drawText(label, {
        x: x + buttonSize / 2 - textWidth / 2,
        y: y - buttonSize / 2 - fontSize / 3,
        size: fontSize,
        font: monoFont,
        color: isActive ? BACKGROUND : WHITE,
      });
    }
  }

  // Draw piano keyboard (to the right of buttons)
  const pianoStartX = startX + 4 * (buttonSize + buttonGap) + 30;
  const pianoStartY = startY;

  // Draw white keys first
  for (let i = 0; i < WHITE_KEYS.length; i++) {
    const note = WHITE_KEYS[i];
    if (!note) continue;

    const x = pianoStartX + i * whiteKeyWidth;
    const isActive = snapshot.notes.includes(note);
    const isPrimary = snapshot.rootNote === note;

    // Consistent with button styling: primary = white, secondary = subtle grey, inactive = black outline
    let keyColor = BACKGROUND;
    let borderColor = MEDIUM_GREY;
    let textColor = WHITE;

    if (isActive) {
      if (isPrimary) {
        // Primary: white fill (like active buttons on left)
        keyColor = WHITE;
        borderColor = WHITE;
        textColor = BACKGROUND;
      } else {
        // Secondary: very subtle grey (barely noticeable)
        keyColor = VERY_SUBTLE_GREY;
        borderColor = MEDIUM_GREY;
        textColor = WHITE;
      }
    }

    // Draw white key
    page.drawRectangle({
      x,
      y: pianoStartY - whiteKeyHeight,
      width: whiteKeyWidth,
      height: whiteKeyHeight,
      color: keyColor,
      borderColor: borderColor,
      borderWidth: 1.5,
    });

    // Draw note label at bottom (monospace font)
    const fontSize = 9;
    const textWidth = monoFont.widthOfTextAtSize(note, fontSize);
    page.drawText(note, {
      x: x + whiteKeyWidth / 2 - textWidth / 2,
      y: pianoStartY - whiteKeyHeight + 10,
      size: fontSize,
      font: monoFont,
      color: textColor,
    });
  }

  // Draw black keys on top
  for (let i = 0; i < BLACK_KEYS.length; i++) {
    const note = BLACK_KEYS[i];
    if (!note) continue;

    const x =
      pianoStartX + i * whiteKeyWidth + whiteKeyWidth - blackKeyWidth / 2;
    const isActive = snapshot.notes.includes(note);
    const isPrimary = snapshot.rootNote === note;

    // Consistent with white keys: primary = white, secondary = subtle grey, inactive = dark grey
    let keyColor = DARK_GREY; // Subtle dark grey for inactive black keys
    let borderColor = MEDIUM_GREY;
    let textColor = WHITE;

    if (isActive) {
      if (isPrimary) {
        // Primary: white fill (like active buttons on left)
        keyColor = WHITE;
        borderColor = WHITE;
        textColor = BACKGROUND;
      } else {
        // Secondary: very subtle grey (barely lighter than inactive)
        keyColor = grayscale(0.3); // Just slightly lighter than dark grey
        borderColor = MEDIUM_GREY;
        textColor = WHITE;
      }
    }

    // Draw black key
    page.drawRectangle({
      x,
      y: pianoStartY - blackKeyHeight,
      width: blackKeyWidth,
      height: blackKeyHeight,
      color: keyColor,
      borderColor: borderColor,
      borderWidth: 1.5,
    });

    // Draw note label (monospace font)
    const fontSize = 7;
    const textWidth = monoFont.widthOfTextAtSize(note, fontSize);
    page.drawText(note, {
      x: x + blackKeyWidth / 2 - textWidth / 2,
      y: pianoStartY - blackKeyHeight + 10,
      size: fontSize,
      font: monoFont,
      color: textColor,
    });
  }
}

/**
 * Generates a clean dark mode PDF chord sheet from scratch
 * Supports up to 8 chords (4 per page)
 */
export async function generateChordSheetPDF(
  snapshots: ChordSnapshot[],
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);
  const monoBoldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Page dimensions (US Letter)
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 40;
  const chordsPerPage = 4;
  const chordSpacing = 175;

  // Calculate number of pages needed (max 8 chords = 2 pages)
  const numPages = Math.ceil(Math.min(snapshots.length, 8) / chordsPerPage);

  for (let pageNum = 0; pageNum < numPages; pageNum++) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Fill background with black
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: BACKGROUND,
    });

    // Title (only on first page)
    if (pageNum === 0) {
      page.drawText("ORCHID", {
        x: margin,
        y: pageHeight - 45,
        size: 18,
        font: monoBoldFont,
        color: WHITE,
      });

      // Subtle subtitle
      page.drawText("Chord Sheet", {
        x: margin + 85,
        y: pageHeight - 45,
        size: 18,
        font: monoFont,
        color: MEDIUM_GREY,
      });
    }

    // Draw chords for this page
    const startY = pageHeight - 90;
    const startChordIdx = pageNum * chordsPerPage;
    const endChordIdx = Math.min(
      startChordIdx + chordsPerPage,
      snapshots.length,
    );

    for (let i = startChordIdx; i < endChordIdx; i++) {
      const snapshot = snapshots[i];
      if (!snapshot) continue;

      const localIdx = i - startChordIdx;
      const currentY = startY - localIdx * chordSpacing;

      // Draw position number with minimalist style
      page.drawText(`${i + 1}`, {
        x: margin - 20,
        y: currentY - 25,
        size: 16,
        font: monoBoldFont,
        color: MEDIUM_GREY,
      });

      drawChordPosition(page, snapshot, margin, currentY, monoFont);
    }

    // Footer - clean and minimal
    const footerY = 25;
    page.drawText("orchid.synthsonic.app", {
      x: margin,
      y: footerY,
      size: 8,
      font: monoFont,
      color: DARK_GREY,
    });

    // Page number (if multiple pages)
    if (numPages > 1) {
      const pageText = `${pageNum + 1}/${numPages}`;
      const pageTextWidth = monoFont.widthOfTextAtSize(pageText, 8);
      page.drawText(pageText, {
        x: pageWidth - margin - pageTextWidth,
        y: footerY,
        size: 8,
        font: monoFont,
        color: DARK_GREY,
      });
    }
  }

  return await pdfDoc.save();
}

/**
 * Downloads a PDF blob to the user's computer
 */
export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}


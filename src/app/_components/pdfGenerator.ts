import type { PDFFont, PDFPage } from "pdf-lib";
import { PDFDocument, StandardFonts, grayscale } from "pdf-lib";
import type { OrchidSettings } from "./types/chord.types";

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
  // Optional Orchid settings
  settings?: OrchidSettings;
}

// Type aliases for clarity
type GrayscaleValue = ReturnType<typeof grayscale>;

// Define the white and black key layout for one octave
const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_KEYS = ["C#", "D#", null, "F#", "G#", "A#", null]; // null = no black key

// Dark mode color palette
const BACKGROUND: GrayscaleValue = grayscale(0); // Pure black
const WHITE: GrayscaleValue = grayscale(1); // Pure white
const VERY_SUBTLE_GREY: GrayscaleValue = grayscale(0.25); // Very subtle grey for secondary keys (barely visible)
const MEDIUM_GREY: GrayscaleValue = grayscale(0.5); // Medium grey for borders/text
const DARK_GREY: GrayscaleValue = grayscale(0.15); // Dark grey for inactive black keys

/**
 * Draws a single chord position on the PDF
 */
function drawChordPosition(
  page: PDFPage,
  snapshot: ChordSnapshot,
  startX: number,
  startY: number,
  monoFont: PDFFont,
): void {
  const whiteKeyWidth = 40;
  const whiteKeyHeight = 140;
  const blackKeyWidth = 25;
  const blackKeyHeight = 90;
  const buttonSize = 50;
  const buttonGap = 6;

  // Draw modifier buttons (4x2 grid on the left)
  const modifiers = [
    ["Dim", "Min", "Maj", "Sus"],
    ["6", "m7", "M7", "9"],
  ] as const;

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
      const fontSize = 10;
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
  const pianoStartX = startX + 4 * (buttonSize + buttonGap) + 20;
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
 * Draws the settings header at the top of the first page
 */
function drawSettingsHeader(
  page: PDFPage,
  settings: OrchidSettings,
  startY: number,
  monoFont: PDFFont,
  monoBoldFont: PDFFont,
  margin: number,
): number {
  const fontSize = 8;
  const lineHeight = 12;
  const labelColor = MEDIUM_GREY;
  const valueColor = WHITE;
  let currentY = startY;

  // Draw settings in a grid layout (3 columns)
  const columnWidth = 170;
  const columns: Array<{ label: string; value: string }[]> = [[], [], []];
  let columnIndex = 0;

  // Collect all settings into columns
  if (settings.sound !== undefined) {
    columns[columnIndex % 3]!.push({
      label: "Sound",
      value: settings.sound.toString(),
    });
    columnIndex++;
  }

  if (settings.voicing !== undefined) {
    columns[columnIndex % 3]!.push({
      label: "Voicing",
      value: settings.voicing.toString().padStart(2, "0"),
    });
    columnIndex++;
  }

  if (settings.performance !== undefined) {
    const modeValue =
      settings.performanceValue !== undefined
        ? ` (${settings.performanceValue})`
        : "";
    columns[columnIndex % 3]!.push({
      label: "Performance",
      value: `${settings.performance.replace(" 2 octaves", " 2oct")}${modeValue}`,
    });
    columnIndex++;
  }

  if (settings.bpm !== undefined) {
    columns[columnIndex % 3]!.push({
      label: "BPM",
      value: settings.bpm.toString(),
    });
    columnIndex++;
  }

  if (settings.drumLoop !== undefined) {
    columns[columnIndex % 3]!.push({
      label: "Drum Loop",
      value: settings.drumLoop,
    });
    columnIndex++;
  }

  if (settings.fx && settings.fx.length > 0) {
    settings.fx.forEach((fx) => {
      columns[columnIndex % 3]!.push({
        label: fx.type,
        value: fx.value === 0 ? "Off" : fx.value.toString().padStart(2, "0"),
      });
      columnIndex++;
    });
  }

  if (settings.filter !== undefined) {
    columns[columnIndex % 3]!.push({
      label: "Filter",
      value: settings.filter === 0 ? "Off" : settings.filter.toString().padStart(2, "0"),
    });
    columnIndex++;
  }

  if (settings.drumFX) {
    const drumFX = settings.drumFX;
    if (drumFX.reverbType !== undefined) {
      columns[columnIndex % 3]!.push({
        label: "Reverb Type",
        value: drumFX.reverbType.toString().padStart(2, "0"),
      });
      columnIndex++;
    }
    if (drumFX.reverbMix !== undefined) {
      columns[columnIndex % 3]!.push({
        label: "Reverb Mix",
        value: drumFX.reverbMix === 0 ? "Off" : drumFX.reverbMix.toString().padStart(2, "0"),
      });
      columnIndex++;
    }
    if (drumFX.saturatorType !== undefined) {
      columns[columnIndex % 3]!.push({
        label: "Saturator Type",
        value: drumFX.saturatorType.toString().padStart(2, "0"),
      });
      columnIndex++;
    }
    if (drumFX.saturatorMix !== undefined) {
      columns[columnIndex % 3]!.push({
        label: "Saturator Mix",
        value: drumFX.saturatorMix === 0 ? "Off" : drumFX.saturatorMix.toString().padStart(2, "0"),
      });
      columnIndex++;
    }
  }

  // Calculate max rows needed
  const maxRows = Math.max(columns[0]!.length, columns[1]!.length, columns[2]!.length);

  // Draw the grid
  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < 3; col++) {
      const item = columns[col]?.[row];
      if (item) {
        const x = margin + col * columnWidth;
        // Draw label in uppercase
        page.drawText(item.label.toUpperCase(), {
          x,
          y: currentY,
          size: fontSize,
          font: monoFont,
          color: labelColor,
        });
        // Draw value
        page.drawText(item.value, {
          x: x + 100,
          y: currentY,
          size: fontSize,
          font: monoBoldFont,
          color: valueColor,
        });
      }
    }
    currentY -= lineHeight;
  }

  return currentY - 10; // Return the new Y position with some spacing
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
    const page: PDFPage = pdfDoc.addPage([pageWidth, pageHeight]);

    // Fill background with black
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: BACKGROUND,
    });

    let contentStartY = pageHeight - 90;

    // Title and settings header (only on first page)
    if (pageNum === 0) {
      let titleY = pageHeight - 45;

      // Check if any snapshot has a custom title
      const firstSnapshotWithSettings = snapshots.find((s) => s.settings);
      const customTitle = firstSnapshotWithSettings?.settings?.title;

      if (customTitle) {
        // Draw custom title
        page.drawText(customTitle, {
          x: margin,
          y: titleY,
          size: 18,
          font: monoBoldFont,
          color: WHITE,
        });
        titleY -= 25; // Move down for next section
      } else {
        // Draw default title
        page.drawText("ORCHID", {
          x: margin,
          y: titleY,
          size: 18,
          font: monoBoldFont,
          color: WHITE,
        });

        // Subtle subtitle
        page.drawText("Chord Sheet", {
          x: margin + 85,
          y: titleY,
          size: 18,
          font: monoFont,
          color: MEDIUM_GREY,
        });
      }

      if (firstSnapshotWithSettings?.settings) {
        // Draw settings header
        contentStartY = drawSettingsHeader(
          page,
          firstSnapshotWithSettings.settings,
          titleY - 30,
          monoFont,
          monoBoldFont,
          margin,
        );
      } else {
        contentStartY = titleY - 45;
      }
    }

    // Draw chords for this page
    const startY = contentStartY;
    const startChordIdx = pageNum * chordsPerPage;
    const endChordIdx = Math.min(
      startChordIdx + chordsPerPage,
      snapshots.length,
    );

    // Calculate available space for chords on this page
    const footerY = 25;
    const footerMargin = 50; // Space needed for footer
    const availableSpace = startY - footerMargin;
    const chordsOnThisPage = endChordIdx - startChordIdx;
    
    // Adjust spacing based on available space (min 140, max 175)
    const dynamicSpacing = Math.max(
      140,
      Math.min(chordSpacing, availableSpace / chordsOnThisPage)
    );

    for (let i = startChordIdx; i < endChordIdx; i++) {
      const snapshot = snapshots[i];
      if (!snapshot) continue;

      const localIdx = i - startChordIdx;
      const currentY = startY - localIdx * dynamicSpacing;

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
export function downloadPDF(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

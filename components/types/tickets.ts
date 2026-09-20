export interface Ticket {
  _id: string;
  movieTitle: string;
  posterUrl: string | null;
  recipientName: string;
  message: string;
  seatNumber: string;
  barcodeWord: string;
  imageData?: string;
  createdAt: string; // ISO date string from DB
}

export interface TicketPreviewProps {
  ticket: Ticket; // Full ticket for image src
  width?: number;
  height?: number;
}


import { NextRequest, NextResponse } from 'next/server';
import { createTicket } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { movieTitle, posterUrl, recipientName, message, seatNumber, barcodeWord } = body;

    // Validate required fields
    if (!movieTitle || !recipientName || !message || !seatNumber || !barcodeWord) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save ticket to database
    try {
      const ticketId = await createTicket({
        movieTitle,
        posterUrl,
        recipientName,
        message,
        seatNumber,
        barcodeWord,
        imageData: '',
      });

      console.log('Ticket saved to database:', ticketId);

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Ticket sent successfully',
        ticketId,
      });
    } catch (dbError) {
      console.error('Failed to save ticket to database:', dbError);
      return NextResponse.json(
        { error: 'Failed to save ticket to database' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing ticket:', error);
    return NextResponse.json(
      { error: 'Failed to process ticket' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const { newsReports } = await request.json();

    if (!Array.isArray(newsReports)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected an array of news reports.' },
        { status: 400 },
      );
    }

    const summaries: { [key: string]: string } = {};

    for (const report of newsReports) {
      try {
        // Make an internal call to the existing /api/gemini-alerts endpoint
        const geminiAlertsResponse = await fetch('/api/gemini-alerts', {
          // Assuming localhost for internal call
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alertData: {
              level: 'info', // Default level for news summary context
              location: report.source,
              timestamp: report.timestamp,
              reason: report.title,
              severity: 5, // Default severity for news summary context
              affectedAreas: [], // No specific affected areas from news
              estimatedPopulation: 0, // No specific population from news
              newsContent: report.content, // Pass the full news content
              requestType: 'news_summary', // Indicate this is a news summary request
            },
          }),
        });

        if (!geminiAlertsResponse.ok) {
          const errorData = await geminiAlertsResponse.json();
          throw new Error(
            errorData.error ||
              `Failed to summarize news report ${report.id} internally.`,
          );
        }

        const summaryData = await geminiAlertsResponse.json();
        summaries[report.id] = summaryData.explanation;
      } catch (internalError: any) {
        console.error(
          `Error summarizing single news report ${report.id} in batch:`,
          internalError,
        );
        summaries[report.id] =
          `Gagal merangkum berita ini: ${internalError.message || 'Unknown error'}`;
      }
    }

    return NextResponse.json({ summaries });
  } catch (error: any) {
    console.error('Error in summarize-news-batch API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

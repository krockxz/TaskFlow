import { GoogleGenAI } from '@google/genai';
import { requireAuth } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { generateShiftBriefPrompt } from '@/lib/ai/prompts';

/**
 * POST /api/shift-brief
 *
 * Generates an AI-powered shift brief summarizing recent task activity.
 * Streams the response token-by-token for better UX.
 *
 * Uses Google Gemini 2.5 Flash Lite model via @google/genai SDK.
 *
 * Request body:
 * - timeframe: '24h' | '7d' (default: '24h')
 *
 * Returns: Server-Sent Events stream with JSON chunks:
 * - { text: string } - Each chunk of generated text
 * - [DONE] - Stream completion marker
 */
export async function POST(request: Request) {
  const user = await requireAuth();
  const body = await request.json().catch(() => ({}));
  const timeframe = body.timeframe || '24h';

  const hoursAgo = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 24;
  const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  // Check if Gemini API key is configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your environment.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ assignedTo: user.id }, { createdById: user.id }],
      updatedAt: { gte: since },
    },
    include: {
      assignedToUser: { select: { id: true, email: true } },
      createdBy: { select: { id: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const prompt = generateShiftBriefPrompt({
    tasks,
    userName: user.email || 'User',
    timeframe,
  });

  const ai = new GoogleGenAI({ apiKey });

  // Create streaming response with Server-Sent Events format
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash-lite',
          contents: prompt,
        });

        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        console.error('Gemini API error:', error);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Failed to generate brief' })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

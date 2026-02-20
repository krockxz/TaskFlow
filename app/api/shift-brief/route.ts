import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { requireAuth } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { generateShiftBriefPrompt } from '@/lib/ai/prompts';

/**
 * POST /api/shift-brief
 *
 * Generates an AI-powered shift brief summarizing recent task activity.
 * Streams the response token-by-token for better UX.
 *
 * Request body:
 * - timeframe: '24h' | '7d' (default: '24h')
 *
 * Returns: Streaming text response with markdown-formatted summary
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const timeframe = (body.timeframe as string) || '24h';

    // Calculate date threshold
    const hoursAgo = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 24;
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    // Fetch relevant tasks (assigned to user or created by user)
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ assignedTo: user.id }, { createdById: user.id }],
        updatedAt: { gte: since },
      },
      include: {
        assignedToUser: {
          select: { id: true, email: true },
        },
        createdBy: {
          select: { id: true, email: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment.',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate prompt with task context
    const prompt = generateShiftBriefPrompt({
      tasks,
      userName: user.email || 'User',
      timeframe,
    });

    // Stream AI response
    const response = await streamText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful project coordination assistant specializing in async team handoffs.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    // Return streaming response
    return response.toTextStreamResponse();
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle other errors
    console.error('Shift brief generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate shift brief' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

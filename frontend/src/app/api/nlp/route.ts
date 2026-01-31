/**
 * NLP Extraction API Route
 * Uses Google Gemini to extract structured attributes from text
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  extractFromBragText,
  extractFromProjectDescription,
  generateNarrativeTagline,
  analyzeEssayDraft,
  type BragTextExtraction,
  type ProjectExtraction,
} from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, text, context } = body;

    if (!type || !text) {
      return NextResponse.json(
        { error: 'Missing required fields: type and text' },
        { status: 400 }
      );
    }

    let result: BragTextExtraction | ProjectExtraction | { tagline: string } | {
      strengths: string[];
      weaknesses: string[];
      hook_quality: number;
      authenticity: number;
      suggestions: string[];
    };

    switch (type) {
      case 'brag_text':
        result = await extractFromBragText(text);
        break;

      case 'project':
        result = await extractFromProjectDescription(text);
        break;

      case 'tagline':
        if (!context?.spike || !context?.major || !context?.achievement) {
          return NextResponse.json(
            { error: 'Missing context for tagline: spike, major, achievement' },
            { status: 400 }
          );
        }
        const tagline = await generateNarrativeTagline(
          context.spike,
          context.major,
          context.achievement
        );
        result = { tagline };
        break;

      case 'essay':
        result = await analyzeEssayDraft(text);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown extraction type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      extraction: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('NLP API error:', error);
    return NextResponse.json(
      {
        error: 'NLP extraction failed',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

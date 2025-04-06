
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { topic, model }: { topic: string, model: string } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: topic,
        stream: false, 
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from Llama API' }, { status: 500 });
    }

    const data = await response.json();
    const questions = data.response.split('\n').filter(Boolean);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Something went wrong, please try again.' }, { status: 500 });
  }
}



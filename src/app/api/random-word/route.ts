import { NextResponse } from 'next/server';
import { WORD_LIST } from '../words';

export async function GET() {
  const index = Math.floor(Math.random() * WORD_LIST.length);
  const word = WORD_LIST[index];
  return NextResponse.json({ word });
} 
import { getTodayKey } from '@/lib/utils';

const WORD_LIST = ['WORLD', 'HAPPY', 'SMILE', 'BEACH', 'DREAM']; // Your word list

export async function GET() {
  const todayKey = getTodayKey();
  
  // Use the date as a seed to get the same word for the whole day
  const index = Math.abs(todayKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % WORD_LIST.length;
  const word = WORD_LIST[index];

  return Response.json({ word });
} 
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await dbConnect();

  // @ts-ignore
  const test = await Test.findOne({ _id: id, createdBy: userId });

  if (!test) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }

  return NextResponse.json({ test });
}

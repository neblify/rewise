import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await currentAuth();

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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

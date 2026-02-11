import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/test/[id]/route';
import { currentAuth } from '@/lib/auth-wrapper';
import Test from '@/lib/db/models/Test';
import { NextRequest, NextResponse } from 'next/server';

// Mock Dependencies
vi.mock('@/lib/auth-wrapper', () => ({
  currentAuth: vi.fn(),
}));

vi.mock('@/lib/db/connect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

// Mock Mongoose Model with chainable populate
vi.mock('@/lib/db/models/Test', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock('@/lib/db/models/Question', () => ({}));

// Helper to create mock request
function createMockRequest(url: string) {
  return {
    nextUrl: new URL(url, 'http://localhost'),
  } as unknown as NextRequest;
}

describe('API Route: GET /api/test/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (currentAuth as any).mockResolvedValue({ userId: null });
    const req = createMockRequest('http://localhost/api/test/123');
    const params = Promise.resolve({ id: '123' });

    const response = await GET(req, { params });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('should return 404 if test is not found', async () => {
    (currentAuth as any).mockResolvedValue({ userId: 'user_123' });
    (Test.findOne as any).mockReturnValue({
      populate: vi.fn().mockResolvedValue(null),
    });

    const req = createMockRequest('http://localhost/api/test/123');
    const params = Promise.resolve({ id: '123' });

    const response = await GET(req, { params });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Test not found');
  });

  it('should return test data if found', async () => {
    (currentAuth as any).mockResolvedValue({ userId: 'user_123' });

    const mockTest = {
      _id: '123',
      title: 'Sample Test',
      createdBy: 'user_123',
    };
    (Test.findOne as any).mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockTest),
    });

    const req = createMockRequest('http://localhost/api/test/123');
    const params = Promise.resolve({ id: '123' });

    const response = await GET(req, { params });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.test).toEqual(mockTest);

    // Verify query ensures user owns the test
    expect(Test.findOne).toHaveBeenCalledWith({
      _id: '123',
      createdBy: 'user_123',
    });
  });
});

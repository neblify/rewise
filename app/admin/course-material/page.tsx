import { getCourseMaterials } from './actions';
import IngestForm from './IngestForm';
import DeleteMaterialButton from './DeleteMaterialButton';

export const dynamic = 'force-dynamic';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ready: 'bg-green-100 text-green-800',
    processing: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  );
}

function SourceBadge({ sourceType }: { sourceType: string }) {
  const styles: Record<string, string> = {
    pdf: 'bg-blue-100 text-blue-800',
    text: 'bg-purple-100 text-purple-800',
    url: 'bg-orange-100 text-orange-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[sourceType] || 'bg-gray-100 text-gray-800'}`}
    >
      {sourceType.toUpperCase()}
    </span>
  );
}

export default async function CourseMaterialPage() {
  const materials = await getCourseMaterials();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Course Material</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload and manage course material for vector search and AI-powered
          question generation.
        </p>
      </div>

      <IngestForm />

      {/* Materials Table */}
      <div className="bg-card rounded-xl border-2 border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            Uploaded Materials ({materials.length})
          </h2>
        </div>

        {materials.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No course materials uploaded yet. Use the form above to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Source
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Board / Grade
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Subject / Topic
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Chunks
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {materials.map(
                  (m: {
                    _id: string;
                    title: string;
                    fileName: string;
                    sourceType: string;
                    board: string;
                    grade: string;
                    subject: string;
                    topic: string;
                    status: string;
                    errorMessage?: string;
                    chunkCount: number;
                    createdAt: string;
                  }) => (
                    <tr
                      key={m._id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {m.title}
                        </div>
                        <div
                          className="text-xs text-muted-foreground truncate max-w-[200px]"
                          title={m.fileName}
                        >
                          {m.fileName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <SourceBadge sourceType={m.sourceType} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {m.board} / {m.grade}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {m.subject} / {m.topic}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={m.status} />
                        {m.errorMessage && (
                          <div
                            className="text-xs text-red-600 mt-1 truncate max-w-[150px]"
                            title={m.errorMessage}
                          >
                            {m.errorMessage}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {m.chunkCount}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <DeleteMaterialButton
                          materialId={m._id}
                          materialTitle={m.title}
                          chunkCount={m.chunkCount}
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

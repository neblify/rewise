'use client';

import { useState } from 'react';
import { updateFriendProfile, deleteFriend } from '../actions';

export type FriendItem = {
  _id: string;
  email: string;
  challengeTestId?: string;
  challengeResultId?: string;
  scoreToBeat?: number;
  name?: string;
  location?: string;
  class?: string;
  linkedClerkId?: string;
};

export default function FriendsListClient({
  initialFriends,
}: {
  initialFriends: FriendItem[];
}) {
  const [friends, setFriends] = useState(initialFriends);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    location: string;
    class: string;
  }>({
    name: '',
    location: '',
    class: '',
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const startEdit = (f: FriendItem) => {
    setEditingId(f._id);
    setEditForm({
      name: f.name ?? '',
      location: f.location ?? '',
      class: f.class ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await updateFriendProfile(editingId, {
        name: editForm.name || undefined,
        location: editForm.location || undefined,
        class: editForm.class || undefined,
      });
      if (res.success) {
        setFriends(prev =>
          prev.map(p => (p._id === editingId ? { ...p, ...editForm } : p))
        );
        setEditingId(null);
      } else {
        alert(res.error || 'Failed to update');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this friend from your list?')) return;
    setDeletingId(id);
    try {
      const res = await deleteFriend(id);
      if (res.success) {
        setFriends(prev => prev.filter(f => f._id !== id));
      } else {
        alert(res.error || 'Failed to delete friend');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setDeletingId(current => (current === id ? null : current));
    }
  };

  if (friends.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        No friends invited yet. Invite people from the Open Challenge page after
        taking an assessment.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 font-medium text-foreground">
                Email
              </th>
              <th className="text-left p-3 font-medium text-foreground">
                Name
              </th>
              <th className="text-left p-3 font-medium text-foreground">
                Location
              </th>
              <th className="text-left p-3 font-medium text-foreground">
                Class
              </th>
              <th className="text-left p-3 font-medium text-foreground">
                Score to beat
              </th>
              <th className="text-left p-3 font-medium text-foreground w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {friends.map(f => (
              <tr key={f._id} className="border-b border-border last:border-0">
                <td className="p-3 text-foreground">{f.email}</td>
                {editingId === f._id ? (
                  <>
                    <td className="p-2">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => {
                          setEditForm(prev => ({
                            ...prev,
                            name: e.target.value,
                          }));
                        }}
                        placeholder="Name"
                        className="w-full rounded border border-border px-2 py-1 text-foreground bg-background"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={e => {
                          setEditForm(prev => ({
                            ...prev,
                            location: e.target.value,
                          }));
                        }}
                        placeholder="Location"
                        className="w-full rounded border border-border px-2 py-1 text-foreground bg-background"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={editForm.class}
                        onChange={e => {
                          setEditForm(prev => ({
                            ...prev,
                            class: e.target.value,
                          }));
                        }}
                        placeholder="Class"
                        className="w-full rounded border border-border px-2 py-1 text-foreground bg-background"
                      />
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {f.scoreToBeat ?? '—'}
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={saving}
                        className="text-primary hover:underline disabled:opacity-50 mr-2"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 text-foreground">{f.name ?? '—'}</td>
                    <td className="p-3 text-foreground">{f.location ?? '—'}</td>
                    <td className="p-3 text-foreground">{f.class ?? '—'}</td>
                    <td className="p-3 text-muted-foreground">
                      {f.scoreToBeat ?? '—'}
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => {
                          startEdit(f);
                        }}
                        className="text-primary hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(f._id)}
                        disabled={deletingId === f._id}
                        className="text-destructive hover:underline disabled:opacity-50"
                      >
                        {deletingId === f._id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

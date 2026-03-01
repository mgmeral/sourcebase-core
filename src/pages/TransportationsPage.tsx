import { useEffect, useState } from 'react';
import {
  createTransportation,
  deleteTransportation,
  getTransportations,
  updateTransportation
} from '../api/transportations';
import { extractErrorMessage } from '../api/fetcher';
import type { Transportation } from '../types';
import { Modal } from '../layout/Modal';
import { downloadCsv } from '../utils/download';

export function TransportationsPage() {
  const [items, setItems] = useState<Transportation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transportation | null>(null);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await getTransportations());
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load transportations'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setFormError('');
    setOpen(true);
  };

  const openEdit = (item: Transportation) => {
    setEditing(item);
    setName(item.name);
    setFormError('');
    setOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }

    setFormError('');
    setSaving(true);
    try {
      if (editing) {
        await updateTransportation(editing.id, { ...editing, name: name.trim() });
      } else {
        await createTransportation({ name: name.trim() });
      }
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not save transportation'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this transportation?')) return;
    try {
      await deleteTransportation(id);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not delete transportation'));
    }
  };

  return (
    <section className="card">
      <div className="card-header">
        <h2>Transportations</h2>
        <div className="actions-end">
          <button
            className="btn ghost"
            onClick={() => downloadCsv('transportations.csv', ['Name'], items.map((item) => [item.name]))}
            disabled={items.length === 0}
          >
            Hepsini İndir
          </button>
          <button className="btn" onClick={openCreate}>
            Create
          </button>
        </div>
      </div>
      {loading ? <p>Loading...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <button className="btn small" onClick={() => openEdit(item)}>
                    Edit
                  </button>{' '}
                  <button className="btn danger small" onClick={() => remove(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {open && (
        <Modal title={editing ? 'Edit Transportation' : 'Create Transportation'} onClose={() => setOpen(false)}>
          <form className="form" onSubmit={submit}>
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            {formError ? <p className="error">{formError}</p> : null}
            <div className="actions-end">
              <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={saving || !name.trim()}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

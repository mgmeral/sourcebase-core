import { useEffect, useMemo, useState } from 'react';
import { createLocation, deleteLocation, getLocations, updateLocation } from '../api/locations';
import { extractErrorMessage } from '../api/fetcher';
import type { Location, LocationCreateRequest } from '../types';
import { Modal } from '../layout/Modal';
import { downloadCsv } from '../utils/download';

const initialForm: LocationCreateRequest = { code: '', name: '', country: '', city: '' };

function validate(form: LocationCreateRequest) {
  const errors: Partial<Record<keyof LocationCreateRequest, string>> = {};
  if (!form.code.trim()) errors.code = 'Code is required';
  else if (form.code.trim().length < 3 || form.code.trim().length > 16) errors.code = 'Code must be 3-16 chars';
  if (!form.name.trim()) errors.name = 'Name is required';
  else if (form.name.trim().length > 128) errors.name = 'Name max 128 chars';
  if (!form.country.trim()) errors.country = 'Country is required';
  else if (form.country.trim().length > 64) errors.country = 'Country max 64 chars';
  if (!form.city.trim()) errors.city = 'City is required';
  else if (form.city.trim().length > 64) errors.city = 'City max 64 chars';
  return errors;
}

export function LocationsPage() {
  const [items, setItems] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState<LocationCreateRequest>(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const errors = useMemo(() => validate(form), [form]);
  const isFormValid = Object.keys(errors).length === 0;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await getLocations());
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load locations'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setFormError('');
    setOpen(true);
  };

  const openEdit = (item: Location) => {
    setEditing(item);
    setForm({ code: item.code, name: item.name, country: item.country, city: item.city });
    setFormError('');
    setOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!isFormValid) return;
    setSaving(true);
    try {
      if (editing) {
        await updateLocation(editing.id, form);
      } else {
        await createLocation(form);
      }
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not save location'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this location?')) return;
    try {
      await deleteLocation(id);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not delete location'));
    }
  };

  return (
    <section className="card">
      <div className="card-header">
        <h2>Locations</h2>
        <div className="actions-end">
          <button
            className="btn ghost"
            onClick={() =>
              downloadCsv(
                'locations.csv',
                ['Code', 'Name', 'Country', 'City'],
                items.map((item) => [item.code, item.name, item.country, item.city])
              )
            }
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
              <th>Code</th>
              <th>Name</th>
              <th>Country</th>
              <th>City</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{item.country}</td>
                <td>{item.city}</td>
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
        <Modal title={editing ? 'Edit Location' : 'Create Location'} onClose={() => setOpen(false)}>
          <form className="form" onSubmit={submit}>
            <label>
              Code
              <input
                value={form.code}
                onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                maxLength={16}
                required
              />
              {errors.code ? <small className="error">{errors.code}</small> : null}
            </label>
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                maxLength={128}
                required
              />
              {errors.name ? <small className="error">{errors.name}</small> : null}
            </label>
            <label>
              Country
              <input
                value={form.country}
                onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
                maxLength={64}
                required
              />
              {errors.country ? <small className="error">{errors.country}</small> : null}
            </label>
            <label>
              City
              <input
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                maxLength={64}
                required
              />
              {errors.city ? <small className="error">{errors.city}</small> : null}
            </label>
            {formError ? <p className="error">{formError}</p> : null}
            <div className="actions-end">
              <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={!isFormValid || saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

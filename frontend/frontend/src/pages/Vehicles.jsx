import StatusPill from "../components/StatusPill.jsx";
import { useState, useEffect } from "react";
import { api } from "../api";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", plate: "", capacity: "", odometer: "", status: "available", type: "van" });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  const fetchVehicles = async () => {
    try {
      const data = await api.vehicles.getAll();
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    setErrors((err) => {
      const copy = { ...err };
      if (name === 'name') {
        if (!value || value.trim().length < 2) copy.name = 'Enter vehicle name (min 2 chars)'; else delete copy.name;
      }
      if (name === 'plate') {
        if (!value || !/^[A-Z0-9\- ]{4,}$/i.test(value)) copy.plate = 'Enter a valid plate (alphanumeric, min 4 chars)'; else delete copy.plate;
      }
      if (name === 'capacity') {
        const n = Number(value);
        if (!value || isNaN(n) || n <= 0) copy.capacity = 'Capacity must be a positive number'; else delete copy.capacity;
      }
      if (name === 'odometer') {
        const n = Number(value);
        if (value !== '' && (isNaN(n) || n < 0)) copy.odometer = 'Odometer must be 0 or greater'; else delete copy.odometer;
      }
      return copy;
    });
  };

  const validateForm = () => {
    const copy = {};
    if (!form.name || form.name.trim().length < 2) copy.name = 'Enter vehicle name (min 2 chars)';
    if (!form.plate || !/^[A-Z0-9\- ]{4,}$/i.test(form.plate)) copy.plate = 'Enter a valid plate (alphanumeric, min 4 chars)';
    const cap = Number(form.capacity);
    if (!form.capacity || isNaN(cap) || cap <= 0) copy.capacity = 'Capacity must be a positive number';
    if (form.odometer !== '') {
      const odo = Number(form.odometer);
      if (isNaN(odo) || odo < 0) copy.odometer = 'Odometer must be 0 or greater';
    }
    setErrors(copy);
    return Object.keys(copy).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const vehicleData = {
        name: form.name,
        plate: form.plate,
        capacity: Number(form.capacity),
        odometer: Number(form.odometer || 0),
        status: form.status,
        type: form.type,
      };

      if (editingId) {
        await api.vehicles.update(editingId, vehicleData);
      } else {
        await api.vehicles.create(vehicleData);
      }
      
      fetchVehicles();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const editVehicle = (v) => {
    setForm({
      name: v.name || '',
      plate: v.plate || '',
      capacity: String(v.capacity || ''),
      odometer: String(v.odometer ?? ''),
      status: v.status || 'available',
      type: v.type || 'van'
    });
    setEditingId(v._id);
    setShowForm(true);
    setErrors({});
  };

  const deleteVehicle = async (v) => {
    if (!window.confirm(`Remove vehicle ${v.name} (${v.plate})?`)) return;
    try {
      await api.vehicles.delete(v._id);
      fetchVehicles();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", plate: "", capacity: "", odometer: "", status: "available", type: "van" });
    setErrors({});
    setShowForm(false);
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading vehicles...</div></div>;
  }

  return (
    <div className="container">
      <h1 className="page-title">Vehicle Registry</h1>

      {error && <div className="error-message" style={{marginBottom: 16}}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <button className="primary-btn" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add Vehicle'}</button>
        </div>
      </div>

      {showForm && (
        <form className="card vehicle-form" onSubmit={handleSubmit} style={{ marginBottom: 18 }}>
          <div className="form-row">
            <label className="form-label">Vehicle Name / Model</label>
            <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="e.g. Van-05" />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>
          <div className="form-row">
            <label className="form-label">License Plate (Unique)</label>
            <input name="plate" value={form.plate} onChange={handleChange} className="form-input" placeholder="e.g. MH12AB1234" disabled={!!editingId} />
            {errors.plate && <div className="error-text">{errors.plate}</div>}
          </div>
          <div className="form-row">
            <label className="form-label">Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="form-input">
              <option value="van">Van</option>
              <option value="truck">Truck</option>
              <option value="bike">Bike</option>
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Max Load Capacity (kg)</label>
            <input name="capacity" value={form.capacity} onChange={handleChange} className="form-input" type="number" placeholder="500" />
            {errors.capacity && <div className="error-text">{errors.capacity}</div>}
          </div>
          <div className="form-row">
            <label className="form-label">Odometer</label>
            <input name="odometer" value={form.odometer} onChange={handleChange} className="form-input" type="number" placeholder="0" />
            {errors.odometer && <div className="error-text">{errors.odometer}</div>}
          </div>
          <div className="form-row">
            <label className="form-label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="form-input">
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="in_shop">In Shop</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button type="submit" className="primary-btn">{editingId ? 'Save Changes' : 'Save Vehicle'}</button>
            {editingId && (
              <button type="button" className="primary-btn" style={{ background: 'transparent', color: 'var(--text)', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.04)' }} onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Plate</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>No vehicles found</td></tr>
            ) : (
              vehicles.map((v) => (
                <tr key={v._id}>
                  <td>{v.name}</td>
                  <td>{v.plate}</td>
                  <td>{v.type}</td>
                  <td>{v.capacity} kg</td>
                  <td>{v.odometer ?? '-'}</td>
                  <td><StatusPill status={v.status} /></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="primary-btn" style={{ background: 'transparent', color: 'var(--text)', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.04)', marginRight: 6 }} onClick={() => editVehicle(v)}>Edit</button>
                    <button className="primary-btn" style={{ background: 'transparent', color: '#ffb4b4', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.04)' }} onClick={() => deleteVehicle(v)}>Remove</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Vehicles;

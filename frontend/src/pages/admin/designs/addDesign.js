import React, { useEffect, useReducer, useState } from 'react';
import { createFood, deleteFood, getAll, getAllByTag, getAllTags, search, updateFood } from '../../../Services/foodService.js';
import classes from './addDesign.module.css';
import { useAuth } from '../../../hooks/useAuth.js';
import { toast } from 'react-toastify';
import { Buffer } from 'buffer';
import Price from '../../../Components/price/Price.js';

const initialState = { foods: [], tags: [] };
const categoryOptions = ['Birthday Cakes', 'Wedding Cakes', 'Cup Cakes', 'Gateaux'];

const reducer = (state, action) => {
  switch (action.type) {
    case 'FOODS_LOADED':
      return { ...state, foods: action.payload };
    case 'TAGS_LOADED':
      return { ...state, tags: [...action.payload].sort((a, b) => a.name.localeCompare(b.name)) };
    default:
      return state;
  }
};

export default function AdminDesignPage() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { foods, tags } = state;
  const [activeTag, setActiveTag] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingFood, setEditingFood] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    imageData: '',
    category: '',
    available: true,
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getAllTags()
      .then(tags => {
        dispatch({ type: 'TAGS_LOADED', payload: tags });
      });
    let loader = getAll;
    if (activeTag) loader = () => getAllByTag(activeTag);
    else if (searchTerm) loader = () => search(searchTerm);
    loader()
      .then(foods => {
        dispatch({ type: 'FOODS_LOADED', payload: foods });
        setIsLoading(false);
      });
  }, [activeTag, searchTerm]);

  useEffect(() => {
    if (editingFood) {
      let imagePreview = '';
      if (editingFood.imageData) {
        if (typeof editingFood.imageData === 'string' && editingFood.imageData.startsWith('data:image/')) {
          imagePreview = editingFood.imageData;
        } else if (editingFood.imageData.data) {
          const base64String = Buffer.from(editingFood.imageData.data).toString('base64');
          imagePreview = `data:image/jpeg;base64,${base64String}`;
        }
      }
      setForm({ ...editingFood, imageData: imagePreview });
    } else {
      setForm({
        name: '',
        description: '',
        price: 0,
        imageData: '',
        category: '',
        available: true,
      });
    }
    setError(null);
  }, [editingFood]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : name === 'price' || name === 'size' || name === 'pieces'
          ? parseFloat(value)
          : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, imageData: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (editingFood) {
        await updateFood(editingFood.id, form, token);
        toast.success('Updated successfully!');
      } else {
        await createFood(form, token);
        toast.success('Added successfully!');
      }
      setEditingFood(null);
      setIsLoading(true);
      const updatedFoods = await getAll();
      dispatch({ type: 'FOODS_LOADED', payload: updatedFoods });
      setIsLoading(false);
      setForm({
        name: '',
        description: '',
        price: 0,
        imageData: '',
        category: '',
        available: true,
      });
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this design?')) return;
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      await deleteFood(id, token);
      toast.success('Deleted successfully!');
      const updatedFoods = await getAll();
      dispatch({ type: 'FOODS_LOADED', payload: updatedFoods });
      if (editingFood?.id === id) setEditingFood(null);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  if (!user?.isAdmin) return <p className={classes.noAccess}>Access Denied. Admins only.</p>;

  return (
    <div className={classes.container}>
      <header className={classes.adminHeader}>
        <h1>Manage Cake Designs</h1>
        <input
          className={classes.input}
          placeholder="Search cakes..."
          type="search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          aria-label="Search cakes"
        />
      </header>

      <section className={classes.tagsSection}>
        <h2 className={classes.sectionTitle}>Filter by Category</h2>
        <div className={classes.tagsContainer}>
          {tags.map(tag => (
            <button
              key={tag.name}
              className={`${classes.tagItem} ${activeTag === tag.name ? classes.activeTag : ''}`}
              onClick={() => setActiveTag(activeTag === tag.name ? null : tag.name)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </section>

      <section className={classes.adminContent}>
        <aside className={classes.foodList}>
          {isLoading ? (
            <div className={classes.loadingSpinner}>
              <div className={classes.spinner}></div>
              Loading cakes...
            </div>
          ) : foods.length === 0 ? (
            <p>No cakes found.</p>
          ) : (
            foods.map(food => (
              <div
                key={food.id}
                className={`${classes.foodItem} ${editingFood?.id === food.id ? classes.activeFood : ''}`}
                onClick={() => setEditingFood(food)}
              >
                <img
                  src={`data:image/jpeg;base64,${Buffer.from(food.imageData.data).toString('base64')}`}
                  alt={food.name}
                  className={classes.foodImage}
                />
                <div>
                  <h3>{food.name}</h3>
                  <p><Price price={food.price}></Price></p>
                </div>
                <button
                  className={classes.deleteButton}
                  aria-label={`Delete ${food.name}`}
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(food.id);
                  }}
                >
                  &times;
                </button>
              </div>
            ))
          )}
          <button
            className={classes.addNewButton}
            onClick={() => setEditingFood(null)}
          >
            + Add New Design
          </button>
        </aside>

        <main className={classes.formSection}>
          <h2>{editingFood ? 'Edit Design' : 'Add New Design'}</h2>
          {error && <p className={classes.error}>{error}</p>}
          <form onSubmit={handleSubmit} className={classes.form}>
            <div className={classes.formGrid}>
              <label className={classes.label}>
                Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  className={classes.input}
                />
              </label>

              <label className={classes.label}>
                Price (LKR)
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleInputChange}
                  required
                  className={classes.input}
                />
              </label>

              <label className={classes.label} style={{ gridColumn: '1 / -1' }}>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  className={classes.textarea}
                />
              </label>

              <label className={classes.label}>
                Upload Image
                <input
                  name="imageData"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={classes.input}
                />
                {form.imageData && (
                  <img
                    src={form.imageData}
                    alt="Preview"
                    style={{ maxWidth: '180px', marginTop: '0.5rem', borderRadius: '10px' }}
                  />
                )}
              </label>

              <label className={classes.label}>
                Category
                <input
                  list="categories"
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  required
                  className={classes.input}
                />
                <datalist id="categories">
                  {categoryOptions.map(opt => <option key={opt} value={opt} />)}
                </datalist>
              </label>

              <label className={classes.checkboxLabel}>
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleInputChange}
                />
                Available
              </label>
            </div>

            <div className={classes.buttonGroup}>
              <button
                type="submit"
                disabled={submitting}
                className={classes.submitButton}
              >
                {submitting ? (editingFood ? 'Updating...' : 'Adding...') : editingFood ? 'Update' : 'Add'}
              </button>

              {editingFood && (
                <button
                  type="button"
                  className={classes.cancelButton}
                  onClick={() => setEditingFood(null)}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </main>
      </section>
    </div>
  );
}

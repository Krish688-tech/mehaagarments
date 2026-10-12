import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const AdminUniqueCategories = () => {
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    displayOrder: 0,
    isActive: true,
  });

  // ==========================================
  // FETCH UNIQUE CATEGORIES
  // ==========================================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/unique-categories/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch unique categories"
        );
      }

      setCategories(data.categories || []);
    } catch (error) {
      console.error("Fetch Unique Categories Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // GENERATE SLUG
  // ==========================================

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // ==========================================
  // NAME CHANGE
  // ==========================================

  const handleNameChange = (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,
      name: value,
      slug: editingCategory
        ? previous.slug
        : generateSlug(value),
    }));
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      displayOrder: 0,
      isActive: true,
    });

    setEditingCategory(null);
    setShowForm(false);
  };

  // ==========================================
  // OPEN CREATE FORM
  // ==========================================

  const handleAddNew = () => {
    setEditingCategory(null);

    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      displayOrder: categories.length,
      isActive: true,
    });

    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const handleEdit = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image: category.image || "",
      displayOrder: category.displayOrder ?? 0,
      isActive: category.isActive ?? true,
    });

    setShowForm(true);
  };

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        displayOrder: Number(formData.displayOrder),
        isActive: formData.isActive,
      };

      if (!payload.name) {
        throw new Error("Category name is required");
      }

      if (!payload.slug) {
        throw new Error("Category slug is required");
      }

      if (!payload.image) {
        throw new Error("Category image is required");
      }

      const url = editingCategory
        ? `${import.meta.env.VITE_API_URL}/unique-categories/admin/${editingCategory._id}`
        : `${import.meta.env.VITE_API_URL}/unique-categories/admin`;

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save unique category"
        );
      }

      await fetchCategories();

      resetForm();
    } catch (error) {
      console.error("Save Unique Category Error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // TOGGLE ACTIVE STATUS
  // ==========================================

  const handleToggleStatus = async (category) => {
    try {
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/unique-categories/admin/${category._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !category.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update category status"
        );
      }

      await fetchCategories();
    } catch (error) {
      console.error("Toggle Category Status Error:", error);
      setError(error.message);
    }
  };

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}"?\n\nThis should only be done if this collection is no longer needed.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/unique-categories/admin/${category._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete category"
        );
      }

      await fetchCategories();
    } catch (error) {
      console.error("Delete Unique Category Error:", error);
      setError(error.message);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm tracking-wide text-gray-500">
          Loading unique collections...
        </p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-500">
            Mehaa Garments
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-gray-900 md:text-3xl">
            Unique Collections
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Manage the special collections displayed in the
            Our Unique section of your storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + Add Collection
        </button>

      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ======================================
          FORM
      ====================================== */}

      {showForm && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCategory
                  ? "Edit Collection"
                  : "Create Collection"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Configure the collection displayed on the
                storefront.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-500 transition hover:text-black"
            >
              Cancel
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >

            {/* NAME */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Collection Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Cotton Elegance"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* SLUG */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Slug
              </label>

              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="cotton-elegance"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* IMAGE */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image URL
              </label>

              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://res.cloudinary.com/..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              />

              {formData.image && (
                <div className="mt-4 h-40 w-32 overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={formData.image}
                    alt="Collection preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Lightweight sarees perfect for everyday comfort and grace"
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* DISPLAY ORDER */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Display Order
              </label>

              <input
                type="number"
                name="displayOrder"
                min="0"
                value={formData.displayOrder}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* ACTIVE */}

            <div className="flex items-center gap-3 md:pt-8">
              <input
                id="isActive"
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4"
              />

              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                Active Collection
              </label>
            </div>

            {/* SUBMIT */}

            <div className="flex justify-end gap-3 md:col-span-2">

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingCategory
                  ? "Update Collection"
                  : "Create Collection"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* ======================================
          COLLECTION LIST
      ====================================== */}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">
            Collections
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {categories.length} collection
            {categories.length !== 1 ? "s" : ""}
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-500">
              No unique collections found.
            </p>

            <button
              type="button"
              onClick={handleAddNew}
              className="mt-4 text-sm font-medium text-black underline"
            >
              Create your first collection
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">

            {categories.map((category) => (
              <div
                key={category._id}
                className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
              >

                {/* LEFT */}

                <div className="flex min-w-0 items-center gap-4">

                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">

                    <h3 className="truncate font-medium text-gray-900">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      /{category.slug}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {category.description ||
                        "No description"}
                    </p>

                  </div>
                </div>

                {/* MIDDLE */}

                <div className="flex items-center gap-6 text-sm">

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Order
                    </p>

                    <p className="mt-1 font-medium text-gray-700">
                      {category.displayOrder}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Products
                    </p>

                    <p className="mt-1 font-medium text-gray-700">
                      {category.productCount ?? 0}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleStatus(category)
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      category.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {category.isActive
                      ? "Active"
                      : "Inactive"}
                  </button>

                </div>

                {/* ACTIONS */}

                <div className="flex items-center gap-3">

                  <button
                    type="button"
                    onClick={() => handleEdit(category)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(category)
                    }
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUniqueCategories;
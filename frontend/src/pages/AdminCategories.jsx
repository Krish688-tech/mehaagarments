import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const AdminCategories = () => {
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    displayOrder: 0,
  });

  const [saving, setSaving] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/categories/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load categories",
        );
      }

      setCategories(data.categories || []);
    } catch (error) {
      console.error("Fetch Categories Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  // ==========================================
  // SEARCH + FILTER
  // ==========================================

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        category.name.toLowerCase().includes(searchValue) ||
        category.slug.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          category.isActive) ||
        (statusFilter === "inactive" &&
          !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  // ==========================================
  // FORM
  // ==========================================

  const openCreateForm = () => {
    setEditingCategory(null);

    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      displayOrder: 0,
    });

    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image: category.image || "",
      displayOrder: category.displayOrder || 0,
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingCategory(null);
  };

  // ==========================================
  // INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    if (!formData.slug.trim()) {
      alert("Category slug is required");
      return;
    }

    if (!formData.image.trim()) {
      alert("Category image is required");
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingCategory);

      const url = isEditing
        ? `${API_URL}/categories/admin/${editingCategory._id}`
        : `${API_URL}/categories/admin`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          displayOrder: Number(formData.displayOrder),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              isEditing ? "update" : "create"
            } category`,
        );
      }

      alert(
        isEditing
          ? "Category updated successfully"
          : "Category created successfully",
      );

      closeForm();
      await fetchCategories();
    } catch (error) {
      console.error("Save Category Error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // STATUS
  // ==========================================

  const handleStatusChange = async (category) => {
    const action = category.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${category.name}"?`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/categories/admin/${category._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !category.isActive,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update category status",
        );
      }

      await fetchCategories();
    } catch (error) {
      console.error(
        "Update Category Status Error:",
        error,
      );

      alert(error.message);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}" permanently?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/categories/admin/${category._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete category",
        );
      }

      alert("Category deleted successfully");

      await fetchCategories();
    } catch (error) {
      console.error("Delete Category Error:", error);

      alert(error.message);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">
          Loading categories...
        </p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="p-8">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase">
            Product Management
          </p>

          <h1 className="text-4xl font-light mt-2">
            Categories
          </h1>

          <p className="text-gray-500 mt-2">
            Manage product categories, visibility,
            ordering, and category information.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="px-5 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          + Add Category
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* SEARCH / FILTER */}

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search category by name or slug..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="flex-1 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none"
        >
          <option value="all">
            All Categories
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

        <button
          type="button"
          onClick={fetchCategories}
          className="px-5 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* TABLE */}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
          <div>
            <h2 className="font-medium">
              Category Accounts
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {filteredCategories.length} categories found
            </p>
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No categories found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">
                    Category
                  </th>

                  <th className="px-6 py-4">
                    Slug
                  </th>

                  <th className="px-6 py-4">
                    Products
                  </th>

                  <th className="px-6 py-4">
                    Order
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map(
                  (category) => (
                    <tr
                      key={category._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                          />

                          <div>
                            <p className="font-medium text-gray-900">
                              {category.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              {category.description ||
                                "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-500">
                        /{category.slug}
                      </td>

                      <td className="px-6 py-5 text-sm">
                        {category.productCount || 0}
                      </td>

                      <td className="px-6 py-5 text-sm">
                        {category.displayOrder}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                            category.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              category.isActive
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />

                          {category.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(category)
                            }
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                category,
                              )
                            }
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                          >
                            {category.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(category)
                            }
                            className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium">
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Configure category information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="text-gray-500 hover:text-black text-xl"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Name
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Cotton Sarees"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Slug
                </label>

                <input
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="cotton-sarees"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Category description..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Image URL
                </label>

                <input
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Display Order
                </label>

                <input
                  type="number"
                  min="0"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="px-5 py-3 border border-gray-200 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 bg-black text-white rounded-lg disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
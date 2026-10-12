import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Upload, X, ArrowLeft, Save } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const initialForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  images: [],
  price: "",
  oldPrice: "",
  category: "",
  uniqueCategories: [],
  sareeType: "",
  fabric: "",
  color: "",
  work: "",
  occasion: "",
  blousePiece: "",
  sareeLength: "",
  washCare: "",
  countryOfOrigin: "India",
  stock: 1,

  // Shipping / package information
  weightKg: "",
  lengthCm: "",
  breadthCm: "",
  heightCm: "",

  isActive: true,
  isFeatured: false,
  isBestSeller: false,
};

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  const [mainImagePreview, setMainImagePreview] = useState("");
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  // =====================================================
  // FETCH NORMAL + UNIQUE CATEGORIES
  // =====================================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setFetchingCategories(true);

        const [categoryResponse, uniqueResponse] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/unique-categories`),
        ]);

        setCategories(
          Array.isArray(categoryResponse.data?.categories)
            ? categoryResponse.data.categories
            : [],
        );

        setUniqueCategories(
          Array.isArray(uniqueResponse.data?.categories)
            ? uniqueResponse.data.categories
            : Array.isArray(uniqueResponse.data?.uniqueCategories)
              ? uniqueResponse.data.uniqueCategories
              : [],
        );
      } catch (error) {
        console.error("Failed to fetch categories:", error);

        Swal.fire({
          icon: "error",
          title: "Unable to load categories",
          text:
            error.response?.data?.message ||
            "Please refresh the page and try again.",
          confirmButtonColor: "#000000",
        });
      } finally {
        setFetchingCategories(false);
      }
    };

    fetchCategories();
  }, [token]);

  // =====================================================
  // CLOUDINARY IMAGE UPLOAD
  // =====================================================

  const uploadImageToCloudinary = async (file) => {
    if (!file) {
      throw new Error("No image selected.");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG and WebP images are allowed.");
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error("Each image must be smaller than 5MB.");
    }

    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }

    const { data } = await axios.get(`${API_URL}/uploads/signature`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("api_key", data.apiKey);
    uploadData.append("timestamp", data.timestamp);
    uploadData.append("folder", data.folder);
    uploadData.append("signature", data.signature);

    const uploadResponse = await axios.post(
      `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
      uploadData,
    );

    if (!uploadResponse.data?.secure_url) {
      throw new Error("Cloudinary did not return an image URL.");
    }

    return uploadResponse.data.secure_url;
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // GENERATE SLUG
  // =====================================================

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((previous) => ({
      ...previous,
      slug,
    }));
  };

  // =====================================================
  // UNIQUE CATEGORY SELECTION
  // =====================================================

  const handleUniqueCategoryChange = (id) => {
    setFormData((prev) => {
      const exists = prev.uniqueCategories.includes(id);

      return {
        ...prev,
        uniqueCategories: exists
          ? prev.uniqueCategories.filter((item) => item !== id)
          : [...prev.uniqueCategories, id],
      };
    });
  };

  // =====================================================
  // MAIN IMAGE
  // =====================================================

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Invalid image",
        text: "Please select a valid image file.",
        confirmButtonColor: "#000000",
      });

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Image too large",
        text: "Main image must be smaller than 5MB.",
        confirmButtonColor: "#000000",
      });

      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setMainImagePreview(URL.createObjectURL(file));
  };

  // =====================================================
  // ADDITIONAL IMAGES
  // =====================================================

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) return false;
      if (file.size > 5 * 1024 * 1024) return false;

      return true;
    });

    if (validFiles.length !== files.length) {
      Swal.fire({
        icon: "warning",
        title: "Some images were skipped",
        text: "Only image files smaller than 5MB are allowed.",
        confirmButtonColor: "#000000",
      });
    }

    const combinedFiles = [...formData.images, ...validFiles];

    if (combinedFiles.length > 8) {
      Swal.fire({
        icon: "warning",
        title: "Maximum 8 images",
        text: "You can upload a maximum of 8 additional images.",
        confirmButtonColor: "#000000",
      });

      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: combinedFiles,
    }));

    setAdditionalPreviews(
      combinedFiles.map((file) => URL.createObjectURL(file)),
    );
  };

  // =====================================================
  // REMOVE ADDITIONAL IMAGE
  // =====================================================

  const removeAdditionalImage = (index) => {
    const updatedFiles = formData.images.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      images: updatedFiles,
    }));

    setAdditionalPreviews(
      updatedFiles.map((file) => URL.createObjectURL(file)),
    );
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    const price = Number(formData.price);
    const oldPrice = Number(formData.oldPrice);
    const stock = Number(formData.stock);
    const weightKg = Number(formData.weightKg);
    const lengthCm = Number(formData.lengthCm);
    const breadthCm = Number(formData.breadthCm);
    const heightCm = Number(formData.heightCm);

    if (!formData.name.trim()) {
      return "Product name is required.";
    }

    if (!formData.description.trim()) {
      return "Product description is required.";
    }

    if (!formData.image) {
      return "Main product image is required.";
    }

    if (!formData.category && !formData.uniqueCategories.length) {
      return "Please select a normal category or at least one unique collection.";
    }

    if (!formData.price || price <= 0) {
      return "Please enter a valid selling price.";
    }

    if (!formData.oldPrice || oldPrice <= 0) {
      return "Please enter a valid original price.";
    }

    if (oldPrice < price) {
      return "Original price should be greater than or equal to selling price.";
    }

    if (stock < 0) {
      return "Stock cannot be negative.";
    }

    if (!formData.weightKg || weightKg <= 0) {
      return "Please enter a valid package weight.";
    }

    if (!formData.lengthCm || lengthCm <= 0) {
      return "Please enter a valid package length.";
    }

    if (!formData.breadthCm || breadthCm <= 0) {
      return "Please enter a valid package width.";
    }

    if (!formData.heightCm || heightCm <= 0) {
      return "Please enter a valid package height.";
    }

    return null;
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      Swal.fire({
        icon: "warning",
        title: "Check product details",
        text: validationError,
        confirmButtonColor: "#000000",
      });

      return;
    }

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Session expired",
        text: "Please log in again before creating a product.",
        confirmButtonColor: "#000000",
      });
      return;
    }

    try {
      setLoading(true);
      setUploadingImages(true);

      // =================================================
      // UPLOAD MAIN IMAGE TO CLOUDINARY
      // =================================================

      const mainImageUrl = await uploadImageToCloudinary(formData.image);

      // =================================================
      // UPLOAD ADDITIONAL IMAGES TO CLOUDINARY
      // =================================================

      const additionalImages = [];

      for (const file of formData.images) {
        const imageUrl = await uploadImageToCloudinary(file);
        additionalImages.push(imageUrl);
      }

      setUploadingImages(false);

      // =================================================
      // PRODUCT DATA
      // =================================================

      const productData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        image: mainImageUrl,
        images: additionalImages,
        price: Number(formData.price),
        oldPrice: Number(formData.oldPrice),
        category: formData.category
          ? formData.category.toLowerCase().trim()
          : "",
        uniqueCategories: formData.uniqueCategories,
        sareeType: formData.sareeType.trim(),
        fabric: formData.fabric.trim(),
        color: formData.color.trim(),
        work: formData.work.trim(),
        occasion: formData.occasion.trim(),
        blousePiece: formData.blousePiece.trim(),
        sareeLength: formData.sareeLength.trim(),
        washCare: formData.washCare.trim(),
        countryOfOrigin: formData.countryOfOrigin.trim(),
        stock: Number(formData.stock),
        shipping: {
          weightKg: Number(formData.weightKg),
          lengthCm: Number(formData.lengthCm),
          breadthCm: Number(formData.breadthCm),
          heightCm: Number(formData.heightCm),
        },
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
      };

      // =================================================
      // CREATE PRODUCT
      // IMPORTANT: PRODUCT API EXPECTS JSON, NOT FILES
      // =================================================

      const { data } = await axios.post(`${API_URL}/products`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Product created:", data);

      await Swal.fire({
        icon: "success",
        title: "Product Added",
        text: data.message || "The saree has been added successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      navigate("/admin/products", { replace: true });
    } catch (error) {
      console.error("Create product error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to add product",
        text:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong while creating the product.",
        confirmButtonColor: "#000000",
      });
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f8f7f4] px-4 py-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="mb-3 flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
            >
              <ArrowLeft size={17} />
              Back to Products
            </button>

            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Add New Product
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create a new saree product and assign it to your collections.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* =====================================================
                LEFT
            ===================================================== */}

            <div className="space-y-6">
              {/* BASIC INFORMATION */}

              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Product Information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Basic information customers will see on the product page.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Product Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Example: Premium Green Maheshwari Silk Saree"
                      className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Slug
                    </label>

                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="elegant-maheshwari-cotton-saree"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                      />

                      <button
                        type="button"
                        onClick={generateSlug}
                        className="shrink-0 rounded-xl border border-gray-300 px-4 text-sm transition hover:border-black"
                      >
                        Generate
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      Use a unique lowercase URL slug. Click Generate to create
                      it from the product name.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Description *
                    </label>

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe the saree, fabric, craftsmanship and style..."
                      className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                    />
                  </div>
                </div>
              </section>

              {/* PRICING */}

              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pricing & Inventory
                </h2>

                <div className="mt-6 grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Selling Price *
                    </label>

                    <input
                      type="number"
                      name="price"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="₹ 0"
                      className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Original Price *
                    </label>

                    <input
                      type="number"
                      name="oldPrice"
                      min="0"
                      value={formData.oldPrice}
                      onChange={handleChange}
                      placeholder="₹ 0"
                      className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Stock *
                    </label>

                    <input
                      type="number"
                      name="stock"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>
                </div>
              </section>

              {/* SHIPPING & PACKAGE */}

              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Shipping & Package
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Enter the actual packed parcel measurements used for courier
                    shipping and delivery calculations.
                  </p>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Package Weight *
                    </label>

                    <div className="relative mt-2">
                      <input
                        type="number"
                        name="weightKg"
                        min="0.01"
                        step="0.01"
                        value={formData.weightKg}
                        onChange={handleChange}
                        placeholder="Example: 0.65"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-14 outline-none transition focus:border-black"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        kg
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      Weight of the saree after packing.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Package Length *
                    </label>

                    <div className="relative mt-2">
                      <input
                        type="number"
                        name="lengthCm"
                        min="1"
                        step="0.1"
                        value={formData.lengthCm}
                        onChange={handleChange}
                        placeholder="Example: 32"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-14 outline-none transition focus:border-black"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Package Width *
                    </label>

                    <div className="relative mt-2">
                      <input
                        type="number"
                        name="breadthCm"
                        min="1"
                        step="0.1"
                        value={formData.breadthCm}
                        onChange={handleChange}
                        placeholder="Example: 25"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-14 outline-none transition focus:border-black"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Package Height *
                    </label>

                    <div className="relative mt-2">
                      <input
                        type="number"
                        name="heightCm"
                        min="1"
                        step="0.1"
                        value={formData.heightCm}
                        onChange={handleChange}
                        placeholder="Example: 6"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-14 outline-none transition focus:border-black"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        cm
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs leading-5 text-amber-800">
                    <strong>Important:</strong> Enter the measurements of the
                    final packed parcel, including packaging material. Do not
                    enter the unfolded saree length as the package length.
                  </p>
                </div>
              </section>

              {/* CATEGORY */}

              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Collections
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Choose the main category and the special collections where
                  this saree should appear.
                </p>

                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-700">
                    Main Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={fetchingCategories}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="">
                      {fetchingCategories
                        ? "Loading categories..."
                        : "Select category"}
                    </option>

                    {categories.map((category) => (
                      <option key={category._id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Unique Collections
                    </label>

                    <span className="text-xs text-gray-400">
                      {formData.uniqueCategories.length} selected
                    </span>
                  </div>

                  {fetchingCategories ? (
                    <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">
                      Loading collections...
                    </div>
                  ) : uniqueCategories.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 p-5 text-sm text-gray-500">
                      No unique collections available.
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {uniqueCategories.map((collection) => {
                        const selected = formData.uniqueCategories.includes(
                          collection._id,
                        );

                        return (
                          <button
                            type="button"
                            key={collection._id}
                            onClick={() =>
                              handleUniqueCategoryChange(collection._id)
                            }
                            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                              selected
                                ? "border-black bg-black text-white"
                                : "border-gray-200 bg-white hover:border-gray-400"
                            }`}
                          >
                            <div
                              className={`h-4 w-4 rounded-full border ${
                                selected
                                  ? "border-white bg-white"
                                  : "border-gray-400"
                              }`}
                            >
                              {selected && (
                                <div className="m-0.5 h-2.5 w-2.5 rounded-full bg-black" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {collection.name}
                              </p>

                              {collection.description && (
                                <p
                                  className={`mt-1 line-clamp-1 text-xs ${
                                    selected ? "text-gray-300" : "text-gray-500"
                                  }`}
                                >
                                  {collection.description}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              {/* SAREE SPECIFICATIONS */}

              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  Saree Specifications
                </h2>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {[
                    ["sareeType", "Saree Type", "Example: Maheshwari Silk"],
                    ["fabric", "Fabric", "Example: Pure Silk"],
                    ["color", "Color", "Example: Emerald Green"],
                    ["work", "Work", "Example: Zari"],
                    ["occasion", "Occasion", "Example: Wedding"],
                    ["blousePiece", "Blouse Piece", "Example: Included"],
                    ["sareeLength", "Saree Length", "Example: 5.5 meters"],
                    ["washCare", "Wash Care", "Example: Dry Clean Only"],
                  ].map(([name, label, placeholder]) => (
                    <div key={name}>
                      <label className="text-sm font-medium text-gray-700">
                        {label}
                      </label>

                      <input
                        type="text"
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <label className="text-sm font-medium text-gray-700">
                    Country of Origin
                  </label>

                  <input
                    type="text"
                    name="countryOfOrigin"
                    value={formData.countryOfOrigin}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </section>
            </div>

            {/* =====================================================
                RIGHT
            ===================================================== */}

            <div className="space-y-6">
              {/* MAIN IMAGE */}

              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Images
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Upload high-quality product photography.
                </p>

                <label className="mt-5 block cursor-pointer">
                  <div className="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50">
                    {mainImagePreview ? (
                      <div className="relative aspect-square">
                        <img
                          src={mainImagePreview}
                          alt="Product preview"
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-black/0 transition hover:bg-black/10" />
                      </div>
                    ) : (
                      <div className="flex aspect-square flex-col items-center justify-center px-6 text-center">
                        <Upload size={30} className="text-gray-400" />

                        <p className="mt-4 text-sm font-medium text-gray-700">
                          Upload main image
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          JPG, PNG or WEBP • Max 5MB
                        </p>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                </label>
              </section>

              {/* ADDITIONAL IMAGES */}

              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Additional Images
                  </h2>

                  <span className="text-xs text-gray-400">
                    {formData.images.length}/8
                  </span>
                </div>

                <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-600 transition hover:border-black hover:text-black">
                  <Upload size={17} />
                  Add Images
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAdditionalImagesChange}
                    className="hidden"
                  />
                </label>

                {additionalPreviews.length > 0 && (
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {additionalPreviews.map((preview, index) => (
                      <div
                        key={preview}
                        className="group relative aspect-square overflow-hidden rounded-xl"
                      >
                        <img
                          src={preview}
                          alt={`Additional ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* PRODUCT STATUS */}

              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Status
                </h2>

                <div className="mt-5 space-y-4">
                  <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-gray-50 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Active Product
                      </p>

                      <p className="text-xs text-gray-500">
                        Show this product to customers.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-5 w-5 accent-black"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-gray-50 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Featured Product
                      </p>

                      <p className="text-xs text-gray-500">
                        Display in the Featured Products section.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="h-5 w-5 accent-black"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-gray-50 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Best Seller
                      </p>

                      <p className="text-xs text-gray-500">
                        Mark this product as a best seller.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onChange={handleChange}
                      className="h-5 w-5 accent-black"
                    />
                  </label>
                </div>
              </section>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading || fetchingCategories}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={19} />

                {uploadingImages
                  ? "Uploading Images..."
                  : loading
                    ? "Creating Product..."
                    : "Create Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProduct;

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    images: "",
    price: "",
    oldPrice: "",
    category: "",
    uniqueCategory: "",
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
    weightKg: "",
    lengthCm: "",
    breadthCm: "",
    heightCm: "",
    rating: 5,
    reviews: 0,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    salesCount: 0,
  });

  // =====================================================
  // MAIN IMAGE
  // =====================================================

  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");

  // =====================================================
  // ADDITIONAL IMAGES
  // =====================================================
  //
  // Each item is either:
  //
  // {
  //   type: "existing",
  //   url: "https://..."
  // }
  //
  // OR
  //
  // {
  //   type: "new",
  //   file: File,
  //   preview: "blob:..."
  // }
  //
  // =====================================================

  const [additionalImages, setAdditionalImages] = useState([]);

  // =====================================================
  // ADMIN CHECK
  // =====================================================

  // =====================================================
  // FETCH PRODUCT + CATEGORIES
  // =====================================================

  useEffect(() => {
    if (!token || !id) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setCategoryLoading(true);

        const [productResponse, categoryResponse] = await Promise.all([
          axios.get(`${API_URL}/products/admin/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${API_URL}/categories`),
        ]);

        // IMPORTANT:
        // Backend returns { success: true, product: {...} }
        const product = productResponse.data.product;

        if (!product) {
          throw new Error("Product data was not returned by the server.");
        }

        console.log("Fetched product:", product);

        setFormData({
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          image: product.image || "",
          images: Array.isArray(product.images)
            ? product.images.join("\n")
            : "",
          price: product.price ?? "",
          oldPrice: product.oldPrice ?? "",
          category: product.category || "",
          uniqueCategory: product.uniqueCategory || "",
          sareeType: product.sareeType || "",
          fabric: product.fabric || "",
          color: product.color || "",
          work: product.work || "",
          occasion: product.occasion || "",
          blousePiece: product.blousePiece || "",
          sareeLength: product.sareeLength || "",
          washCare: product.washCare || "",
          countryOfOrigin: product.countryOfOrigin || "India",
          stock: product.stock ?? 1,
          weightKg: product.shipping?.weightKg ?? "",
          lengthCm: product.shipping?.lengthCm ?? "",
          breadthCm: product.shipping?.breadthCm ?? "",
          heightCm: product.shipping?.heightCm ?? "",
          rating: product.rating ?? 5,
          reviews: product.reviews ?? 0,
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
          isBestSeller: product.isBestSeller ?? false,
          salesCount: product.salesCount ?? 0,
        });

        setMainImagePreview(product.image || "");

        const existingAdditionalImages = Array.isArray(product.images)
          ? product.images.filter(Boolean).map((url) => ({
              type: "existing",
              url,
            }))
          : [];

        setAdditionalImages(existingAdditionalImages);

        // Categories API returns { categories: [...] }
        setCategories(
          Array.isArray(categoryResponse.data?.categories)
            ? categoryResponse.data.categories
            : [],
        );
      } catch (error) {
        console.error("Failed to load product:", error);

        await Swal.fire({
          icon: "error",
          title: "Unable to Load Product",
          text:
            error.response?.data?.message ||
            error.message ||
            "Please try again.",
          confirmButtonColor: "#000000",
        });

        navigate("/admin/products", { replace: true });
      } finally {
        setLoading(false);
        setCategoryLoading(false);
      }
    };

    fetchData();
  }, [id, token, navigate]);

  // =====================================================
  // CLEANUP MAIN IMAGE PREVIEW
  // =====================================================

  useEffect(() => {
    return () => {
      if (mainImagePreview && mainImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(mainImagePreview);
      }
    };
  }, [mainImagePreview]);

  // =====================================================
  // CLEANUP ADDITIONAL IMAGE PREVIEWS
  // =====================================================

  useEffect(() => {
    return () => {
      additionalImages.forEach((image) => {
        if (image.type === "new" && image.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [additionalImages]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
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
  // CLOUDINARY UPLOAD
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

    return uploadResponse.data.secure_url;
  };

  // =====================================================
  // MAIN IMAGE - CHANGE
  // =====================================================

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid image format",
        text: "Only JPG, PNG and WebP images are allowed.",
        confirmButtonColor: "#000000",
      });

      e.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      Swal.fire({
        icon: "warning",
        title: "Image is too large",
        text: "The main image must be smaller than 5MB.",
        confirmButtonColor: "#000000",
      });

      e.target.value = "";
      return;
    }

    if (mainImagePreview && mainImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(mainImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setMainImageFile(file);
    setMainImagePreview(previewUrl);

    e.target.value = "";
  };

  // =====================================================
  // ADDITIONAL IMAGES - ADD
  // =====================================================

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const maxSize = 5 * 1024 * 1024;

    const invalidType = files.find((file) => !allowedTypes.includes(file.type));

    if (invalidType) {
      Swal.fire({
        icon: "warning",
        title: "Invalid image format",
        text: "Only JPG, PNG and WebP images are allowed.",
        confirmButtonColor: "#000000",
      });

      e.target.value = "";
      return;
    }

    const oversizedFile = files.find((file) => file.size > maxSize);

    if (oversizedFile) {
      Swal.fire({
        icon: "warning",
        title: "Image is too large",
        text: "Each image must be smaller than 5MB.",
        confirmButtonColor: "#000000",
      });

      e.target.value = "";
      return;
    }

    const newImages = files.map((file) => ({
      type: "new",
      file,
      preview: URL.createObjectURL(file),
    }));

    setAdditionalImages((previous) => [...previous, ...newImages]);

    e.target.value = "";
  };

  // =====================================================
  // ADDITIONAL IMAGE - REMOVE
  // =====================================================

  const removeAdditionalImage = (index) => {
    setAdditionalImages((previous) => {
      const imageToRemove = previous[index];

      if (
        imageToRemove?.type === "new" &&
        imageToRemove.preview?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return previous.filter((_, i) => i !== index);
    });
  };

  // =====================================================
  // ADDITIONAL IMAGE - REPLACE
  // =====================================================

  const replaceAdditionalImage = (e, index) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid image format",
        text: "Please select a JPG, PNG or WebP image.",
        confirmButtonColor: "#000000",
      });

      e.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      Swal.fire({
        icon: "warning",
        title: "Image is too large",
        text: "Please select an image smaller than 5MB.",
        confirmButtonColor: "#000000",
      });

      e.target.value = "";
      return;
    }

    setAdditionalImages((previous) => {
      const oldImage = previous[index];

      if (oldImage?.type === "new" && oldImage.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(oldImage.preview);
      }

      const updatedImages = [...previous];

      updatedImages[index] = {
        type: "new",
        file,
        preview: URL.createObjectURL(file),
      };

      return updatedImages;
    });

    e.target.value = "";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Product name is required",
        confirmButtonColor: "#000000",
      });
    }

    if (!formData.image.trim() && !mainImageFile) {
      return Swal.fire({
        icon: "warning",
        title: "Main product image is required",
        confirmButtonColor: "#000000",
      });
    }

    if (!formData.price) {
      return Swal.fire({
        icon: "warning",
        title: "Product price is required",
        confirmButtonColor: "#000000",
      });
    }

    if (!formData.oldPrice) {
      return Swal.fire({
        icon: "warning",
        title: "Old price is required",
        confirmButtonColor: "#000000",
      });
    }

    if (!formData.category) {
      return Swal.fire({
        icon: "warning",
        title: "Category is required",
        confirmButtonColor: "#000000",
      });
    }

    if (Number(formData.price) > Number(formData.oldPrice)) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid pricing",
        text: "Current price cannot be greater than the old price.",
        confirmButtonColor: "#000000",
      });
    }

    if (Number(formData.stock) < 0) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid stock",
        text: "Stock cannot be negative.",
        confirmButtonColor: "#000000",
      });
    }

    if (!formData.weightKg || Number(formData.weightKg) <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Package weight is required",
        text: "Please enter the actual packed parcel weight.",
        confirmButtonColor: "#000000",
      });
    }

    if (!formData.lengthCm || Number(formData.lengthCm) <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Package length is required",
        text: "Please enter the package length.",
        confirmButtonColor: "#000000",
      });
    }

    if (!formData.breadthCm || Number(formData.breadthCm) <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Package width is required",
        text: "Please enter the package width.",
        confirmButtonColor: "#000000",
      });
    }

    if (!formData.heightCm || Number(formData.heightCm) <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Package height is required",
        text: "Please enter the package height.",
        confirmButtonColor: "#000000",
      });
    }

    try {
      setSaving(true);
      setUploadingImages(false);

      // =================================================
      // MAIN IMAGE
      // =================================================

      let mainImageUrl = formData.image.trim();

      if (mainImageFile) {
        setUploadingImages(true);

        mainImageUrl = await uploadImageToCloudinary(mainImageFile);
      }

      // =================================================
      // ADDITIONAL IMAGES
      // =================================================

      const finalAdditionalImages = [];

      for (const image of additionalImages) {
        if (image.type === "existing") {
          finalAdditionalImages.push(image.url);
          continue;
        }

        if (image.type === "new") {
          setUploadingImages(true);

          const uploadedUrl = await uploadImageToCloudinary(image.file);

          finalAdditionalImages.push(uploadedUrl);
        }
      }

      // =================================================
      // PRODUCT DATA
      // =================================================

      const productData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        image: mainImageUrl,
        images: finalAdditionalImages,
        price: Number(formData.price),
        oldPrice: Number(formData.oldPrice),
        category: formData.category.toLowerCase().trim(),
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
        rating: Number(formData.rating),
        reviews: Number(formData.reviews),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        salesCount: Number(formData.salesCount),
      };

      // =================================================
      // UPDATE PRODUCT
      // =================================================

      setUploadingImages(false);

      const { data } = await axios.put(
        `${API_URL}/products/${id}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Product updated:", data);

      await Swal.fire({
        icon: "success",
        title: "Product Updated",
        text: data.message || "Product updated successfully.",
        confirmButtonColor: "#000000",
      });

      navigate("/admin/products", {
        replace: true,
      });
    } catch (error) {
      console.error("Failed to update product:", error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#000000",
      });
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading product...</p>
      </section>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <section className="min-h-screen bg-[#faf9f6]">
      {/* HEADER */}

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
                Mehaa Garments
              </p>

              <h1 className="text-2xl md:text-3xl font-serif text-gray-900">
                Edit Product
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Update your saree product information.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              disabled={saving}
              className="border border-gray-300 px-5 py-2.5 text-sm hover:border-black disabled:opacity-50"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="bg-white border border-gray-200 p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Basic Information
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Update the main information about this product.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="form-label">Product Name *</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Slug</label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="form-input"
                  />

                  <button
                    type="button"
                    onClick={generateSlug}
                    className="shrink-0 border border-gray-300 px-4 text-xs hover:border-black"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Category *</label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={categoryLoading}
                  className="form-input bg-white"
                >
                  <option value="">
                    {categoryLoading
                      ? "Loading categories..."
                      : "Select Category"}
                  </option>

                  {categories.map((item) => (
                    <option key={item._id} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Our Unique Collection</label>

                <select
                  value={formData.uniqueCategory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      uniqueCategory: e.target.value,
                    })
                  }
                  className="w-full border text-sm border-gray-300 px-4 py-3 bg-white focus:outline-none focus:border-black"
                >
                  <option value="">Select Unique Collection</option>
                  <option value="cotton-elegance">Cotton Elegance</option>
                  <option value="silk-heritage">Silk Heritage</option>
                  <option value="festive-glow">Festive Glow</option>
                  <option value="modern-tradition">Modern Tradition</option>
                  <option value="royal-weaves">Royal Weaves</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="form-input resize-y"
                />
              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCT IMAGES
          ================================================= */}

          <div className="bg-white border border-gray-200 p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Product Images
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Replace, remove or add product images.
              </p>
            </div>

            <div className="space-y-8">
              {/* =================================================
                  MAIN IMAGE
              ================================================= */}

              <div>
                <label className="form-label">Main Product Image *</label>

                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="w-40 h-52 border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
                    {mainImagePreview ? (
                      <img
                        src={mainImagePreview}
                        alt={formData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="inline-flex items-center justify-center bg-black text-white px-5 py-3 text-sm cursor-pointer hover:bg-gray-800 transition">
                      Choose File
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleMainImageChange}
                      />
                    </label>

                    <p className="text-xs text-gray-400 mt-3">
                      JPG, PNG or WebP · Maximum 5MB
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      Choose another image to replace the current main image.
                    </p>

                    {mainImageFile && (
                      <p className="text-xs text-green-600 mt-2">
                        New main image selected.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* =================================================
                  DIVIDER
              ================================================= */}

              <div className="border-t border-gray-100" />

              {/* =================================================
                  ADDITIONAL IMAGES
              ================================================= */}

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <label className="form-label mb-1">
                      Additional Product Images
                    </label>

                    <p className="text-xs text-gray-400">
                      Add multiple JPG, PNG or WebP images. Maximum 5MB each.
                    </p>
                  </div>

                  <label className="inline-flex items-center justify-center bg-black text-white px-5 py-3 text-sm cursor-pointer hover:bg-gray-800 transition w-fit">
                    + Add Images
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleAdditionalImagesChange}
                    />
                  </label>
                </div>

                {additionalImages.length > 0 ? (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {additionalImages.map((image, index) => {
                      const preview =
                        image.type === "existing" ? image.url : image.preview;

                      return (
                        <div
                          key={`${image.type}-${index}-${preview}`}
                          className="relative group"
                        >
                          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            <img
                              src={preview}
                              alt={`Additional product image ${index + 1}`}
                              className="w-full aspect-3/4 object-cover"
                            />

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300" />

                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
                              {/* REPLACE */}

                              <label
                                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center cursor-pointer shadow-md hover:bg-gray-100 transition"
                                title="Replace image"
                              >
                                ↻
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="hidden"
                                  onChange={(e) =>
                                    replaceAdditionalImage(e, index)
                                  }
                                />
                              </label>

                              {/* REMOVE */}

                              <button
                                type="button"
                                onClick={() => removeAdditionalImage(index)}
                                className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:bg-red-600 transition"
                                title="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              Image {index + 1}
                            </p>

                            {image.type === "existing" ? (
                              <span className="text-[10px] uppercase tracking-wider text-gray-400">
                                Existing
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase tracking-wider text-green-600">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-5 border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
                    <p className="text-sm text-gray-500">
                      No additional images.
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Click "Add Images" to upload additional product images.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              PRICING & INVENTORY
          ================================================= */}

          <div className="bg-white border border-gray-200 p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Pricing & Inventory
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="form-label">Selling Price *</label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Old Price *</label>

                <input
                  type="number"
                  name="oldPrice"
                  value={formData.oldPrice}
                  onChange={handleChange}
                  min="0"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Stock *</label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* =================================================
    SHIPPING & PACKAGE
================================================= */}

          <div className="bg-white border border-gray-200 p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Shipping & Package
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Enter the actual measurements of the packed parcel used for
                courier shipping.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Package Weight *</label>

                <div className="relative">
                  <input
                    type="number"
                    name="weightKg"
                    value={formData.weightKg}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="Example: 0.65"
                    className="form-input pr-12"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    kg
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Final packed parcel weight.
                </p>
              </div>

              <div>
                <label className="form-label">Package Length *</label>

                <div className="relative">
                  <input
                    type="number"
                    name="lengthCm"
                    value={formData.lengthCm}
                    onChange={handleChange}
                    min="1"
                    step="0.1"
                    placeholder="Example: 32"
                    className="form-input pr-12"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    cm
                  </span>
                </div>
              </div>

              <div>
                <label className="form-label">Package Width *</label>

                <div className="relative">
                  <input
                    type="number"
                    name="breadthCm"
                    value={formData.breadthCm}
                    onChange={handleChange}
                    min="1"
                    step="0.1"
                    placeholder="Example: 25"
                    className="form-input pr-12"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    cm
                  </span>
                </div>
              </div>

              <div>
                <label className="form-label">Package Height *</label>

                <div className="relative">
                  <input
                    type="number"
                    name="heightCm"
                    value={formData.heightCm}
                    onChange={handleChange}
                    min="1"
                    step="0.1"
                    placeholder="Example: 6"
                    className="form-input pr-12"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    cm
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs leading-5 text-amber-800">
                <strong>Important:</strong> Enter the measurements of the final
                packed parcel, including packaging material. Do not use the
                unfolded saree length as the package length.
              </p>
            </div>
          </div>

          {/* =================================================
              SAREE DETAILS
          ================================================= */}

          <div className="bg-white border border-gray-200 p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Saree Details
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Update the specifications shown on the product page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Saree Type</label>

                <input
                  type="text"
                  name="sareeType"
                  value={formData.sareeType}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Fabric</label>

                <input
                  type="text"
                  name="fabric"
                  value={formData.fabric}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Color</label>

                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Work</label>

                <input
                  type="text"
                  name="work"
                  value={formData.work}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Occasion</label>

                <input
                  type="text"
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Blouse Piece</label>

                <input
                  type="text"
                  name="blousePiece"
                  value={formData.blousePiece}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Saree Length</label>

                <input
                  type="text"
                  name="sareeLength"
                  value={formData.sareeLength}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Wash Care</label>

                <input
                  type="text"
                  name="washCare"
                  value={formData.washCare}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Country of Origin</label>

                <input
                  type="text"
                  name="countryOfOrigin"
                  value={formData.countryOfOrigin}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* =================================================
              STATUS
          ================================================= */}

          <div className="bg-white border border-gray-200 p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Product Status
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Control how this product behaves in your store.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    Active Product
                  </span>

                  <span className="block text-xs text-gray-500 mt-1">
                    Active products are visible in the customer storefront.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    Featured Product
                  </span>

                  <span className="block text-xs text-gray-500 mt-1">
                    Mark this product as featured.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={formData.isBestSeller}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    Best Seller
                  </span>

                  <span className="block text-xs text-gray-500 mt-1">
                    Mark this product as a best seller.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* =================================================
              SAVE
          ================================================= */}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              disabled={saving}
              className="border border-gray-300 px-6 py-3 text-sm hover:border-black disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {uploadingImages
                ? "Uploading Images..."
                : saving
                  ? "Saving Changes..."
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`
        .form-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: #4b5563;
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          min-height: 44px;
          border: 1px solid #d1d5db;
          padding: 0.7rem 0.85rem;
          font-size: 0.875rem;
          color: #111827;
          background: white;
          outline: none;
        }

        .form-input:focus {
          border-color: #000000;
        }

        .form-input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
};

export default AdminEditProduct;

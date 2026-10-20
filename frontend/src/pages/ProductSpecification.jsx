import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useSEO from "../hooks/useSEO";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const ProductSpecification = () => {
  const { id, category } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [uploadingReviewImages, setUploadingReviewImages] = useState(false);
  const [myReview, setMyReview] = useState(null);

  const [reviewImages, setReviewImages] = useState([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]);

  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: "",
    comment: "",
  });

  // --------------------------------------------------
  // PRODUCT SEO
  // --------------------------------------------------

  const seoTitle = product?.name
    ? `${product.name} | Buy Sarees Online | Mehaa Garments`
    : "Shop Sarees Online | Mehaa Garments";

  const seoDescription = product
    ? (
        product.description ||
        `Explore ${product.name} at Mehaa Garments. Discover beautiful sarees with detailed product information, pricing and specifications.`
      ).slice(0, 160)
    : "Explore beautiful sarees at Mehaa Garments. Discover elegant styles for everyday wear, celebrations and special occasions.";

  useSEO({
    title: seoTitle,
    description: seoDescription,
    canonicalUrl: `https://www.mehaagarments.in/collection/${category || product?.category || "product"}/specification/${id}`,
  });

  // --------------------------------------------------
  // PRODUCT STRUCTURED DATA (JSON-LD)
  // --------------------------------------------------

  useEffect(() => {
    if (!product?._id || !product?.name) return;

    const productUrl = `https://mehaagarments.in/collection/${product.category || category || "product"}/specification/${product._id}`;

    const productImage = product.images?.length
      ? product.images
      : product.image
        ? [product.image]
        : [];

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: (
        product.description || `Discover ${product.name} at Mehaa Garments.`
      ).slice(0, 5000),
      image: productImage,
      sku: String(product._id),
      brand: {
        "@type": "Brand",
        name: "Mehaa Garments",
      },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "INR",
        price: Number(product.price || 0).toFixed(2),
        availability:
          Number(product.stock || 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          name: "Mehaa Garments",
          url: "https://mehaagarments.in/",
        },
      },
    };

    const scriptId = "product-json-ld";
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(structuredData);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [product, category]);

  // --------------------------------------------------
  // FETCH PRODUCT
  // --------------------------------------------------

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(`${API_URL}/products/${id}`);

        const productData = data?.product;

        if (!productData) {
          throw new Error("Product data not found.");
        }

        setProduct(productData);

        // Main product image
        setSelectedImage(productData.image || "");

        // ----------------------------------------------
        // SIMILAR PRODUCTS
        // ----------------------------------------------

        const similarRes = await axios.get(
          `${API_URL}/products?category=${encodeURIComponent(
            productData.category,
          )}&limit=12`,
        );

        const products = similarRes.data?.products || [];

        const filteredProducts = products.filter(
          (item) => item._id !== productData._id,
        );

        setSimilarProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching product:", error);

        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to load product. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      try {
        setReviewLoading(true);

        const { data } = await axios.get(`${API_URL}/reviews/product/${id}`);

        setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      } catch (error) {
        console.error("Error fetching reviews:", error);

        setReviews([]);
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (!id || !token) {
      setMyReview(null);
      return;
    }

    const fetchMyReview = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/reviews/product/${id}/my-review`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setMyReview(data?.hasReviewed ? data.review : null);
      } catch (error) {
        console.error("Error fetching my review:", error);

        setMyReview(null);
      }
    };

    fetchMyReview();
  }, [id, token]);
  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading product...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-black text-white rounded-full text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // PRODUCT NOT FOUND
  // --------------------------------------------------

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-gray-500 mb-4">Product not found.</p>

        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-black text-white rounded-full text-sm"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // PRODUCT IMAGES
  // --------------------------------------------------

  const productImages =
    product.images?.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  // --------------------------------------------------
  // PRICE CALCULATIONS
  // --------------------------------------------------

  const price = Number(product.price) || 0;
  const oldPrice = Number(product.oldPrice) || 0;

  const discountPercentage =
    oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  const totalPrice = price * quantity;

  // --------------------------------------------------
  // QUANTITY
  // --------------------------------------------------

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // --------------------------------------------------
  // ADD TO CART
  // --------------------------------------------------

  const handleAddToCart = async () => {
    if (!token) {
      const result = await Swal.fire({
        icon: "info",
        title: "Login Required",
        text: "Please login to add products to your cart.",
        confirmButtonColor: "#000",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        navigate("/login");
      }

      return;
    }

    if (product.stock <= 0) {
      await Swal.fire({
        icon: "warning",
        title: "Out of Stock",
        text: "This product is currently unavailable.",
        confirmButtonColor: "#000",
      });

      return;
    }

    try {
      const { data } = await axios.post(
        `${API_URL}/cart`,
        {
          productId: product._id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Keep local cart cache synchronized
      const serverCart = data?.cart;

      if (serverCart?.items) {
        const localCart = serverCart.items
          .filter((item) => item.product)
          .map((item) => ({
            ...item.product,
            quantity: item.quantity,
          }));

        localStorage.setItem("cartItems", JSON.stringify(localCart));
      }

      // Update Navbar cart count
      window.dispatchEvent(new Event("cartUpdated"));

      await Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: `${product.name} has been added to your cart.`,
        confirmButtonColor: "#000",
      });
    } catch (error) {
      console.error("Add to cart error:", error);

      await Swal.fire({
        icon: "error",
        title: "Unable to Add",
        text:
          error.response?.data?.message ||
          "Something went wrong while adding the product to your cart.",
        confirmButtonColor: "#000",
      });
    }
  };

  // --------------------------------------------------
  // BUY NOW
  // --------------------------------------------------

  const handleBuyNow = () => {
    if (!product?._id) {
      Swal.fire({
        icon: "error",
        title: "Product unavailable",
        text: "This product could not be selected. Please try again.",
        confirmButtonColor: "#000000",
      });
      return;
    }

    const buyNowProduct = {
      _id: product._id,
      name: product.name,
      image: product.image || product.images?.[0],
      images: product.images || [],
      price: Number(product.price) || 0,
      oldPrice: Number(product.oldPrice) || 0,
      quantity: quantity,
    };

    localStorage.setItem("buyNowProduct", JSON.stringify(buyNowProduct));

    // Make sure checkout does not accidentally use cart checkout data
    localStorage.removeItem("checkoutCart");

    navigate("/checkout");
  };

  // --------------------------------------------------
  // SIMILAR PRODUCT CLICK
  // --------------------------------------------------

  const handleSimilarProduct = (item) => {
    navigate(`/collection/${item.category}/specification/${item._id}`);
  };

  // --------------------------------------------------
  // REVIEW IMAGE UPLOAD
  // --------------------------------------------------

  const uploadReviewImageToCloudinary = async (file) => {
    if (!file) {
      throw new Error("No image selected.");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG and WebP images are allowed.");
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error("Each review image must be smaller than 5MB.");
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

  const handleReviewImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (!selectedFiles.length) return;

    const remainingSlots = 5 - reviewImages.length;

    if (remainingSlots <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Maximum 5 photos",
        text: "You can upload a maximum of 5 photos with your review.",
        confirmButtonColor: "#000",
      });

      e.target.value = "";
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    const invalidFiles = filesToAdd.filter(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024,
    );

    if (invalidFiles.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid image",
        text: "Only JPG, PNG and WebP images smaller than 5MB are allowed.",
        confirmButtonColor: "#000",
      });

      e.target.value = "";
      return;
    }

    const updatedFiles = [...reviewImages, ...filesToAdd];

    setReviewImages(updatedFiles);

    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));

    setReviewImagePreviews((previous) => [...previous, ...newPreviews]);

    e.target.value = "";
  };

  const removeReviewImage = (index) => {
    setReviewImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );

    setReviewImagePreviews((previous) => {
      const updated = [...previous];

      if (updated[index]) {
        URL.revokeObjectURL(updated[index]);
      }

      updated.splice(index, 1);

      return updated;
    });
  };

  // --------------------------------------------------
  // REVIEW SUBMIT
  // --------------------------------------------------

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token) {
      await Swal.fire({
        icon: "info",
        title: "Login required",
        text: "Please login to write a review.",
        confirmButtonColor: "#000",
      });

      navigate("/login");
      return;
    }

    if (!reviewForm.rating) {
      await Swal.fire({
        icon: "warning",
        title: "Select a rating",
        text: "Please select between 1 and 5 stars.",
        confirmButtonColor: "#000",
      });

      return;
    }

    if (reviewForm.comment.trim().length < 10) {
      await Swal.fire({
        icon: "warning",
        title: "Review is too short",
        text: "Your review must contain at least 10 characters.",
        confirmButtonColor: "#000",
      });

      return;
    }

    try {
      setReviewSubmitting(true);

      // ==========================================
      // UPLOAD CUSTOMER REVIEW IMAGES
      // ==========================================

      const uploadedReviewImages = [];

      if (reviewImages.length > 0) {
        setUploadingReviewImages(true);

        for (const file of reviewImages) {
          const imageUrl = await uploadReviewImageToCloudinary(file);

          uploadedReviewImages.push(imageUrl);
        }

        setUploadingReviewImages(false);
      }

      // ==========================================
      // SUBMIT REVIEW
      // ==========================================

      const { data } = await axios.post(
        `${API_URL}/reviews`,
        {
          productId: id,
          rating: reviewForm.rating,
          title: reviewForm.title.trim(),
          comment: reviewForm.comment.trim(),
          images: uploadedReviewImages,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // ==========================================
      // CLEAN UP PREVIEWS
      // ==========================================

      reviewImagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });

      setReviewImages([]);
      setReviewImagePreviews([]);

      setShowReviewForm(false);

      setReviewForm({
        rating: 0,
        title: "",
        comment: "",
      });

      await Swal.fire({
        icon: "success",
        title: "Review submitted",
        text:
          data?.message ||
          "Your review has been submitted and is awaiting approval.",
        confirmButtonColor: "#000",
      });
    } catch (error) {
      console.error("Submit review error:", error);

      setUploadingReviewImages(false);

      await Swal.fire({
        icon: "error",
        title: "Unable to submit review",
        text:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong while submitting your review.",
        confirmButtonColor: "#000",
      });
    } finally {
      setReviewSubmitting(false);
      setUploadingReviewImages(false);
    }
  };

  const handleReviewRating = (rating) => {
    setReviewForm((previous) => ({
      ...previous,
      rating,
    }));
  };

  const handleReviewInput = (e) => {
    const { name, value } = e.target;

    setReviewForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // CATEGORY NAME
  // --------------------------------------------------

  const categoryName = product.category
    ? product.category
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "Collection";

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <section className="w-full bg-white">
      {/* ==========================================
          PRODUCT SECTION
      ========================================== */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 lg:pt-28 lg:pb-16">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-500">
          <button
            onClick={() => navigate(`/collections/${product.category}`)}
            className="hover:text-black transition"
          >
            {categoryName}
          </button>

          <span className="mx-2">/</span>

          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ======================================
              LEFT - PRODUCT IMAGES
          ====================================== */}

          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}

            {productImages.length > 0 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
                {productImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(image)}
                    className={`
                      shrink-0
                      w-20 h-24
                      overflow-hidden
                      border
                      transition
                      ${
                        selectedImage === image
                          ? "border-black"
                          : "border-gray-200"
                      }
                    `}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}

            <div className="flex-1 bg-gray-50 overflow-hidden">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="
                    w-full
                    aspect-4/5
                    object-cover
                    transition-transform
                    duration-500
                    hover:scale-105
                  "
                />
              ) : (
                <div className="w-full aspect-4/5 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* ======================================
              RIGHT - PRODUCT DETAILS
          ====================================== */}

          <div className="flex flex-col">
            {/* Category */}

            <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-4">
              {categoryName}
            </p>

            {/* Product Name */}

            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Brand Text */}

            <p className="mt-3 text-sm text-gray-500">
              With Love From Mehaa Garments
            </p>

            {/* Rating */}

            <div className="flex items-center gap-3 mt-5">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      star <= Math.round(product.rating || 0)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <span className="text-sm text-gray-500">
                {product.rating || 0}
              </span>

              <span className="text-sm text-gray-400">
                ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Price */}

            <div className="flex items-center gap-4 mt-7">
              <span className="text-3xl font-semibold text-gray-900">
                ₹{price.toLocaleString("en-IN")}
              </span>

              {oldPrice > price && (
                <span className="text-lg text-gray-400 line-through">
                  ₹{oldPrice.toLocaleString("en-IN")}
                </span>
              )}

              {discountPercentage > 0 && (
                <span className="text-sm font-medium text-green-700">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Description */}

            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3">
                Description
              </h2>

              <p className="text-gray-600 leading-7 text-sm">
                {product.description ||
                  "Beautifully crafted saree designed to add elegance to every occasion."}
              </p>
            </div>

            {/* Stock */}

            <div className="mt-6">
              {product.stock > 0 ? (
                <p className="text-sm text-green-700">
                  {product.stock <= 5
                    ? `Only ${product.stock} left in stock`
                    : "In stock"}
                </p>
              ) : (
                <p className="text-sm text-red-600">Out of stock</p>
              )}
            </div>

            {/* Quantity */}

            {product.stock > 0 && (
              <div className="mt-7">
                <p className="text-sm font-medium mb-3">Quantity</p>

                <div className="flex items-center border border-gray-300 w-fit">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="w-11 h-11 flex items-center justify-center text-lg disabled:opacity-30"
                  >
                    −
                  </button>

                  <span className="w-12 text-center text-sm">{quantity}</span>

                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    className="w-11 h-11 flex items-center justify-center text-lg disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Total */}

            {product.stock > 0 && (
              <div className="flex items-center justify-between mt-7 py-4 border-y border-gray-200">
                <span className="text-sm text-gray-500">Total</span>

                <span className="text-xl font-semibold">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* Buttons */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="
                  h-14
                  border
                  border-black
                  text-black
                  uppercase
                  tracking-wider
                  text-sm
                  font-medium
                  transition
                  hover:bg-black
                  hover:text-white
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="
                  h-14
                  bg-black
                  text-white
                  uppercase
                  tracking-wider
                  text-sm
                  font-medium
                  transition
                  hover:bg-gray-800
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                Buy Now
              </button>
            </div>

            {/* Product Information */}

            <div className="mt-10 border-t border-gray-200">
              <div className="py-5 border-b border-gray-200">
                <h3 className="text-sm font-semibold mb-5">
                  Product Information
                </h3>

                <div className="space-y-4 text-sm">
                  {/* Category */}

                  {product.category && (
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-500">Category</span>

                      <span className="text-right capitalize">
                        {product.category.replace(/-/g, " ")}
                      </span>
                    </div>
                  )}

                  {/* Saree Type */}

                  {product.sareeType && (
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-500">Saree Type</span>

                      <span className="text-right">{product.sareeType}</span>
                    </div>
                  )}

                  {/* Fabric */}

                  {product.fabric && (
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-500">Fabric</span>

                      <span className="text-right">{product.fabric}</span>
                    </div>
                  )}

                  {/* Color */}

                  {product.color && (
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-500">Color</span>

                      <span className="text-right">{product.color}</span>
                    </div>
                  )}

                  {/* Work */}

                  {product.work && (
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-500">Work</span>

                      <span className="text-right">{product.work}</span>
                    </div>
                  )}

                  {/* Occasion */}

                  {product.occasion && (
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-500">Occasion</span>

                      <span className="text-right">{product.occasion}</span>
                    </div>
                  )}

                  {/* Blouse */}

                  {product.blousePiece && (
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-500">Blouse</span>

                      <span className="text-right">{product.blousePiece}</span>
                    </div>
                  )}

                  {/* Saree Length */}

                  {product.sareeLength && (
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-500">Saree Length</span>

                      <span className="text-right">{product.sareeLength}</span>
                    </div>
                  )}

                  {/* Wash Care */}

                  {product.washCare && (
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-500">Wash Care</span>

                      <span className="text-right">{product.washCare}</span>
                    </div>
                  )}

                  {/* Availability */}

                  <div className="flex justify-between gap-6">
                    <span className="text-gray-500">Availability</span>

                    <span
                      className={
                        product.stock > 0 ? "text-green-700" : "text-red-600"
                      }
                    >
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  {/* Country */}

                  {product.countryOfOrigin && (
                    <div className="flex justify-between gap-6">
                      <span className="text-gray-500">Country of Origin</span>

                      <span className="text-right">
                        {product.countryOfOrigin}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          REVIEWS
      ========================================== */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="border-t border-gray-200 pt-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
                Genuine Customer Feedback
              </p>

              <h2 className="text-2xl md:text-3xl font-serif">
                Customer Reviews
              </h2>
            </div>

            {!myReview && (
              <button
                type="button"
                onClick={() => {
                  if (!token) {
                    navigate("/login");
                    return;
                  }

                  setShowReviewForm((previous) => !previous);
                }}
                className="w-fit border border-black px-6 py-3 text-sm uppercase tracking-wider transition hover:bg-black hover:text-white"
              >
                {showReviewForm ? "Close Review" : "Write a Review"}
              </button>
            )}
          </div>

          {/* ======================================
        RATING SUMMARY
    ====================================== */}

          <div className="mt-10 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10 border-y border-gray-200 py-10">
            <div>
              <div className="text-5xl font-semibold text-gray-900">
                {Number(product.rating || 0).toFixed(1)}
              </div>

              <div className="flex mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      star <= Math.round(product.rating || 0)
                        ? "text-yellow-500 text-xl"
                        : "text-gray-300 text-xl"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-2">
                Based on {product.reviews || 0} verified reviews
              </p>
            </div>

            {/* ======================================
          RATING DISTRIBUTION
      ====================================== */}

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(
                  (review) => review.rating === rating,
                ).length;

                const percentage =
                  reviews.length > 0
                    ? Math.round((count / reviews.length) * 100)
                    : 0;

                return (
                  <div key={rating} className="flex items-center gap-3 text-sm">
                    <span className="w-8">{rating} ★</span>

                    <div className="h-2 flex-1 bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-black transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <span className="w-8 text-right text-gray-500">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================
        REVIEW FORM
    ====================================== */}

          {showReviewForm && !myReview && (
            <form
              onSubmit={handleSubmitReview}
              className="mt-10 border border-gray-200 p-6 md:p-8 bg-gray-50"
            >
              <h3 className="text-xl font-serif">Write Your Review</h3>

              <p className="text-sm text-gray-500 mt-2">
                Your review will be published after verification and approval.
              </p>

              {/* Rating */}

              <div className="mt-6">
                <label className="block text-sm font-medium mb-3">
                  Your Rating
                </label>

                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleReviewRating(star)}
                      className="text-3xl leading-none transition hover:scale-110"
                      aria-label={`Rate ${star} out of 5`}
                    >
                      <span
                        className={
                          star <= reviewForm.rating
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}

              <div className="mt-6">
                <label
                  htmlFor="review-title"
                  className="block text-sm font-medium mb-2"
                >
                  Review Title
                </label>

                <input
                  id="review-title"
                  name="title"
                  type="text"
                  value={reviewForm.title}
                  onChange={handleReviewInput}
                  maxLength={120}
                  placeholder="Give your review a title"
                  className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* Comment */}

              <div className="mt-6">
                <label
                  htmlFor="review-comment"
                  className="block text-sm font-medium mb-2"
                >
                  Your Review
                </label>

                <textarea
                  id="review-comment"
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleReviewInput}
                  maxLength={2000}
                  rows={6}
                  placeholder="Tell other customers about your experience..."
                  className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none resize-none focus:border-black"
                />

                <p className="text-xs text-gray-400 mt-2">
                  {reviewForm.comment.length}/2000
                </p>
              </div>

              {/* ======================================
    CUSTOMER REVIEW PHOTOS
====================================== */}

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">
                  Add Photos <span className="text-gray-400">(Optional)</span>
                </label>

                <p className="text-xs text-gray-500 mb-4">
                  Share photos of the product you received. Maximum 5 photos,
                  5MB each.
                </p>

                <div className="flex flex-wrap gap-3">
                  {reviewImagePreviews.map((preview, index) => (
                    <div
                      key={`${preview}-${index}`}
                      className="relative w-24 h-28 border border-gray-200 bg-white overflow-hidden"
                    >
                      <img
                        src={preview}
                        alt={`Review upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeReviewImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-black text-white text-sm"
                        aria-label={`Remove photo ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {reviewImages.length < 5 && (
                    <label className="w-24 h-28 border border-dashed border-gray-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-black transition">
                      <span className="text-2xl text-gray-500">+</span>

                      <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">
                        Add Photo
                      </span>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleReviewImagesChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {uploadingReviewImages && (
                  <div className="mt-4 text-sm text-gray-500">
                    Uploading your photos...
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting || uploadingReviewImages}
                className="mt-6 bg-black text-white px-7 py-3 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingReviewImages
                  ? "Uploading Photos..."
                  : reviewSubmitting
                    ? "Submitting..."
                    : "Submit Review"}
              </button>
            </form>
          )}

          {/* ======================================
        EXISTING CUSTOMER REVIEW MESSAGE
    ====================================== */}

          {myReview && (
            <div className="mt-8 border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-medium">
                You have already reviewed this product.
              </p>

              {!myReview.isApproved && (
                <p className="text-sm text-gray-500 mt-1">
                  Your review is currently awaiting approval.
                </p>
              )}
            </div>
          )}

          {/* ======================================
        REVIEWS LIST
    ====================================== */}

          <div className="mt-10">
            {reviewLoading ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-500">
                  Loading customer reviews...
                </p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-10 text-center border border-gray-100">
                <p className="text-sm text-gray-500">
                  No customer reviews yet.
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Be the first verified customer to share your experience.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <article key={review._id} className="py-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={
                                  star <= review.rating
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>

                          {review.isVerifiedPurchase && (
                            <span className="text-xs text-green-700">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>

                        {review.title && (
                          <h3 className="mt-3 font-medium text-gray-900">
                            {review.title}
                          </h3>
                        )}

                        <p className="mt-2 text-sm leading-7 text-gray-600 whitespace-pre-line">
                          {review.comment}
                        </p>

                        {/* CUSTOMER REVIEW PHOTOS */}

                        {Array.isArray(review.images) &&
                          review.images.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-3">
                              {review.images.map((image, index) => (
                                <a
                                  key={`${image}-${index}`}
                                  href={image}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-24 h-28 overflow-hidden border border-gray-200 bg-gray-50"
                                >
                                  <img
                                    src={image}
                                    alt={`${review.user?.name || "Customer"} review photo ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    loading="lazy"
                                  />
                                </a>
                              ))}
                            </div>
                          )}

                        <div className="mt-4 text-xs text-gray-400">
                          {review.user?.name || "Customer"}
                          {" • "}
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Reply */}

                    {review.adminReply && (
                      <div className="mt-5 ml-0 md:ml-8 border-l-2 border-gray-200 pl-5">
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Mehaa Garments
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {review.adminReply}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          SIMILAR PRODUCTS
      ========================================== */}

      {similarProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
                You May Also Like
              </p>

              <h2 className="text-2xl md:text-3xl font-serif">
                Similar Products
              </h2>
            </div>

            <button
              onClick={() => navigate(`/collections/${product.category}`)}
              className="hidden sm:block text-sm underline underline-offset-4"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {similarProducts.map((item) => {
              const itemImage =
                item.images?.length > 0 ? item.images[0] : item.image;

              return (
                <button
                  key={item._id}
                  onClick={() => handleSimilarProduct(item)}
                  className="text-left group"
                >
                  <div className="bg-gray-50 overflow-hidden">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="
                          w-full
                          aspect-4/5
                          object-cover
                          transition-transform
                          duration-500
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div className="w-full aspect-4/5 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium line-clamp-2">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-semibold">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </span>

                      {item.oldPrice > item.price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{Number(item.oldPrice || 0).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductSpecification;

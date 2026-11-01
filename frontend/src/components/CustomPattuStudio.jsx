import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Sparkles,
  UploadCloud,
  ImagePlus,
  X,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Loader2,
  Crown,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const WHATSAPP_NUMBER = "917418541436";
const DRAFT_KEY = "mehaaCustomPattuDraft";
const CLOUDINARY_FOLDER = "mehaa-garments/custom-designs";
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const initialForm = {
  zariType: "gold",
  preferredColor: "",
  occasion: "",
  designDescription: "",
  referenceImages: [],
};

const CustomPattuStudio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated } = useAuth();

  const fileInputRef = useRef(null);

  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      return saved ? { ...initialForm, ...JSON.parse(saved) } : initialForm;
    } catch {
      return initialForm;
    }
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Preserve design details when customers go to login.
  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const redirectToLogin = () => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));

    navigate("/login", {
      state: {
        from: `${location.pathname}#custom-pattu-studio`,
      },
    });
  };

  // ==========================================
  // CLOUDINARY SIGNED IMAGE UPLOAD
  // ==========================================

  const handleImageUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    event.target.value = "";

    if (!selectedFiles.length) return;

    if (!isAuthenticated || !token) {
      redirectToLogin();
      return;
    }

    if (form.referenceImages.length + selectedFiles.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      const validType = ["image/jpeg", "image/png", "image/webp"].includes(
        file.type,
      );

      if (!validType) {
        setError("Please upload JPG, PNG or WEBP images only.");
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Each image must be smaller than 5 MB.");
        return false;
      }

      return true;
    });

    if (!validFiles.length) return;

    setUploading(true);
    setError("");

    try {
      for (const file of validFiles) {
        // Request protected Cloudinary signature.
        const signatureResponse = await fetch(
          `${API_URL}/uploads/signature?folder=${encodeURIComponent(
            CLOUDINARY_FOLDER,
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const signatureData = await signatureResponse.json();

        if (!signatureResponse.ok) {
          throw new Error(
            signatureData.message || "Unable to prepare image upload.",
          );
        }

        const uploadData = new FormData();

        uploadData.append("file", file);
        uploadData.append("api_key", signatureData.apiKey);
        uploadData.append("timestamp", signatureData.timestamp);
        uploadData.append("signature", signatureData.signature);
        uploadData.append("folder", signatureData.folder);

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
          {
            method: "POST",
            body: uploadData,
          },
        );

        const cloudinaryData = await cloudinaryResponse.json();

        if (!cloudinaryResponse.ok) {
          throw new Error(
            cloudinaryData.error?.message || "Image upload failed.",
          );
        }

        setForm((previous) => ({
          ...previous,
          referenceImages: [
            ...previous.referenceImages,
            {
              url: cloudinaryData.secure_url,
              publicId: cloudinaryData.public_id,
            },
          ],
        }));
      }

      setSuccess("Your inspiration images have been uploaded.");
    } catch (uploadError) {
      console.error("Custom design upload error:", uploadError);
      setError(uploadError.message || "Unable to upload images.");
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // REMOVE REFERENCE IMAGE
  // ==========================================

  const removeImage = (index) => {
    setForm((previous) => ({
      ...previous,
      referenceImages: previous.referenceImages.filter(
        (_, imageIndex) => imageIndex !== index,
      ),
    }));
  };

  // ==========================================
  // SUBMIT CUSTOM ORDER
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!isAuthenticated || !token) {
      redirectToLogin();
      return;
    }

    if (uploading) {
      setError("Please wait until all images finish uploading.");
      return;
    }

    if (form.designDescription.trim().length < 20) {
      setError("Please describe your dream saree in at least 20 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/custom-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          designDescription: form.designDescription.trim(),
          preferredColor: form.preferredColor.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit your custom design.");
      }

      sessionStorage.removeItem(DRAFT_KEY);

      setForm(initialForm);

      setSuccess(
        "Your dream saree request has been submitted successfully! Our team will contact you soon.",
      );

      await Swal.fire({
        icon: "success",
        title: "Your Dream Saree Journey Begins!",
        html: `
    <p style="color:#786d62;font-size:14px;line-height:1.8;">
      Your custom Pattu saree design has been
      successfully submitted.
    </p>
    <p style="color:#8b7355;font-size:13px;margin-top:12px;">
      Our team will contact you soon to discuss
      your beautiful creation.
    </p>
  `,
        confirmButtonText: "Wonderful!",
        confirmButtonColor: "#49382b",
        background: "#faf9f7",
        color: "#30261f",
        width: "460px",
        padding: "35px",
        showCloseButton: true,
        allowOutsideClick: false,
        customClass: {
          popup: "mehaa-custom-popup",
          title: "mehaa-popup-title",
          confirmButton: "mehaa-popup-button",
        },
      });
    } catch (submitError) {
      console.error("Custom order submission error:", submitError);

      setError(
        submitError.message || "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    "Hello Mehaa Garments! I am interested in creating a custom-designed Pattu saree. I would like to discuss my design ideas with your team.",
  );

  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <section
      id="custom-pattu-studio"
      className="scroll-mt-24 overflow-hidden bg-[#f5f1eb] px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-360">
        {/* ==================================
            EDITORIAL INTRODUCTION
        ================================== */}

        <header className="mx-auto mb-14 max-w-4xl text-center sm:mb-20">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#9b8062]" />

            <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#8b7355] sm:text-[10px]">
              The Art of Custom Pattu
            </p>

            <span className="h-px w-10 bg-[#9b8062]" />
          </div>

          <div className="mb-5 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c9b69d] text-[#8b7355]">
              <Crown size={21} strokeWidth={1.2} />
            </div>
          </div>

          <h2 className="font-serif text-4xl font-normal leading-tight tracking-[-0.04em] text-[#30261f] sm:text-5xl md:text-6xl lg:text-7xl">
            Your Dream Pattu Saree,
            <span className="mt-1 block italic text-[#967a5c]">
              Designed by You.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#786d62] sm:text-base sm:leading-8">
            Every saree tells a story. What if yours could begin with your
            imagination? Share your favourite designs, colours and patterns. At
            Mehaa Garments, we bring your dream Pattu saree to life with
            beautiful traditional craftsmanship.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[9px] font-medium uppercase tracking-[0.2em] text-[#8b7355] sm:text-[10px]">
            <span>Gold Zari</span>
            <span className="h-1 w-1 rounded-full bg-[#b59a75]" />
            <span>Silver Zari</span>
            <span className="h-1 w-1 rounded-full bg-[#b59a75]" />
            <span>Exclusive Pattu</span>
          </div>
        </header>

        {/* ==================================
            ZARI SHOWCASE
        ================================== */}

        <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mb-24 lg:gap-8">
          {/* GOLD ZARI */}

          <button
            type="button"
            onClick={() => updateField("zariType", "gold")}
            aria-pressed={form.zariType === "gold"}
            className={`group relative overflow-hidden border p-5 text-left transition duration-300 sm:p-7 ${
              form.zariType === "gold"
                ? "border-[#9b8062] bg-[#ebe2d5] shadow-[0_8px_30px_rgba(80,55,30,0.08)]"
                : "border-[#e0d6c9] bg-[#faf8f4] hover:border-[#b49a78]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#8b7355]">
                  Traditional Elegance
                </span>

                <h3 className="mt-2 font-serif text-3xl text-[#49382b] sm:text-4xl">
                  Gold Zari
                </h3>

                <p className="mt-2 text-xs text-[#786d62]">தங்க ஜரிகை</p>
              </div>

              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#bba27e] text-[#8b7355]">
                {form.zariType === "gold" ? (
                  <CheckCircle2 size={19} />
                ) : (
                  <Sparkles size={18} />
                )}
              </span>
            </div>

            <div className="my-7 h-px bg-[#cbb99f]" />

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#b99a5c]" />
              <span className="text-[9px] uppercase tracking-[0.17em] text-[#786d62]">
                Select Golden Zari
              </span>
            </div>

            {form.zariType === "gold" && (
              <span className="absolute right-5 top-5 text-[8px] font-semibold uppercase tracking-widest text-[#8b7355]">
                Selected
              </span>
            )}
          </button>

          {/* SILVER ZARI */}

          <button
            type="button"
            onClick={() => updateField("zariType", "silver")}
            aria-pressed={form.zariType === "silver"}
            className={`group relative overflow-hidden border p-5 text-left transition duration-300 sm:p-7 ${
              form.zariType === "silver"
                ? "border-[#9b8062] bg-[#ebe7e1] shadow-[0_8px_30px_rgba(80,55,30,0.08)]"
                : "border-[#e0d6c9] bg-[#faf8f4] hover:border-[#b49a78]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#8b7355]">
                  Understated Luxury
                </span>

                <h3 className="mt-2 font-serif text-3xl text-[#49382b] sm:text-4xl">
                  Silver Zari
                </h3>

                <p className="mt-2 text-xs text-[#786d62]">வெள்ளி ஜரிகை</p>
              </div>

              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#bba27e] text-[#8b7355]">
                {form.zariType === "silver" ? (
                  <CheckCircle2 size={19} />
                ) : (
                  <Sparkles size={18} />
                )}
              </span>
            </div>

            <div className="my-7 h-px bg-[#d0c9bd]" />

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-[#aaa69e] bg-[#d8d5cf]" />
              <span className="text-[9px] uppercase tracking-[0.17em] text-[#786d62]">
                Select Silver Zari
              </span>
            </div>

            {form.zariType === "silver" && (
              <span className="absolute right-5 top-5 text-[8px] font-semibold uppercase tracking-widest text-[#8b7355]">
                Selected
              </span>
            )}
          </button>
        </div>

        {/* ==================================
            CUSTOM DESIGN FORM
        ================================== */}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          {/* LEFT CONTENT */}

          <div className="lg:sticky lg:top-28 lg:h-fit">
            <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#967a5c]">
              A Creation Beyond Ordinary
            </p>

            <h3 className="mt-4 font-serif text-4xl leading-tight text-[#30261f] sm:text-5xl">
              Imagine it.
              <span className="block italic text-[#967a5c]">
                We'll create it.
              </span>
            </h3>

            <p className="mt-5 text-sm leading-7 text-[#786d62]">
              Have a special design in mind? A wedding saree you've always
              dreamed of? A traditional border or a unique pallu pattern? Share
              your inspiration with us.
            </p>

            <div className="mt-9 space-y-5 border-t border-[#ded4c6] pt-7">
              {[
                [
                  "01",
                  "Share Your Inspiration",
                  "Upload photos, sketches or reference designs.",
                ],
                [
                  "02",
                  "Describe Your Vision",
                  "Tell us about colours, borders and motifs.",
                ],
                [
                  "03",
                  "We Bring It to Life",
                  "Our team will connect with you to discuss your design.",
                ],
              ].map(([number, title, description]) => (
                <div key={number} className="flex gap-4">
                  <span className="font-serif text-xl italic text-[#a58a69]">
                    {number}
                  </span>

                  <div>
                    <h4 className="text-sm font-medium text-[#49382b]">
                      {title}
                    </h4>

                    <p className="mt-1 text-xs leading-5 text-[#82776b]">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT FORM */}

          <form
            onSubmit={handleSubmit}
            className="border border-[#e0d6c9] bg-[#faf9f7] p-5 sm:p-8 lg:p-10"
          >
            <div className="mb-8 border-b border-[#e4dbd0] pb-6">
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#967a5c]">
                Your Custom Creation
              </p>

              <h3 className="mt-2 font-serif text-3xl text-[#30261f]">
                Design Your Saree
              </h3>

              <p className="mt-2 text-xs leading-6 text-[#82776b]">
                Tell us what you have in mind. Every detail helps us understand
                your dream creation.
              </p>
            </div>

            {/* COLOUR */}

            <div className="mb-7">
              <label
                htmlFor="preferredColor"
                className="mb-3 block text-[10px] font-medium uppercase tracking-[0.17em] text-[#49382b]"
              >
                Preferred Saree Colour
                <span className="ml-1 text-[#a18a70]">(Optional)</span>
              </label>

              <input
                id="preferredColor"
                type="text"
                value={form.preferredColor}
                onChange={(e) => updateField("preferredColor", e.target.value)}
                maxLength={100}
                placeholder="e.g. Royal Blue, Maroon, Emerald Green..."
                className="w-full border border-[#ded5ca] bg-white px-4 py-3.5 text-sm text-[#49382b] outline-none transition placeholder:text-[#b2a89c] focus:border-[#9b8062]"
              />
            </div>

            {/* OCCASION */}

            <div className="mb-7">
              <label
                htmlFor="occasion"
                className="mb-3 block text-[10px] font-medium uppercase tracking-[0.17em] text-[#49382b]"
              >
                Occasion
                <span className="ml-1 text-[#a18a70]">(Optional)</span>
              </label>

              <div className="group relative">
                <select
                  id="occasion"
                  value={form.occasion}
                  onChange={(e) => updateField("occasion", e.target.value)}
                  className="w-full appearance-none border border-[#ded5ca] bg-white px-4 py-4 pr-12 text-sm text-[#49382b] outline-none transition-all duration-300 hover:border-[#b49a78] focus:border-[#9b8062] focus:bg-[#fdfcf9] focus:ring-2 focus:ring-[#9b8062]/10"
                >
                  <option value="">Choose an occasion</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Reception">Reception</option>
                  <option value="Festival">Festival</option>
                  <option value="Traditional Event">Traditional Event</option>
                  <option value="Other">Other</option>
                </select>

                <ChevronDown
                  size={17}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#967a5c] transition-transform duration-300 group-focus-within:rotate-180"
                />
              </div>
            </div>

            {/* IMAGE UPLOAD */}

            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="text-[10px] font-medium uppercase tracking-[0.17em] text-[#49382b]">
                  Upload Your Inspiration
                </label>

                <span className="text-[10px] text-[#9b8062]">
                  {form.referenceImages.length}/{MAX_IMAGES} Images
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
                disabled={
                  uploading || form.referenceImages.length >= MAX_IMAGES
                }
                className="hidden"
              />

              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated || !token) {
                    redirectToLogin();
                    return;
                  }

                  fileInputRef.current?.click();
                }}
                disabled={
                  uploading || form.referenceImages.length >= MAX_IMAGES
                }
                className="flex min-h-40 w-full flex-col items-center justify-center border border-dashed border-[#bca78d] bg-[#f5f1eb] px-4 py-7 text-center transition hover:border-[#8b7355] hover:bg-[#f0e9df] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 size={27} className="animate-spin text-[#8b7355]" />
                ) : (
                  <ImagePlus
                    size={28}
                    strokeWidth={1.3}
                    className="text-[#8b7355]"
                  />
                )}

                <span className="mt-3 text-xs font-medium text-[#49382b]">
                  {uploading
                    ? "Uploading your images..."
                    : "Choose Design Images"}
                </span>

                <span className="mt-2 text-[10px] leading-5 text-[#918477]">
                  JPG, PNG or WEBP · Maximum 5 MB per image
                  <br />
                  Upload up to 5 reference images
                </span>
              </button>

              {/* IMAGE PREVIEWS */}

              {form.referenceImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {form.referenceImages.map((image, index) => (
                    <div
                      key={image.publicId || image.url}
                      className="group relative aspect-square overflow-hidden border border-[#e0d6c9]"
                    >
                      <img
                        src={image.url}
                        alt={`Custom saree reference ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={uploading}
                        aria-label={`Remove image ${index + 1}`}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center bg-black/70 text-white transition hover:bg-red-600 disabled:opacity-50"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DESIGN DESCRIPTION */}

            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between gap-2">
                <label
                  htmlFor="designDescription"
                  className="text-[10px] font-medium uppercase tracking-[0.17em] text-[#49382b]"
                >
                  Describe Your Dream Saree
                </label>

                <span className="text-[10px] text-[#9b8062]">
                  {form.designDescription.length}/5000
                </span>
              </div>

              <textarea
                id="designDescription"
                value={form.designDescription}
                onChange={(e) =>
                  updateField("designDescription", e.target.value)
                }
                minLength={20}
                maxLength={5000}
                required
                rows={9}
                placeholder="Tell us about your dream Pattu saree...

What colours would you love?

How would you like your border and pallu?

Do you have a particular traditional motif or pattern in mind?

Describe every little detail. We would love to hear your ideas..."
                className="w-full resize-y border border-[#ded5ca] bg-white px-4 py-4 text-sm leading-7 text-[#49382b] outline-none transition placeholder:text-[#b2a89c] focus:border-[#9b8062]"
              />

              <p className="mt-2 text-[10px] leading-5 text-[#948679]">
                Minimum 20 characters. Share as many details as you wish.
              </p>
            </div>

            {/* STATUS MESSAGES */}

            {error && (
              <div
                role="alert"
                className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-xs leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-5 flex gap-3 border border-green-200 bg-green-50 px-4 py-4 text-xs leading-6 text-green-800"
              >
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={submitting || uploading}
              className="group flex w-full items-center justify-center gap-3 bg-[#49382b] px-5 py-4 text-[10px] font-medium uppercase tracking-[0.22em] text-white transition duration-300 hover:bg-[#8b7355] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Submitting Your Design...
                </>
              ) : (
                <>
                  {!isAuthenticated
                    ? "Login to Submit Your Design"
                    : "Submit Your Custom Design"}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[11px] leading-6 text-[#82776b]">
              Our team will contact you soon.
            </p>

            <div className="my-7 flex items-center gap-4">
              <span className="h-px flex-1 bg-[#e2d8cc]" />
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#a18a70]">
                OR
              </span>
              <span className="h-px flex-1 bg-[#e2d8cc]" />
            </div>

            {/* WHATSAPP CTA */}

            <a
              href={whatsappURL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center justify-center gap-3 border border-[#c9b69d] bg-transparent px-5 py-4 text-[10px] font-medium uppercase tracking-[0.18em] text-[#49382b] transition duration-300 hover:border-[#547b57] hover:bg-[#edf2eb] hover:text-[#426d47]"
            >
              <MessageCircle size={18} />
              Chat With Us on WhatsApp
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>

            <p className="mt-4 text-center text-[10px] text-[#948679]">
              Have questions? Let's discuss your dream creation.
            </p>
          </form>
        </div>

        {/* ==================================
            CLOSING LINE
        ================================== */}

        <div className="mt-16 border-t border-[#ded4c6] pt-9 text-center sm:mt-24">
          <Sparkles
            size={19}
            strokeWidth={1.2}
            className="mx-auto text-[#967a5c]"
          />

          <h3 className="mt-4 font-serif text-2xl italic text-[#49382b] sm:text-3xl">
            Your imagination deserves to be woven.
          </h3>

          <p className="mt-3 text-[9px] uppercase tracking-[0.25em] text-[#8b7355]">
            Exclusively Crafted by Mehaa Garments
          </p>
        </div>
      </div>
    </section>
  );
};

export default CustomPattuStudio;

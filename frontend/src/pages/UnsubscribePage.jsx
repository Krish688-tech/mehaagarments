
import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const subscriberId = searchParams.get("subscriberId");
  const token = searchParams.get("token");

  const isPreview = location.pathname === "/unsubscribe-preview";

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleUnsubscribe = async () => {
    if (!subscriberId || !token) {
      setStatus("error");
      setMessage("This unsubscribe link is invalid or incomplete.");
      return;
    }

    try {
      setStatus("loading");

      const response = await fetch(`${API_URL}/newsletter/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriberId,
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to unsubscribe.");
      }

      setStatus("success");
      setMessage(
        data.message || "You have successfully unsubscribed from our newsletter."
      );
    } catch (error) {
      console.error("Newsletter Unsubscribe Error:", error);

      setStatus("error");
      setMessage(error.message || "Something went wrong. Please try again.");
    }
  };

  const isValidLink = Boolean(subscriberId && token);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-4 py-12">

      <div className="w-full max-w-lg overflow-hidden border border-gray-200 bg-white shadow-sm">

        {/* BRAND HEADER */}

        <div className="bg-[#111111] px-6 py-9 text-center">

          <h1 className="font-serif text-4xl italic tracking-wide text-white">
            Mehaa
          </h1>

          <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-gray-400">
            Elegance in Every Saree
          </p>

        </div>

        {/* CONTENT */}

        <div className="px-7 py-12 text-center md:px-12">

          {status === "success" ? (
            <>
              <CheckCircle2
                size={48}
                className="mx-auto text-green-600"
                strokeWidth={1.5}
              />

              <h2 className="mt-6 font-serif text-2xl text-gray-900">
                You're Unsubscribed
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                {message}
              </p>

              <p className="mt-5 text-sm leading-6 text-gray-500">
                You will no longer receive promotional emails from Mehaa
                Garments.
              </p>
            </>
          ) : status === "error" ? (
            <>
              <AlertCircle
                size={48}
                className="mx-auto text-red-500"
                strokeWidth={1.5}
              />

              <h2 className="mt-6 font-serif text-2xl text-gray-900">
                Unable to Unsubscribe
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                {message}
              </p>

              {isValidLink && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setMessage("");
                  }}
                  className="mt-7 bg-black px-7 py-3 text-xs font-semibold tracking-wider text-white transition hover:bg-gray-800"
                >
                  TRY AGAIN
                </button>
              )}
            </>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Mail size={25} className="text-gray-700" />
              </div>

              <h2 className="mt-6 font-serif text-2xl text-gray-900">
                Unsubscribe from Emails
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                We're sorry to see you go. If you no longer wish to receive
                promotional emails about our latest saree collections,
                offers and updates, you can unsubscribe below.
              </p>

              {isPreview ? (
                <div className="mt-8 border border-gray-200 bg-gray-50 px-4 py-4">
                  <p className="text-xs leading-6 text-gray-500">
                    This is a preview of the customer unsubscribe page.
                    Actual unsubscribe links will contain a secure personal
                    token.
                  </p>
                </div>
              ) : isValidLink ? (
                <button
                  type="button"
                  onClick={handleUnsubscribe}
                  disabled={status === "loading"}
                  className="mt-8 inline-flex items-center justify-center gap-2 bg-black px-8 py-4 text-xs font-semibold tracking-[0.15em] text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      PROCESSING...
                    </>
                  ) : (
                    "CONFIRM UNSUBSCRIBE"
                  )}
                </button>
              ) : (
                <div className="mt-8 border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="text-xs leading-6 text-amber-800">
                    This link is incomplete or invalid. Please use the
                    unsubscribe link from your original email.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="mt-10 border-t border-gray-200 pt-6">
            <a
              href="https://mehaagarments.in"
              className="text-xs font-medium text-gray-600 underline underline-offset-4 hover:text-black"
            >
              Visit Mehaa Garments
            </a>
          </div>

        </div>

        {/* FOOTER */}

        <div className="border-t border-gray-200 bg-gray-50 px-5 py-5 text-center">
          <p className="text-[10px] tracking-wide text-gray-400">
            © {new Date().getFullYear()} Mehaa Garments. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
};

export default UnsubscribePage;

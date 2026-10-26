import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const OrderSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white px-5 pt-32 pb-20">
      <div className="mx-auto max-w-2xl text-center">
        {/* SUCCESS ICON */}

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
          <svg
            className="h-10 w-10 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* TITLE */}

        <p className="mt-8 text-xs uppercase tracking-[0.3em] text-gray-400">
          Mehaa Garments
        </p>

        <h1 className="mt-3 font-serif text-4xl text-gray-900 md:text-5xl">
          Order Confirmed
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-gray-500">
          Thank you for shopping with Mehaa Garments. Your order has been
          successfully placed and we are preparing it for you.
        </p>

        {/* ORDER MESSAGE */}

        <div className="mt-10 border border-gray-200 bg-gray-50 px-6 py-7">
          <p className="text-sm text-gray-500">
            Your payment has been processed successfully.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            You can track your order from your account.
          </p>
        </div>

        {/* BUTTONS */}

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="border border-black px-8 py-3 text-sm font-medium uppercase tracking-wide text-black transition hover:bg-black hover:text-white"
          >
            View My Orders
          </button>

          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="bg-black px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
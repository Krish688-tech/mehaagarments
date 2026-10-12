import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Lock, LogOut } from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

const MyAccount = () => {
  const navigate = useNavigate();

  const { user, token, logout, updateUser } = useAuth();

  const [activeSection, setActiveSection] = useState("profile");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // GET CUSTOMER PROFILE
  // ============================================

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const API_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";

        const response = await fetch(`${API_URL}/users/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        // ----------------------------------------
        // Unauthorized / expired token
        // ----------------------------------------

        if (response.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        const customer = data.user;

        // ----------------------------------------
        // Store API data in local state
        // ----------------------------------------

        setProfile({
          name: customer?.name || "",
          email: customer?.email || "",
          phone: customer?.address?.phone || "",
          address: customer?.address?.address || "",
          apartment: customer?.address?.apartment || "",
          city: customer?.address?.city || "",
          state: customer?.address?.state || "",
          pincode: customer?.address?.pincode || "",
          country: customer?.address?.country || "",
        });
      } catch (error) {
        console.error("Fetch Profile Error:", error);

        setError(
          error.message || "Unable to load your profile. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate, logout]);

  // ============================================
  // SAVE ADDRESS
  // ============================================

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setAddressError("");

    // ----------------------------------------
    // Frontend validation
    // ----------------------------------------

    if (
      !profile.phone ||
      !profile.address ||
      !profile.city ||
      !profile.state ||
      !profile.pincode ||
      !profile.country
    ) {
      setAddressError("Please complete all required address fields.");

      return;
    }

    if (!/^[0-9]{10}$/.test(profile.phone.trim())) {
      setAddressError("Please enter a valid 10-digit phone number.");

      return;
    }

    if (!/^[0-9]{6}$/.test(profile.pincode.trim())) {
      setAddressError("Please enter a valid 6-digit pincode.");

      return;
    }

    try {
      setSavingAddress(true);

      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await fetch(`${API_URL}/users/save-address`, {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          phone: profile.phone.trim(),
          address: profile.address.trim(),
          apartment: profile.apartment.trim(),
          city: profile.city.trim(),
          state: profile.state.trim(),
          pincode: profile.pincode.trim(),
          country: profile.country.trim(),
        }),
      });

      const data = await response.json();

      // ----------------------------------------
      // Authentication failure
      // ----------------------------------------

      if (response.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      // ----------------------------------------
      // API validation/server error
      // ----------------------------------------

      if (!response.ok) {
        throw new Error(data.message || "Failed to save address");
      }

      // ----------------------------------------
      // Update local state with saved address
      // ----------------------------------------

      setProfile((previous) => ({
        ...previous,

        phone: data.address?.phone || previous.phone,
        address: data.address?.address || previous.address,
        apartment: data.address?.apartment || previous.apartment,
        city: data.address?.city || previous.city,
        state: data.address?.state || previous.state,
        pincode: data.address?.pincode || previous.pincode,
        country: data.address?.country || previous.country,
      }));

      setAddressError("");

      await Swal.fire({
        icon: "success",
        title: "Address Saved",
        text: "Your address has been saved successfully.",
        confirmButtonColor: "#000000",
      });
    } catch (error) {
      console.error("Save Address Error:", error);

      setAddressError(
        error.message || "Unable to save your address. Please try again.",
      );
    } finally {
      setSavingAddress(false);
    }
  };

  // ============================================
  // UPDATE PROFILE
  // PUT /api/users/profile
  // ============================================

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setProfileError("");

    const cleanName = profile.name.trim();
    const cleanPhone = profile.phone.trim();

    // ----------------------------------------
    // Validate name
    // ----------------------------------------

    if (!cleanName) {
      setProfileError("Name is required.");
      return;
    }

    if (cleanName.length < 2) {
      setProfileError("Name must contain at least 2 characters.");
      return;
    }

    if (cleanName.length > 50) {
      setProfileError("Name cannot exceed 50 characters.");
      return;
    }

    // ----------------------------------------
    // Validate phone
    // ----------------------------------------

    if (!cleanPhone) {
      setProfileError("Phone number is required.");
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      setProfileError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setSavingProfile(true);

      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: cleanName,

          address: {
            phone: cleanPhone,
          },
        }),
      });

      const data = await response.json();

      // ----------------------------------------
      // Token expired / invalid
      // ----------------------------------------

      if (response.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      // ----------------------------------------
      // API error
      // ----------------------------------------

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      const updatedUser = data.user;

      // ----------------------------------------
      // Update local profile state
      // ----------------------------------------

      setProfile((previous) => ({
        ...previous,

        name: updatedUser?.name || cleanName,

        phone: updatedUser?.address?.phone || cleanPhone,
      }));

      // ----------------------------------------
      // Exit edit mode
      // ----------------------------------------

      setEditingProfile(false);
      setProfileError("");

      // ----------------------------------------
      // Update AuthContext / localStorage
      // ----------------------------------------

      if (updatedUser) {
        updateUser(updatedUser);
      }

      await Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been updated successfully.",
        confirmButtonColor: "#000000",
      });
    } catch (error) {
      console.error("Update Profile Error:", error);

      setProfileError(
        error.message || "Unable to update your profile. Please try again.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f7] pt-28 pb-20 px-5 md:px-10">
      {loading && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-500">
            Loading your account...
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        </div>
      )}
      {/* PAGE HEADER */}
      <div className="max-w-7xl mx-auto mb-12">
        <p className="text-xs uppercase tracking-[4px] text-gray-500 mb-3">
          My Account
        </p>

        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-[#222]">
          Welcome back,{" "}
          <span className="font-medium">
            {profile.name || user?.name || "Customer"}
          </span>
        </h1>

        <p className="mt-4 text-gray-500 max-w-xl">
          Manage your personal information, address and account security.
        </p>
      </div>

      {/* ACCOUNT CONTENT */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* SIDEBAR */}
          <aside className="bg-white rounded-3xl border border-gray-100 p-4 h-fit shadow-sm">
            <button
              onClick={() => setActiveSection("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition ${
                activeSection === "profile"
                  ? "bg-black text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <User size={18} />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => setActiveSection("address")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition mt-1 ${
                activeSection === "address"
                  ? "bg-black text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <MapPin size={18} />
              <span>My Address</span>
            </button>

            <button
              onClick={() => setActiveSection("password")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition mt-1 ${
                activeSection === "password"
                  ? "bg-black text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Lock size={18} />
              <span>Change Password</span>
            </button>

            <div className="border-t border-gray-100 my-4" />

            <button
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-red-500 hover:bg-red-50 transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </aside>

          {/* MAIN CONTENT */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
            {/* PROFILE */}
            {activeSection === "profile" && (
              <div>
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-[3px] text-gray-400">
                    Personal Information
                  </p>

                  <h2 className="text-2xl font-medium text-gray-900 mt-2">
                    My Profile
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Manage your personal information.
                  </p>
                </div>

                {/* =========================================
        VIEW MODE
    ========================================= */}

                {!editingProfile && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* NAME */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>

                        <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900">
                          {profile.name || "Not added yet"}
                        </div>
                      </div>

                      {/* EMAIL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>

                        <div className="relative">
                          <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 pr-20">
                            {profile.email}
                          </div>

                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            Verified
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                          Email changes will require verification.
                        </p>
                      </div>

                      {/* PHONE */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>

                        <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900">
                          {profile.phone || "Not added yet"}
                        </div>
                      </div>
                    </div>

                    {/* VIEW MODE BUTTONS */}

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileError("");
                          setEditingProfile(true);
                        }}
                        className="px-7 py-3 rounded-full bg-black text-white text-sm font-medium hover:scale-105 transition"
                      >
                        Edit Profile
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveSection("address")}
                        className="px-7 py-3 rounded-full border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 transition"
                      >
                        Manage Address
                      </button>
                    </div>
                  </div>
                )}

                {/* =========================================
        EDIT MODE
    ========================================= */}

                {editingProfile && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* NAME */}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>

                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) =>
                            setProfile((previous) => ({
                              ...previous,
                              name: e.target.value,
                            }))
                          }
                          autoFocus
                          maxLength={50}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-black transition"
                        />
                      </div>

                      {/* EMAIL */}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>

                        <div className="relative">
                          <input
                            type="email"
                            value={profile.email}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none pr-20 cursor-not-allowed"
                          />

                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            Verified
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                          Email changes will require verification.
                        </p>
                      </div>

                      {/* PHONE */}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>

                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) =>
                            setProfile((previous) => ({
                              ...previous,
                              phone: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10),
                            }))
                          }
                          maxLength={10}
                          inputMode="numeric"
                          placeholder="10-digit phone number"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-black transition"
                        />
                      </div>
                    </div>

                    {/* ERROR */}

                    {profileError && (
                      <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
                        {profileError}
                      </div>
                    )}

                    {/* EDIT MODE BUTTONS */}

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-7 py-3 rounded-full bg-black text-white text-sm font-medium hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingProfile ? "Saving Changes..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        disabled={savingProfile}
                        onClick={() => {
                          setEditingProfile(false);
                          setProfileError("");

                          setProfile((previous) => ({
                            ...previous,
                            name: user?.name || "",
                            email: user?.email || "",
                            phone: user?.address?.phone || "",
                          }));
                        }}
                        className="px-7 py-3 rounded-full border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ADDRESS */}
            {activeSection === "address" && (
              <div>
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-[3px] text-gray-400">
                    Delivery Information
                  </p>

                  <h2 className="text-2xl font-medium text-gray-900 mt-2">
                    My Address
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Add the address you want to use for your orders.
                  </p>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-6">
                  {/* PHONE + APARTMENT */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PHONE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile((previous) => ({
                            ...previous,
                            phone: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          }))
                        }
                        placeholder="10-digit phone number"
                        maxLength={10}
                        autoComplete="tel"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black transition"
                      />
                    </div>

                    {/* APARTMENT */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apartment / Door No.
                      </label>

                      <input
                        type="text"
                        value={profile.apartment}
                        onChange={(e) =>
                          setProfile((previous) => ({
                            ...previous,
                            apartment: e.target.value,
                          }))
                        }
                        placeholder="Apartment / Door No."
                        autoComplete="address-line2"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black transition"
                      />
                    </div>
                  </div>

                  {/* ADDRESS */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>

                    <textarea
                      value={profile.address}
                      onChange={(e) =>
                        setProfile((previous) => ({
                          ...previous,
                          address: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="House / Street / Area"
                      autoComplete="street-address"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black transition resize-none"
                    />
                  </div>

                  {/* CITY + STATE */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CITY */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>

                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) =>
                          setProfile((previous) => ({
                            ...previous,
                            city: e.target.value,
                          }))
                        }
                        placeholder="City"
                        autoComplete="address-level2"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black transition"
                      />
                    </div>

                    {/* STATE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>

                      <input
                        type="text"
                        value={profile.state}
                        onChange={(e) =>
                          setProfile((previous) => ({
                            ...previous,
                            state: e.target.value,
                          }))
                        }
                        placeholder="State"
                        autoComplete="address-level1"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black transition"
                      />
                    </div>
                  </div>

                  {/* PINCODE + COUNTRY */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PINCODE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>

                      <input
                        type="text"
                        inputMode="numeric"
                        value={profile.pincode}
                        onChange={(e) =>
                          setProfile((previous) => ({
                            ...previous,
                            pincode: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          }))
                        }
                        placeholder="6-digit pincode"
                        maxLength={6}
                        autoComplete="postal-code"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black transition"
                      />
                    </div>

                    {/* COUNTRY */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>

                      <input
                        type="text"
                        value={profile.country}
                        onChange={(e) =>
                          setProfile((previous) => ({
                            ...previous,
                            country: e.target.value,
                          }))
                        }
                        placeholder="Country"
                        autoComplete="country-name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black transition"
                      />
                    </div>
                  </div>

                  {/* ERROR */}

                  {addressError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
                      {addressError}
                    </div>
                  )}

                  {/* SAVE BUTTON */}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="px-7 py-3 rounded-full bg-black text-white text-sm font-medium hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {savingAddress ? "Saving Address..." : "Save Address"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PASSWORD */}
            {activeSection === "password" && (
              <div>
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-[3px] text-gray-400">
                    Account Security
                  </p>

                  <h2 className="text-2xl font-medium text-gray-900 mt-2">
                    Change Password
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Keep your account secure with a strong password.
                  </p>
                </div>

                <div className="max-w-xl space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black"
                    />
                  </div>

                  <button className="px-7 py-3 rounded-full bg-black text-white text-sm font-medium hover:scale-105 transition">
                    Change Password
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
};

export default MyAccount;

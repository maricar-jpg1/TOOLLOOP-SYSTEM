
import { useEffect, useState } from "react";
import "./App.css";

import Borrowing from "./components/Borrowing";
import Returns from "./components/Returns";
import { getEquipment, addEquipment } from "./services/api";

function App() {
  // NAVIGATION
  const [activePage, setActivePage] = useState("Dashboard");

  // EQUIPMENT INVENTORY
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // BORROWING REQUESTS
  const [borrowingRequests, setBorrowingRequests] = useState([]);

  // INVENTORY FORM
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
  });

  // SIDEBAR NAVIGATION
  const navigation = [
    "Dashboard",
    "Equipment Inventory",
    "Borrowing Requests",
    "Return Management",
  ];

  // LOAD EQUIPMENT FROM MONGODB THROUGH THE API
  useEffect(() => {
    async function loadEquipment() {
      try {
        setLoading(true);
        setLoadError("");

        const data = await getEquipment();

        setEquipment(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading equipment:", error);
        setLoadError(
          "Unable to load equipment. Please check your API connection."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEquipment();
  }, []);

  // SEARCH EQUIPMENT
  const filteredEquipment = equipment.filter((item) =>
    (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.category || "").toLowerCase().includes(search.toLowerCase())
  );

  // ADD NEW EQUIPMENT TO MONGODB
  async function handleAddEquipment(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Equipment name is required.");
      return;
    }

    if (!form.category.trim()) {
      setError("Please enter an equipment category.");
      return;
    }

    const quantity = Number(form.quantity);

    if (
      form.quantity === "" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      setError("Quantity must be a whole number greater than zero.");
      return;
    }

    try {
      setSaving(true);

      const newEquipment = {
        name: form.name.trim(),
        category: form.category.trim(),
        quantity: quantity,
        availableQuantity: quantity,
        description: "",
      };

      // SAVE TO THE BACKEND API
      const savedEquipment = await addEquipment(newEquipment);

      // UPDATE THE FRONTEND WITH THE DATABASE RESPONSE
      setEquipment((previous) => [
        ...previous,
        savedEquipment,
      ]);

      // RESET FORM
      setForm({
        name: "",
        category: "",
        quantity: "",
      });

      setSearch("");
      setShowForm(false);
      setSuccess("Equipment saved successfully to MongoDB!");
    } catch (error) {
      console.error("Error saving equipment:", error);
      setError(error.message || "Unable to save equipment.");
    } finally {
      setSaving(false);
    }
  }

  // DASHBOARD STATISTICS
  const totalEquipment = equipment.length;

  const totalQuantity = equipment.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const availableEquipment = equipment.filter(
    (item) => Number(item.availableQuantity ?? item.quantity ?? 0) > 0
  ).length;

  const pendingRequests = borrowingRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  const borrowedRequests = borrowingRequests.filter(
    (request) => request.status === "Borrowed"
  ).length;

  // NAVIGATION HANDLER
  function handleNavigation(page) {
    setActivePage(page);
    setError("");
    setSuccess("");
    setShowForm(false);
    setSearch("");
  }

  return (
    <div className="app-container">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">
            T
          </div>

          <div>
            <h2>ToolLoop</h2>
            <p>Community Equipment</p>
          </div>

        </div>

        <div className="sidebar-label">
          MAIN MENU
        </div>

        <nav className="sidebar-navigation">

          {navigation.map((item) => (

            <button
              key={item}
              className={
                activePage === item
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => handleNavigation(item)}
            >

              {item === "Dashboard" && "Dashboard"}

              {item === "Equipment Inventory" && "Inventory"}

              {item === "Borrowing Requests" && "Borrowing"}

              {item === "Return Management" && "Returns"}

            </button>

          ))}

        </nav>

        <div className="sidebar-bottom">
          <p>ToolLoop</p>
          <small>Community Sharing System</small>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* PAGE HEADER */}
        <header className="top-header">

          <div>

            <p className="breadcrumb">
              ToolLoop / {activePage}
            </p>

            <h1>{activePage}</h1>

          </div>

          <span className="user-label">
            Community Member
          </span>

        </header>

        {/* GLOBAL LOADING AND ERROR MESSAGES */}
        {loading && (
          <p className="success-message">
            Loading equipment...
          </p>
        )}

        {loadError && (
          <p className="form-error" role="alert">
            {loadError}
          </p>
        )}

        {/* ================================= */}
        {/* DASHBOARD */}
        {/* ================================= */}

        {activePage === "Dashboard" && (

          <section>

            {/* WELCOME BANNER */}
            <div className="welcome-banner">

              <div>

                <p>COMMUNITY EQUIPMENT MANAGEMENT</p>

                <h2>Welcome to ToolLoop!</h2>

                <span>
                  Share equipment, lend resources, and
                  manage community borrowing activities.
                </span>

              </div>

              <button
                onClick={() =>
                  handleNavigation("Equipment Inventory")
                }
              >
                View Equipment
              </button>

            </div>

            {/* DASHBOARD STATISTICS */}
            <div className="statistics-grid">

              <div className="stat-card">

                <p>Total Equipment</p>

                <h2>{totalEquipment}</h2>

                <small>
                  Registered equipment types
                </small>

              </div>

              <div className="stat-card">

                <p>Total Available Quantity</p>

                <h2>{totalQuantity}</h2>

                <small>
                  Total registered equipment units
                </small>

              </div>

              <div className="stat-card">

                <p>Available Equipment</p>

                <h2>{availableEquipment}</h2>

                <small>
                  Equipment types in stock
                </small>

              </div>

              <div className="stat-card">

                <p>Pending Requests</p>

                <h2>{pendingRequests}</h2>

                <small>
                  Requests awaiting approval
                </small>

              </div>

              <div className="stat-card">

                <p>Currently Borrowed</p>

                <h2>{borrowedRequests}</h2>

                <small>
                  Active borrowing records
                </small>

              </div>

            </div>

            {/* EQUIPMENT OVERVIEW */}
            <div className="content-card">

              <div className="section-header">

                <div>

                  <h2>Equipment Overview</h2>

                  <p>
                    Recently registered equipment
                  </p>

                </div>

                <button
                  className="text-button"
                  onClick={() =>
                    handleNavigation("Equipment Inventory")
                  }
                >
                  View All
                </button>

              </div>

              {equipment.length === 0 ? (

                <div className="empty-message">

                  <h3>No equipment found</h3>

                  <p>
                    Add equipment to start managing your inventory.
                  </p>

                </div>

              ) : (

                <EquipmentTable
                  equipment={equipment.slice(0, 5)}
                />

              )}

            </div>

            {/* RECENT BORROWING REQUESTS */}
            <div className="content-card">

              <div className="section-header">

                <div>

                  <h2>Recent Borrowing Requests</h2>

                  <p>
                    Latest community borrowing activities
                  </p>

                </div>

                <button
                  className="text-button"
                  onClick={() =>
                    handleNavigation("Borrowing Requests")
                  }
                >
                  View All
                </button>

              </div>

              {borrowingRequests.length === 0 ? (

                <div className="empty-message">

                  <h3>No borrowing requests yet</h3>

                  <p>
                    Submitted borrowing requests will appear here.
                  </p>

                </div>

              ) : (

                <BorrowingTable
                  requests={borrowingRequests.slice(-5).reverse()}
                />

              )}

            </div>

          </section>

        )}

        {/* ================================= */}
        {/* EQUIPMENT INVENTORY */}
        {/* ================================= */}

        {activePage === "Equipment Inventory" && (

          <section className="content-card">

            <div className="section-header">

              <div>

                <h2>Equipment Inventory</h2>

                <p>
                  Manage community equipment records.
                </p>

              </div>

              <button
                className="add-button"
                onClick={() => {
                  setShowForm(!showForm);
                  setError("");
                  setSuccess("");
                }}
              >
                {showForm ? "Close Form" : "+ Add Equipment"}
              </button>

            </div>

            {/* SUCCESS MESSAGE */}
            {success && (

              <div
                className="success-message"
                role="status"
              >
                {success}
              </div>

            )}

            {/* FORM ERROR */}
            {error && !showForm && (

              <p className="form-error" role="alert">
                {error}
              </p>

            )}

            {/* ADD EQUIPMENT FORM */}
            {showForm && (

              <form
                className="equipment-form"
                onSubmit={handleAddEquipment}
              >

                <h3>Add New Equipment</h3>

                <label htmlFor="equipmentName">
                  Equipment Name
                </label>

                <input
                  id="equipmentName"
                  type="text"
                  placeholder="Example: Electric Drill"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

                <label htmlFor="equipmentCategory">
                  Category
                </label>

                <input
                  id="equipmentCategory"
                  type="text"
                  placeholder="Example: Power Tools"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                />

                <label htmlFor="equipmentQuantity">
                  Quantity
                </label>

                <input
                  id="equipmentQuantity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: e.target.value,
                    })
                  }
                />

                {error && (

                  <p
                    className="form-error"
                    role="alert"
                  >
                    {error}
                  </p>

                )}

                <button
                  type="submit"
                  className="add-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Equipment"}
                </button>

              </form>

            )}

            {/* SEARCH */}
            <input
              className="search-input"
              type="search"
              placeholder="Search equipment or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search equipment"
            />

            {/* EQUIPMENT TABLE */}
            {loading ? (

              <div className="empty-message">
                <p>Loading equipment...</p>
              </div>

            ) : filteredEquipment.length > 0 ? (

              <EquipmentTable
                equipment={filteredEquipment}
              />

            ) : (

              <div className="empty-message">

                <h3>No equipment found</h3>

                <p>
                  {search
                    ? "Try another equipment name or category."
                    : "No equipment has been registered yet."}
                </p>

              </div>

            )}

          </section>

        )}

        {/* ================================= */}
        {/* BORROWING REQUESTS */}
        {/* ================================= */}

        {activePage === "Borrowing Requests" && (

          <Borrowing
            equipment={equipment}
            requests={borrowingRequests}
            setRequests={setBorrowingRequests}
          />

        )}

        {/* ================================= */}
        {/* RETURN MANAGEMENT */}
        {/* ================================= */}

        {activePage === "Return Management" && (

          <Returns
            equipment={equipment}
            setEquipment={setEquipment}
            requests={borrowingRequests}
            setRequests={setBorrowingRequests}
          />

        )}

        {/* FOOTER */}
        <footer className="footer">

          ToolLoop Community Equipment Sharing System

        </footer>

      </main>

    </div>
  );
}

// =================================
// EQUIPMENT TABLE COMPONENT
// =================================

function EquipmentTable({ equipment }) {

  return (

    <div className="table-container">

      <table>

        <thead>

          <tr>
            <th>Equipment Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {equipment.map((item) => {

            const availableQuantity = Number(
              item.availableQuantity ?? item.quantity ?? 0
            );

            return (

              <tr key={item.id}>

                <td>{item.name}</td>

                <td>{item.category}</td>

                <td>{item.quantity}</td>

                <td>

                  <span
                    className={
                      availableQuantity > 0
                        ? "status-badge"
                        : "returned-badge"
                    }
                  >
                    {availableQuantity > 0
                      ? "Available"
                      : "Unavailable"}
                  </span>

                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

    </div>

  );
}

// =================================
// BORROWING TABLE COMPONENT
// =================================

function BorrowingTable({ requests }) {

  return (

    <div className="table-container">

      <table>

        <thead>

          <tr>
            <th>Borrower</th>
            <th>Equipment</th>
            <th>Quantity</th>
            <th>Borrow Date</th>
            <th>Return Date</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {requests.map((request) => (

            <tr key={request.id}>

              <td>{request.borrower}</td>

              <td>{request.equipment}</td>

              <td>{request.quantity}</td>

              <td>{request.borrowDate}</td>

              <td>{request.returnDate}</td>

              <td>

                <span
                  className={
                    request.status === "Pending"
                      ? "pending-badge"
                      : request.status === "Borrowed"
                      ? "borrowed-badge"
                      : "returned-badge"
                  }
                >
                  {request.status}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default App;

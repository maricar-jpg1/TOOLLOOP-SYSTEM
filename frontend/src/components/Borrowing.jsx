
import { useState } from "react";
import { addBorrowing } from "../services/api";

function Borrowing({ equipment, requests, setRequests }) {
  const [form, setForm] = useState({
    borrower: "",
    equipmentId: "",
    quantity: "1",
    borrowDate: "",
    returnDate: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.borrower.trim()) {
      setError("Borrower name is required.");
      return;
    }

    if (!form.equipmentId) {
      setError("Please select equipment.");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Quantity must be a whole number greater than zero.");
      return;
    }

    if (!form.borrowDate || !form.returnDate) {
      setError("Please enter both borrowing and return dates.");
      return;
    }

    if (form.returnDate < form.borrowDate) {
      setError("Return date cannot be earlier than borrowing date.");
      return;
    }

    const selectedEquipment = equipment.find(
      (item) => String(item.id) === form.equipmentId
    );

    if (!selectedEquipment) {
      setError("Selected equipment was not found.");
      return;
    }

    const reservedQuantity = requests
      .filter(
        (request) =>
          String(request.equipmentId) === form.equipmentId &&
          request.status === "Pending"
      )
      .reduce((total, request) => total + Number(request.quantity), 0);

    const availableQuantity =
      Number(selectedEquipment.availableQuantity ?? selectedEquipment.quantity) -
      reservedQuantity;

    if (quantity > availableQuantity) {
      setError(`Only ${Math.max(availableQuantity, 0)} unit(s) are available.`);
      return;
    }

    try {
      setSaving(true);

      const savedRequest = await addBorrowing({
        borrower: form.borrower.trim(),
        equipmentId: form.equipmentId,
        equipment: selectedEquipment.name,
        quantity,
        borrowDate: form.borrowDate,
        returnDate: form.returnDate,
      });

      setRequests((previous) => [...previous, savedRequest]);

      setForm({
        borrower: "",
        equipmentId: "",
        quantity: "1",
        borrowDate: "",
        returnDate: "",
      });

      setSuccess("Borrowing request saved successfully!");
    } catch (err) {
      console.error("Borrowing request error:", err);
      setError(err.message || "Unable to save borrowing request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="content-card">
      <div className="section-header">
        <div>
          <h2>Borrowing Requests</h2>
          <p>Manage community equipment borrowing requests.</p>
        </div>
      </div>

      <form className="equipment-form" onSubmit={handleSubmit}>
        <h3>New Borrowing Request</h3>

        <label htmlFor="borrower">Borrower Name</label>
        <input
          id="borrower"
          name="borrower"
          type="text"
          placeholder="Enter borrower's full name"
          value={form.borrower}
          onChange={handleChange}
        />

        <label htmlFor="equipmentId">Select Equipment</label>
        <select
          id="equipmentId"
          name="equipmentId"
          value={form.equipmentId}
          onChange={handleChange}
        >
          <option value="">Select equipment</option>
          {equipment.map((item) => (
            <option
              key={item.id}
              value={String(item.id)}
              disabled={Number(item.availableQuantity ?? item.quantity) <= 0}
            >
              {item.name} ({item.availableQuantity ?? item.quantity} available)
            </option>
          ))}
        </select>

        <label htmlFor="borrowQuantity">Borrowing Quantity</label>
        <input
          id="borrowQuantity"
          name="quantity"
          type="number"
          min="1"
          step="1"
          value={form.quantity}
          onChange={handleChange}
        />

        <label htmlFor="borrowDate">Borrowing Date</label>
        <input
          id="borrowDate"
          name="borrowDate"
          type="date"
          value={form.borrowDate}
          onChange={handleChange}
        />

        <label htmlFor="returnDate">Expected Return Date</label>
        <input
          id="returnDate"
          name="returnDate"
          type="date"
          value={form.returnDate}
          onChange={handleChange}
        />

        {error && <p className="form-error" role="alert">{error}</p>}
        {success && <p className="success-message" role="status">{success}</p>}

        <button
          type="submit"
          className="add-button"
          disabled={saving || equipment.length === 0}
        >
          {saving ? "Submitting..." : "Submit Borrowing Request"}
        </button>
      </form>

      <div className="borrowing-records">
        <div className="section-header">
          <div>
            <h3>Borrowing Records</h3>
            <p>List of submitted borrowing requests.</p>
          </div>
          <span className="record-count">{requests.length} Records</span>
        </div>

        {requests.length === 0 ? (
          <div className="empty-message">
            <h3>No borrowing requests yet</h3>
            <p>Submitted borrowing requests will appear here.</p>
          </div>
        ) : (
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
                      <span className="pending-badge">{request.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Borrowing;


import { useState } from "react";
import {
  updateBorrowing,
  getEquipment,
} from "../services/api";

function Returns({
  equipment,
  setEquipment,
  requests,
  setRequests,
}) {
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function approveRequest(requestId) {
    const request = requests.find(
      (item) => String(item.id) === String(requestId)
    );

    if (!request || request.status !== "Pending") return;

    try {
      setProcessingId(requestId);
      setError("");
      setSuccess("");

      const updatedRequest = await updateBorrowing(
        requestId,
        "approve"
      );

      setRequests((previous) =>
        previous.map((item) =>
          String(item.id) === String(requestId)
            ? updatedRequest
            : item
        )
      );

      const updatedEquipment = await getEquipment();
      setEquipment(updatedEquipment);

      setSuccess("Borrowing request approved successfully!");
    } catch (err) {
      console.error("Approval error:", err);
      setError(err.message || "Unable to approve request.");
    } finally {
      setProcessingId(null);
    }
  }

  async function markAsReturned(requestId) {
    const request = requests.find(
      (item) => String(item.id) === String(requestId)
    );

    if (!request || request.status !== "Borrowed") return;

    try {
      setProcessingId(requestId);
      setError("");
      setSuccess("");

      const updatedRequest = await updateBorrowing(
        requestId,
        "return"
      );

      setRequests((previous) =>
        previous.map((item) =>
          String(item.id) === String(requestId)
            ? updatedRequest
            : item
        )
      );

      const updatedEquipment = await getEquipment();
      setEquipment(updatedEquipment);

      setSuccess("Equipment return recorded successfully!");
    } catch (err) {
      console.error("Return error:", err);
      setError(err.message || "Unable to record equipment return.");
    } finally {
      setProcessingId(null);
    }
  }

  const pendingRequests = requests.filter(
    (item) => item.status === "Pending"
  );

  const borrowedRequests = requests.filter(
    (item) => item.status === "Borrowed"
  );

  const returnedRequests = requests.filter(
    (item) => item.status === "Returned"
  );

  function getStatusClass(status) {
    if (status === "Pending") return "pending-badge";
    if (status === "Borrowed") return "borrowed-badge";
    return "returned-badge";
  }

  return (
    <section className="content-card">

      <div className="section-header">
        <div>
          <h2>Return Management</h2>
          <p>
            Review borrowing requests and manage equipment returns.
          </p>
        </div>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="success-message" role="status">
          {success}
        </p>
      )}

      {/* SUMMARY */}
      <div className="return-summary">
        <div className="return-stat">
          <span>Pending Requests</span>
          <strong>{pendingRequests.length}</strong>
        </div>

        <div className="return-stat">
          <span>Currently Borrowed</span>
          <strong>{borrowedRequests.length}</strong>
        </div>

        <div className="return-stat">
          <span>Returned</span>
          <strong>{returnedRequests.length}</strong>
        </div>
      </div>

      {/* PENDING REQUESTS */}
      <div className="return-section">
        <h3>Pending Borrowing Requests</h3>
        <p className="section-description">
          Review and approve equipment borrowing requests.
        </p>

        {pendingRequests.length === 0 ? (
          <div className="empty-message">
            <h3>No pending requests</h3>
            <p>New borrowing requests will appear here.</p>
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
                  <th>Expected Return</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {pendingRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.borrower}</td>
                    <td>{request.equipment}</td>
                    <td>{request.quantity}</td>
                    <td>{request.borrowDate}</td>
                    <td>{request.returnDate}</td>
                    <td>
                      <button
                        className="approve-button"
                        disabled={processingId === request.id}
                        onClick={() => approveRequest(request.id)}
                      >
                        {processingId === request.id
                          ? "Processing..."
                          : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BORROWED EQUIPMENT */}
      <div className="return-section">
        <h3>Currently Borrowed Equipment</h3>
        <p className="section-description">
          Track equipment that has been released to borrowers.
        </p>

        {borrowedRequests.length === 0 ? (
          <div className="empty-message">
            <h3>No borrowed equipment</h3>
            <p>Approved borrowing requests will appear here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Equipment</th>
                  <th>Quantity</th>
                  <th>Expected Return</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {borrowedRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.borrower}</td>
                    <td>{request.equipment}</td>
                    <td>{request.quantity}</td>
                    <td>{request.returnDate}</td>
                    <td>
                      <button
                        className="return-button"
                        disabled={processingId === request.id}
                        onClick={() => markAsReturned(request.id)}
                      >
                        {processingId === request.id
                          ? "Processing..."
                          : "Mark as Returned"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RETURNED RECORDS */}
      <div className="return-section">
        <h3>Returned Equipment Records</h3>
        <p className="section-description">
          History of completed equipment returns.
        </p>

        {returnedRequests.length === 0 ? (
          <div className="empty-message">
            <h3>No returned equipment yet</h3>
            <p>Completed returns will appear here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Equipment</th>
                  <th>Quantity</th>
                  <th>Expected Return</th>
                  <th>Actual Return</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {returnedRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.borrower}</td>
                    <td>{request.equipment}</td>
                    <td>{request.quantity}</td>
                    <td>{request.returnDate}</td>
                    <td>{request.actualReturnDate}</td>
                    <td>
                      <span className={getStatusClass(request.status)}>
                        {request.status}
                      </span>
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

export default Returns;

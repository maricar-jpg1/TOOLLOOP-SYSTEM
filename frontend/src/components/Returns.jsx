
function Returns({
  equipment,
  setEquipment,
  requests,
  setRequests,
}) {
  function approveRequest(requestId) {
    const request = requests.find(
      (item) => item.id === requestId
    );

    if (!request || request.status !== "Pending") {
      return;
    }

    const selectedEquipment = equipment.find(
      (item) => String(item.id) === request.equipmentId
    );

    if (!selectedEquipment) {
      alert("Equipment record not found.");
      return;
    }

    if (selectedEquipment.quantity < request.quantity) {
      alert("Not enough available equipment to approve this request.");
      return;
    }

    setEquipment((previous) =>
      previous.map((item) =>
        String(item.id) === request.equipmentId
          ? {
              ...item,
              quantity: item.quantity - request.quantity,
              status:
                item.quantity - request.quantity > 0
                  ? "Available"
                  : "Unavailable",
            }
          : item
      )
    );

    setRequests((previous) =>
      previous.map((item) =>
        item.id === requestId
          ? { ...item, status: "Borrowed" }
          : item
      )
    );
  }

  function markAsReturned(requestId) {
    const request = requests.find(
      (item) => item.id === requestId
    );

    if (!request || request.status !== "Borrowed") {
      return;
    }

    setEquipment((previous) =>
      previous.map((item) =>
        String(item.id) === request.equipmentId
          ? {
              ...item,
              quantity: item.quantity + request.quantity,
              status: "Available",
            }
          : item
      )
    );

    setRequests((previous) =>
      previous.map((item) =>
        item.id === requestId
          ? {
              ...item,
              status: "Returned",
              actualReturnDate: new Date()
                .toISOString()
                .split("T")[0],
            }
          : item
      )
    );
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
                        onClick={() => approveRequest(request.id)}
                      >
                        Approve
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
                        onClick={() => markAsReturned(request.id)}
                      >
                        Mark as Returned
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

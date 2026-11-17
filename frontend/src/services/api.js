const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:10000";

async function handleResponse(response, action) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `${action} failed: ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// EQUIPMENT

export async function getEquipment() {
  const response = await fetch(`${API_URL}/api/equipment`);
  return handleResponse(response, "Retrieve equipment");
}

export async function addEquipment(equipment) {
  const response = await fetch(`${API_URL}/api/equipment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equipment),
  });

  return handleResponse(response, "Add equipment");
}

export async function updateEquipment(id, equipment) {
  const response = await fetch(
    `${API_URL}/api/equipment/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(equipment),
    }
  );

  return handleResponse(response, "Update equipment");
}

export async function deleteEquipment(id) {
  const response = await fetch(
    `${API_URL}/api/equipment/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(response, "Delete equipment");
}

// BORROWING REQUESTS

export async function getBorrowings() {
  const response = await fetch(`${API_URL}/api/borrowings`);
  return handleResponse(response, "Retrieve borrowing requests");
}

export async function addBorrowing(borrowing) {
  const response = await fetch(`${API_URL}/api/borrowings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(borrowing),
  });

  return handleResponse(response, "Submit borrowing request");
}

export async function updateBorrowing(id, action) {
  if (!["approve", "return"].includes(action)) {
    throw new Error("Invalid borrowing action.");
  }

  const response = await fetch(
    `${API_URL}/api/borrowings/${encodeURIComponent(id)}/${action}`,
    {
      method: "PUT",
    }
  );

  return handleResponse(response, `Borrowing ${action}`);
}


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5117";

// GET: Retrieve all equipment
export async function getEquipment() {
  const response = await fetch(`${API_URL}/api/equipment`);

  if (!response.ok) {
    throw new Error(`Failed to retrieve equipment: ${response.status}`);
  }

  return response.json();
}

// POST: Add equipment
export async function addEquipment(equipment) {
  const response = await fetch(`${API_URL}/api/equipment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equipment),
  });

  if (!response.ok) {
    throw new Error(`Failed to add equipment: ${response.status}`);
  }

  return response.json();
}

// PUT: Update equipment
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

  if (!response.ok) {
    throw new Error(`Failed to update equipment: ${response.status}`);
  }

  return response.json();
}

// DELETE: Remove equipment
export async function deleteEquipment(id) {
  const response = await fetch(
    `${API_URL}/api/equipment/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete equipment: ${response.status}`);
  }

  return response.json();
}

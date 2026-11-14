
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5117";

export async function getEquipment() {
  const response = await fetch(`${API_URL}/api/equipment`);

  if (!response.ok) {
    throw new Error(`API returned status ${response.status}`);
  }

  return await response.json();
}

export async function addEquipment(equipment) {
  const response = await fetch(`${API_URL}/api/equipment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equipment),
  });

  if (!response.ok) {
    throw new Error(`API returned status ${response.status}`);
  }

  return await response.json();
}

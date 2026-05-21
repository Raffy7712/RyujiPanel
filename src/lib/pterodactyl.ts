const PTERODACTYL_URL = process.env.PTERODACTYL_URL || "https://panel.example.com";
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY || "";

async function fetchPterodactyl(endpoint: string, options: RequestInit = {}) {
  const url = `${PTERODACTYL_URL}/api${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    Authorization: `Bearer ${PTERODACTYL_API_KEY}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`Pterodactyl API Error [${response.status}]:`, errorData);
    throw new Error(`Pterodactyl API Error: ${response.statusText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const pterodactyl = {
  // --- APPLICATION API (Admin Level) ---

  async getNodes() {
    return fetchPterodactyl("/application/nodes");
  },

  async getUsers() {
    return fetchPterodactyl("/application/users");
  },

  async getUser(userId: string) {
    return fetchPterodactyl(`/application/users/${userId}`);
  },

  async createUser(userData: Record<string, unknown>) {
    return fetchPterodactyl("/application/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async updateUser(userId: string, userData: Record<string, unknown>) {
    return fetchPterodactyl(`/application/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
  },

  async deleteUser(userId: string) {
    return fetchPterodactyl(`/application/users/${userId}`, {
      method: "DELETE",
    });
  },

  async getAllServers() {
    return fetchPterodactyl("/application/servers");
  },

  async getServerDetails(serverId: string) {
    return fetchPterodactyl(`/application/servers/${serverId}`);
  },

  async updateServerDetails(serverId: string, data: Record<string, unknown>) {
    return fetchPterodactyl(`/application/servers/${serverId}/details`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async suspendServer(serverId: string) {
    return fetchPterodactyl(`/application/servers/${serverId}/suspend`, {
      method: "POST",
    });
  },

  async unsuspendServer(serverId: string) {
    return fetchPterodactyl(`/application/servers/${serverId}/unsuspend`, {
      method: "POST",
    });
  },

  // --- CLIENT API (User Level / Server Management) ---

  async getClientServers() {
    return fetchPterodactyl("/client");
  },

  async getServerResources(identifier: string) {
    return fetchPterodactyl(`/client/servers/${identifier}/resources`);
  },

  async setPowerState(identifier: string, signal: string) {
    // signal can be: start, stop, restart, kill
    return fetchPterodactyl(`/client/servers/${identifier}/power`, {
      method: "POST",
      body: JSON.stringify({ signal }),
    });
  },

  async getServerWebSocket(identifier: string) {
    return fetchPterodactyl(`/client/servers/${identifier}/websocket`);
  },

  async sendServerCommand(identifier: string, command: string) {
    return fetchPterodactyl(`/client/servers/${identifier}/command`, {
      method: "POST",
      body: JSON.stringify({ command }),
    });
  },
};

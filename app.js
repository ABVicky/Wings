const app = document.getElementById("app");
let user = null;

/* ---------- LOGIN UI ---------- */
function renderLogin() {
  app.innerHTML = `
    <div class="login-wrapper">
      <div class="login-card">
        <h2>Wings Login</h2>
        <input id="name" placeholder="Name" />
        <input id="pin" placeholder="4-digit PIN" type="password" />
        <button id="loginBtn">Login</button>
        <p id="error" style="color:#ffb4b4;margin-top:8px;"></p>
      </div>
    </div>
  `;

  document.getElementById("loginBtn").addEventListener("click", login);
}

/* ---------- LOGIN LOGIC ---------- */
async function login() {
  const name = document.getElementById("name").value.trim();
  const pin = document.getElementById("pin").value.trim();
  const errorBox = document.getElementById("error");

  if (!name || !pin) {
    errorBox.textContent = "Enter name and PIN";
    return;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("action", "loginUser");
    formData.append("name", name);
    formData.append("pin", pin);

    const res = await fetch(CONFIG.BACKEND_URL, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!data.success) {
      errorBox.textContent = "Invalid login";
      return;
    }

    user = data.user;
    user.Role === "Manager" ? renderManager() : renderEmployee();

  } catch (err) {
    errorBox.textContent = "Server error";
    console.error(err);
  }
}


/* ---------- EMPLOYEE DASHBOARD ---------- */
async function renderEmployee() {
  const res = await fetch(CONFIG.BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "getEmployeeClients",
      employee: user.Name
    })
  });

  const data = await res.json();

  app.innerHTML = `
    <div class="sidebar">
      <h2>${user.Name}</h2>
      <button onclick="logout()">Logout</button>
    </div>
    <div class="content">
      <div class="card">
        <h3>Your Clients</h3>
        <table>
          <tr>
            <th>Client</th>
            <th>Service</th>
            <th>Status</th>
          </tr>
          ${data.clients.map(c => `
            <tr>
              <td>${c.ClientName}</td>
              <td>${c.Service}</td>
              <td>${c.Status}</td>
            </tr>
          `).join("")}
        </table>
      </div>
    </div>
  `;
}

/* ---------- MANAGER DASHBOARD ---------- */
async function renderManager() {
  const res = await fetch(CONFIG.BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "getAllClients" })
  });

  const data = await res.json();

  app.innerHTML = `
    <div class="sidebar">
      <h2>Manager</h2>
      <button onclick="logout()">Logout</button>
    </div>
    <div class="content">
      <div class="card">
        <h3>All Clients</h3>
        <table>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Assigned</th>
          </tr>
          ${data.clients.map(c => `
            <tr>
              <td>${c.ClientName}</td>
              <td>${c.Status}</td>
              <td>${c.AssignedEmployee}</td>
            </tr>
          `).join("")}
        </table>
      </div>
    </div>
  `;
}

/* ---------- LOGOUT ---------- */
function logout() {
  user = null;
  renderLogin();
}

/* ---------- INIT ---------- */
renderLogin();

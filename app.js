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

  const url =
    CONFIG.BACKEND_URL +
    `?action=loginUser&name=${encodeURIComponent(name)}&pin=${encodeURIComponent(pin)}`;

  try {
    const res = await fetch(url);
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
  try {
    const res = await fetch(
      CONFIG.BACKEND_URL +
      `?action=getEmployeeClients&employee=${encodeURIComponent(user.Name)}`
    );

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
  } catch (err) {
    alert("Failed to load employee data");
    console.error(err);
  }
}

/* ---------- MANAGER DASHBOARD (FIXED) ---------- */
async function renderManager() {
  try {
    const res = await fetch(
      CONFIG.BACKEND_URL + `?action=getAllClients`
    );

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
  } catch (err) {
    alert("Failed to load manager data");
    console.error(err);
  }
}

/* ---------- LOGOUT ---------- */
function logout() {
  user = null;
  renderLogin();
}

/* ---------- INIT ---------- */
renderLogin();

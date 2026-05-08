/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */


const BASE = "/TelecomBillingWebsite";
let user = null;

const fetchAPI = (endpoint, options = {}) => {
    options.credentials = "include";
    if (!options.headers && options.method && options.method !== 'GET') {
        options.headers = { 'Content-Type': 'application/json' };
    }
    return fetch(BASE + endpoint, options);
};

// Init
window.onload = () => {
    fetchAPI("/auth")
        .then(res => res.json())
        .then(data => {
            if (data.error || !data.role || data.role.toUpperCase() !== "ADMIN") {
                window.location.href = "index.html";
                return;
            }
            user = data;
            navigate("customers");
        })
        .catch(() => {
            window.location.href = "index.html";
        });
};

// Router
function navigate(page) {
    if (!user) return window.location.href = "index.html";

    if (page === "customers") renderCustomers();
    if (page === "profiles") renderProfiles();
    if (page === "billing") renderBilling();
    if (page === "cdrs") renderCdrs();
    if (page === "analytics") renderAnalytics();
}

function logout() {
    fetchAPI("/auth", { method: "DELETE" })
        .then(() => {
            window.location.href = "index.html";
        });
}

function renderCustomers() {
    if (user.role.toUpperCase() !== "ADMIN") return renderForbidden();

    app.innerHTML = `
        <div class="card">
            <h2>Customers</h2>
            
            <div class="form-row">
                <input id="newName" placeholder="Full Name">
                <input id="newEmail" type="email" placeholder="Email Address">
                <input id="newAddress" placeholder="Physical Address">
                <button onclick="addCustomer()">Add</button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                <input id="searchQuery" placeholder="🔍 Search DB by name or email..." onkeypress="if(event.key === 'Enter') loadCustomers(0)" style="flex: 1; margin: 0; min-width: 200px;">
                <select id="limit" onchange="loadCustomers(0)" style="padding: 8px;">
                    <option value="10" selected>10 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                </select>
                <button onclick="loadCustomers(0)" class="btn-secondary">Search</button>
            </div>

            <div id="customers"></div>
        </div>
    `;
    loadCustomers(0);
}

let currentSortBy = 'name';
let currentSortOrder = 'ASC';

function toggleSort(col) {
    if (currentSortBy === col) {
        currentSortOrder = currentSortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
        currentSortBy = col;
        currentSortOrder = 'ASC';
    }
    loadCustomers(0);
}

function loadCustomers(offset = 0) {
    const limit = document.getElementById("limit") ? parseInt(document.getElementById("limit").value) : 10;
    const searchQuery = document.getElementById("searchQuery") ? document.getElementById("searchQuery").value : "";

    // Validate offset if called from HTML event without arg
    if (typeof offset !== 'number') {
        offset = window.currentCustomerOffset || 0;
    }
    window.currentCustomerOffset = offset;

    fetch(`${BASE}/customer/all?limit=${limit}&offset=${offset}&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}&searchQuery=${encodeURIComponent(searchQuery)}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            let html = `
            <table>
                <tr>
                    <th style="cursor:pointer;" onclick="toggleSort('name')" title="Sort by Name">Name ${currentSortBy === 'name' ? (currentSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th style="cursor:pointer;" onclick="toggleSort('email')" title="Sort by Email">Email ${currentSortBy === 'email' ? (currentSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th>Address</th>
                    <th>Actions</th>
                </tr>`;

            data.forEach(c => {
                html += `
                <tr>
                    <td contenteditable="true" onblur="updateCustomer('${c.email}', this.innerText)">${c.name}</td>
                    <td>${c.email}</td>
                    <td>${c.address}</td>
                    <td>
                        <button class="btn-info" onclick="viewContracts('${c.email}', '${c.name}')" style="background: #0ea5e9; color: white; cursor: pointer;">Contracts</button>
                        <button class="btn-primary" onclick="viewInvoices('${c.email}', '${c.name}')">Invoices</button>
                        <button class="btn-danger" onclick="deleteCustomer('${c.email}')">Delete</button>
                    </td>
                </tr>`;
            });

            html += "</table>";

            // Pagination controls
            html += `
            <div class="pagination-row">
                <button class="btn-secondary" onclick="loadCustomers(${Math.max(0, offset - limit)})" ${offset === 0 ? 'disabled' : ''}>⬅ Previous</button>
                <span style="font-weight: 500; color: var(--text-muted);">Page ${Math.floor(offset / limit) + 1}</span>
                <button class="btn-secondary" onclick="loadCustomers(${offset + limit})" ${data.length < limit ? 'disabled' : ''}>Next ➡</button>
            </div>
            `;

            customers.innerHTML = html;
        });
}

let currentInvoiceSortBy = 'id';
let currentInvoiceSortOrder = 'DESC';
let currentInvoiceEmail = '';
let currentInvoiceName = '';

function toggleInvoiceSort(col) {
    if (currentInvoiceSortBy === col) {
        currentInvoiceSortOrder = currentInvoiceSortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
        currentInvoiceSortBy = col;
        currentInvoiceSortOrder = 'DESC';
    }
    viewInvoices(currentInvoiceEmail, currentInvoiceName, 0);
}

function viewInvoices(email, name, offset = 0) {
    currentInvoiceEmail = email;
    currentInvoiceName = name;

    if (typeof offset !== 'number') {
        offset = window.currentInvoiceOffset || 0;
    }
    window.currentInvoiceOffset = offset;
    const limit = 10;

    app.innerHTML = `
        <div class="card">
            <h2>Invoices for ${name}</h2>
            <button class="btn-secondary" onclick="navigate('customers')">⬅ Back to Customers</button>
            <br><br>
            <div id="invoiceList"><i>Loading invoices...</i></div>
        </div>
    `;

    fetch(`${BASE}/customer/invoices?email=${encodeURIComponent(email)}&limit=${limit}&offset=${offset}&sortBy=${currentInvoiceSortBy}&sortOrder=${currentInvoiceSortOrder}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            let html = `<table>
                <tr>
                    <th style="cursor:pointer;" onclick="toggleInvoiceSort('id')" title="Sort by Invoice ID">Inv # ${currentInvoiceSortBy === 'id' ? (currentInvoiceSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th>Phone (MSISDN)</th>
                    <th>Billing Period</th>
                    <th>Subtotal</th>
                    <th>Tax</th>
                    <th style="cursor:pointer;" onclick="toggleInvoiceSort('total')" title="Sort by Total">Total ${currentInvoiceSortBy === 'total' ? (currentInvoiceSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th style="cursor:pointer;" onclick="toggleInvoiceSort('status')" title="Sort by Status">Status ${currentInvoiceSortBy === 'status' ? (currentInvoiceSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th>Invoice</th>
                </tr>`;

            if (data.length === 0 && offset === 0) {
                invoiceList.innerHTML = "<p>No invoices found for this customer.</p>";
                return;
            }

            data.forEach(inv => {
                let statusColor = inv.status.toLowerCase() === 'pending' ? 'orange' :
                    inv.status.toLowerCase() === 'paid' ? 'green' : 'red';

                html += `<tr>
                    <td><b>#${inv.invoice_id}</b></td>
                    <td>${inv.msisdn}</td>
                    <td><small>${inv.start} to ${inv.end}</small></td>
                    <td>${inv.sub_total.toFixed(2)} EGP</td>
                    <td>${inv.tax.toFixed(2)} EGP</td>
                    <td style="font-weight:bold;">${inv.total.toFixed(2)} EGP</td>
                    <td style="color:${statusColor}; font-weight:bold;">${inv.status}</td>
                    <td>
                        <a href="https://github.com/OmarGabr0/TelecomBillingSystem/tree/main/AggregationEngine/${inv.pdf_path}" target="_blank" style="padding: 5px 10px; background: #2ecc71; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">
                           📥 Download
                        </a>
                    </td>
                </tr>`;
            });
            html += "</table>";

            html += `
            <div class="pagination-row">
                <button class="btn-secondary" onclick="viewInvoices('${email}', '${name}', ${Math.max(0, offset - limit)})" ${offset === 0 ? 'disabled' : ''}>⬅ Previous</button>
                <span style="font-weight: 500; color: var(--text-muted);">Page ${Math.floor(offset / limit) + 1}</span>
                <button class="btn-secondary" onclick="viewInvoices('${email}', '${name}', ${offset + limit})" ${data.length < limit ? 'disabled' : ''}>Next ➡</button>
            </div>
            `;

            invoiceList.innerHTML = html;
        })
        .catch(err => {
            console.error(err);
            invoiceList.innerHTML = "<p style='color:red;'>Failed to load invoices.</p>";
        });
}

function addCustomer() {
    const name = document.getElementById('newName').value;
    const email = document.getElementById('newEmail').value;
    const address = document.getElementById('newAddress').value;

    if (!name || !email || !address) {
        return alert("Please fill all fields.");
    }

    fetch(BASE + "/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Sending fields matching the Java Customer model
        body: JSON.stringify({ name: name, email: email, address: address }),
        credentials: "include"
    })
        .then(res => res.text())
        .then(msg => {
            alert(msg);
            loadCustomers();
        });
}

function updateCustomer(email, newName) {
    // Basic validation to prevent accidentally wiping a name
    if (!newName.trim()) {
        alert("Name cannot be empty");
        loadCustomers(); // Reload to reset the UI
        return;
    }

    fetch(BASE + "/customer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Using email as the identifier
        body: JSON.stringify({
            email: email,
            name: newName
        }),
        credentials: "include"
    })
        .then(() => console.log("Updated"));
}

function updateCustomerAddress(email, newAddress) {
    // Basic validation to prevent accidentally wiping a name
    if (!newAddress.trim()) {
        alert("Address cannot be empty");
        loadCustomers(); // Reload to reset the UI
        return;
    }

    fetch(BASE + "/customer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Using email as the identifier
        body: JSON.stringify({
            email: email,
            name: newAddress
        }),
        credentials: "include"
    })
        .then(() => console.log("Updated"));
}

function deleteCustomer(email) {
    if (!confirm("Delete this customer?")) return;

    // Pass email as query parameter
    fetch(BASE + "/customer?email=" + encodeURIComponent(email), {
        method: "DELETE",
        credentials: "include"
    })
        .then(() => {
            loadCustomers();
        });
}

// Helper function to safely format the LocalDateTime from Java
function formatDate(dateObj) {
    if (!dateObj) return "N/A";

    // Depending on how Gson serialized your LocalDateTime, it might be an object or string
    // If it's a string like "2026-04-21T12:08:50", this will format it nicely
    try {
        let d = new Date(dateObj);
        return d.toLocaleDateString() + " " + d.toLocaleTimeString();
    } catch (e) {
        return dateObj;
    }
}

function renderCdrs() {
    app.innerHTML = `
        <div class="card">
            <h2>CDR Upload for testing</h2>
            <button onclick="uploadCdrs()">Upload CDRs</button>
            <div id="cdrResult"></div>
        </div>
    `;
}

function uploadCdrs() {
    fetch(BASE + "/cdr/upload")
        .then(res => res.text())
        .then(msg => cdrResult.innerText = msg);
}

function renderAnalytics() {
    app.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2>Analytics Dashboard</h2>
        </div>
        <div id="analyticsLoading">Loading analytics...</div>
    `;

    fetch(BASE + "/analytics", { credentials: "include" })
        .then(res => {
            if (!res.ok) throw new Error("Failed to load analytics");
            return res.json();
        })
        .then(data => {
            // Build the layout
            app.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h2>Analytics Dashboard</h2>
                    <button class="btn-primary" onclick="renderAnalytics()">Refresh</button>
                </div>
                
                <!-- KPI Cards -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="card" style="text-align:center; border-top: 4px solid var(--primary-color);">
                        <div style="color:var(--text-muted); font-size:0.9em; text-transform:uppercase;">Total Customers</div>
                        <div style="font-size:2em; font-weight:700; color:var(--primary-color);">${data.totalCustomers}</div>
                    </div>
                    <div class="card" style="text-align:center; border-top: 4px solid #10b981;">
                        <div style="color:var(--text-muted); font-size:0.9em; text-transform:uppercase;">Paid Revenue</div>
                        <div style="font-size:2em; font-weight:700; color:#10b981;">${data.totalRevenue.toFixed(2)} <small style="font-size:0.5em;">EGP</small></div>
                    </div>
                    <div class="card" style="text-align:center; border-top: 4px solid #f59e0b;">
                        <div style="color:var(--text-muted); font-size:0.9em; text-transform:uppercase;">Pending Revenue</div>
                        <div style="font-size:2em; font-weight:700; color:#f59e0b;">${data.pendingRevenue.toFixed(2)} <small style="font-size:0.5em;">EGP</small></div>
                    </div>
                </div>

                <!-- Charts Grid -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    
                    <div class="card">
                        <h3 style="margin-bottom: 15px; text-align: center;">Invoice Status</h3>
                        <div style="position: relative; height: 250px;">
                            <canvas id="invoiceStatusChart"></canvas>
                        </div>
                    </div>

                    <div class="card">
                        <h3 style="margin-bottom: 15px; text-align: center;">Rateplan Popularity</h3>
                        <div style="position: relative; height: 250px;">
                            <canvas id="rateplanChart"></canvas>
                        </div>
                    </div>

                    <div class="card">
                        <h3 style="margin-bottom: 15px; text-align: center;">Network Usage</h3>
                        <div style="position: relative; height: 250px;">
                            <canvas id="usageChart"></canvas>
                        </div>
                    </div>

                </div>
            `;

            // Initialize Invoice Status Chart (Doughnut)
            const invCtx = document.getElementById('invoiceStatusChart');
            const invLabels = Object.keys(data.invoiceCounts);
            const invData = Object.values(data.invoiceCounts);
            new Chart(invCtx, {
                type: 'doughnut',
                data: {
                    labels: invLabels,
                    datasets: [{
                        data: invData,
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'],
                        borderWidth: 1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });

            // Initialize Rateplan Popularity Chart (Bar)
            const rpCtx = document.getElementById('rateplanChart');
            const rpLabels = Object.keys(data.rateplanPopularity);
            const rpData = Object.values(data.rateplanPopularity);
            new Chart(rpCtx, {
                type: 'bar',
                data: {
                    labels: rpLabels,
                    datasets: [{
                        label: 'Subscribers',
                        data: rpData,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });

            // Initialize Usage Distribution Chart (Pie)
            const usCtx = document.getElementById('usageChart');
            const usLabels = Object.keys(data.usageDistribution);
            const usData = Object.values(data.usageDistribution);
            new Chart(usCtx, {
                type: 'pie',
                data: {
                    labels: usLabels,
                    datasets: [{
                        data: usData,
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                        borderWidth: 1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });

        })
        .catch(err => {
            console.error(err);
            app.innerHTML = `<h2 style="color:red;">Failed to load analytics</h2><p>${err.message}</p>`;
        });
}

function renderForbidden() {
    app.innerHTML = `<h2 style="color:red;">Access Denied</h2>`;
}

function renderProfiles() {
    if (user.role.toUpperCase() !== "ADMIN") return renderForbidden();

    app.innerHTML = `
        <div class="card">
            <h2>Profiles & Services Catalog</h2>
            
            <div style="background: var(--bg-color); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3>Create New Rateplan</h3>
                <div class="form-row">
                    <input id="rpName" placeholder="Plan Name (e.g. My_Life_500)" style="flex: 1;">
                    <input id="rpPrice" type="number" placeholder="Plan Price (EGP)" style="width: 120px;">
                    <input id="rpRor" type="number" step="0.01" placeholder="ROR (e.g. 0.19)" style="width: 120px;">
                    <input id="rpFreeUnits" type="number" placeholder="Free Units" style="width: 120px;">
                    <input id="rpDesc" placeholder="Description" style="flex: 2;">
                    <button class="btn-primary" onclick="createRateplan()">Create</button>
                </div>
            </div>

            <div style="background: var(--bg-color); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3>Create Additional Fee / Service</h3>
                <div class="form-row">
                    <select id="feeTypeSelect" style="padding: 10px; margin: unset;">
                        <option value="recurring">Recurring Service</option>
                        <option value="onetime">One-Time Fee</option>
                    </select>
                    <input id="feeName" placeholder="Name" style="flex: 1;">
                    <input id="feeDesc" placeholder="Description" style="flex: 2;">
                    <input id="feeAmount" type="number" step="0.01" placeholder="Amount (EGP)">
                    <button class="btn-primary" onclick="createFee()">Create</button>
                </div>
            </div>

            <div style="display: flex; gap: 20px;">
                <div style="flex: 2;">
                    <h3>Available Rateplans</h3>
                    <div id="rateplanTable">Loading...</div>
                    
                    <br>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h3 style="margin: 0;">Additional Fees & Services</h3>
                        <select id="feeFilterSelect" onchange="renderFeesTable()" style="padding: 5px;">
                            <option value="all">All Fees</option>
                            <option value="recurring">Recurring Only</option>
                            <option value="onetime">One-Time Only</option>
                        </select>
                    </div>
                    <div id="servicesTable">Loading...</div>
                </div>

                <div id="rightPanel" style="flex: 1; background: #f9f9f9; padding: 15px; border-radius: 8px;">
                    <h3>Assign Fee to Customer</h3>
                    <input id="assignMsisdn" placeholder="Customer MSISDN" required style="width: 100%; margin-bottom: 10px; padding: 8px;">
                    <select id="assignServiceId" style="width: 100%; margin-bottom: 10px; padding: 8px;"></select>
                    <button class="btn-primary" onclick="assignService()" style="width: 100%;">Assign to Contract</button>
                    <p id="assignResult" style="margin-top: 10px; font-weight: bold;"></p>
                </div>
            </div>
        </div>
    `;

    loadCatalogs();
}

// NEW: Function to post the new rateplan to Java
function createRateplan() {
    const payload = new URLSearchParams({
        name: document.getElementById("rpName").value,
        plan_price: document.getElementById("rpPrice").value,
        ror: document.getElementById("rpRor").value,
        free_units: document.getElementById("rpFreeUnits").value || 0,
        description: document.getElementById("rpDesc").value
    });

    if (!payload.get("name") || !payload.get("plan_price") || !payload.get("ror")) {
        return alert("Name, Price, and ROR are required!");
    }

    fetch(BASE + "/profiles/rateplans", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
        credentials: "include"
    }).then(res => res.text()).then(msg => {
        alert(msg);
        document.getElementById("rpName").value = "";
        document.getElementById("rpPrice").value = "";
        document.getElementById("rpRor").value = "";
        document.getElementById("rpFreeUnits").value = "";
        document.getElementById("rpDesc").value = "";
        loadCatalogs();
    });
}

function createFee() {
    const type = document.getElementById("feeTypeSelect").value;
    const name = document.getElementById("feeName").value;
    const desc = document.getElementById("feeDesc").value;
    const amount = document.getElementById("feeAmount").value;

    if (!name || !amount) {
        return alert("Name and Amount are required.");
    }

    const payload = new URLSearchParams({ name, description: desc, amount });
    const endpoint = type === 'recurring' ? '/profiles/recurring' : '/profiles/onetime';

    fetch(BASE + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
        credentials: "include"
    }).then(res => res.text()).then(msg => {
        alert(msg);
        document.getElementById("feeName").value = "";
        document.getElementById("feeDesc").value = "";
        document.getElementById("feeAmount").value = "";
        loadCatalogs();
    });
}

let currentRpSortBy = 'id';
let currentRpSortOrder = 'DESC';

function toggleRpSort(col) {
    if (currentRpSortBy === col) {
        currentRpSortOrder = currentRpSortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
        currentRpSortBy = col;
        currentRpSortOrder = 'ASC';
    }
    loadRateplans(0);
}

function loadRateplans(offset = 0) {
    if (typeof offset !== 'number') {
        offset = window.currentRpOffset || 0;
    }
    window.currentRpOffset = offset;
    const limit = 10;

    fetch(`${BASE}/profiles/rateplans?limit=${limit}&offset=${offset}&sortBy=${currentRpSortBy}&sortOrder=${currentRpSortOrder}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            let html = `<table>
                <tr>
                    <th style="cursor:pointer;" onclick="toggleRpSort('id')">ID ${currentRpSortBy === 'id' ? (currentRpSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th style="cursor:pointer;" onclick="toggleRpSort('name')">Rateplan Name ${currentRpSortBy === 'name' ? (currentRpSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th style="cursor:pointer;" onclick="toggleRpSort('price')">Price ${currentRpSortBy === 'price' ? (currentRpSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th>Out-of-Bundle (ROR)</th>
                    <th style="cursor:pointer;" onclick="toggleRpSort('units')">Free Units ${currentRpSortBy === 'units' ? (currentRpSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th>Actions</th>
                </tr>`;
            data.forEach(p => {
                html += `<tr>
                    <td>${p.id}</td>
                    <td><b>${p.name}</b></td>
                    <td>${p.price.toFixed(2)} EGP</td>
                    <td>${p.ror.toFixed(2)} EGP</td>
                    <td>${p.free_units}</td>
                    <td><button class="btn-secondary" onclick="manageRateplanPackages(${p.id}, '${p.name}')">⚙️ Manage Packages</button></td>
                </tr>`;
            });
            html += "</table>";

            html += `
            <div class="pagination-row">
                <button class="btn-secondary" onclick="loadRateplans(${Math.max(0, offset - limit)})" ${offset === 0 ? 'disabled' : ''}>⬅ Previous</button>
                <span style="font-weight: 500; color: var(--text-muted);">Page ${Math.floor(offset / limit) + 1}</span>
                <button class="btn-secondary" onclick="loadRateplans(${offset + limit})" ${data.length < limit ? 'disabled' : ''}>Next ➡</button>
            </div>
            `;
            document.getElementById("rateplanTable").innerHTML = html;
        });
}

function loadCatalogs() {
    // 1. Load Rateplans
    loadRateplans(0);
    // 2. Load Services (Dropdowns)
    fetch(BASE + "/profiles/fees?limit=1000", { credentials: "include" })
        .then(r => r.json())
        .then(data => {
            let options = '<option value="">Select a Fee...</option>';
            data.forEach(f => {
                options += `<option value="${f.id}" data-type="${f.type}">${f.name} (${f.amount} EGP)</option>`;
            });
            const assignSelect = document.getElementById("assignServiceId");
            if (assignSelect) assignSelect.innerHTML = options;
        });

    renderFeesTable(0);
}

let currentFeeSortBy = 'name';
let currentFeeSortOrder = 'ASC';

function toggleFeeSort(col) {
    if (currentFeeSortBy === col) {
        currentFeeSortOrder = currentFeeSortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
        currentFeeSortBy = col;
        currentFeeSortOrder = 'ASC';
    }
    renderFeesTable(0);
}

function renderFeesTable(offset = 0) {
    if (typeof offset !== 'number') {
        offset = 0; // Reset offset if called from a generic HTML event
    }
    window.currentFeeOffset = offset;
    const limit = 10;
    const filter = document.getElementById("feeFilterSelect").value;

    fetch(`${BASE}/profiles/fees?limit=${limit}&offset=${offset}&sortBy=${currentFeeSortBy}&sortOrder=${currentFeeSortOrder}&filter=${filter}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            let html = `<table>
                <tr>
                    <th>Type</th>
                    <th style="cursor:pointer;" onclick="toggleFeeSort('name')">Name ${currentFeeSortBy === 'name' ? (currentFeeSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th>Description</th>
                    <th style="cursor:pointer;" onclick="toggleFeeSort('amount')">Amount ${currentFeeSortBy === 'amount' ? (currentFeeSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                </tr>`;

            if (data.length === 0 && offset === 0) {
                document.getElementById("servicesTable").innerHTML = "<p>No fees found.</p>";
                return;
            }

            data.forEach(f => {
                const badgeColor = f.type === 'recurring' ? 'var(--primary-color)' : 'var(--secondary-color)';
                const typeLabel = f.type === 'recurring' ? 'Recurring' : 'One-Time';
                html += `<tr>
                    <td><span style="color: white; background: ${badgeColor}; padding: 3px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 500;">${typeLabel}</span></td>
                    <td><b>${f.name}</b></td>
                    <td>${f.description && f.description !== "null" ? f.description : '-'}</td>
                    <td>${f.amount.toFixed(2)} EGP</td>
                </tr>`;
            });
            html += "</table>";

            html += `
            <div class="pagination-row">
                <button class="btn-secondary" onclick="renderFeesTable(${Math.max(0, offset - limit)})" ${offset === 0 ? 'disabled' : ''}>⬅ Previous</button>
                <span style="font-weight: 500; color: var(--text-muted);">Page ${Math.floor(offset / limit) + 1}</span>
                <button class="btn-secondary" onclick="renderFeesTable(${offset + limit})" ${data.length < limit ? 'disabled' : ''}>Next ➡</button>
            </div>
            `;

            document.getElementById("servicesTable").innerHTML = html;
        });
}

function manageRateplanPackages(rateplanId, rateplanName) {
    // Replace the right panel
    const rightPanel = document.getElementById("rightPanel");
    rightPanel.innerHTML = `
        <h3>Manage: ${rateplanName}</h3>
        <p style="color: var(--text-muted); font-size: 0.9em; margin-bottom: 15px;">Link or update service packages to this rateplan.</p>
        
        <label style="font-weight: 600; font-size: 0.9rem;">Voice Package</label>
        <select id="manageVoiceService" style="width: 100%; margin-bottom: 5px; padding: 8px;"><option value="">Loading...</option></select>
        <button class="btn-primary" onclick="linkRateplanService(${rateplanId}, 'manageVoiceService')" style="width: 100%; margin-bottom: 15px;">Update Voice Package</button>
        
        <label style="font-weight: 600; font-size: 0.9rem;">SMS Package</label>
        <select id="manageSmsService" style="width: 100%; margin-bottom: 5px; padding: 8px;"><option value="">Loading...</option></select>
        <button class="btn-primary" onclick="linkRateplanService(${rateplanId}, 'manageSmsService')" style="width: 100%; margin-bottom: 15px;">Update SMS Package</button>
        
        <label style="font-weight: 600; font-size: 0.9rem;">Data Package</label>
        <select id="manageDataService" style="width: 100%; margin-bottom: 5px; padding: 8px;"><option value="">Loading...</option></select>
        <button class="btn-primary" onclick="linkRateplanService(${rateplanId}, 'manageDataService')" style="width: 100%; margin-bottom: 15px;">Update Data Package</button>
        
        <br><br>
        <h4>Currently Active Packages</h4>
        <div id="linkedPackagesList"><i>Loading...</i></div>
        
        <button class="btn-secondary" onclick="restoreRightPanel()" style="width: 100%; margin-top: 15px;">Done</button>
    `;

    // Fetch and populate the dropdowns with 'units'
    fetch(BASE + "/profiles/services", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            let voiceOptions = '<option value="">No Voice Package</option>';
            let smsOptions = '<option value="">No SMS Package</option>';
            let dataOptions = '<option value="">No Data Package</option>';

            if (Array.isArray(data)) {
                data.forEach(s => {
                    let option = `<option value="${s.id}">${s.name} - ${s.units} Units (${s.price} EGP)</option>`;
                    if (s.type === 'Voice') voiceOptions += option;
                    else if (s.type === 'SMS') smsOptions += option;
                    else if (s.type === 'Data') dataOptions += option;
                });
            }

            document.getElementById("manageVoiceService").innerHTML = voiceOptions;
            document.getElementById("manageSmsService").innerHTML = smsOptions;
            document.getElementById("manageDataService").innerHTML = dataOptions;

            // Load linked packages AFTER options are populated to set the pre-selected value
            loadLinkedPackages(rateplanId);
        });
}

function loadLinkedPackages(rateplanId) {
    fetch(BASE + "/profiles/rateplan-services?rateplan_id=" + rateplanId, { credentials: "include" })
        .then(res => res.json())
        .then(linkedServices => {
            if (!linkedServices || linkedServices.length === 0) {
                document.getElementById("linkedPackagesList").innerHTML = "<p>No packages currently linked.</p>";
            } else {
                let html = `<table><tr><th>Type</th><th>Active Package</th><th>Units</th></tr>`;
                linkedServices.forEach(s => {
                    html += `<tr><td><b>${s.type}</b></td><td>${s.name}</td><td>${s.units}</td></tr>`;
                });
                document.getElementById("linkedPackagesList").innerHTML = html + "</table>";
            }

            // Sync dropdowns to match the currently linked packages
            const voiceSelect = document.getElementById("manageVoiceService");
            const smsSelect = document.getElementById("manageSmsService");
            const dataSelect = document.getElementById("manageDataService");

            // Reset to empty first
            if (voiceSelect) voiceSelect.value = "";
            if (smsSelect) smsSelect.value = "";
            if (dataSelect) dataSelect.value = "";

            if (Array.isArray(linkedServices)) {
                linkedServices.forEach(s => {
                    if (s.type === 'Voice' && voiceSelect) voiceSelect.value = s.id;
                    else if (s.type === 'SMS' && smsSelect) smsSelect.value = s.id;
                    else if (s.type === 'Data' && dataSelect) dataSelect.value = s.id;
                });
            }
        });
}

function linkRateplanService(rateplanId, selectId) {
    const serviceId = document.getElementById(selectId).value;
    if (!serviceId) {
        return alert("Please select a package first!");
    }

    const payload = new URLSearchParams();
    payload.append("rateplan_id", rateplanId);
    payload.append("service_id", serviceId);

    fetch(BASE + "/profiles/rateplan-services", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
        credentials: "include"
    })
        .then(res => res.text())
        .then(msg => {
            alert(msg);
            loadLinkedPackages(rateplanId); // Refresh the table
        });
}

function restoreRightPanel() {
    const rightPanel = document.getElementById("rightPanel");
    if (!rightPanel) return;

    rightPanel.innerHTML = `
        <h3>Assign Fee to Customer</h3>
        <input id="assignMsisdn" placeholder="Customer MSISDN" required style="width: 100%; margin-bottom: 10px; padding: 8px;">
        <select id="assignServiceId" style="width: 100%; margin-bottom: 10px; padding: 8px;"></select>
        <button class="btn-primary" onclick="assignService()" style="width: 100%;">Assign to Contract</button>
        <p id="assignResult" style="margin-top: 10px; font-weight: bold;"></p>
    `;

    let options = '<option value="">Select a Fee...</option>';
    if (window.globalFeesData) {
        window.globalFeesData.forEach(f => {
            options += `<option value="${f.id}" data-type="${f.type}">${f.name} (${f.amount} EGP)</option>`;
        });
    }
    document.getElementById("assignServiceId").innerHTML = options;
}

function assignService() {
    const msisdn = document.getElementById("assignMsisdn").value;
    const selectBox = document.getElementById("assignServiceId");
    const serviceId = selectBox.value;

    // Automatically grab the fee type from the selected option!
    const feeType = selectBox.options[selectBox.selectedIndex].getAttribute('data-type');

    const resultBox = document.getElementById("assignResult");

    if (!msisdn || !serviceId) {
        resultBox.style.color = "red";
        resultBox.innerText = "Please provide an MSISDN and select a fee.";
        return;
    }

    const payload = new URLSearchParams();
    payload.append("msisdn", msisdn);
    payload.append("feeId", serviceId);
    payload.append("feeType", feeType);

    fetch(BASE + "/profiles/assign", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
        credentials: "include"
    })
        .then(res => res.text())
        .then(msg => {
            resultBox.style.color = msg.includes("Error") ? "red" : "green";
            resultBox.innerText = msg;
        });
}

// =======================
// CONTRACTS MANAGEMENT
// =======================

let currentContractEmail = '';
let currentContractName = '';
let cachedRateplans = [];

function viewContracts(email, name) {
    currentContractEmail = email;
    currentContractName = name;

    app.innerHTML = `
        <div class="card">
            <h2>Contracts for ${name}</h2>
            <button class="btn-secondary" onclick="navigate('customers')" style="margin-bottom: 20px;">⬅ Back to Customers</button>
            
            <div style="background: var(--bg-color); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3>Add New Contract</h3>
                <div class="form-row">
                    <input id="newMsisdn" placeholder="MSISDN (e.g. 01012345678)" style="flex: 1;">
                    <select id="newContractRateplan" style="flex: 1; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); margin: unset;"><option>Loading...</option></select>
                    <input id="newCreditLimit" type="number" placeholder="Credit Limit (EGP)" style="flex: 1;">
                    <button class="btn-primary" onclick="addContractSubmit('${email}')">Add Contract</button>
                </div>
            </div>

            <div id="contractsList"><i>Loading contracts...</i></div>
        </div>
    `;

    // Fetch rateplans first to populate dropdowns
    fetch(BASE + "/profiles/rateplans?limit=100", { credentials: "include" })
        .then(res => res.json())
        .then(rateplans => {
            cachedRateplans = rateplans;
            let options = '<option value="">Select Rateplan...</option>';
            rateplans.forEach(rp => {
                options += `<option value="${rp.id}">${rp.name} (${rp.price} EGP)</option>`;
            });
            document.getElementById("newContractRateplan").innerHTML = options;

            // Now fetch contracts
            loadContractsTable();
        });
}

function loadContractsTable() {
    fetch(`${BASE}/contract?email=${encodeURIComponent(currentContractEmail)}`, { credentials: "include" })
        .then(res => res.json())
        .then(contracts => {
            let html = `<table>
                <tr>
                    <th>MSISDN</th>
                    <th>Rate Plan</th>
                    <th>Credit Limit</th>
                    <th>Balance</th>
                    <th>Created At</th>
                    <th>Actions</th>
                </tr>`;

            if (contracts.length === 0) {
                document.getElementById("contractsList").innerHTML = "<p>No contracts found for this customer.</p>";
                return;
            }

            contracts.forEach(c => {
                html += `<tr id="row-${c.msisdn}">
                    <td><b>${c.msisdn}</b></td>
                    <td id="rp-${c.msisdn}">${c.rateplan_name}</td>
                    <td id="cl-${c.msisdn}">${c.credit_limit} EGP</td>
                    <td style="color: ${c.balance < 0 ? 'red' : 'green'}; font-weight: bold;">${c.balance.toFixed(2)} EGP</td>
                    <td><small>${c.created_at}</small></td>
                    <td id="action-${c.msisdn}">
                        <button class="btn-secondary" onclick="editContract('${c.msisdn}', ${c.rateplan_id}, ${c.credit_limit})">Edit</button>
                    </td>
                </tr>`;
            });
            html += "</table>";
            document.getElementById("contractsList").innerHTML = html;
        })
        .catch(err => {
            console.error(err);
            document.getElementById("contractsList").innerHTML = "<p style='color:red;'>Failed to load contracts.</p>";
        });
}

const MSISDN_REGEX = /^002016\d{8}$/;

function addContractSubmit(email) {
    const msisdn = document.getElementById("newMsisdn").value.trim();
    const rateplanId = document.getElementById("newContractRateplan").value;
    const creditLimit = document.getElementById("newCreditLimit").value;

    if (!msisdn || !rateplanId || !creditLimit) {
        return alert("Please fill all fields for the new contract.");
    }

    if (!MSISDN_REGEX.test(msisdn)) {
        return alert("Invalid MSISDN format.\nExpected format: 002016XXXXXXXX (14 digits)\nExample: 00201610293847");
    }

    fetch(BASE + "/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: email,
            msisdn: msisdn,
            rateplan_id: rateplanId,
            credit_limit: creditLimit
        }),
        credentials: "include"
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to create contract");
            return res.text();
        })
        .then(msg => {
            alert(msg);
            viewContracts(currentContractEmail, currentContractName);
        })
        .catch(err => alert(err.message));
}

function editContract(msisdn, currentRateplanId, currentCreditLimit) {
    // Replace the row contents with inputs
    let rpOptions = '';
    cachedRateplans.forEach(rp => {
        let selected = rp.id === currentRateplanId ? 'selected' : '';
        rpOptions += `<option value="${rp.id}" ${selected}>${rp.name}</option>`;
    });

    document.getElementById(`rp-${msisdn}`).innerHTML = `<select id="edit-rp-${msisdn}" style="padding: 5px; width: 100%;">${rpOptions}</select>`;
    document.getElementById(`cl-${msisdn}`).innerHTML = `<input id="edit-cl-${msisdn}" type="number" value="${currentCreditLimit}" style="padding: 5px; width: 80px;">`;

    document.getElementById(`action-${msisdn}`).innerHTML = `
        <button class="btn-primary" onclick="updateContractSubmit('${msisdn}')" style="margin-bottom: 5px;">Save</button>
        <button class="btn-secondary" onclick="loadContractsTable()">Cancel</button>
    `;
}

function updateContractSubmit(msisdn) {
    const newRateplanId = document.getElementById(`edit-rp-${msisdn}`).value;
    const newCreditLimit = document.getElementById(`edit-cl-${msisdn}`).value;

    if (!newRateplanId || !newCreditLimit) {
        return alert("Values cannot be empty");
    }

    fetch(BASE + "/contract", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            msisdn: msisdn,
            rateplan_id: newRateplanId,
            credit_limit: newCreditLimit
        }),
        credentials: "include"
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to update contract");
            return res.text();
        })
        .then(msg => {
            alert("Updated successfully");
            loadContractsTable();
        })
        .catch(err => alert(err.message));
}
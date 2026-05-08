const BASE = "/TelecomBillingWebsite";
let user = null;

const fetchAPI = (endpoint, options = {}) => {
    options.credentials = "include";
    return fetch(BASE + endpoint, options);
};

window.onload = () => {
    fetchAPI("/auth")
        .then(res => res.json())
        .then(data => {
            if (data.error || !data.role || data.role.toUpperCase() !== "USER") {
                window.location.href = "index.html";
                return;
            }
            user = data;

            // Fetch profile data BEFORE navigating to dashboard to set name
            fetchAPI("/customer/profile?email=" + encodeURIComponent(user.username))
                .then(r => r.json())
                .then(profiles => {
                    window.userProfiles = profiles;
                    if (profiles && profiles.length > 0) {
                        document.getElementById("welcomeTitle").innerText = `Welcome, ${profiles[0].customer_name}!`;
                    } else {
                        document.getElementById("welcomeTitle").innerText = `Welcome, ${user.username}!`;
                    }
                    navigate("dashboard");
                })
                .catch(() => {
                    document.getElementById("welcomeTitle").innerText = `Welcome, ${user.username}!`;
                    navigate("dashboard");
                });
        })
        .catch(() => {
            window.location.href = "index.html";
        });
};

function navigate(page) {
    if (!user) return;
    const app = document.getElementById("app");

    if (page === "dashboard") {
        let usageHtml = "";

        if (window.userProfiles && window.userProfiles.length > 0) {
            usageHtml = `<h2 style="margin-bottom: 20px;">My Profiles & Usage</h2>`;
            window.userProfiles.forEach(p => {
                usageHtml += `
                    <div class="card" style="margin-bottom: 20px; border-left: 5px solid var(--primary-color);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h3 style="margin:0;">Number: ${p.msisdn}</h3>
                            <span style="background:var(--bg-color); padding:5px 12px; border-radius:12px; font-size:0.9em; border:1px solid var(--border-color);">
                                Rateplan: <b>${p.rateplan_name}</b>
                            </span>
                        </div>
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                            
                            <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                <h4 style="color: var(--text-muted); margin-bottom: 10px;">Voice (Mins)</h4>
                                <div style="position: relative; height: 120px; width: 120px; margin: 0 auto;">
                                    <canvas id="voiceChart-${p.msisdn}"></canvas>
                                </div>
                                <p style="margin-top: 10px; font-size: 0.95em; font-weight: 600; color: var(--primary-color);">${p.voice_units} <span style="color: var(--text-muted); font-weight: normal; font-size: 0.9em;">/ ${p.total_voice}</span></p>
                            </div>

                            <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                <h4 style="color: var(--text-muted); margin-bottom: 10px;">Data (MBs)</h4>
                                <div style="position: relative; height: 120px; width: 120px; margin: 0 auto;">
                                    <canvas id="dataChart-${p.msisdn}"></canvas>
                                </div>
                                <p style="margin-top: 10px; font-size: 0.95em; font-weight: 600; color: #10b981;">${p.data_units} <span style="color: var(--text-muted); font-weight: normal; font-size: 0.9em;">/ ${p.total_data}</span></p>
                            </div>

                            <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                <h4 style="color: var(--text-muted); margin-bottom: 10px;">SMS</h4>
                                <div style="position: relative; height: 120px; width: 120px; margin: 0 auto;">
                                    <canvas id="smsChart-${p.msisdn}"></canvas>
                                </div>
                                <p style="margin-top: 10px; font-size: 0.95em; font-weight: 600; color: #f59e0b;">${p.sms_units} <span style="color: var(--text-muted); font-weight: normal; font-size: 0.9em;">/ ${p.total_sms}</span></p>
                            </div>

                            <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: var(--radius-md); border: 1px solid #bbf7d0;">
                                <h4 style="color: #166534; margin-bottom: 10px;">Free Units</h4>
                                <div style="position: relative; height: 120px; width: 120px; margin: 0 auto;">
                                    <canvas id="freeChart-${p.msisdn}"></canvas>
                                </div>
                                <p style="margin-top: 10px; font-size: 0.95em; font-weight: 600; color: #15803d;">${p.free_units} <span style="color: #166534; font-weight: normal; font-size: 0.9em;">/ ${p.total_free}</span></p>
                            </div>

                            <div style="text-align: center; padding: 15px; background: #fff1f2; border-radius: var(--radius-md); border: 1px solid #fecdd3;">
                                <h4 style="color: #be123c; margin-bottom: 10px;">Credit Used (EGP)</h4>
                                <div style="position: relative; height: 120px; width: 120px; margin: 0 auto;">
                                    <canvas id="creditChart-${p.msisdn}"></canvas>
                                </div>
                                <p style="margin-top: 10px; font-size: 0.95em; font-weight: 600; color: #be123c;">${p.ror_usage.toFixed(2)} <span style="color: #9f1239; font-weight: normal; font-size: 0.9em;">/ ${p.credit_limit} EGP</span></p>
                            </div>

                        </div>
                    </div>
                `;
            });
        }

        app.innerHTML = usageHtml + `
            <div class="card">
                <h3>Available Rateplans</h3>
                <p style="color: var(--text-muted); margin-bottom: 15px;">Discover our latest plans.</p>
                <div id="rateplanTable">Loading...</div>
            </div>
        `;

        // Initialize Doughnut Charts
        if (window.userProfiles) {
            window.userProfiles.forEach(p => {
                const createDoughnut = (id, remaining, total, color, bg) => {
                    const ctx = document.getElementById(id);
                    if (!ctx) return;

                    let used = total - remaining;
                    if (used < 0) used = 0; // fallback

                    let chartData;
                    if (total === 0 && remaining === 0) {
                        chartData = { labels: ['No Quota'], datasets: [{ data: [1], backgroundColor: ['#e2e8f0'], borderWidth: 0 }] };
                    } else if (total === 0 && remaining > 0) {
                        chartData = { labels: ['Remaining'], datasets: [{ data: [remaining], backgroundColor: [color], borderWidth: 0 }] };
                    } else {
                        chartData = {
                            labels: ['Remaining', 'Used'],
                            datasets: [{
                                data: [remaining, used],
                                backgroundColor: [color, bg],
                                borderWidth: 0,
                                hoverOffset: 2
                            }]
                        };
                    }

                    new Chart(ctx, {
                        type: 'doughnut',
                        data: chartData,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '75%',
                            plugins: {
                                legend: { display: false },
                                tooltip: { enabled: total > 0 }
                            }
                        }
                    });
                };

                createDoughnut(`voiceChart-${p.msisdn}`, p.voice_units, p.total_voice, '#3b82f6', '#e0e7ff');
                createDoughnut(`dataChart-${p.msisdn}`, p.data_units, p.total_data, '#10b981', '#d1fae5');
                createDoughnut(`smsChart-${p.msisdn}`, p.sms_units, p.total_sms, '#f59e0b', '#fef3c7');
                createDoughnut(`freeChart-${p.msisdn}`, p.free_units, p.total_free, '#6366f1', '#e0e7ff');
                createDoughnut(`creditChart-${p.msisdn}`, p.credit_limit - p.ror_usage, p.credit_limit, '#be123c', '#fecdd3');
            });
        }

        loadStore();
    } else if (page === "invoices") {
        app.innerHTML = `
            <div class="card">
                <h2>My Invoices</h2>
                <div id="invoiceList">Loading...</div>
            </div>
        `;
        loadInvoices();
    }
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

    fetchAPI(`/profiles/rateplans?limit=${limit}&offset=${offset}&sortBy=${currentRpSortBy}&sortOrder=${currentRpSortOrder}`)
        .then(res => res.json())
        .then(data => {
            let html = `<table>
                <tr>
                    <th style="cursor:pointer;" onclick="toggleRpSort('name')">Plan ${currentRpSortBy === 'name' ? (currentRpSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th style="cursor:pointer;" onclick="toggleRpSort('price')">Price ${currentRpSortBy === 'price' ? (currentRpSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th style="cursor:pointer;" onclick="toggleRpSort('units')">Free Units ${currentRpSortBy === 'units' ? (currentRpSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th>Included Packages</th>
                </tr>`;
            data.forEach(p => {
                html += `<tr>
                    <td><b>${p.name}</b></td>
                    <td>${p.price.toFixed(2)} EGP</td>
                    <td>${p.free_units}</td>
                    <td id="rp-services-${p.id}"><i>Loading...</i></td>
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

            // Fetch linked services
            data.forEach(p => {
                fetchAPI("/profiles/rateplan-services?rateplan_id=" + p.id)
                    .then(r => r.json())
                    .then(services => {
                        const td = document.getElementById(`rp-services-${p.id}`);
                        if (td) {
                            if (!services || services.length === 0) {
                                td.innerHTML = "<small style='color:var(--text-muted)'>No packages included</small>";
                            } else {
                                let shtml = "";
                                services.forEach(s => {
                                    shtml += `<span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin: 2px; display: inline-block; color: var(--text-main);"><b>${s.type}</b>: ${s.name} (${s.units})</span> `;
                                });
                                td.innerHTML = shtml;
                            }
                        }
                    })
                    .catch(() => {
                        const td = document.getElementById(`rp-services-${p.id}`);
                        if (td) td.innerHTML = "<small style='color:red'>Error loading</small>";
                    });
            });
        });
}

function loadStore() {
    loadRateplans(0);
}

let currentInvoiceSortBy = 'id';
let currentInvoiceSortOrder = 'DESC';

function toggleInvoiceSort(col) {
    if (currentInvoiceSortBy === col) {
        currentInvoiceSortOrder = currentInvoiceSortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
        currentInvoiceSortBy = col;
        currentInvoiceSortOrder = 'DESC';
    }
    loadInvoices(0);
}

function loadInvoices(offset = 0) {
    if (typeof offset !== 'number') {
        offset = window.currentInvoiceOffset || 0;
    }
    window.currentInvoiceOffset = offset;
    const limit = 10;

    fetchAPI(`/customer/invoices?email=${encodeURIComponent(user.username)}&limit=${limit}&offset=${offset}&sortBy=${currentInvoiceSortBy}&sortOrder=${currentInvoiceSortOrder}`)
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch invoices");
            return res.json();
        })
        .then(data => {
            const invoiceList = document.getElementById("invoiceList");
            let html = `<table>
                <tr>
                    <th style="cursor:pointer;" onclick="toggleInvoiceSort('id')">Inv # ${currentInvoiceSortBy === 'id' ? (currentInvoiceSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th>Billing Period</th>
                    <th>Subtotal</th>
                    <th style="cursor:pointer;" onclick="toggleInvoiceSort('total')">Total ${currentInvoiceSortBy === 'total' ? (currentInvoiceSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th style="cursor:pointer;" onclick="toggleInvoiceSort('status')">Status ${currentInvoiceSortBy === 'status' ? (currentInvoiceSortOrder === 'ASC' ? '↑' : '↓') : ''}</th>
                    <th>Download</th>
                </tr>`;

            if (data.length === 0 && offset === 0) {
                invoiceList.innerHTML = "<p>No invoices found.</p>";
                return;
            }

            data.forEach(inv => {
                let statusColor = inv.status.toLowerCase() === 'pending' ? 'orange' :
                    inv.status.toLowerCase() === 'paid' ? 'green' : 'red';

                html += `<tr>
                    <td><b>#${inv.invoice_id}</b></td>
                    <td><small>${inv.start} to ${inv.end}</small></td>
                    <td>${inv.sub_total.toFixed(2)} EGP</td>
                    <td style="font-weight:bold;">${inv.total.toFixed(2)} EGP</td>
                    <td style="color:${statusColor}; font-weight:bold;">${inv.status}</td>
                    <td>
                        <a href="https://github.com/OmarGabr0/TelecomBillingSystem/tree/main/AggregationEngine/${inv.pdf_path}" target="_blank" style="padding: 5px 10px; background: #2ecc71; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">
                           📥 PDF
                        </a>
                    </td>
                </tr>`;
            });
            html += "</table>";

            html += `
            <div class="pagination-row">
                <button class="btn-secondary" onclick="loadInvoices(${Math.max(0, offset - limit)})" ${offset === 0 ? 'disabled' : ''}>⬅ Previous</button>
                <span style="font-weight: 500; color: var(--text-muted);">Page ${Math.floor(offset / limit) + 1}</span>
                <button class="btn-secondary" onclick="loadInvoices(${offset + limit})" ${data.length < limit ? 'disabled' : ''}>Next ➡</button>
            </div>
            `;

            invoiceList.innerHTML = html;
        })
        .catch(err => {
            document.getElementById("invoiceList").innerHTML = "<p style='color:red;'>Could not load invoices.</p>";
        });
}

function logout() {
    fetchAPI("/auth", { method: "DELETE" })
        .then(() => {
            window.location.href = "index.html";
        });
}

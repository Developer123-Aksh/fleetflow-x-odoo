const http = require("http");

const BASE_URL = "http://localhost:3000";

const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: { "Content-Type": "application/json" }
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

const runTests = async () => {
  console.log("=== FLEETFLOW API TESTS ===\n");

  let vehicleId, driverId;

  console.log("--- AUTH TESTS ---\n");

  const uniqueEmail = "test" + Date.now() + "@fleet.com";
  
  const auth1 = await makeRequest("POST", "/auth/register", { 
    email: uniqueEmail, password: "1234", name: "Test User", role: "manager" 
  });
  console.log(`1. Register: ${auth1.status === 201 ? "PASS" : "FAIL"}`);
  if (auth1.data.token) console.log("   Token: " + auth1.data.token.substring(0, 20) + "...");

  const auth2 = await makeRequest("POST", "/auth/login", { 
    email: uniqueEmail, password: "1234" 
  });
  console.log(`2. Login: ${auth2.status === 200 ? "PASS" : "FAIL"}`);
  if (auth2.data.user) console.log("   User: " + auth2.data.user.name + " (" + auth2.data.user.role + ")");

  console.log("\n--- VEHICLE TESTS ---\n");

  const v1 = await makeRequest("POST", "/vehicles", { name: "Truck-01", plate: "ABC-123", capacity: 500, odometer: 1000 });
  console.log(`1. Create vehicle: ${v1.status === 201 ? "PASS" : "FAIL"}`);
  vehicleId = v1.data._id;

  const v2 = await makeRequest("POST", "/vehicles", { plate: "BBB-222", capacity: 300 });
  console.log(`2. Missing name: ${v2.status === 400 ? "PASS" : "FAIL"}`);

  console.log("\n--- DRIVER TESTS ---\n");

  const d1 = await makeRequest("POST", "/drivers", { name: "John Doe", licenseExpiry: "2027-01-01", status: "on_duty" });
  console.log(`1. Create driver: ${d1.status === 201 ? "PASS" : "FAIL"}`);
  driverId = d1.data._id;

  console.log("\n--- TRIP TESTS ---\n");

  const t1 = await makeRequest("POST", "/trips", { vehicle: vehicleId, driver: driverId, cargo: 100 });
  console.log(`1. Create trip: ${t1.status === 201 ? "PASS" : "FAIL"}`);

  const t2 = await makeRequest("POST", "/trips", { vehicle: vehicleId, driver: driverId, cargo: 1000 });
  console.log(`2. Overcapacity: ${t2.status === 400 ? "PASS" : "FAIL"}`);

  console.log("\n--- EXPENSE TESTS ---\n");

  const e1 = await makeRequest("POST", "/expenses", { vehicle: vehicleId, type: "fuel", liters: 50, cost: 75, odometer: 1100 });
  console.log(`1. Add fuel: ${e1.status === 201 ? "PASS" : "FAIL"}`);

  const e2 = await makeRequest("GET", "/expenses/vehicle/" + vehicleId);
  console.log(`2. Get expenses: ${e2.status === 200 ? "PASS" : "FAIL"}`);

  console.log("\n--- DASHBOARD TESTS ---\n");

  const db1 = await makeRequest("GET", "/dashboard");
  console.log(`1. KPIs: ${db1.status === 200 ? "PASS" : "FAIL"}`);

  const db2 = await makeRequest("GET", "/dashboard/analytics");
  console.log(`2. Analytics: ${db2.status === 200 ? "PASS" : "FAIL"}`);

  console.log("\n=== ALL TESTS DONE ===");
  process.exit(0);
};

runTests().catch(err => {
  console.error("Error:", err.message);
  console.log("Run server first: node server.js");
  process.exit(1);
});

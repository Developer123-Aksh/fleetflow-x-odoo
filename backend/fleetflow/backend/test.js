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

  console.log("--- VEHICLE TESTS ---\n");

  const v1 = await makeRequest("POST", "/vehicles", { name: "Truck-01", plate: "ABC-123", capacity: 500, odometer: 1000 });
  console.log(`1. Create valid vehicle: ${v1.status === 201 ? "PASS" : "FAIL"}`);
  vehicleId = v1.data._id;

  const v2 = await makeRequest("POST", "/vehicles", { plate: "BBB-222", capacity: 300 });
  console.log(`2. Missing name (should fail): ${v2.status === 400 ? "PASS" : "FAIL"} - ${JSON.stringify(v2.data)}`);

  const v3 = await makeRequest("POST", "/vehicles", { name: "Truck-02", plate: "CCC-333", capacity: -100 });
  console.log(`3. Negative capacity (should fail): ${v3.status === 400 ? "PASS" : "FAIL"} - ${JSON.stringify(v3.data)}`);

  const v4 = await makeRequest("GET", "/vehicles");
  console.log(`4. Get all vehicles: ${v4.status === 200 ? "PASS" : "FAIL"} (${v4.data.length} vehicles)`);

  console.log("\n--- DRIVER TESTS ---\n");

  const d1 = await makeRequest("POST", "/drivers", { name: "John Doe", licenseExpiry: "2027-01-01", status: "on_duty" });
  console.log(`1. Create valid driver: ${d1.status === 201 ? "PASS" : "FAIL"}`);
  driverId = d1.data._id;

  const d2 = await makeRequest("POST", "/drivers", { name: "Jane", status: "invalid" });
  console.log(`2. Invalid status (should fail): ${d2.status === 400 ? "PASS" : "FAIL"} - ${JSON.stringify(d2.data)}`);

  const d3 = await makeRequest("POST", "/drivers", { name: "Expired Driver", licenseExpiry: "2020-01-01", status: "on_duty" });
  console.log(`3. Create driver with expired license: ${d3.status === 201 ? "PASS" : "FAIL"} (driver created, but can't be assigned to trips)`);

  console.log("\n--- TRIP TESTS ---\n");

  const t1 = await makeRequest("POST", "/trips", { vehicle: vehicleId, driver: driverId, cargo: 100 });
  console.log(`1. Create valid trip: ${t1.status === 201 ? "PASS" : "FAIL"}`);

  const t2 = await makeRequest("POST", "/trips", { vehicle: vehicleId, driver: driverId, cargo: 1000 });
  console.log(`2. Overcapacity trip (should fail): ${t2.status === 400 ? "PASS" : "FAIL"} - ${JSON.stringify(t2.data)}`);

  const t3 = await makeRequest("POST", "/trips", { vehicle: "invalid-id", driver: driverId, cargo: 100 });
  console.log(`3. Invalid vehicle ID (should fail): ${t3.status === 400 ? "PASS" : "FAIL"} - ${JSON.stringify(t3.data)}`);

  console.log("\n--- MAINTENANCE TESTS ---\n");

  const m1 = await makeRequest("POST", "/maintenance", { vehicle: vehicleId, note: "Oil change", cost: 150 });
  console.log(`1. Create maintenance: ${m1.status === 201 ? "PASS" : "FAIL"}`);

  const m2 = await makeRequest("POST", "/maintenance", { vehicle: "bad-id", note: "Test" });
  console.log(`2. Invalid vehicle ID (should fail): ${m2.status === 400 ? "PASS" : "FAIL"} - ${JSON.stringify(m2.data)}`);

  const m3 = await makeRequest("GET", "/maintenance");
  console.log(`3. Get all maintenance: ${m3.status === 200 ? "PASS" : "FAIL"}`);

  console.log("\n=== TESTS COMPLETED ===");
  process.exit(0);
};

runTests().catch(err => {
  console.error("Test error:", err.message);
  console.log("\nMake sure server is running: node server.js");
  process.exit(1);
});

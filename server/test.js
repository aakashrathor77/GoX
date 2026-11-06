const http = require("http");

const data = JSON.stringify({
  email: "test@gox.com",
  password: "TestPass123"
});

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/auth/login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log("Status:", res.statusCode);

  res.on("data", (chunk) => {
    console.log("Response:", chunk.toString());
  });
});

req.on("error", (error) => {
  console.log("Error:", error.message);
});

req.write(data);
req.end();
const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Our Life Wallet</title>
      <style>
        body { font-family: Arial, sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 25px; border-radius: 12px; width: 300px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        input { width: 90%; padding: 10px; margin: 10px 0; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: white; }
        button { width: 96%; padding: 10px; border-radius: 6px; border: none; background: #2563eb; color: white; font-weight: bold; cursor: pointer; }
        .hidden { display: none; }
      </style>
    </head>
    <body>
      <div class="card" id="loginBox">
        <h2>Our Life Wallet</h2>
        <p>লগইন করুন</p>
        <input type="text" id="phone" placeholder="ফোন নম্বর" value="01311843771">
        <input type="password" id="pin" placeholder="পিন" value="12345">
        <button onclick="login()">Login</button>
      </div>
      <div class="card hidden" id="dashBox">
        <h2>Our Life Wallet</h2>
        <p>স্বাগতম, <span id="userPhone"></span></p>
        <h3>ব্যালেন্স: <span id="balance">5000</span> BDT</h3>
        <button onclick="logout()" style="background:#dc2626;">Logout</button>
      </div>
      <script>
        function login() {
          const p = document.getElementById('phone').value;
          const pin = document.getElementById('pin').value;
          if(p === "01311843771" && pin === "12345") {
            document.getElementById('loginBox').classList.add('hidden');
            document.getElementById('dashBox').classList.remove('hidden');
            document.getElementById('userPhone').innerText = p;
          } else {
            alert("ভুল নম্বর বা পিন!");
          }
        }
        function logout() { location.reload(); }
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running...'));

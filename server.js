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
        body { font-family: Arial, sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 20px; border-radius: 12px; width: 320px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); margin: 20px 0; }
        input, select { width: 90%; padding: 10px; margin: 8px 0; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: white; }
        button { width: 96%; padding: 10px; border-radius: 6px; border: none; background: #2563eb; color: white; font-weight: bold; cursor: pointer; margin-top: 5px; }
        button.secondary { background: #475569; margin-top: 8px; }
        button.danger { background: #dc2626; }
        .hidden { display: none; }
        .history-item { background: #0f172a; padding: 8px; margin: 5px 0; border-radius: 5px; font-size: 13px; text-align: left; display: flex; justify-content: space-between; }
        .success { color: #22c55e; }
        .danger-text { color: #ef4444; }
      </style>
    </head>
    <body>
      <!-- Login Box -->
      <div class="card" id="loginBox">
        <h2>Our Life Wallet</h2>
        <p>লগইন করুন</p>
        <input type="text" id="phone" placeholder="ফোন নম্বর" value="01311843771">
        <input type="password" id="pin" placeholder="পিন" value="12345">
        <button onclick="login()">Login</button>
      </div>

      <!-- Dashboard Box -->
      <div class="card hidden" id="dashBox">
        <h2>Our Life Wallet</h2>
        <p>স্বাগতম, <span id="userPhone"></span></p>
        <h3>মূল ব্যালেন্স: <span id="balance">5000</span> BDT</h3>
        
        <button onclick="showSection('sendBox')">Send Money / Cash In</button>
        <button class="secondary" onclick="showSection('historyBox')">লেনদেনের ইতিহাস</button>
        <button class="secondary" onclick="showSection('pinBox')">পিন পরিবর্তন</button>
        <button class="danger" onclick="logout()" style="margin-top:15px;">Logout</button>
      </div>

      <!-- Send Money / Cash In Box -->
      <div class="card hidden" id="sendBox">
        <h3>টাকা লেনদেন</h3>
        <select id="actionType">
          <option value="send">Send Money</option>
          <option value="cashin">Cash In</option>
        </select>
        <input type="text" id="targetPhone" placeholder="প্রাপকের নম্বর">
        <input type="number" id="amount" placeholder="টাকার পরিমাণ">
        <button onclick="processTransaction()">নিশ্চিত করুন</button>
        <button class="secondary" onclick="showSection('dashBox')">ফিরে যান</button>
      </div>

      <!-- History Box -->
      <div class="card hidden" id="historyBox">
        <h3>লেনদেনের ইতিহাস</h3>
        <div id="historyList" style="max-height: 150px; overflow-y: auto;">
          <p style="color: #94a3b8; font-size: 13px;">কোনো লেনদেন নেই</p>
        </div>
        <button class="secondary" onclick="showSection('dashBox')">ফিরে যান</button>
      </div>

      <!-- Change PIN Box -->
      <div class="card hidden" id="pinBox">
        <h3>পিন পরিবর্তন</h3>
        <input type="password" id="oldPin" placeholder="পুরাতন পিন">
        <input type="password" id="newPin" placeholder="নতুন পিন">
        <button onclick="changePin()">পরিবর্তন করুন</button>
        <button class="secondary" onclick="showSection('dashBox')">ফিরে যান</button>
      </div>

      <script>
        let currentBalance = 5000;
        let currentPin = "12345";
        let history = [];

        function login() {
          const p = document.getElementById('phone').value;
          const pin = document.getElementById('pin').value;
          if(p === "01311843771" && pin === currentPin) {
            document.getElementById('loginBox').classList.add('hidden');
            document.getElementById('dashBox').classList.remove('hidden');
            document.getElementById('userPhone').innerText = p;
            updateUI();
          } else {
            alert("ভুল নম্বর বা পিন!");
          }
        }

        function showSection(id) {
          ['dashBox', 'sendBox', 'historyBox', 'pinBox'].forEach(box => {
            document.getElementById(box).classList.add('hidden');
          });
          document.getElementById(id).classList.remove('hidden');
        }

        function updateUI() {
          document.getElementById('balance').innerText = currentBalance;
          let hList = document.getElementById('historyList');
          if(history.length === 0) {
            hList.innerHTML = '<p style="color: #94a3b8; font-size: 13px;">কোনো লেনদেন নেই</p>';
          } else {
            hList.innerHTML = history.map(item => \`
              <div class="history-item">
                <span>\${item.type} (\${item.to})</span>
                <span class="\${item.class}">\${item.amount} BDT</span>
              </div>
            \`).join('');
          }
        }

        function processTransaction() {
          const type = document.getElementById('actionType').value;
          const target = document.getElementById('targetPhone').value;
          const amt = parseFloat(document.getElementById('amount').value);

          if(!target || !amt || amt <= 0) {
            alert("সঠিক তথ্য দিন!");
            return;
          }

          if(type === 'send') {
            if(amt > currentBalance) {
              alert("পর্যাপ্ত ব্যালেন্স নেই!");
              return;
            }
            currentBalance -= amt;
            history.unshift({ type: 'Send', to: target, amount: '-' + amt, class: 'danger-text' });
            alert(amt + ' BDT সফলভাবে পাঠানো হয়েছে!');
          } else {
            currentBalance += amt;
            history.unshift({ type: 'CashIn', to: target, amount: '+' + amt, class: 'success' });
            alert(amt + ' BDT ক্যাশ ইন সফল হয়েছে!');
          }
          document.getElementById('amount').value = '';
          document.getElementById('targetPhone').value = '';
          updateUI();
          showSection('dashBox');
        }

        function changePin() {
          const oldP = document.getElementById('oldPin').value;
          const newP = document.getElementById('newPin').value;
          if(oldP === currentPin && newP.length >= 4) {
            currentPin = newP;
            alert("পিন সফলভাবে পরিবর্তন হয়েছে!");
            document.getElementById('oldPin').value = '';
            document.getElementById('newPin').value = '';
            showSection('dashBox');
          } else {
            alert("পুরোনো পিন ভুল অথবা নতুন পিন ছোট হয়েছে!");
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

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_FILE = path.join(__dirname, 'database.json');

const initialData = {
    users: {
        '01311843771': { name: 'Ariyan', phone: '01311843771', pin: '12345', balance: 5000, history: [] }
    }
};

function loadData() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    try {
        return JSON.parse(fs.readFileSync(DB_FILE));
    } catch (e) {
        return initialData;
    }
}

function saveData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// সাইন আপ এপিআই
app.post('/api/signup', (req, res) => {
    const { name, phone, pin } = req.body;
    const db = loadData();

    if (!name || !phone || !pin) {
        return res.status(400).json({ message: 'সব তথ্য ঠিকভাবে পূরণ করুন!' });
    }
    if (db.users[phone]) {
        return res.status(400).json({ message: 'এই নম্বরে ইতোমধ্যে অ্যাকাউন্ট রয়েছে!' });
    }

    db.users[phone] = { name, phone, pin, balance: 500, history: [] }; // বোনাস ৫০০ টাকা
    saveData(db);
    res.json({ message: 'অ্যাকাউন্ট তৈরি সফল হয়েছে! লগইন করুন।' });
});

// লগইন এপিআই
app.post('/api/login', (req, res) => {
    const { phone, pin } = req.body;
    const db = loadData();
    const user = db.users[phone];

    if (user && user.pin === pin) {
        return res.json({ status: 'success', user });
    }
    res.status(400).json({ status: 'error', message: 'ভুল ফোন নম্বর বা পিন!' });
});

// ট্রানজেকশন এপিআই (মাল্টি-ইউজার)
app.post('/api/transaction', (req, res) => {
    const { senderPhone, type, targetPhone, amount, pin } = req.body;
    const db = loadData();
    const sender = db.users[senderPhone];
    const numAmount = Number(amount);

    if (!sender || sender.pin !== pin) {
        return res.status(400).json({ message: 'ভুল পিন নম্বর!' });
    }
    if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: 'সঠিক টাকার পরিমাণ দিন!' });
    }

    const now = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    if (type === 'SEND_MONEY') {
        const receiver = db.users[targetPhone];
        if (!receiver) {
            return res.status(400).json({ message: 'প্রাপকের অ্যাকাউন্ট পাওয়া যায়নি!' });
        }
        if (targetPhone === senderPhone) {
            return res.status(400).json({ message: 'নিজের নম্বরে সেন্ড মানি করা যাবে না!' });
        }
        if (numAmount > sender.balance) {
            return res.status(400).json({ message: 'পর্যাপ্ত ব্যালেন্স নেই!' });
        }

        sender.balance -= numAmount;
        receiver.balance += numAmount;

        sender.history.unshift({ type: 'সেন্ড মানি', details: targetPhone, amount: numAmount, isCredit: false, date: now });
        receiver.history.unshift({ type: 'টাকা গ্রহণ', details: senderPhone, amount: numAmount, isCredit: true, date: now });

    } else if (type === 'CASH_OUT' || type === 'RECHARGE') {
        if (numAmount > sender.balance) {
            return res.status(400).json({ message: 'পর্যাপ্ত ব্যালেন্স নেই!' });
        }
        sender.balance -= numAmount;
        const title = type === 'CASH_OUT' ? 'ক্যাশ আউট' : 'মোবাইল রিচার্জ';
        sender.history.unshift({ type: title, details: targetPhone, amount: numAmount, isCredit: false, date: now });

    } else if (type === 'ADD_MONEY') {
        sender.balance += numAmount;
        sender.history.unshift({ type: 'এড মানি', details: 'কার্ড/ব্যাংক', amount: numAmount, isCredit: true, date: now });
    }

    saveData(db);
    res.json({ message: 'লেনদেন সফল হয়েছে!', user: sender });
});

app.listen(3000, () => console.log('Our Life Multi-User Wallet is live on port 3000'));
process.stdin.resume();

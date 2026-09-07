const Datastore = require('nedb-promises');
const bcrypt = require('bcryptjs');

const usersDb = Datastore.create({ filename: 'users.db', autoload: true });

async function seedData() {
    await usersDb.remove({}, { multi: true });
    
    const hashedPin1 = await bcrypt.hash('12345', 10);
    const hashedPin2 = await bcrypt.hash('12345', 10);

    const users = [
        { name: 'Ariyan', phone: '01311843771', pin: hashedPin1, balance: 5000, currency: 'BDT' },
        { name: 'John Doe', phone: '01722222222', pin: hashedPin2, balance: 100, currency: 'USD' }
    ];

    await usersDb.insert(users);
    console.log('Ariyan user updated with new phone number!');
}

seedData();

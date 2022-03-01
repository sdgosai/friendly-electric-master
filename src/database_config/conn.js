const mongoose = require('mongoose');

mongoose.connect(process.env.DB)
    .then(() => { console.log("DATABASE connected ✅") })
    .catch((err) => { console.log("DATABASE can't connected ❌", err) })
import mongoose from 'mongoose';

const DB_ACCOUNT = 'admin';
const DB_PASSWORD = 'quangha2239';

const DB_URL = `mongodb+srv://${DB_ACCOUNT}:${DB_PASSWORD}@cluster0.z3qdj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const connect = async (callback: (error?: Error) => any) => {
  try {
    await mongoose.connect(DB_URL);
    callback();
  } catch (e) {
    if (e instanceof Error) {
      callback(e);
    }
  }
};

export { connect };

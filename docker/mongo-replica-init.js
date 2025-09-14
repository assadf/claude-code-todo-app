// Initialize MongoDB as a single-node replica set
rs.initiate({
  _id: 'rs0',
  members: [
    {
      _id: 0,
      host: 'mongodb:27017',
    },
  ],
});

// Wait for replica set to be ready
sleep(1000);

// Switch to the application database
db = db.getSiblingDB('claude-todo-app');

// Create collections if they don't exist
db.createCollection('User');
db.createCollection('Account');
db.createCollection('Session');
db.createCollection('VerificationToken');
db.createCollection('TodoList');
db.createCollection('TodoItem');

// Create indexes for better performance
db.User.createIndex({ email: 1 }, { unique: true });
db.Session.createIndex({ sessionToken: 1 }, { unique: true });
db.VerificationToken.createIndex({ token: 1 }, { unique: true });
db.TodoList.createIndex({ userId: 1 });
db.TodoItem.createIndex({ todoListId: 1 });

print('Replica set and database initialized successfully');

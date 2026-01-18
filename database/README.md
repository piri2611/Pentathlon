# Database Schema for Pentathlon

## Schools Table

This table stores school names entered in the Bazar page.

### Table Structure

```sql
schools
├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
├── school_name (VARCHAR(255), NOT NULL)
├── created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
└── updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
```

### Usage

1. **Create the database and table:**
   ```bash
   mysql -u root -p < schema.sql
   ```

2. **Insert a new school:**
   ```sql
   INSERT INTO schools (school_name) VALUES ('Your School Name');
   ```

3. **Get all schools:**
   ```sql
   SELECT * FROM schools ORDER BY created_at DESC;
   ```

4. **Search for a school:**
   ```sql
   SELECT * FROM schools WHERE school_name LIKE '%search%';
   ```

### Database Options

You can use any of these databases:
- MySQL
- PostgreSQL
- SQLite
- MongoDB

For PostgreSQL, use this schema instead:

```sql
CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

For SQLite:

```sql
CREATE TABLE schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

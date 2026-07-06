# HealthFlow Clinic Management

## Setup

### Prerequisites
- Node.js (v18+)
- Java 17

### Local Development

1. **Start the Backend:**
   The backend relies on PostgreSQL and a JWT Secret. Ensure you set the `JDBC_DATABASE_URL` environment variable to your provided database connection string before running the backend. A default secret is provided in `server/src/main/resources/application.properties`, but it is recommended to set a custom `JWT_SECRET`.

   Open a terminal, set the environment variable, and run the backend:

   **On Linux/macOS:**
   ```bash
   export JDBC_DATABASE_URL="jdbc:postgresql://bowed-herder-17640.jxf.gcp-asia-south1.cockroachlabs.cloud:26257/healthflow?sslmode=verify-full&password=your_password&user=postgres"
   cd server
   ./mvnw spring-boot:run
   ```

   **On Windows (PowerShell):**
   ```powershell
   $env:JDBC_DATABASE_URL="jdbc:postgresql://bowed-herder-17640.jxf.gcp-asia-south1.cockroachlabs.cloud:26257/healthflow?sslmode=verify-full&password=your_password&user=postgres"
   cd server
   .\mvnw.cmd spring-boot:run
   ```

2. **Seed Initial Data:**
   On the very first launch, the database might be empty. You need to seed the initial roles and users. You can do this by opening your browser or using `curl` to make a GET request to:
   ```
   http://localhost:8080/api/setup/init
   ```

3. **Start the Frontend:**
   Open a *new* terminal and run:
   ```bash
   npm install
   npm run dev
   ```

4. **Access the App:**
   Open your browser and navigate to `http://localhost:5173`.

   Login with default credentials:
   - **Email:** `admin@healthflow.com`
   - **Password:** `password123`

## Architecture
- Spring Boot (Java 17, Data JPA, Security with JWT)
- React (Vite, TypeScript, Tailwind CSS, Recharts)
- PostgreSQL

// test.ts
import { jwtDecode } from "jwt-decode";

const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

try {
  const decoded = jwtDecode(testToken);
  console.log("Decoded:", decoded);
} catch (error) {
  console.error("Test error:", error);
}
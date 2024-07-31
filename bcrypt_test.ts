import bcrypt from "bcrypt";

const password = "danhyeye";
const rounds = 12;

const testBcrypt = async () => {
  try {
    // Hash the password
    const hash = await bcrypt.hash(password, rounds);
    console.log("Hashed password:", hash);

    // Compare the password with the hashed password
    const result = await bcrypt.compare(password, hash);
    console.log("Password comparison result:", result);
  } catch (error) {
    console.error("Error in bcrypt test:", error);
  }
};

// Run the test
testBcrypt();

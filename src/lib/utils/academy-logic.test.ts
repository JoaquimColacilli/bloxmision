import { calculateStars } from "./academy-logic"
import assert from "assert"

// Simple test runner structure since no Jest/Vitest is available
console.log("Running Academy Logic Tests...")

let testsPassed = 0
let testsTotal = 0

function runTest(name: string, actual: any, expected: any) {
    testsTotal++
    try {
        assert.strictEqual(actual, expected)
        console.log(`✅ ${name}`)
        testsPassed++
    } catch (e) {
        console.error(`❌ ${name}`)
        console.error(`   Expected: ${expected}, Got: ${actual}`)
    }
}

// Scenarios
// 3 Exercises, 3 Quiz Questions

// Case 1: Perfect Run -> 3 Stars
runTest("Perfect Run (3/3 Q, 0 Hints, 3 Attempts)", calculateStars(3, 3, 0, 3, 3), 3)

// Case 2: Good Run (2/3 Q, 1 Hint, 4 Attempts) -> 2 Stars
runTest("Good Run (2/3 Q, 1 Hint, 4 Attempts)", calculateStars(2, 3, 1, 4, 3), 2)

// Case 3: Too many hints -> 1 Star
runTest("Too many hints (1/3 Q, 2 Hints, 3 Attempts)", calculateStars(1, 3, 2, 3, 3), 1)

// Case 4: Too many attempts -> 1 Star
runTest("Too many attempts (3/3 Q, 0 Hints, 10 Attempts)", calculateStars(3, 3, 0, 10, 3), 1)

// Case 5: Quiz fail but practice done -> 1 Star (Logic says if completed, min 1 star)
runTest("Quiz Fail (0/3 Q, 0 Hints, 3 Attempts)", calculateStars(0, 3, 0, 3, 3), 1)

// Case 6: Edge case, exactly 2 attempts per exercise -> 2 Stars
runTest("Max attempts for 2 stars (2/3 Q, 0 Hints, 6 Attempts)", calculateStars(2, 3, 0, 6, 3), 2)

console.log(`\nTest Result: ${testsPassed}/${testsTotal} passed.`)

if (testsPassed === testsTotal) {
    process.exit(0)
} else {
    process.exit(1)
}
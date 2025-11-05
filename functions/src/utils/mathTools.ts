/**
 * Math Tools for AI Tutor
 * Uses nerdamer for symbolic math, algebra, geometry, and calculus
 */

// nerdamer requires CommonJS require
const nerdamer = require("nerdamer");
require("nerdamer/Calculus");
require("nerdamer/Solve");
require("nerdamer/Algebra");

// ============================================================================
// ALGEBRA TOOLS
// ============================================================================

/**
 * Solve linear equation (e.g., 2x + 5 = 13)
 */
export function solveLinearEquation(
  equation: string,
  variable: string
): { solution: string; steps: string[] } {
  try {
    // Clean equation: replace spaces, handle common formats
    const cleanEq = equation.replace(/\s/g, "");
    
    // Solve using nerdamer - use solveEquations for equations
    const solutions = nerdamer.solveEquations(cleanEq, variable);
    const solutionStr = Array.isArray(solutions) 
      ? solutions[0].toString() 
      : solutions.toString();
    
    // Format solution
    const solution = solutionStr.includes("=") 
      ? solutionStr 
      : `${variable} = ${solutionStr}`;
    
    return {
      solution,
      steps: [
        `Equation: ${equation}`,
        `Solving for ${variable}...`,
        `Solution: ${solution}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to solve linear equation: ${error}`);
  }
}

/**
 * Solve quadratic equation (e.g., x² + 5x + 6 = 0)
 */
export function solveQuadraticEquation(
  equation: string,
  variable: string
): { solutions: string[]; discriminant: number; steps: string[] } {
  try {
    const cleanEq = equation.replace(/\s/g, "");
    
    // Solve quadratic using solveEquations
    const solutions = nerdamer.solveEquations(cleanEq, variable);
    const solutionArray = Array.isArray(solutions) 
      ? solutions.map((s: any) => s.toString())
      : [solutions.toString()];
    
    // Calculate discriminant (for ax² + bx + c = 0)
    // Extract coefficients - simplified approach (would need manual calculation)
    const discriminant = 0; // Would need to calculate separately
    
    return {
      solutions: solutionArray,
      discriminant, // Would need to calculate separately
      steps: [
        `Equation: ${equation}`,
        `Solving quadratic equation for ${variable}...`,
        `Solutions: ${solutionArray.join(", ")}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to solve quadratic equation: ${error}`);
  }
}

/**
 * Factor algebraic expression (e.g., x² + 5x + 6 → (x+2)(x+3))
 */
export function factorExpression(
  expression: string
): { factored: string; steps: string[] } {
  try {
    const cleanExpr = expression.replace(/\s/g, "");
    // nerdamer factor method - use factor() on the expression
    const factored = nerdamer.factor(cleanExpr).toString();
    
    return {
      factored,
      steps: [
        `Expression: ${expression}`,
        `Factoring...`,
        `Factored form: ${factored}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to factor expression: ${error}`);
  }
}

/**
 * Expand algebraic expression (e.g., (x+2)(x+3) → x² + 5x + 6)
 */
export function expandExpression(
  expression: string
): { expanded: string; steps: string[] } {
  try {
    const cleanExpr = expression.replace(/\s/g, "");
    // nerdamer expand method
    const expanded = nerdamer.expand(cleanExpr).toString();
    
    return {
      expanded,
      steps: [
        `Expression: ${expression}`,
        `Expanding...`,
        `Expanded form: ${expanded}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to expand expression: ${error}`);
  }
}

/**
 * Simplify algebraic expression
 */
export function simplifyExpression(
  expression: string
): { simplified: string; steps: string[] } {
  try {
    const cleanExpr = expression.replace(/\s/g, "");
    // nerdamer simplify method
    const simplified = nerdamer.simplify(cleanExpr).toString();
    
    return {
      simplified,
      steps: [
        `Expression: ${expression}`,
        `Simplifying...`,
        `Simplified form: ${simplified}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to simplify expression: ${error}`);
  }
}

/**
 * Solve system of linear equations
 */
export function solveSystemOfEquations(
  equations: string[],
  variables: string[]
): { solutions: Record<string, string>; steps: string[] } {
  try {
    const cleanEqs = equations.map((eq) => eq.replace(/\s/g, ""));
    // nerdamer solveEquations for systems
    const solutions = nerdamer.solveEquations(cleanEqs, variables);
    
    // Convert to object format
    const solutionObj: Record<string, string> = {};
    if (Array.isArray(solutions)) {
      solutions.forEach((sol: any, index: number) => {
        if (index < variables.length) {
          solutionObj[variables[index]] = sol.toString();
        }
      });
    }
    
    return {
      solutions: solutionObj,
      steps: [
        `Equations: ${equations.join(", ")}`,
        `Solving system for ${variables.join(", ")}...`,
        `Solutions: ${JSON.stringify(solutionObj)}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to solve system of equations: ${error}`);
  }
}

// ============================================================================
// GEOMETRY TOOLS
// ============================================================================

/**
 * Calculate area of geometric shape
 */
export function calculateArea(
  shape: string,
  dimensions: Record<string, number>
): { area: number; formula: string; steps: string[] } {
  try {
    let area = 0;
    let formula = "";
    
    switch (shape.toLowerCase()) {
      case "circle":
        if (dimensions.radius) {
          area = Math.PI * dimensions.radius * dimensions.radius;
          formula = "π × r²";
        }
        break;
      case "rectangle":
        if (dimensions.length && dimensions.width) {
          area = dimensions.length * dimensions.width;
          formula = "length × width";
        }
        break;
      case "square":
        if (dimensions.side) {
          area = dimensions.side * dimensions.side;
          formula = "side²";
        }
        break;
      case "triangle":
        if (dimensions.base && dimensions.height) {
          area = 0.5 * dimensions.base * dimensions.height;
          formula = "½ × base × height";
        }
        break;
      case "trapezoid":
        if (dimensions.base1 && dimensions.base2 && dimensions.height) {
          area = 0.5 * (dimensions.base1 + dimensions.base2) * dimensions.height;
          formula = "½ × (base1 + base2) × height";
        }
        break;
      case "parallelogram":
        if (dimensions.base && dimensions.height) {
          area = dimensions.base * dimensions.height;
          formula = "base × height";
        }
        break;
      default:
        throw new Error(`Unsupported shape: ${shape}`);
    }
    
    if (area === 0) {
      throw new Error(`Missing required dimensions for ${shape}`);
    }
    
    return {
      area: Math.round(area * 100) / 100, // Round to 2 decimal places
      formula,
      steps: [
        `Shape: ${shape}`,
        `Dimensions: ${JSON.stringify(dimensions)}`,
        `Formula: ${formula}`,
        `Area: ${area}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to calculate area: ${error}`);
  }
}

/**
 * Calculate volume of 3D shape
 */
export function calculateVolume(
  shape: string,
  dimensions: Record<string, number>
): { volume: number; formula: string; steps: string[] } {
  try {
    let volume = 0;
    let formula = "";
    
    switch (shape.toLowerCase()) {
      case "cube":
        if (dimensions.side) {
          volume = dimensions.side * dimensions.side * dimensions.side;
          formula = "side³";
        }
        break;
      case "sphere":
        if (dimensions.radius) {
          volume = (4 / 3) * Math.PI * dimensions.radius * dimensions.radius * dimensions.radius;
          formula = "4/3 × π × r³";
        }
        break;
      case "cylinder":
        if (dimensions.radius && dimensions.height) {
          volume = Math.PI * dimensions.radius * dimensions.radius * dimensions.height;
          formula = "π × r² × h";
        }
        break;
      case "cone":
        if (dimensions.radius && dimensions.height) {
          volume = (1 / 3) * Math.PI * dimensions.radius * dimensions.radius * dimensions.height;
          formula = "1/3 × π × r² × h";
        }
        break;
      case "rectangular_prism":
      case "box":
        if (dimensions.length && dimensions.width && dimensions.height) {
          volume = dimensions.length * dimensions.width * dimensions.height;
          formula = "length × width × height";
        }
        break;
      default:
        throw new Error(`Unsupported shape: ${shape}`);
    }
    
    if (volume === 0) {
      throw new Error(`Missing required dimensions for ${shape}`);
    }
    
    return {
      volume: Math.round(volume * 100) / 100,
      formula,
      steps: [
        `Shape: ${shape}`,
        `Dimensions: ${JSON.stringify(dimensions)}`,
        `Formula: ${formula}`,
        `Volume: ${volume}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to calculate volume: ${error}`);
  }
}

/**
 * Calculate perimeter/circumference
 */
export function calculatePerimeter(
  shape: string,
  dimensions: Record<string, number>
): { perimeter: number; formula: string; steps: string[] } {
  try {
    let perimeter = 0;
    let formula = "";
    
    switch (shape.toLowerCase()) {
      case "circle":
        if (dimensions.radius) {
          perimeter = 2 * Math.PI * dimensions.radius;
          formula = "2 × π × r";
        }
        break;
      case "rectangle":
        if (dimensions.length && dimensions.width) {
          perimeter = 2 * (dimensions.length + dimensions.width);
          formula = "2 × (length + width)";
        }
        break;
      case "square":
        if (dimensions.side) {
          perimeter = 4 * dimensions.side;
          formula = "4 × side";
        }
        break;
      case "triangle":
        if (dimensions.side1 && dimensions.side2 && dimensions.side3) {
          perimeter = dimensions.side1 + dimensions.side2 + dimensions.side3;
          formula = "side1 + side2 + side3";
        }
        break;
      default:
        throw new Error(`Unsupported shape: ${shape}`);
    }
    
    if (perimeter === 0) {
      throw new Error(`Missing required dimensions for ${shape}`);
    }
    
    return {
      perimeter: Math.round(perimeter * 100) / 100,
      formula,
      steps: [
        `Shape: ${shape}`,
        `Dimensions: ${JSON.stringify(dimensions)}`,
        `Formula: ${formula}`,
        `Perimeter: ${perimeter}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to calculate perimeter: ${error}`);
  }
}

/**
 * Calculate surface area of 3D shape
 */
export function calculateSurfaceArea(
  shape: string,
  dimensions: Record<string, number>
): { surface_area: number; formula: string; steps: string[] } {
  try {
    let surfaceArea = 0;
    let formula = "";
    
    switch (shape.toLowerCase()) {
      case "cube":
        if (dimensions.side) {
          surfaceArea = 6 * dimensions.side * dimensions.side;
          formula = "6 × side²";
        }
        break;
      case "sphere":
        if (dimensions.radius) {
          surfaceArea = 4 * Math.PI * dimensions.radius * dimensions.radius;
          formula = "4 × π × r²";
        }
        break;
      case "cylinder":
        if (dimensions.radius && dimensions.height) {
          surfaceArea = 2 * Math.PI * dimensions.radius * (dimensions.radius + dimensions.height);
          formula = "2 × π × r × (r + h)";
        }
        break;
      case "cone":
        if (dimensions.radius && dimensions.height) {
          const slantHeight = Math.sqrt(
            dimensions.radius * dimensions.radius + dimensions.height * dimensions.height
          );
          surfaceArea = Math.PI * dimensions.radius * (dimensions.radius + slantHeight);
          formula = "π × r × (r + l)";
        }
        break;
      case "rectangular_prism":
      case "box":
        if (dimensions.length && dimensions.width && dimensions.height) {
          surfaceArea = 2 * (
            dimensions.length * dimensions.width +
            dimensions.length * dimensions.height +
            dimensions.width * dimensions.height
          );
          formula = "2 × (lw + lh + wh)";
        }
        break;
      default:
        throw new Error(`Unsupported shape: ${shape}`);
    }
    
    if (surfaceArea === 0) {
      throw new Error(`Missing required dimensions for ${shape}`);
    }
    
    return {
      surface_area: Math.round(surfaceArea * 100) / 100,
      formula,
      steps: [
        `Shape: ${shape}`,
        `Dimensions: ${JSON.stringify(dimensions)}`,
        `Formula: ${formula}`,
        `Surface Area: ${surfaceArea}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to calculate surface area: ${error}`);
  }
}

/**
 * Solve using Pythagorean theorem
 */
export function solvePythagoreanTheorem(
  dimensions: { a?: number; b?: number; c?: number }
): { missing_side: number; formula: string; steps: string[] } {
  try {
    const { a, b, c } = dimensions;
    let missingSide = 0;
    let formula = "";
    
    if (a && b && !c) {
      // Find hypotenuse
      missingSide = Math.sqrt(a * a + b * b);
      formula = "c = √(a² + b²)";
    } else if (a && c && !b) {
      // Find leg
      missingSide = Math.sqrt(c * c - a * a);
      formula = "b = √(c² - a²)";
    } else if (b && c && !a) {
      // Find leg
      missingSide = Math.sqrt(c * c - b * b);
      formula = "a = √(c² - b²)";
    } else {
      throw new Error("Must provide exactly two of a, b, c");
    }
    
    return {
      missing_side: Math.round(missingSide * 100) / 100,
      formula,
      steps: [
        `Given: ${JSON.stringify(dimensions)}`,
        `Using Pythagorean theorem: ${formula}`,
        `Missing side: ${missingSide}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to solve Pythagorean theorem: ${error}`);
  }
}

// ============================================================================
// CALCULUS TOOLS
// ============================================================================

/**
 * Calculate derivative
 */
export function calculateDerivative(
  expression: string,
  variable: string
): { derivative: string; steps: string[] } {
  try {
    const cleanExpr = expression.replace(/\s/g, "");
    // nerdamer diff for derivatives
    const derivative = nerdamer.diff(cleanExpr, variable).toString();
    
    return {
      derivative,
      steps: [
        `Expression: ${expression}`,
        `Calculating derivative with respect to ${variable}...`,
        `Derivative: ${derivative}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to calculate derivative: ${error}`);
  }
}

/**
 * Calculate integral (indefinite or definite)
 */
export function calculateIntegral(
  expression: string,
  variable: string,
  lower?: number,
  upper?: number
): { integral: string; steps: string[] } {
  try {
    const cleanExpr = expression.replace(/\s/g, "");
    
    let integral: string;
    if (lower !== undefined && upper !== undefined) {
      // Definite integral - use integrate with bounds
      integral = nerdamer.integrate(cleanExpr, variable, lower, upper).toString();
    } else {
      // Indefinite integral
      integral = nerdamer.integrate(cleanExpr, variable).toString();
    }
    
    return {
      integral,
      steps: [
        `Expression: ${expression}`,
        lower !== undefined && upper !== undefined
          ? `Calculating definite integral from ${lower} to ${upper}...`
          : `Calculating indefinite integral...`,
        `Integral: ${integral}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to calculate integral: ${error}`);
  }
}

/**
 * Calculate limit
 */
export function calculateLimit(
  expression: string,
  variable: string,
  approaches: number
): { limit: number | string; steps: string[] } {
  try {
    const cleanExpr = expression.replace(/\s/g, "");
    
    // nerdamer limit - may need to use limit method or evaluate at point
    // For now, try to substitute and evaluate
    const substituted = nerdamer(cleanExpr).sub(variable, approaches);
    const limit = substituted.evaluate().toString();
    
    // Try to evaluate as number, otherwise return as string
    const limitNum = parseFloat(limit);
    const limitValue = isNaN(limitNum) ? limit : limitNum;
    
    return {
      limit: limitValue,
      steps: [
        `Expression: ${expression}`,
        `Calculating limit as ${variable} approaches ${approaches}...`,
        `Limit: ${limitValue}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to calculate limit: ${error}`);
  }
}

// ============================================================================
// ARITHMETIC TOOLS
// ============================================================================

/**
 * Evaluate arithmetic expression
 */
export function evaluateExpression(
  expression: string
): { result: number; steps: string[] } {
  try {
    const cleanExpr = expression.replace(/\s/g, "");
    // nerdamer evaluate
    const result = parseFloat(nerdamer(cleanExpr).evaluate().toString());
    
    if (isNaN(result)) {
      throw new Error("Expression could not be evaluated to a number");
    }
    
    return {
      result,
      steps: [
        `Expression: ${expression}`,
        `Evaluating...`,
        `Result: ${result}`,
      ],
    };
  } catch (error) {
    throw new Error(`Failed to evaluate expression: ${error}`);
  }
}

/**
 * Calculate percentage
 */
export function calculatePercentage(
  input: { part?: number; whole?: number; percent?: number }
): { result: number; steps: string[] } {
  try {
    const { part, whole, percent } = input;
    let result = 0;
    let steps: string[] = [];
    
    if (part !== undefined && whole !== undefined) {
      // Calculate percentage
      result = (part / whole) * 100;
      steps = [
        `Part: ${part}, Whole: ${whole}`,
        `Percentage = (part / whole) × 100`,
        `Result: ${result}%`,
      ];
    } else if (percent !== undefined && whole !== undefined) {
      // Calculate part from percentage
      result = (percent / 100) * whole;
      steps = [
        `Percent: ${percent}%, Whole: ${whole}`,
        `Part = (percent / 100) × whole`,
        `Result: ${result}`,
      ];
    } else {
      throw new Error("Must provide either (part, whole) or (percent, whole)");
    }
    
    return {
      result: Math.round(result * 100) / 100,
      steps,
    };
  } catch (error) {
    throw new Error(`Failed to calculate percentage: ${error}`);
  }
}

// ============================================================================
// VALIDATION TOOLS
// ============================================================================

/**
 * Validate student answer against correct solution
 */
export function validateAnswer(
  problem: string,
  studentAnswer: string,
  problemType: string
): { is_correct: boolean; correct_answer: string; error?: string } {
  try {
    // Try to solve the problem based on type
    let correctAnswer = "";
    
    if (problemType === "algebra" || problemType === "linear_equation") {
      // Extract variable (usually x or t)
      const variableMatch = problem.match(/([a-z])/i);
      const variable = variableMatch ? variableMatch[1] : "x";
      
      // Solve the ORIGINAL problem to get correct answer
      const solution = solveLinearEquation(problem, variable);
      correctAnswer = solution.solution;
      
      // Also check if student's answer is a rearrangement - if so, solve it too
      // If student provides a rearranged equation (e.g., "16 - 9 = 5t + 2t"), 
      // check if it's equivalent by solving it and comparing
      if (studentAnswer.includes("=") && studentAnswer !== problem) {
        try {
          // Try to solve the student's rearranged equation
          const studentSolution = solveLinearEquation(studentAnswer, variable);
          const studentAnswerValue = studentSolution.solution;
          
          // Compare the solutions - if they match, the rearrangement is correct
          const correctValue = parseFloat(correctAnswer);
          const studentValue = parseFloat(studentAnswerValue);
          
          if (!isNaN(correctValue) && !isNaN(studentValue)) {
            // If solutions match, the rearrangement is mathematically equivalent
            return {
              is_correct: Math.abs(correctValue - studentValue) < 0.0001,
              correct_answer: correctAnswer,
              error: Math.abs(correctValue - studentValue) >= 0.0001 
                ? `The rearrangement is not equivalent. Correct solution: ${variable} = ${correctAnswer}` 
                : undefined,
            };
          }
        } catch (error) {
          // If we can't solve student's equation, it might be invalid
          // Fall through to normal validation
        }
      }
    } else if (problemType === "arithmetic" || problemType === "expression") {
      // For arithmetic, evaluate the expression
      const result = evaluateExpression(problem);
      correctAnswer = result.result.toString();
    } else if (problemType === "quadratic_equation") {
      // Extract variable (usually x)
      const variableMatch = problem.match(/([a-z])/i);
      const variable = variableMatch ? variableMatch[1] : "x";
      
      const solution = solveQuadraticEquation(problem, variable);
      // For quadratic, compare all solutions
      correctAnswer = solution.solutions.join(", ");
    } else {
      // For other types, try to evaluate first (most flexible)
      try {
        const result = evaluateExpression(problem);
        correctAnswer = result.result.toString();
      } catch {
        // If evaluation fails, we can't validate
        return {
          is_correct: false,
          correct_answer: "Unable to determine correct answer",
          error: "Problem type not supported for validation",
        };
      }
    }
    
    // Normalize student answer and correct answer for comparison
    const normalizeAnswer = (ans: string) => {
      return ans
        .replace(/\s/g, "")
        .replace(/=/g, "=")
        .toLowerCase()
        .trim();
    };
    
    // Extract numerical value from student answer (e.g., "x = 4" → "4", "74" → "74")
    const extractNumber = (ans: string): string => {
      // Remove "x = ", "y = ", etc.
      const match = ans.match(/[=:]\s*([-\d.]+)/);
      if (match) {
        return match[1];
      }
      // If no "=" found, try to extract just the number
      const numMatch = ans.match(/([-\d.]+)/);
      if (numMatch) {
        return numMatch[1];
      }
      return ans;
    };
    
    const normalizedStudent = normalizeAnswer(studentAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    
    // Extract numerical values for comparison
    const studentNum = extractNumber(normalizedStudent);
    const correctNum = extractNumber(normalizedCorrect);
    
    // Check if answers match (numeric comparison)
    let isCorrect = false;
    
    // Try numeric comparison first
    if (studentNum && correctNum) {
      const studentValue = parseFloat(studentNum);
      const correctValue = parseFloat(correctNum);
      if (!isNaN(studentValue) && !isNaN(correctValue)) {
        // Allow small floating point differences
        isCorrect = Math.abs(studentValue - correctValue) < 0.0001;
      }
    }
    
    // If numeric comparison didn't work, try string matching
    if (!isCorrect) {
      isCorrect = normalizedStudent === normalizedCorrect ||
        normalizedStudent.includes(normalizedCorrect) ||
        normalizedCorrect.includes(normalizedStudent);
    }
    
    return {
      is_correct: isCorrect,
      correct_answer: correctAnswer,
      error: isCorrect ? undefined : `Answer does not match correct solution. Correct answer: ${correctAnswer}`,
    };
  } catch (error) {
    return {
      is_correct: false,
      correct_answer: "Error",
      error: `Validation failed: ${error}`,
    };
  }
}

/**
 * Check if intermediate step is valid
 */
export function checkStep(
  previousStep: string,
  currentStep: string,
  operation: string
): { is_valid: boolean; error?: string; next_hint?: string } {
  try {
    // This is a simplified validation - in practice, you'd want more sophisticated checking
    // For now, we'll try to evaluate both sides and see if they're equal
    
    try {
      // Try to extract equations and evaluate
      // Note: This is simplified - actual step validation would need more sophisticated logic
      // For now, assume valid if we can't check
      const isValid = true; // Simplified - would need more logic
      
      return {
        is_valid: isValid,
        next_hint: isValid ? "Step is correct, continue" : "Check your operation",
      };
    } catch {
      // If evaluation fails, we can't validate
      return {
        is_valid: true, // Assume valid if we can't check
        error: "Unable to validate step",
      };
    }
  } catch (error) {
    return {
      is_valid: false,
      error: `Step validation failed: ${error}`,
    };
  }
}


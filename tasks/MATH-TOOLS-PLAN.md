# Math Tools Integration Plan

## Overview
Add comprehensive math tools using nerdamer so the AI can automatically solve problems internally and guide students using the Socratic method.

---

## Math Tools to Create

### 1. Algebra Tools

#### `solve_linear_equation`
- **Purpose:** Solve linear equations (e.g., `2x + 5 = 13`)
- **Input:** `equation: string`, `variable: string`
- **Output:** `{ solution: string, steps: string[] }`
- **Example:** `solve_linear_equation("2*x+5=13", "x")` → `x = 4`

#### `solve_quadratic_equation`
- **Purpose:** Solve quadratic equations (e.g., `x² + 5x + 6 = 0`)
- **Input:** `equation: string`, `variable: string`
- **Output:** `{ solutions: string[], discriminant: number, steps: string[] }`
- **Example:** `solve_quadratic_equation("x^2+5*x+6=0", "x")` → `x = -2, x = -3`

#### `factor_expression`
- **Purpose:** Factor algebraic expressions
- **Input:** `expression: string`
- **Output:** `{ factored: string, steps: string[] }`
- **Example:** `factor_expression("x^2+5*x+6")` → `(x+2)(x+3)`

#### `expand_expression`
- **Purpose:** Expand algebraic expressions
- **Input:** `expression: string`
- **Output:** `{ expanded: string, steps: string[] }`
- **Example:** `expand_expression("(x+2)(x+3)")` → `x² + 5x + 6`

#### `simplify_expression`
- **Purpose:** Simplify algebraic expressions
- **Input:** `expression: string`
- **Output:** `{ simplified: string, steps: string[] }`
- **Example:** `simplify_expression("2*x+3*x")` → `5x`

#### `solve_system_of_equations`
- **Purpose:** Solve systems of linear equations
- **Input:** `equations: string[]`, `variables: string[]`
- **Output:** `{ solutions: object, steps: string[] }`
- **Example:** `solve_system_of_equations(["2*x+y=5", "x-y=1"], ["x", "y"])` → `{x: 2, y: 1}`

### 2. Geometry Tools

#### `calculate_area`
- **Purpose:** Calculate area of geometric shapes
- **Input:** `shape: string`, `dimensions: object`
- **Output:** `{ area: number, formula: string, steps: string[] }`
- **Shapes:** circle, rectangle, triangle, square, trapezoid, parallelogram
- **Example:** `calculate_area("circle", {radius: 5})` → `78.54`

#### `calculate_volume`
- **Purpose:** Calculate volume of 3D shapes
- **Input:** `shape: string`, `dimensions: object`
- **Output:** `{ volume: number, formula: string, steps: string[] }`
- **Shapes:** cube, sphere, cylinder, cone, rectangular_prism
- **Example:** `calculate_volume("sphere", {radius: 3})` → `113.1`

#### `calculate_perimeter`
- **Purpose:** Calculate perimeter/circumference
- **Input:** `shape: string`, `dimensions: object`
- **Output:** `{ perimeter: number, formula: string, steps: string[] }`
- **Shapes:** circle, rectangle, triangle, square
- **Example:** `calculate_perimeter("circle", {radius: 5})` → `31.42`

#### `calculate_surface_area`
- **Purpose:** Calculate surface area of 3D shapes
- **Input:** `shape: string`, `dimensions: object`
- **Output:** `{ surface_area: number, formula: string, steps: string[] }`
- **Shapes:** cube, sphere, cylinder, cone, rectangular_prism
- **Example:** `calculate_surface_area("cube", {side: 5})` → `150`

#### `solve_pythagorean_theorem`
- **Purpose:** Solve using Pythagorean theorem
- **Input:** `a?: number`, `b?: number`, `c?: number`
- **Output:** `{ missing_side: number, formula: string, steps: string[] }`
- **Example:** `solve_pythagorean_theorem({a: 3, b: 4})` → `c = 5`

### 3. Calculus Tools

#### `calculate_derivative`
- **Purpose:** Calculate derivative of a function
- **Input:** `expression: string`, `variable: string`
- **Output:** `{ derivative: string, steps: string[] }`
- **Example:** `calculate_derivative("x^2+3*x", "x")` → `2x + 3`

#### `calculate_integral`
- **Purpose:** Calculate integral (indefinite or definite)
- **Input:** `expression: string`, `variable: string`, `lower?: number`, `upper?: number`
- **Output:** `{ integral: string, steps: string[] }`
- **Example:** `calculate_integral("x^2", "x")` → `x³/3 + C`
- **Example:** `calculate_integral("x^2", "x", 0, 2)` → `8/3`

#### `calculate_limit`
- **Purpose:** Calculate limit of a function
- **Input:** `expression: string`, `variable: string`, `approaches: number`
- **Output:** `{ limit: number | string, steps: string[] }`
- **Example:** `calculate_limit("(x^2-4)/(x-2)", "x", 2)` → `4`

### 4. Arithmetic Tools

#### `evaluate_expression`
- **Purpose:** Evaluate arithmetic expressions
- **Input:** `expression: string`
- **Output:** `{ result: number, steps: string[] }`
- **Example:** `evaluate_expression("2+3*4")` → `14`

#### `calculate_percentage`
- **Purpose:** Calculate percentages
- **Input:** `part: number`, `whole: number` OR `percent: number`, `whole: number`
- **Output:** `{ result: number, steps: string[] }`
- **Example:** `calculate_percentage({part: 20, whole: 100})` → `20%`

### 5. Validation Tools

#### `validate_answer`
- **Purpose:** Validate student's answer against correct solution
- **Input:** `problem: string`, `student_answer: string`, `problem_type: string`
- **Output:** `{ is_correct: boolean, correct_answer: string, error?: string }`
- **Example:** `validate_answer("2*x+5=13", "x=4", "algebra")` → `{is_correct: true, correct_answer: "x=4"}`

#### `check_step`
- **Purpose:** Validate intermediate step in problem solving
- **Input:** `previous_step: string`, `current_step: string`, `operation: string`
- **Output:** `{ is_valid: boolean, error?: string, next_hint?: string }`
- **Example:** `check_step("2*x+5=13", "2*x=8", "subtract")` → `{is_valid: true}`

---

## AI Detection Logic

The AI will automatically detect which tool to use based on:

1. **Problem Type Detection:**
   - Keywords: "solve", "find", "calculate", "evaluate"
   - Mathematical notation: `=`, `+`, `-`, `*`, `/`, `^`, `∫`, `d/dx`
   - Shape names: "circle", "triangle", "sphere", etc.
   - Operation words: "factor", "expand", "simplify", "integrate", "differentiate"

2. **Automatic Tool Selection:**
   - Linear equation → `solve_linear_equation`
   - Quadratic equation → `solve_quadratic_equation`
   - "factor" → `factor_expression`
   - "area of" → `calculate_area`
   - "integral" or "∫" → `calculate_integral`
   - "derivative" or "d/dx" → `calculate_derivative`

3. **Tool Priority:**
   - Try specific tools first (e.g., `solve_linear_equation`)
   - Fall back to general tools (e.g., `evaluate_expression`)
   - Always validate with `validate_answer` when student provides answer

---

## Implementation Structure

### File: `functions/src/utils/mathTools.ts`
- All nerdamer math functions
- Organized by category (algebra, geometry, calculus, etc.)
- Error handling and validation
- Returns structured results with steps

### File: `functions/src/utils/mathToolSchemas.ts`
- OpenAI function schemas (JSON Schema format)
- All tool definitions for OpenAI API
- Descriptions that help AI choose correct tool

### File: `functions/src/index.ts`
- Update `chat` function:
  - Add `tools` parameter to OpenAI API call
  - Handle `function_call` responses
  - Execute math functions
  - Return results to OpenAI
  - Continue streaming

### File: `functions/src/utils/prompts.ts`
- Update prompt:
  - Instruct AI to use tools automatically
  - Explain when to use each tool
  - Emphasize: keep solutions internal, guide conversationally

---

## Testing Plan

### Test Cases by Category

#### Algebra
- [ ] Linear: `2x + 5 = 13`
- [ ] Quadratic: `x² + 5x + 6 = 0`
- [ ] Factoring: `x² + 5x + 6`
- [ ] Expanding: `(x+2)(x+3)`
- [ ] Simplifying: `2x + 3x`
- [ ] Systems: `2x + y = 5, x - y = 1`

#### Geometry
- [ ] Circle area: radius = 5
- [ ] Rectangle area: length = 10, width = 5
- [ ] Triangle area: base = 6, height = 4
- [ ] Sphere volume: radius = 3
- [ ] Pythagorean: a = 3, b = 4
- [ ] Surface area: cube with side = 5

#### Calculus
- [ ] Derivative: `d/dx(x² + 3x)`
- [ ] Integral: `∫x² dx`
- [ ] Definite integral: `∫₀² x² dx`
- [ ] Limit: `lim(x→2) (x²-4)/(x-2)`

#### Arithmetic
- [ ] Expression: `2 + 3 * 4`
- [ ] Percentage: 20% of 100
- [ ] Validation: Check if `x=4` solves `2x+5=13`

---

## Success Criteria

1. ✅ AI automatically detects math problems
2. ✅ AI calls appropriate tool without user prompting
3. ✅ Tools execute correctly and return solutions
4. ✅ AI uses solutions internally to guide students
5. ✅ AI never reveals direct answers
6. ✅ Validation works correctly
7. ✅ All test cases pass

---

## Next Steps

1. Install nerdamer
2. Create math tools module
3. Create function schemas
4. Update chat function
5. Update prompt
6. Test all tools
7. Deploy and verify

---

## Notes

- All tools run server-side (Cloud Functions)
- Solutions stay internal to AI
- AI uses solutions to validate and guide
- No frontend changes needed
- Tools are transparent to student


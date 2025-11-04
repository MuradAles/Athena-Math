/**
 * OpenAI Function Schemas for Math Tools
 * Defines all available math tools that AI can call automatically
 */

// OpenAI tool type - using ChatCompletionTool from OpenAI SDK
// Note: ChatCompletionTool may not be exported, using inline type
type ChatCompletionTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
  };
};

/**
 * All math tool schemas for OpenAI function calling
 */
export const MATH_TOOL_SCHEMAS: ChatCompletionTool[] = [
  // ============================================================================
  // ALGEBRA TOOLS
  // ============================================================================
  
  {
    type: "function",
    function: {
      name: "solve_linear_equation",
      description: "Solve a linear equation (e.g., 2x + 5 = 13). Use when student provides a linear equation or asks to solve for a variable in a linear equation.",
      parameters: {
        type: "object",
        properties: {
          equation: {
            type: "string",
            description: "The linear equation to solve (e.g., '2x + 5 = 13' or '3y - 7 = 14')",
          },
          variable: {
            type: "string",
            description: "The variable to solve for (e.g., 'x', 'y', 'z')",
          },
        },
        required: ["equation", "variable"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "solve_quadratic_equation",
      description: "Solve a quadratic equation (e.g., x² + 5x + 6 = 0). Use when student provides a quadratic equation or asks to solve for a variable in a quadratic equation.",
      parameters: {
        type: "object",
        properties: {
          equation: {
            type: "string",
            description: "The quadratic equation to solve (e.g., 'x^2 + 5x + 6 = 0')",
          },
          variable: {
            type: "string",
            description: "The variable to solve for (usually 'x')",
          },
        },
        required: ["equation", "variable"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "factor_expression",
      description: "Factor an algebraic expression (e.g., x² + 5x + 6 → (x+2)(x+3)). Use when student asks to factor an expression or when checking if factoring is correct.",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "The algebraic expression to factor (e.g., 'x^2 + 5x + 6')",
          },
        },
        required: ["expression"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "expand_expression",
      description: "Expand an algebraic expression (e.g., (x+2)(x+3) → x² + 5x + 6). Use when student asks to expand an expression or when checking if expansion is correct.",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "The algebraic expression to expand (e.g., '(x+2)(x+3)')",
          },
        },
        required: ["expression"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "simplify_expression",
      description: "Simplify an algebraic expression (e.g., 2x + 3x → 5x). Use when student asks to simplify an expression or when checking if simplification is correct.",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "The algebraic expression to simplify (e.g., '2x + 3x' or '2(x + 3)')",
          },
        },
        required: ["expression"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "solve_system_of_equations",
      description: "Solve a system of linear equations (e.g., 2x + y = 5, x - y = 1). Use when student provides multiple equations with multiple variables.",
      parameters: {
        type: "object",
        properties: {
          equations: {
            type: "array",
            items: {type: "string"},
            description: "Array of equations to solve (e.g., ['2x + y = 5', 'x - y = 1'])",
          },
          variables: {
            type: "array",
            items: {type: "string"},
            description: "Array of variables to solve for (e.g., ['x', 'y'])",
          },
        },
        required: ["equations", "variables"],
      },
    },
  },
  
  // ============================================================================
  // GEOMETRY TOOLS
  // ============================================================================
  
  {
    type: "function",
    function: {
      name: "calculate_area",
      description: "Calculate the area of a geometric shape. Use when student asks about area of circle, rectangle, triangle, square, trapezoid, or parallelogram.",
      parameters: {
        type: "object",
        properties: {
          shape: {
            type: "string",
            enum: ["circle", "rectangle", "triangle", "square", "trapezoid", "parallelogram"],
            description: "The shape to calculate area for",
          },
          dimensions: {
            type: "object",
            description: "Required dimensions for the shape. Circle: {radius}. Rectangle: {length, width}. Triangle: {base, height}. Square: {side}. Trapezoid: {base1, base2, height}. Parallelogram: {base, height}",
            properties: {
              radius: {type: "number", description: "Radius (for circle)"},
              length: {type: "number", description: "Length (for rectangle)"},
              width: {type: "number", description: "Width (for rectangle)"},
              base: {type: "number", description: "Base (for triangle, parallelogram)"},
              height: {type: "number", description: "Height (for triangle, trapezoid, parallelogram)"},
              side: {type: "number", description: "Side length (for square)"},
              base1: {type: "number", description: "First base (for trapezoid)"},
              base2: {type: "number", description: "Second base (for trapezoid)"},
            },
          },
        },
        required: ["shape", "dimensions"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "calculate_volume",
      description: "Calculate the volume of a 3D shape. Use when student asks about volume of cube, sphere, cylinder, cone, or rectangular prism.",
      parameters: {
        type: "object",
        properties: {
          shape: {
            type: "string",
            enum: ["cube", "sphere", "cylinder", "cone", "rectangular_prism"],
            description: "The 3D shape to calculate volume for",
          },
          dimensions: {
            type: "object",
            description: "Required dimensions. Cube: {side}. Sphere: {radius}. Cylinder: {radius, height}. Cone: {radius, height}. Rectangular prism: {length, width, height}",
            properties: {
              side: {type: "number", description: "Side length (for cube)"},
              radius: {type: "number", description: "Radius (for sphere, cylinder, cone)"},
              height: {type: "number", description: "Height (for cylinder, cone, rectangular prism)"},
              length: {type: "number", description: "Length (for rectangular prism)"},
              width: {type: "number", description: "Width (for rectangular prism)"},
            },
          },
        },
        required: ["shape", "dimensions"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "calculate_perimeter",
      description: "Calculate the perimeter or circumference of a shape. Use when student asks about perimeter of circle, rectangle, triangle, or square.",
      parameters: {
        type: "object",
        properties: {
          shape: {
            type: "string",
            enum: ["circle", "rectangle", "triangle", "square"],
            description: "The shape to calculate perimeter for",
          },
          dimensions: {
            type: "object",
            description: "Required dimensions. Circle: {radius}. Rectangle: {length, width}. Triangle: {side1, side2, side3}. Square: {side}",
            properties: {
              radius: {type: "number", description: "Radius (for circle)"},
              length: {type: "number", description: "Length (for rectangle)"},
              width: {type: "number", description: "Width (for rectangle)"},
              side: {type: "number", description: "Side length (for square)"},
              side1: {type: "number", description: "First side (for triangle)"},
              side2: {type: "number", description: "Second side (for triangle)"},
              side3: {type: "number", description: "Third side (for triangle)"},
            },
          },
        },
        required: ["shape", "dimensions"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "calculate_surface_area",
      description: "Calculate the surface area of a 3D shape. Use when student asks about surface area of cube, sphere, cylinder, cone, or rectangular prism.",
      parameters: {
        type: "object",
        properties: {
          shape: {
            type: "string",
            enum: ["cube", "sphere", "cylinder", "cone", "rectangular_prism"],
            description: "The 3D shape to calculate surface area for",
          },
          dimensions: {
            type: "object",
            description: "Required dimensions. Cube: {side}. Sphere: {radius}. Cylinder: {radius, height}. Cone: {radius, height}. Rectangular prism: {length, width, height}",
            properties: {
              side: {type: "number", description: "Side length (for cube)"},
              radius: {type: "number", description: "Radius (for sphere, cylinder, cone)"},
              height: {type: "number", description: "Height (for cylinder, cone, rectangular prism)"},
              length: {type: "number", description: "Length (for rectangular prism)"},
              width: {type: "number", description: "Width (for rectangular prism)"},
            },
          },
        },
        required: ["shape", "dimensions"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "solve_pythagorean_theorem",
      description: "Solve using Pythagorean theorem (a² + b² = c²). Use when student asks about right triangles, finding missing side, or mentions Pythagorean theorem.",
      parameters: {
        type: "object",
        properties: {
          a: {
            type: "number",
            description: "Length of side a (optional if unknown)",
          },
          b: {
            type: "number",
            description: "Length of side b (optional if unknown)",
          },
          c: {
            type: "number",
            description: "Length of hypotenuse c (optional if unknown). Must provide exactly two of a, b, c.",
          },
        },
      },
    },
  },
  
  // ============================================================================
  // CALCULUS TOOLS
  // ============================================================================
  
  {
    type: "function",
    function: {
      name: "calculate_derivative",
      description: "Calculate the derivative of a function. Use when student asks about derivatives, d/dx, or differentiation.",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "The mathematical expression to differentiate (e.g., 'x^2 + 3*x')",
          },
          variable: {
            type: "string",
            description: "The variable to differentiate with respect to (usually 'x')",
          },
        },
        required: ["expression", "variable"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "calculate_integral",
      description: "Calculate the integral (indefinite or definite) of a function. Use when student asks about integrals, ∫, or integration.",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "The mathematical expression to integrate (e.g., 'x^2')",
          },
          variable: {
            type: "string",
            description: "The variable of integration (usually 'x')",
          },
          lower: {
            type: "number",
            description: "Lower bound for definite integral (optional, omit for indefinite integral)",
          },
          upper: {
            type: "number",
            description: "Upper bound for definite integral (optional, omit for indefinite integral)",
          },
        },
        required: ["expression", "variable"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "calculate_limit",
      description: "Calculate the limit of a function as a variable approaches a value. Use when student asks about limits or lim notation.",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "The mathematical expression (e.g., '(x^2-4)/(x-2)')",
          },
          variable: {
            type: "string",
            description: "The variable approaching a value (usually 'x')",
          },
          approaches: {
            type: "number",
            description: "The value the variable approaches (e.g., 2 for lim x→2)",
          },
        },
        required: ["expression", "variable", "approaches"],
      },
    },
  },
  
  // ============================================================================
  // ARITHMETIC TOOLS
  // ============================================================================
  
  {
    type: "function",
    function: {
      name: "evaluate_expression",
      description: "MANDATORY: Evaluate an arithmetic or algebraic expression. Use ALWAYS when student provides ANY arithmetic calculation (e.g., '100 - 36', '5 * 7', '2^3') or when you need to check if a calculation is correct. Examples: If student says '100 - 36 = 74', call evaluate_expression('100 - 36') to verify the result is 64, not 74. NEVER trust your own calculations - ALWAYS use this tool.",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "The expression to evaluate (e.g., '100 - 36', '5 * 7', '2^3', '2 + 3 * 4')",
          },
        },
        required: ["expression"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "calculate_percentage",
      description: "Calculate percentage or part from percentage. Use when student asks about percentages, percent of, or part/whole calculations.",
      parameters: {
        type: "object",
        properties: {
          part: {
            type: "number",
            description: "The part value (optional if calculating part from percent)",
          },
          whole: {
            type: "number",
            description: "The whole value (always required)",
          },
          percent: {
            type: "number",
            description: "The percentage value (optional if calculating percent from part)",
          },
        },
        required: ["whole"],
      },
    },
  },
  
  // ============================================================================
  // VALIDATION TOOLS
  // ============================================================================
  
  {
    type: "function",
    function: {
      name: "validate_answer",
      description: "MANDATORY: Validate a student's answer against the correct solution. Use ALWAYS when student provides ANY numerical answer or calculation result. This is CRITICAL for accurate feedback. Examples: If student says '100 - 36 = 74', call validate_answer with problem='100 - 36', student_answer='74', problem_type='arithmetic'. If student says 'x = 4', call validate_answer with the original problem. NEVER proceed without validating.",
      parameters: {
        type: "object",
        properties: {
          problem: {
            type: "string",
            description: "The original problem or expression to validate (e.g., '2x + 5 = 13', 'x^2 + 5x + 6 = 0', '100 - 36', '5 * 7')",
          },
          student_answer: {
            type: "string",
            description: "The student's answer or result (e.g., 'x = 4', 'x = -2, x = -3', '74', '35')",
          },
          problem_type: {
            type: "string",
            enum: ["algebra", "linear_equation", "quadratic_equation", "arithmetic", "expression", "geometry", "calculus"],
            description: "The type of problem for validation. Use 'arithmetic' or 'expression' for arithmetic calculations like '100 - 36', '5 * 7', etc.",
          },
        },
        required: ["problem", "student_answer", "problem_type"],
      },
    },
  },
  
  {
    type: "function",
    function: {
      name: "check_step",
      description: "Validate an intermediate step in problem solving. Use when student provides a step and you need to check if it's mathematically correct.",
      parameters: {
        type: "object",
        properties: {
          previous_step: {
            type: "string",
            description: "The previous step in the solution (e.g., '2x + 5 = 13')",
          },
          current_step: {
            type: "string",
            description: "The current step to validate (e.g., '2x = 8')",
          },
          operation: {
            type: "string",
            description: "The operation performed (e.g., 'subtract', 'divide', 'factor')",
          },
        },
        required: ["previous_step", "current_step", "operation"],
      },
    },
  },
];


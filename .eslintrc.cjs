/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "@electron-toolkit",
    "@electron-toolkit/eslint-config-ts/eslint-recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
  ],
  rules: {
    "vue/require-default-prop": "off",
    "vue/multi-word-component-names": "off",
    strict: "off",
    semi: ["error", "always"], // Enforce semicolons at the end of statements
    indent: ["error", 2], // Enforce 2-space indentation
    "no-unused-vars": "warn",
    "lines-between-class-members": "off",
    "comma-dangle": ["error", "only-multiline"],
    "class-methods-use-this": "off",
    "max-len": ["error", { code: 120 }],
    "arrow-body-style": "off", // 箭头函数不强制以用块体（用花括号表示）
    "arrow-parens": [2, "always", { requireForBlockBody: true }],
    "no-restricted-syntax": "off",
    "import/prefer-default-export": "off",
    "import/order": "off",
    "no-constructor-return": "off",
    "consistent-return": "off",
    "no-plusplus": "off",
    "prefer-promise-reject-errors": "off",
    "guard-for-in": "off",
    "no-nested-ternary": "warn",
    "no-bitwise": "warn",
    "no-async-promise-executor": "off",
    "object-curly-spacing": ["error", "always"],
    "prefer-destructuring": [
      "error",
      {
        object: true,
        array: false,
      },
    ],
    "no-underscore-dangle": "off",
    "prefer-object-spread": "off",
    "object-curly-newline": [
      "warn",
      {
        ObjectExpression: {
          consistent: true,
        },
        ObjectPattern: {
          consistent: true,
        },
        ImportDeclaration: {
          consistent: true,
        },
        ExportDeclaration: {
          consistent: true,
        },
      },
    ],
    "no-param-reassign": "off", // 禁止对函数参数再赋值
    "prettier/prettier": [
      "error",
      {
        singleQuote: false,
        semi: true,
        trailingComma: "all",
        printWidth: 120,
      },
    ],
  },
};

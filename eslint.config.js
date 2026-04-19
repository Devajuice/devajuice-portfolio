export default [
  { ignores: ["dist", "node_modules", "*.config.js"] },
  {
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
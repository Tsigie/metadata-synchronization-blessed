module.exports = process.env.CYPRESS_E2E
    ? {}
    : {
          presets: ["@babel/typescript", "babel-preset-react-app"],
          plugins: [["@babel/plugin-proposal-decorators", { legacy: true }]],
      };

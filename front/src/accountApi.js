export function createAccountApi({ later, getText }) {
  const accounts = new Map();

  return {
    async register(user, pass, mail) {
      await new Promise((resolve) => later(resolve, 420));
      if (accounts.has(user.toLowerCase())) {
        throw new Error(getText().errTaken);
      }
      accounts.set(user.toLowerCase(), { pass, mail });
      return { user, token: "dev-" + Math.random().toString(36).slice(2) };
    },
    async login(user, pass) {
      await new Promise((resolve) => later(resolve, 420));
      const account = accounts.get(user.toLowerCase());
      if (!account) throw new Error(getText().errNoUser);
      if (account.pass !== pass) throw new Error(getText().errWrong);
      return { user, token: "dev-" + Math.random().toString(36).slice(2) };
    },
  };
}

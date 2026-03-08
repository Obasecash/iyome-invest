async function loadUser() {
  const res = await authFetch("http://localhost:10800/api/auth/me");
  return res;
}

export function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

export function mockReq(overrides = {}) {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    user: null,
    ...overrides,
  };
}

export function getJson(res) {
  return res.json.mock.calls.at(-1)[0];
}

export function getStatus(res) {
  return res.status.mock.calls.at(-1)[0];
}
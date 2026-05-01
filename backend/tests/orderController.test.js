jest.mock('../config/db', () => ({
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  restaurant: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
}));

const prisma = require('../config/db');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrderById,
} = require('../controllers/orderController');

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makeReq(overrides = {}) {
  return {
    user: { id: 'user1', role: 'CUSTOMER' },
    body: {},
    params: {},
    query: {},
    app: { get: jest.fn().mockReturnValue(null) },
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

// ─── createOrder ─────────────────────────────────────────────────────────────

describe('createOrder', () => {
  const baseBody = {
    restaurantId: 'r1',
    type: 'DELIVERY',
    items: [{ menuItemId: 'm1', name: 'Burger', quantity: 1, price: 500 }],
    subtotal: 500,
    deliveryFee: 50,
    taxes: 25,
    platformFee: 10,
    total: 585,
    paymentMethod: 'CASH',
  };

  test('404 when restaurant does not exist', async () => {
    prisma.restaurant.findUnique.mockResolvedValue(null);
    const req = makeReq({ body: baseBody });
    const res = makeRes();
    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('400 when CASH is disabled by restaurant', async () => {
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: { cashEnabled: false },
    });
    const req = makeReq({ body: { ...baseBody, paymentMethod: 'CASH' } });
    const res = makeRes();
    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('CASH accepted when cashEnabled is true', async () => {
    const fakeOrder = { id: 'o1', items: [], restaurant: {} };
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: { cashEnabled: true },
    });
    prisma.order.create.mockResolvedValue(fakeOrder);
    prisma.order.findUnique.mockResolvedValue(fakeOrder);
    const req = makeReq({ body: { ...baseBody, paymentMethod: 'CASH' } });
    const res = makeRes();
    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('CASH accepted when paymentSettings is null (no restriction)', async () => {
    const fakeOrder = { id: 'o1', items: [], restaurant: {} };
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: null,
    });
    prisma.order.create.mockResolvedValue(fakeOrder);
    prisma.order.findUnique.mockResolvedValue(fakeOrder);
    const req = makeReq({ body: { ...baseBody, paymentMethod: 'CASH' } });
    const res = makeRes();
    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('table is null for DELIVERY orders even when table is provided', async () => {
    const fakeOrder = { id: 'o1', items: [], restaurant: {} };
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: { cashEnabled: true },
    });
    prisma.order.create.mockResolvedValue(fakeOrder);
    prisma.order.findUnique.mockResolvedValue(fakeOrder);
    const req = makeReq({ body: { ...baseBody, type: 'DELIVERY', table: 'T5' } });
    const res = makeRes();
    await createOrder(req, res);
    const createCall = prisma.order.create.mock.calls[0][0];
    expect(createCall.data.table).toBeNull();
  });

  test('table is set for DINEIN orders', async () => {
    const fakeOrder = { id: 'o1', items: [], restaurant: {} };
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: { cashEnabled: true },
    });
    prisma.order.create.mockResolvedValue(fakeOrder);
    prisma.order.findUnique.mockResolvedValue(fakeOrder);
    const req = makeReq({ body: { ...baseBody, type: 'DINEIN', table: 'T5' } });
    const res = makeRes();
    await createOrder(req, res);
    const createCall = prisma.order.create.mock.calls[0][0];
    expect(createCall.data.table).toBe('T5');
  });

  test('defaults paymentMethod to CASH when not provided', async () => {
    const fakeOrder = { id: 'o1', items: [], restaurant: {} };
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: { cashEnabled: true },
    });
    prisma.order.create.mockResolvedValue(fakeOrder);
    prisma.order.findUnique.mockResolvedValue(fakeOrder);
    const { paymentMethod, ...bodyWithoutPM } = baseBody;
    const req = makeReq({ body: bodyWithoutPM });
    const res = makeRes();
    await createOrder(req, res);
    const createCall = prisma.order.create.mock.calls[0][0];
    expect(createCall.data.paymentMethod).toBe('CASH');
  });

  test('defaults deliveryFee, taxes, platformFee to 0 when not provided', async () => {
    const fakeOrder = { id: 'o1', items: [], restaurant: {} };
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: { cashEnabled: true },
    });
    prisma.order.create.mockResolvedValue(fakeOrder);
    prisma.order.findUnique.mockResolvedValue(fakeOrder);
    const req = makeReq({
      body: {
        restaurantId: 'r1',
        type: 'PICKUP',
        items: [{ menuItemId: 'm1', name: 'Burger', quantity: 1, price: 500 }],
        subtotal: 500,
        total: 500,
      },
    });
    const res = makeRes();
    await createOrder(req, res);
    const createCall = prisma.order.create.mock.calls[0][0];
    expect(createCall.data.deliveryFee).toBe(0);
    expect(createCall.data.taxes).toBe(0);
    expect(createCall.data.platformFee).toBe(0);
  });
});

// ─── getOrders ───────────────────────────────────────────────────────────────

describe('getOrders', () => {
  test('CUSTOMER gets only their own orders (whereClause uses customerId)', async () => {
    prisma.order.findMany.mockResolvedValue([]);
    const req = makeReq({ user: { id: 'u1', role: 'CUSTOMER' } });
    const res = makeRes();
    await getOrders(req, res);
    const whereArg = prisma.order.findMany.mock.calls[0][0].where;
    expect(whereArg.customerId).toBe('u1');
    expect(whereArg.restaurantId).toBeUndefined();
  });

  test('RESTAURANT_OWNER sees orders across all their restaurants', async () => {
    prisma.restaurant.findMany.mockResolvedValue([{ id: 'r1' }, { id: 'r2' }]);
    prisma.order.findMany.mockResolvedValue([]);
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      query: {},
    });
    const res = makeRes();
    await getOrders(req, res);
    const whereArg = prisma.order.findMany.mock.calls[0][0].where;
    expect(whereArg.restaurantId).toEqual({ in: ['r1', 'r2'] });
    expect(whereArg.customerId).toBeUndefined();
  });

  test('RESTAURANT_OWNER with restaurantId query filters to that one restaurant', async () => {
    prisma.restaurant.findMany.mockResolvedValue([{ id: 'r1' }, { id: 'r2' }]);
    prisma.order.findMany.mockResolvedValue([]);
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      query: { restaurantId: 'r1' },
    });
    const res = makeRes();
    await getOrders(req, res);
    const whereArg = prisma.order.findMany.mock.calls[0][0].where;
    expect(whereArg.restaurantId).toBe('r1');
  });

  test('returns 200 with count and data array', async () => {
    prisma.order.findMany.mockResolvedValue([{ id: 'o1' }, { id: 'o2' }]);
    const req = makeReq({ user: { id: 'u1', role: 'CUSTOMER' } });
    const res = makeRes();
    await getOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, count: 2 })
    );
  });
});

// ─── updateOrderStatus ───────────────────────────────────────────────────────

describe('updateOrderStatus', () => {
  const existingOrder = {
    id: 'o1',
    restaurantId: 'r1',
    type: 'DELIVERY',
    restaurant: { ownerId: 'owner1' },
  };

  test('404 when order does not exist', async () => {
    prisma.order.findUnique.mockResolvedValue(null);
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o999' },
      body: { status: 'ACCEPTED' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('403 when user is not the restaurant owner AND not ADMIN', async () => {
    prisma.order.findUnique.mockResolvedValue(existingOrder);
    const req = makeReq({
      user: { id: 'other_user', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
      body: { status: 'ACCEPTED' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('ADMIN can update any order regardless of ownership', async () => {
    prisma.order.findUnique.mockResolvedValue(existingOrder);
    prisma.order.update.mockResolvedValue({ ...existingOrder, status: 'ACCEPTED' });
    const req = makeReq({
      user: { id: 'admin1', role: 'ADMIN' },
      params: { id: 'o1' },
      body: { status: 'ACCEPTED' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('actual owner can update their own order', async () => {
    prisma.order.findUnique.mockResolvedValue(existingOrder);
    prisma.order.update.mockResolvedValue({ ...existingOrder, status: 'PREPARING' });
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
      body: { status: 'PREPARING' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('prepTime is parsed and stored when status is ACCEPTED', async () => {
    prisma.order.findUnique.mockResolvedValue(existingOrder);
    prisma.order.update.mockResolvedValue({ ...existingOrder, status: 'ACCEPTED' });
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
      body: { status: 'ACCEPTED', prepTime: '20' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    const updateCall = prisma.order.update.mock.calls[0][0];
    expect(updateCall.data.prepTime).toBe(20);
    expect(updateCall.data.estimatedDeliveryTime).toBeInstanceOf(Date);
  });

  test('prepTime is NOT stored when status is not ACCEPTED', async () => {
    prisma.order.findUnique.mockResolvedValue(existingOrder);
    prisma.order.update.mockResolvedValue({ ...existingOrder, status: 'PREPARING' });
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
      body: { status: 'PREPARING', prepTime: '20' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    const updateCall = prisma.order.update.mock.calls[0][0];
    expect(updateCall.data.prepTime).toBeUndefined();
  });

  test('DELIVERY orders add 15 min buffer to estimated delivery time', async () => {
    prisma.order.findUnique.mockResolvedValue({ ...existingOrder, type: 'DELIVERY' });
    prisma.order.update.mockResolvedValue({ ...existingOrder, status: 'ACCEPTED' });
    const before = new Date();
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
      body: { status: 'ACCEPTED', prepTime: '0' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    const updateCall = prisma.order.update.mock.calls[0][0];
    const estTime = updateCall.data.estimatedDeliveryTime;
    const diffMinutes = Math.round((estTime - before) / 60000);
    expect(diffMinutes).toBeGreaterThanOrEqual(14);
    expect(diffMinutes).toBeLessThanOrEqual(16);
  });

  test('PICKUP orders do NOT add the 15 min delivery buffer', async () => {
    prisma.order.findUnique.mockResolvedValue({ ...existingOrder, type: 'PICKUP' });
    prisma.order.update.mockResolvedValue({ ...existingOrder, status: 'ACCEPTED' });
    const before = new Date();
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
      body: { status: 'ACCEPTED', prepTime: '0' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    const updateCall = prisma.order.update.mock.calls[0][0];
    const estTime = updateCall.data.estimatedDeliveryTime;
    const diffMinutes = Math.round((estTime - before) / 60000);
    expect(diffMinutes).toBeLessThanOrEqual(1);
  });
});

// ─── getOrderById ─────────────────────────────────────────────────────────────

describe('getOrderById', () => {
  const fullOrder = {
    id: 'o1',
    customerId: 'cust1',
    restaurantId: 'r1',
    items: [],
  };

  test('404 when order not found', async () => {
    prisma.order.findUnique.mockResolvedValue(null);
    const req = makeReq({
      user: { id: 'u1', role: 'CUSTOMER' },
      params: { id: 'bad' },
    });
    const res = makeRes();
    await getOrderById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('customer can view their own order', async () => {
    // isCustomer = true → no restaurant lookup needed
    prisma.order.findUnique.mockResolvedValue(fullOrder);
    prisma.restaurant.findUnique.mockResolvedValue({ ownerId: 'owner1' });
    const req = makeReq({
      user: { id: 'cust1', role: 'CUSTOMER' },
      params: { id: 'o1' },
    });
    const res = makeRes();
    await getOrderById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('restaurant owner can view their own restaurant order', async () => {
    // isCustomer = false, isOwnerOrAdmin checked via prisma.restaurant.findUnique
    prisma.order.findUnique.mockResolvedValue(fullOrder);
    prisma.restaurant.findUnique.mockResolvedValue({ ownerId: 'owner1' });
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
    });
    const res = makeRes();
    await getOrderById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('ADMIN can view any order', async () => {
    prisma.order.findUnique.mockResolvedValue(fullOrder);
    prisma.restaurant.findUnique.mockResolvedValue({ ownerId: 'owner1' });
    const req = makeReq({
      user: { id: 'admin1', role: 'ADMIN' },
      params: { id: 'o1' },
    });
    const res = makeRes();
    await getOrderById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('403 when user is neither the customer nor owner nor ADMIN', async () => {
    prisma.order.findUnique.mockResolvedValue(fullOrder);
    prisma.restaurant.findUnique.mockResolvedValue({ ownerId: 'owner1' });
    const req = makeReq({
      user: { id: 'random_user', role: 'CUSTOMER' },
      params: { id: 'o1' },
    });
    const res = makeRes();
    await getOrderById(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─── Task 3: Mutant-Killing Tests ────────────────────────────────────────────
//
// These tests were written specifically to kill survived mutants identified in
// the baseline Stryker run. Each test targets the exact boundary the mutant exploits.

describe('createOrder — mutant-killing tests', () => {
  const baseBody = {
    restaurantId: 'r1',
    type: 'DELIVERY',
    items: [{ menuItemId: 'm1', name: 'Burger', quantity: 1, price: 500 }],
    subtotal: 500,
    deliveryFee: 50,
    taxes: 25,
    platformFee: 10,
    total: 585,
  };

  test('[LCR kill] no paymentMethod + cashEnabled=false should return 400 (kills || → && on line 31)', async () => {
    /*
     * Survived mutant: `paymentMethod || 'CASH'` → `paymentMethod && 'CASH'`
     * Original: undefined || 'CASH' = 'CASH' → triggers cash guard → 400
     * Mutant:   undefined && 'CASH' = undefined → skips cash guard → 201 (WRONG)
     * This test sends no paymentMethod. Only original correctly defaults to 'CASH'
     * and then catches the cashEnabled=false restriction.
     */
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: { cashEnabled: false },
    });
    const req = makeReq({ body: { ...baseBody } }); // no paymentMethod field
    const res = makeRes();
    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('[BCR kill] non-CASH payment with cashEnabled=false should succeed (kills === CASH → true on line 32)', async () => {
    /*
     * Survived mutant: `if (requestedMethod === 'CASH')` → `if (true)`
     * Original: 'CARD' === 'CASH' = false → skips cash guard → 201
     * Mutant:   if (true) → always enters cash guard → 400 even for CARD (WRONG)
     * This test uses paymentMethod='CARD'. Original allows it through; mutant blocks it.
     */
    const fakeOrder = { id: 'o1', items: [], restaurant: {} };
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: { cashEnabled: false },
    });
    prisma.order.create.mockResolvedValue(fakeOrder);
    prisma.order.findUnique.mockResolvedValue(fakeOrder);
    const req = makeReq({ body: { ...baseBody, paymentMethod: 'CARD' } });
    const res = makeRes();
    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('[SVR kill] 400 response must have success=false (kills false → true on line 34)', async () => {
    /*
     * Survived mutant: `success: false` → `success: true` in the 400 response
     * This test asserts the exact value of the success field.
     */
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: { cashEnabled: false },
    });
    const req = makeReq({ body: { ...baseBody, paymentMethod: 'CASH' } });
    const res = makeRes();
    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('[LCR kill] item modifiers are preserved when truthy (kills || null → && null on line 44)', async () => {
    /*
     * Survived mutant: `item.modifiers || null` → `item.modifiers && null`
     * Original: truthy modifiers || null = modifiers (preserved)
     * Mutant:   truthy modifiers && null = null (modifiers lost — WRONG)
     * This test checks that modifiers ARE passed through to the DB create call.
     */
    const fakeOrder = { id: 'o1', items: [], restaurant: {} };
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: { cashEnabled: true },
    });
    prisma.order.create.mockResolvedValue(fakeOrder);
    prisma.order.findUnique.mockResolvedValue(fakeOrder);
    const modifiers = [{ name: 'Extra Cheese', price: 50 }];
    const req = makeReq({
      body: {
        ...baseBody,
        paymentMethod: 'CASH',
        items: [{ menuItemId: 'm1', name: 'Burger', quantity: 1, price: 500, modifiers }],
      },
    });
    const res = makeRes();
    await createOrder(req, res);
    const createCall = prisma.order.create.mock.calls[0][0];
    expect(createCall.data.items.create[0].modifiers).toEqual(modifiers);
  });
});

describe('updateOrderStatus — mutant-killing tests', () => {
  const existingOrder = {
    id: 'o1',
    restaurantId: 'r1',
    type: 'DELIVERY',
    restaurant: { ownerId: 'owner1' },
  };

  test('[AOR kill] prepTime is added not subtracted to estimate time (kills + → - on line 170)', async () => {
    /*
     * Survived mutant: `getMinutes() + updatedData.prepTime` → `- updatedData.prepTime`
     * The baseline tests used prepTime='0', so +0 and -0 are identical — mutant survived.
     * This test uses prepTime='30'. Original: now+30min. Mutant: now-30min (in the past).
     */
    prisma.order.findUnique.mockResolvedValue({ ...existingOrder, type: 'PICKUP' });
    prisma.order.update.mockResolvedValue({ ...existingOrder, status: 'ACCEPTED' });
    const before = new Date();
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
      body: { status: 'ACCEPTED', prepTime: '30' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    const updateCall = prisma.order.update.mock.calls[0][0];
    const estTime = updateCall.data.estimatedDeliveryTime;
    // Original: ~30 min in the future. Mutant: ~30 min in the PAST.
    expect(estTime.getTime()).toBeGreaterThan(before.getTime());
    const diffMinutes = Math.round((estTime - before) / 60000);
    expect(diffMinutes).toBeGreaterThanOrEqual(29);
    expect(diffMinutes).toBeLessThanOrEqual(31);
  });

  test('[SVR kill] 200 response must have success=true (kills true → false on 200 response)', async () => {
    /*
     * Survived mutant: `success: true` → `success: false` in the 200 response.
     * Asserts the exact boolean value in the successful response.
     */
    prisma.order.findUnique.mockResolvedValue(existingOrder);
    prisma.order.update.mockResolvedValue({ ...existingOrder, status: 'PREPARING' });
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
      body: { status: 'PREPARING' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});

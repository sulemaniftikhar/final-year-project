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

  const fakeOrder = {
    id: 'o1',
    orderNumber: '#ORD-20250501120000-1234',
    restaurantId: 'r1',
    customerId: 'user1',
    type: 'DELIVERY',
    status: 'PENDING',
    total: 585,
    items: [{ id: 'i1', name: 'Burger', quantity: 1, price: 500 }],
    restaurant: { name: 'Test Restaurant', logo: null },
    customer: { fullName: 'Test User', phone: '03001234567' },
  };

  test('404 when restaurant does not exist', async () => {
    prisma.restaurant.findUnique.mockResolvedValue(null);
    const req = makeReq({ body: baseBody });
    const res = makeRes();
    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Restaurant not found' })
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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('CASH accepted when cashEnabled is true — returns 201 with order data', async () => {
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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: 'o1' }),
      })
    );
  });

  test('CASH accepted when paymentSettings is null — returns 201 with order data', async () => {
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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('table is null for DELIVERY orders even when table is provided', async () => {
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
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('table is set for DINEIN orders', async () => {
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
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('defaults paymentMethod to CASH when not provided', async () => {
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
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('defaults deliveryFee, taxes, platformFee to 0 when not provided', async () => {
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
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('500 when database throws during order creation', async () => {
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: { cashEnabled: true },
    });
    prisma.order.create.mockRejectedValue(new Error('DB connection lost'));
    const req = makeReq({ body: baseBody });
    const res = makeRes();
    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
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
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, count: 0 })
    );
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
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
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
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('returns 200 with correct count and data array', async () => {
    const orders = [{ id: 'o1' }, { id: 'o2' }];
    prisma.order.findMany.mockResolvedValue(orders);
    const req = makeReq({ user: { id: 'u1', role: 'CUSTOMER' } });
    const res = makeRes();
    await getOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, count: 2, data: orders })
    );
  });

  test('500 when database throws during order retrieval', async () => {
    prisma.order.findMany.mockRejectedValue(new Error('DB timeout'));
    const req = makeReq({ user: { id: 'u1', role: 'CUSTOMER' } });
    const res = makeRes();
    await getOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
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

  const updatedOrder = {
    ...existingOrder,
    status: 'PREPARING',
    customer: { id: 'cust1', fullName: 'Test User', phone: '03001234567' },
    restaurant: { id: 'r1', name: 'Test Restaurant' },
    items: [],
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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Order not found' })
    );
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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Not authorized' })
    );
  });

  test('ADMIN can update any order regardless of ownership', async () => {
    prisma.order.findUnique.mockResolvedValue(existingOrder);
    prisma.order.update.mockResolvedValue({ ...updatedOrder, status: 'ACCEPTED' });
    const req = makeReq({
      user: { id: 'admin1', role: 'ADMIN' },
      params: { id: 'o1' },
      body: { status: 'ACCEPTED' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: 'o1' }),
      })
    );
  });

  test('actual owner can update their own order', async () => {
    prisma.order.findUnique.mockResolvedValue(existingOrder);
    prisma.order.update.mockResolvedValue(updatedOrder);
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
      body: { status: 'PREPARING' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: 'o1', status: 'PREPARING' }),
      })
    );
  });

  test('prepTime is parsed and stored when status is ACCEPTED', async () => {
    prisma.order.findUnique.mockResolvedValue(existingOrder);
    prisma.order.update.mockResolvedValue({ ...updatedOrder, status: 'ACCEPTED' });
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
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('prepTime is NOT stored when status is not ACCEPTED', async () => {
    prisma.order.findUnique.mockResolvedValue(existingOrder);
    prisma.order.update.mockResolvedValue(updatedOrder);
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
      body: { status: 'PREPARING', prepTime: '20' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    const updateCall = prisma.order.update.mock.calls[0][0];
    expect(updateCall.data.prepTime).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('DELIVERY orders add 15 min buffer to estimated delivery time', async () => {
    prisma.order.findUnique.mockResolvedValue({ ...existingOrder, type: 'DELIVERY' });
    prisma.order.update.mockResolvedValue({ ...updatedOrder, status: 'ACCEPTED' });
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
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('PICKUP orders do NOT add the 15 min delivery buffer', async () => {
    prisma.order.findUnique.mockResolvedValue({ ...existingOrder, type: 'PICKUP' });
    prisma.order.update.mockResolvedValue({ ...updatedOrder, status: 'ACCEPTED' });
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
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('500 when database throws during status update', async () => {
    prisma.order.findUnique.mockRejectedValue(new Error('DB error'));
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
      body: { status: 'PREPARING' },
    });
    const res = makeRes();
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

// ─── getOrderById ─────────────────────────────────────────────────────────────

describe('getOrderById', () => {
  const fullOrder = {
    id: 'o1',
    customerId: 'cust1',
    restaurantId: 'r1',
    status: 'PENDING',
    items: [],
    restaurant: { id: 'r1', name: 'Test Restaurant' },
    customer: { id: 'cust1', fullName: 'Test User', phone: '03001234567' },
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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Order not found' })
    );
  });

  test('customer can view their own order — returns full order data', async () => {
    prisma.order.findUnique.mockResolvedValue(fullOrder);
    prisma.restaurant.findUnique.mockResolvedValue({ ownerId: 'owner1' });
    const req = makeReq({
      user: { id: 'cust1', role: 'CUSTOMER' },
      params: { id: 'o1' },
    });
    const res = makeRes();
    await getOrderById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: 'o1' }),
      })
    );
  });

  test('restaurant owner can view their own restaurant order', async () => {
    prisma.order.findUnique.mockResolvedValue(fullOrder);
    prisma.restaurant.findUnique.mockResolvedValue({ ownerId: 'owner1' });
    const req = makeReq({
      user: { id: 'owner1', role: 'RESTAURANT_OWNER' },
      params: { id: 'o1' },
    });
    const res = makeRes();
    await getOrderById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: 'o1' }),
      })
    );
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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: 'o1' }),
      })
    );
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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('500 when database throws during order fetch', async () => {
    prisma.order.findUnique.mockRejectedValue(new Error('DB error'));
    const req = makeReq({
      user: { id: 'cust1', role: 'CUSTOMER' },
      params: { id: 'o1' },
    });
    const res = makeRes();
    await getOrderById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

// ─── Targeted mutant-killing tests ───────────────────────────────────────────

describe('createOrder — boundary and mutation-killing tests', () => {
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

  const fakeOrder = { id: 'o1', items: [], restaurant: {} };

  test('[LCR] no paymentMethod + cashEnabled=false returns 400 (kills || -> && on default)', async () => {
    /*
     * Original: undefined || 'CASH' = 'CASH' -> triggers cash guard -> 400
     * Mutant:   undefined && 'CASH' = undefined -> skips guard -> 201 (WRONG)
     */
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      paymentSettings: { cashEnabled: false },
    });
    const req = makeReq({ body: { ...baseBody } });
    const res = makeRes();
    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('[BCR] non-CASH payment with cashEnabled=false succeeds (kills === CASH -> true)', async () => {
    /*
     * Original: 'CARD' === 'CASH' = false -> skips guard -> 201
     * Mutant:   if (true) -> enters guard -> blocks CARD (WRONG)
     */
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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('[LCR] item modifiers are preserved when truthy (kills || null -> && null)', async () => {
    /*
     * Original: modifiers || null = modifiers (preserved)
     * Mutant:   modifiers && null = null (silently lost — WRONG)
     */
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

describe('updateOrderStatus — boundary and mutation-killing tests', () => {
  const existingOrder = {
    id: 'o1',
    restaurantId: 'r1',
    type: 'DELIVERY',
    restaurant: { ownerId: 'owner1' },
  };

  const updatedOrder = {
    ...existingOrder,
    status: 'ACCEPTED',
    customer: { id: 'cust1', fullName: 'Test User', phone: '03001234567' },
    restaurant: { id: 'r1', name: 'Test Restaurant' },
    items: [],
  };

  test('[AOR] prepTime=30 is added not subtracted to estimate (kills + -> - on prepTime)', async () => {
    /*
     * Baseline used prepTime=0, making +0 and -0 identical.
     * prepTime=30: original gives future time; mutant gives past time.
     */
    prisma.order.findUnique.mockResolvedValue({ ...existingOrder, type: 'PICKUP' });
    prisma.order.update.mockResolvedValue({ ...updatedOrder, type: 'PICKUP' });
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
    expect(estTime.getTime()).toBeGreaterThan(before.getTime());
    const diffMinutes = Math.round((estTime - before) / 60000);
    expect(diffMinutes).toBeGreaterThanOrEqual(29);
    expect(diffMinutes).toBeLessThanOrEqual(31);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('[LCR] owner is allowed even when not ADMIN (kills && -> || in auth guard)', async () => {
    /*
     * Original: ownerId !== id && role !== ADMIN — both must be true to block
     * Mutant:   ownerId !== id || role !== ADMIN — either true blocks (WRONG)
     * Here ownerId MATCHES, so first condition is false.
     * Original: false && true = false -> allows through
     * Mutant:   false || true = true  -> blocks (WRONG)
     */
    prisma.order.findUnique.mockResolvedValue({ ...existingOrder, type: 'PICKUP' });
    prisma.order.update.mockResolvedValue({ ...updatedOrder, type: 'PICKUP', status: 'PREPARING' });
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

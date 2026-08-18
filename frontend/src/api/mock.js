const mockUser = {
  _id: "mock-user-id",
  name: "Demo User",
  email: "demo@rac-ai.com",
  avatarUrl: "",
  role: "buyer",
  aiTokensRemaining: 5,
};

const mockCars = [
  {
    _id: "mock-car-1",
    slug: "toyota-avanza",
    name: "Toyota Avanza",
    brand: "Toyota",
    type: "MPV",
    basePrice: 250000000,
    thumbnailUrl: "",
    colors: ["Black", "White"],
    status: "active",
    isTopProduct: true,
  },
  {
    _id: "mock-car-2",
    slug: "honda-brio",
    name: "Honda Brio",
    brand: "Honda",
    type: "Hatchback",
    basePrice: 190000000,
    thumbnailUrl: "",
    colors: ["Red", "White"],
    status: "active",
    isTopProduct: false,
  },
];

const mockShowrooms = [
  {
    name: "RAC Jakarta Showroom",
    address: "Central Jakarta",
    distanceKm: 2.5,
    mapsUrl: "https://maps.google.com",
  },
];

const mockWishlist = [];
let mockSubscription = {
  premiumActive: false,
  expiresAt: null,
  daysRemaining: 0,
  paymentStatus: null,
  paymentType: "premium_monthly",
  aiTokensRemaining: mockUser.aiTokensRemaining,
};

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function readBody(body) {
  return body ? JSON.parse(body) : {};
}

function findCar(id) {
  return mockCars.find((car) => car._id === id || car.slug === id);
}

export async function getMockResponse(path, options = {}) {
  const method = options.method || "GET";
  const pathname = path.split("?")[0];
  const body = readBody(options.body);

  await new Promise((resolve) => setTimeout(resolve, 300));

  if (pathname === "/api/auth/google" && method === "POST") {
    return clone({ success: true, token: "mock-access-token", user: mockUser });
  }

  if (pathname === "/api/auth/login" && method === "POST") {
    if (!body.email || !body.password) {
      const error = new Error("Email and password are required");
      error.status = 400;
      throw error;
    }

    return clone({ success: true, token: "mock-access-token", user: mockUser });
  }

  if (pathname === "/api/auth/register" && method === "POST") {
    if (!body.name || !body.email || !body.password) {
      const error = new Error("Name, email, and password are required");
      error.status = 400;
      throw error;
    }

    return clone({
      success: true,
      token: "mock-access-token",
      user: { ...mockUser, name: body.name, email: body.email },
    });
  }

  if (pathname === "/api/auth/me" && method === "GET") {
    return clone({
      success: true,
      user: mockUser,
      aiTokensRemaining: mockUser.aiTokensRemaining,
      subscription: {
        expiresAt: mockSubscription.expiresAt,
        daysRemaining: mockSubscription.daysRemaining,
        paymentStatus: mockSubscription.paymentStatus,
      },
    });
  }

  if (pathname === "/api/auth/logout" && method === "POST") {
    return { success: true, message: "Logged out" };
  }

  if (pathname === "/api/cars" && method === "GET") {
    return clone({ success: true, count: mockCars.length, data: mockCars });
  }

  if (pathname === "/api/cars/top" && method === "GET") {
    return clone({
      success: true,
      data: mockCars.find((car) => car.isTopProduct),
    });
  }

  if (pathname.startsWith("/api/cars/") && method === "GET") {
    const car = findCar(pathname.replace("/api/cars/", ""));
    return clone({ success: true, data: car || null });
  }

  if (pathname === "/api/ai/recommend" && method === "POST") {
    return clone({
      success: true,
      data: {
        recommendations: [
          {
            carId: mockCars[0]._id,
            matchScore: 95,
            aiReason: "A practical choice based on the selected criteria.",
            selectedColor: body.selectedColor || "Black",
          },
        ],
        accessType: "free",
        remainingTokens: 4,
      },
    });
  }

  if (pathname === "/api/ai/chat" && method === "POST") {
    return {
      success: true,
      data: {
        reply: `Here is a recommendation for: ${body.message}`,
        accessType: "free",
        remainingTokens: 4,
      },
    };
  }

  if (pathname === "/api/ai/credit-simulate" && method === "POST") {
    return {
      success: true,
      data: {
        calculation: {
          onTheRoadPrice: body.carPrice,
          downPayment: body.downPayment,
          tenorMonths: body.tenorMonths,
          monthlyInstallment: 5000000,
          totalInterest: 30000000,
          totalPayment: 230000000,
        },
        aiFinancialInsight: {
          financialHealthStatus: "Safe",
          insightText: "Keep the installment below your monthly budget limit.",
        },
        accessType: "free",
        remainingTokens: 4,
      },
    };
  }

  if (pathname === "/api/wishlist" && method === "GET") {
    return clone({
      success: true,
      count: mockWishlist.length,
      data: mockWishlist,
    });
  }

  if (pathname === "/api/wishlist" && method === "POST") {
    if (mockWishlist.some((item) => item.carId === body.carId)) {
      const error = new Error("This car is already in your wishlist");
      error.status = 409;
      throw error;
    }

    const item = {
      _id: `mock-wishlist-${Date.now()}`,
      ...body,
      car: findCar(body.carId) || null,
    };
    mockWishlist.push(item);
    return clone({ success: true, data: item });
  }

  if (pathname.startsWith("/api/wishlist/") && method === "PUT") {
    const id = pathname.replace("/api/wishlist/", "");
    const index = mockWishlist.findIndex((item) => item._id === id);
    if (index >= 0) mockWishlist[index] = { ...mockWishlist[index], ...body };
    return clone({ success: true, data: mockWishlist[index] || body });
  }

  if (pathname.startsWith("/api/wishlist/") && method === "DELETE") {
    const id = pathname.replace("/api/wishlist/", "");
    const index = mockWishlist.findIndex((item) => item._id === id);
    if (index >= 0) mockWishlist.splice(index, 1);
    return { success: true, message: "Wishlist deleted" };
  }

  if (pathname === "/api/showrooms/nearby" && method === "GET") {
    return clone({ success: true, source: "seed", data: mockShowrooms });
  }

  if (pathname === "/api/subscription/status" && method === "GET") {
    return {
      success: true,
      data: clone(mockSubscription),
    };
  }

  if (pathname === "/api/subscription/checkout" && method === "POST") {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    mockSubscription = {
      ...mockSubscription,
      premiumActive: true,
      expiresAt: expiresAt.toISOString(),
      daysRemaining: 30,
      paymentStatus: "success",
    };
    return {
      success: true,
      snapToken: "mock-snap-token",
      orderId: "mock-order-id",
      amount: 99000,
      clientKey: "mock-client-key",
    };
  }

  throw new Error(`Mock route not found: ${method} ${pathname}`);
}

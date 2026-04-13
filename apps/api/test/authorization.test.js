const test = require("node:test");
const assert = require("node:assert/strict");

const { AuthorizationService } = require("../dist/authz/authorization.service");
const { AdminGuard } = require("../dist/authz/guards/admin.guard");
const { GroupManagerPolicy } = require("../dist/authz/policies/group-manager.policy");
const { WeeklyDistributorContextPolicy } = require("../dist/authz/policies/weekly-distributor-context.policy");
const { SelfOrAdminPolicy } = require("../dist/authz/policies/self-or-admin.policy");

function makeExecutionContext({ user }) {
  return {
    switchToHttp() {
      return {
        getRequest() {
          return { user };
        }
      };
    }
  };
}

test("AdminGuard forbids non-admin for global endpoints", async () => {
  const prisma = {
    user: {
      findUnique: async () => ({ systemRole: "USER", deletedAt: null, isActive: true })
    }
  };
  const authz = new AuthorizationService(prisma);
  const guard = new AdminGuard(prisma, authz);

  const ctx = makeExecutionContext({ user: { userId: "u1", phone: "+972500000000", associationId: "a1" } });

  await assert.rejects(() => guard.canActivate(ctx), (err) => {
    assert.equal(err?.getStatus?.(), 403);
    const res = err.getResponse();
    assert.equal(res.code, "ADMIN_REQUIRED");
    return true;
  });
});

test("SelfOrAdminPolicy allows self and forbids others (non-admin)", async () => {
  const prisma = {
    user: {
      findUnique: async () => ({ systemRole: "USER" })
    }
  };
  const authz = new AuthorizationService(prisma);
  const policy = new SelfOrAdminPolicy(prisma, authz);

  const user = { userId: "u1", phone: "+972500000000", associationId: "a1" };
  await policy.assert(user, "u1");

  await assert.rejects(() => policy.assert(user, "u2"), (err) => {
    assert.equal(err?.getStatus?.(), 403);
    const res = err.getResponse();
    assert.equal(res.code, "SELF_OR_ADMIN_REQUIRED");
    return true;
  });
});

test("GroupManagerPolicy allows manager and forbids non-manager", async () => {
  const prisma = {
    user: { findUnique: async () => ({ systemRole: "USER" }) },
    distributionGroup: { findFirst: async () => ({ managerUserId: "u1" }) }
  };
  const authz = new AuthorizationService(prisma);
  const policy = new GroupManagerPolicy(prisma, authz);

  const manager = { userId: "u1", phone: "+972500000000", associationId: "a1" };
  await policy.assert(manager, "g1");

  const other = { userId: "u2", phone: "+972500000001", associationId: "a1" };
  await assert.rejects(() => policy.assert(other, "g1"), (err) => {
    assert.equal(err?.getStatus?.(), 403);
    const res = err.getResponse();
    assert.equal(res.code, "GROUP_MANAGER_REQUIRED");
    return true;
  });
});

test("WeeklyDistributorContextPolicy allows assigned distributor for week only", async () => {
  const prisma = {
    user: { findUnique: async () => ({ systemRole: "USER" }) },
    weeklyDistributorAssignment: { findFirst: async ({ where }) => (where.weekKey === "2026-W16" ? { id: "x" } : null) }
  };
  const authz = new AuthorizationService(prisma);
  const policy = new WeeklyDistributorContextPolicy(prisma, authz);

  const distributor = { userId: "u9", phone: "+972500000009", associationId: "a1" };
  await policy.assert(distributor, "g1", "2026-W16");

  await assert.rejects(() => policy.assert(distributor, "g1", "2026-W17"), (err) => {
    assert.equal(err?.getStatus?.(), 403);
    const res = err.getResponse();
    assert.equal(res.code, "WEEKLY_DISTRIBUTOR_REQUIRED");
    return true;
  });
});


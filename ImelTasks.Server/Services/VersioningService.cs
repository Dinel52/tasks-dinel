using ImelTasks.Server.Data;
using ImelTasks.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace ImelTasks.Server.Services
{
    public class VersioningService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public VersioningService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task CreateUserVersion(User user)
        {
            var lastVersion = await _context.UserVersions
                .Where(v => v.UserId == user.Id)
                .OrderByDescending(v => v.VersionNumber)
                .FirstOrDefaultAsync();

            int nextVersionNumber = (lastVersion?.VersionNumber ?? 0) + 1;

            var userVersion = new UserVersion
            {
                UserId = user.Id,
                Username = user.UserName,
                Email = user.Email,
                Name = user.Name,
                IsAdmin = user.IsAdmin,
                VersionNumber = nextVersionNumber
            };

            await _context.UserVersions.AddAsync(userVersion);
            await _context.SaveChangesAsync();
        }

        public async Task<List<UserVersion>> GetUserVersions(string userId)
        {
            return await _context.UserVersions
                .Where(v => v.UserId == userId)
                .OrderByDescending(v => v.VersionNumber)
                .ToListAsync();
        }

        public async Task CreateAuditLog(string entityType, string entityId, string action, object oldValue, object newValue)
        {
            var currentUser = _httpContextAccessor.HttpContext?.User;
            var userId = currentUser?.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = currentUser?.FindFirstValue(ClaimTypes.Name);

            var changes = JsonSerializer.Serialize(new
            {
                Old = oldValue,
                New = newValue
            });

            var auditLog = new AuditLog
            {
                EntityType = entityType,
                EntityId = entityId,
                Action = action,
                UserId = userId ?? "System",
                UserName = userName ?? "System",
                Changes = changes
            };

            await _context.AuditLogs.AddAsync(auditLog);
            await _context.SaveChangesAsync();
        }
    }
}
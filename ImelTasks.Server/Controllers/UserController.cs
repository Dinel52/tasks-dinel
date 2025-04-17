using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ImelTasks.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ImelTasks.Server.Services;
using iText.Commons.Actions.Contexts;
using ImelTasks.Server.Data;

namespace ImelTasks.Server.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly VersioningService _versioningService;
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        public UserController(UserManager<User> userManager, VersioningService versioningService, ApplicationDbContext context, IWebHostEnvironment env)
        { 
            _userManager = userManager;
            _versioningService = versioningService;
            _context = context;
            _env = env;
        }

        public class RestoreVersionModel
        {
            public int VersionId { get; set; }
        }

        private async Task<bool> IsAdmin()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Console.WriteLine($"Checking admin status for user ID: {userId}");

            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("User ID claim not found");
                return false;
            }

            var isAdminClaim = User.FindFirstValue("isAdmin");
            Console.WriteLine($"isAdmin claim value: {isAdminClaim}");

            if (isAdminClaim == "true")
            {
                return true;
            }

            var user = await _userManager.FindByIdAsync(userId);
            Console.WriteLine($"User found in database: {user != null}, IsAdmin: {user?.IsAdmin}");

            return user != null && user.IsAdmin;
        }

        // GET: api/users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetUser(string id)
        {
            if (!await IsAdmin())
                return Forbid();

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                id = user.Id,
                username = user.UserName,
                email = user.Email,
                name = user.Name,
                isAdmin = user.IsAdmin,
                lastLogin = user.LastLogin,
                createDate = user.CreateDate,
                modifiedDate = user.ModifiedDate
            });
        }

        // POST: api/users
        [HttpPost]
        public async Task<ActionResult> CreateUser(CreateUserModel model)
        {
            if (!await IsAdmin())
                return Forbid();

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new User
            {
                UserName = model.Username,
                Email = model.Email,
                Name = model.Name ?? string.Empty,
                EmailConfirmed = true,
                IsAdmin = model.IsAdmin
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _versioningService.CreateUserVersion(user);
            await _versioningService.CreateAuditLog("User", user.Id, "Create", null, new
            {
                Username = user.UserName,
                Email = user.Email,
                Name = user.Name,
                IsAdmin = user.IsAdmin
            });

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new
            {
                id = user.Id,
                username = user.UserName,
                email = user.Email,
                name = user.Name,
                isAdmin = user.IsAdmin
            });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(string id, UpdateUserModel model)
        {
            if (!await IsAdmin())
                return Forbid();

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var oldUserData = new
            {
                Username = user.UserName,
                Email = user.Email,
                Name = user.Name,
                IsAdmin = user.IsAdmin
            };

            user.UserName = model.Username ?? user.UserName;
            user.Email = model.Email ?? user.Email;
            user.Name = model.Name ?? user.Name;
            user.IsAdmin = model.IsAdmin ?? user.IsAdmin;
            user.ModifiedDate = DateTime.Now;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            if (!string.IsNullOrEmpty(model.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var passwordResult = await _userManager.ResetPasswordAsync(user, token, model.Password);

                if (!passwordResult.Succeeded)
                    return BadRequest(passwordResult.Errors);
            }

            await _versioningService.CreateUserVersion(user);

            var newUserData = new
            {
                Username = user.UserName,
                Email = user.Email,
                Name = user.Name,
                IsAdmin = user.IsAdmin
            };

            await _versioningService.CreateAuditLog("User", user.Id, "Update", oldUserData, newUserData);

            return Ok(new
            {
                id = user.Id,
                username = user.UserName,
                email = user.Email,
                name = user.Name,
                isAdmin = user.IsAdmin,
                modifiedDate = user.ModifiedDate
            });
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(string id)
        {
            if (!await IsAdmin())
                return Forbid();

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (id == currentUserId)
                return BadRequest(new { message = "Cannot delete your own account" });

            var userData = new
            {
                Username = user.UserName,
                Email = user.Email,
                Name = user.Name,
                IsAdmin = user.IsAdmin
            };

            await _versioningService.CreateAuditLog("User", user.Id, "Delete", userData, null);

            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "User deleted successfully" });
        }

        // PATCH: api/users/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<ActionResult> ToggleUserStatus(string id, StatusUpdateModel model)
        {
            if (!await IsAdmin())
                return Forbid();

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            Console.WriteLine($"Promjena statusa za korisnika {user.UserName}, isActive={model.IsActive}");

            if (model.IsActive)
            {
                await _userManager.SetLockoutEndDateAsync(user, null);
                Console.WriteLine($"Korisnik {user.UserName} je aktiviran.");
            }
            else
            {
                await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
                Console.WriteLine($"Korisnik {user.UserName} je deaktiviran.");
            }

            user.ModifiedDate = DateTime.Now;
            await _userManager.UpdateAsync(user);

            var updatedUser = await _userManager.FindByIdAsync(id);
            var isUserActive = updatedUser.LockoutEnd == null || updatedUser.LockoutEnd < DateTimeOffset.UtcNow;


            return Ok(new
            {
                id = updatedUser.Id,
                username = updatedUser.UserName,
                email = updatedUser.Email,
                isActive = isUserActive,
                lockoutEnd = updatedUser.LockoutEnd,
                message = model.IsActive ? "User activated successfully" : "User deactivated successfully"
            });
        }
        [HttpGet("{id}/history")]
        public async Task<ActionResult> GetUserHistory(string id)
        {
            if (!await IsAdmin())
                return Forbid();

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var versions = await _versioningService.GetUserVersions(id);

            return Ok(versions.Select(v => new {
                versionId = v.Id,
                userId = v.UserId,
                username = v.Username,
                email = v.Email,
                name = v.Name,
                isAdmin = v.IsAdmin,
                versionDate = v.VersionDate,
                versionNumber = v.VersionNumber
            }));
        }

        [HttpGet("audit")]
        public async Task<ActionResult> GetAuditLogs([FromQuery] int pageSize = 10, [FromQuery] int pageIndex = 0,
            [FromQuery] string? userId = null, [FromQuery] string? action = null)
        {
            if (!await IsAdmin())
                return Forbid();

            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(a => a.EntityId == userId && a.EntityType == "User");
            }

            if (!string.IsNullOrEmpty(action))
            {
                query = query.Where(a => a.Action == action);
            }

            var totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                logs = logs,
                totalCount = totalCount
            });
        }
        [HttpPost("{id}/restore")]
        public async Task<ActionResult> RestoreUserVersion(string id, [FromBody] RestoreVersionModel model)
        {
            if (!await IsAdmin())
                return Forbid();

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var version = await _context.UserVersions.FindAsync(model.VersionId);
            if (version == null)
                return NotFound(new { message = "Version not found" });

            var oldUserData = new
            {
                Username = user.UserName,
                Email = user.Email,
                Name = user.Name,
                IsAdmin = user.IsAdmin
            };
            user.UserName = version.Username;
            user.Email = version.Email;
            user.Name = version.Name;
            user.IsAdmin = version.IsAdmin;
            user.ModifiedDate = DateTime.Now;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);
            await _versioningService.CreateUserVersion(user);
            var newUserData = new
            {
                Username = user.UserName,
                Email = user.Email,
                Name = user.Name,
                IsAdmin = user.IsAdmin
            };

            await _versioningService.CreateAuditLog("User", user.Id, "Restore", oldUserData, newUserData);

            return Ok(new
            {
                id = user.Id,
                username = user.UserName,
                email = user.Email,
                name = user.Name,
                isAdmin = user.IsAdmin,
                modifiedDate = user.ModifiedDate,
                restoredFromVersion = version.VersionNumber
            });
        }
        // GET: api/users
        [HttpGet]
public async Task<ActionResult> GetUsers([FromQuery] int pageSize = 10, [FromQuery] int pageIndex = 0,
    [FromQuery] string search = "", [FromQuery] bool? isActive = null)
{
    if (!await IsAdmin())
        return Forbid();

    Console.WriteLine($"Dohvat korisnika: pageSize={pageSize}, pageIndex={pageIndex}, search={search}, isActive={isActive}");


    var query = _userManager.Users.AsQueryable();


    if (!string.IsNullOrWhiteSpace(search))
    {
        search = search.ToLower();
        query = query.Where(u =>
            u.UserName.ToLower().Contains(search) ||
            u.Email.ToLower().Contains(search) ||
            (u.Name != null && u.Name.ToLower().Contains(search))
        );
    }


    if (isActive.HasValue)
    {
        if (isActive.Value)
        {

            query = query.Where(u => u.LockoutEnd == null || u.LockoutEnd < DateTimeOffset.UtcNow);
        }
        else
        {

            query = query.Where(u => u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow);
        }
    }


    var totalCount = await query.CountAsync();


    var users = await query
        .Skip(pageIndex * pageSize)
        .Take(pageSize)
        .ToListAsync();


    return Ok(new
    {
        users = users.Select(u => new
        {
            id = u.Id,
            username = u.UserName,
            email = u.Email,
            name = u.Name,
            isAdmin = u.IsAdmin,
            lastLogin = u.LastLogin,
            createDate = u.CreateDate,
            modifiedDate = u.ModifiedDate,
            lockoutEnd = u.LockoutEnd
        }),
        totalCount = totalCount
    });

}
        [HttpPost("{id}/avatar")]
        public async Task<ActionResult> UploadAvatar(string id, [FromForm] AvatarUploadModel model)
        {
            
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!(await IsAdmin() || currentUserId == id))
                return Forbid();

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (model.Avatar == null || model.Avatar.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

           
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
            if (!allowedTypes.Contains(model.Avatar.ContentType))
                return BadRequest(new { message = "Invalid file type. Only JPG, PNG and GIF are allowed." });

            
            if (model.Avatar.Length > 2 * 1024 * 1024)
                return BadRequest(new { message = "File is too large. Maximum file size is 2MB." });

            try
            {
                
                var uploadsFolder = Path.Combine(_env.WebRootPath, "avatars");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                
                var fileName = $"{id}_{Guid.NewGuid()}{Path.GetExtension(model.Avatar.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.Avatar.CopyToAsync(stream);
                }

                
                var oldAvatarPath = user.AvatarPath;
                user.AvatarPath = $"/avatars/{fileName}";
                user.ModifiedDate = DateTime.Now;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                
                await _versioningService.CreateUserVersion(user);
                await _versioningService.CreateAuditLog(
                    "User",
                    user.Id,
                    "UpdateAvatar",
                    new { AvatarPath = oldAvatarPath },
                    new { AvatarPath = user.AvatarPath }
                );

               
                if (!string.IsNullOrEmpty(oldAvatarPath) && oldAvatarPath != "/avatars/default.png")
                {
                    var oldFilePath = Path.Combine(_env.WebRootPath, oldAvatarPath.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                        System.IO.File.Delete(oldFilePath);
                }

                return Ok(new
                {
                    avatarPath = user.AvatarPath,
                    message = "Avatar uploaded successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error uploading avatar: {ex.Message}" });
            }
        }
        [HttpDelete("{id}/avatar")]
        public async Task<ActionResult> DeleteAvatar(string id)
        {
            
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!(await IsAdmin() || currentUserId == id))
                return Forbid();

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            
            if (string.IsNullOrEmpty(user.AvatarPath) || user.AvatarPath == "/avatars/default.png")
                return BadRequest(new { message = "User does not have a custom avatar" });

            try
            {
                
                var oldAvatarPath = user.AvatarPath;

             
                user.AvatarPath = "/avatars/default.png";
                user.ModifiedDate = DateTime.Now;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(result.Errors);

               
                await _versioningService.CreateUserVersion(user);
                await _versioningService.CreateAuditLog(
                    "User",
                    user.Id,
                    "DeleteAvatar",
                    new { AvatarPath = oldAvatarPath },
                    new { AvatarPath = user.AvatarPath }
                );

                
                var oldFilePath = Path.Combine(_env.WebRootPath, oldAvatarPath.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                    System.IO.File.Delete(oldFilePath);

                return Ok(new
                {
                    avatarPath = user.AvatarPath,
                    message = "Avatar removed successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error removing avatar: {ex.Message}" });
            }
        }
        }
}
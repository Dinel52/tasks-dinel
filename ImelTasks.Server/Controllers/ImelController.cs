using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ImelTasks.Server.Models;
using ImelTasks.Server.Services;
using System.Security.Claims;

namespace ImelTasks.Server.Controllers
{
    [Route("api/imel")]
    [ApiController]
    public class ImelController : ControllerBase
    {
        private readonly SignInManager<User> signInManager;
        private readonly UserManager<User> userManager;
        private readonly TokenService tokenService;

        public ImelController(SignInManager<User> signInManager, UserManager<User> userManager, TokenService tokenService)
        {
            this.signInManager = signInManager;
            this.userManager = userManager;
            this.tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult> RegisterUser(User user)
        {
            IdentityResult result = new();

            try
            {
                User user_ = new User()
                {
                    Name = user.Name ?? string.Empty,
                    Email = user.Email,
                    UserName = user.UserName,
                };

                result = await userManager.CreateAsync(user_, user.PasswordHash ?? "DefaultPassword123!");

                if (!result.Succeeded)
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong, please try again. " + ex.Message);
            }

            return Ok(new { message = "Registered Successfully.", result = result });
        }

        [HttpPost("login")]
        public async Task<ActionResult> LoginUser(Login login)
        {
            try
            {
                User user_ = await userManager.FindByEmailAsync(login.Email ?? string.Empty);
                if (user_ == null)
                {
                    return BadRequest(new { message = "Please check your credentials and try again." });
                }

                if (await userManager.IsLockedOutAsync(user_))
                {
                    return BadRequest(new { message = "Account is locked. Please try again later." });
                }

                login.Username = user_.UserName;

                if (!user_.EmailConfirmed)
                {
                    user_.EmailConfirmed = true;
                }

                var result = await signInManager.CheckPasswordSignInAsync(user_, login.Password ?? string.Empty, true);

                if (!result.Succeeded)
                {
                    if (result.IsLockedOut)
                    {
                        return BadRequest(new { message = "Account is locked due to multiple failed attempts. Please try again later." });
                    }

                    return Unauthorized(new { message = "Check your login credentials and try again" });
                }

                await userManager.ResetAccessFailedCountAsync(user_);

                user_.LastLogin = DateTime.Now;
                await userManager.UpdateAsync(user_);
                var token = tokenService.GenerateJwtToken(user_);

                return Ok(new
                {
                    message = "Login Successful.",
                    token = token,
                    user = new
                    {
                        id = user_.Id,
                        username = user_.UserName,
                        email = user_.Email,
                        name = user_.Name,
                        isAdmin = user_.IsAdmin
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Something went wrong, please try again. " + ex.Message });
            }
        }

        [HttpGet("logout"), Authorize]
        public async Task<ActionResult> LogoutUser()
        {
            try
            {
                await signInManager.SignOutAsync();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Someting went wrong, please try again. " + ex.Message });
            }

            return Ok(new { message = "You are free to go!" });
        }


        [HttpGet("home/{email}"), Authorize]
        public async Task<ActionResult> HomePage(string email)
        {
            User userInfo = await userManager.FindByEmailAsync(email);
            if (userInfo == null)
            {
                return BadRequest(new { message = "Something went wrong, please try again." });
            }

            return Ok(new { userInfo = userInfo });
        }

        [HttpGet("xhtlekd"), Authorize]
        public async Task<ActionResult> CheckUser()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var currentUser = await userManager.FindByIdAsync(userId);
                if (currentUser == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new
                {
                    message = "Logged in",
                    user = new
                    {
                        id = currentUser.Id,
                        username = currentUser.UserName,
                        email = currentUser.Email,
                        name = currentUser.Name,
                        isAdmin = currentUser.IsAdmin
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Something went wrong please try again. " + ex.Message });
            }
        }

    }
}